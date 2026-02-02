from django.contrib.auth import get_user_model, update_session_auth_hash
from django.db.models import Count, Q
from rest_framework import generics, status, permissions, viewsets, filters as drf_filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from django.conf import settings
from ..models import VerificationLog, Booking
from ..serializers import (
     WorkerSerializer
)
from ..utils import send_verification_email
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

User = get_user_model()

class EmployerDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        if request.user.role != 'employer':
            return Response({"error": "Unauthorized"}, status=403)
        return Response({
            "total_sent": Booking.objects.filter(employer=request.user).count(),
            "accepted": Booking.objects.filter(employer=request.user, status='accepted').count()
        })

    @action(detail=True, methods=['post'])
    def release_worker(self, request, pk=None):
        # Find the active booking
        booking = get_object_or_404(Booking, id=pk, employer=request.user, status='accepted')
        
        # 1. Update Booking Status
        booking.status = 'completed'
        booking.save()
        
        # 2. Make Worker Available again
        worker = booking.worker
        worker.is_available = True
        worker.current_employer = None
        worker.save()
        
        return Response({
            "message": f"{worker.first_name} has been released and is now available for others."
        })
    

    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        bookings = Booking.objects.filter(employer=request.user).select_related('worker')
        data = [{
            "id": b.id,
            "worker_name": f"{b.worker.first_name} {b.worker.last_name}",
            "status": b.status,
            "date": b.created_at,
            "worker_phone": b.worker.phone if b.status == 'accepted' else "Locked"
        } for b in bookings]
        return Response(data)
    
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Returns all hiring requests made by the current employer"""
        bookings = Booking.objects.filter(employer=request.user).order_by('-created_at')
        
        data = []
        for b in bookings:
            data.append({
                "id": b.id,
                "worker_id": b.worker.id,
                "worker_name": f"{b.worker.first_name} {b.worker.last_name}",
                "worker_type": b.worker.worker_type.replace('_', ' ') if b.worker.worker_type else "General",
                "status": b.status,
                "date": b.created_at.strftime("%d %b %Y"),
                # Only show phone if worker accepted
                "worker_phone": b.worker.phone if b.status == 'accepted' else None,
                "location": b.worker.location
            })
        return Response(data)
    @action(detail=True, methods=['delete'])
    def remove_history(self, request, pk=None):
        # Only allow deleting if the booking belongs to the employer 
        # and it is NOT 'accepted' (usually you want to keep accepted records for records)
        booking = get_object_or_404(Booking, id=pk, employer=request.user)
        
        if booking.status == 'accepted':
            return Response({"error": "Cannot delete an active/accepted hire from history."}, status=400)
            
        booking.delete()
        return Response(status=204)

class WorkerViewSet(viewsets.ReadOnlyModelViewSet):
    """View used by Employers to find Workers"""
    permission_classes = [IsAuthenticated]
    serializer_class = WorkerSerializer # Use the one with 'my_request_status'

    def get_queryset(self):
        # 1. Start with basic filtered queryset
        queryset = User.objects.filter(role='worker', is_deleted=False)
        params = self.request.query_params
        
        # 2. Extract Filters
        location = params.get('location')
        worker_type = params.get('worker_type')
        search = params.get('search')
        min_salary = params.get('min_salary')
        max_salary = params.get('max_salary')
        experience = params.get('experience')

        show_unavailable = self.request.query_params.get('show_unavailable', 'false')
        if show_unavailable == 'false':
            queryset = queryset.filter(is_available=True)

        # 3. Apply Filtering
        if location: 
            queryset = queryset.filter(location__icontains=location)
        if worker_type and worker_type != 'all': 
            queryset = queryset.filter(worker_type=worker_type)
        if search:
            queryset = queryset.filter(Q(first_name__icontains=search) | Q(last_name__icontains=search))
        
        # NOTE: Since expected_salary is a CharField, __gte might fail on some DBs.
        # It is better to cast to integer if possible, but here is the standard filter:
        if min_salary: 
            queryset = queryset.filter(expected_salary__gte=min_salary)
        if max_salary: 
            queryset = queryset.filter(expected_salary__lte=max_salary)
        
        # Experience is a ChoiceField (string), __gte won't work logically. 
        # Usually, you filter for exact match on choices:
        if experience and experience != 'all':
            queryset = queryset.filter(experience=experience)

        return queryset.order_by('-date_joined')
    @action(detail=True, methods=['post'])
    def release_worker(self, request, pk=None):
        # Find the active booking
        booking = get_object_or_404(Booking, id=pk, employer=request.user, status='accepted')
        
        # 1. Update Booking Status
        booking.status = 'completed'
        booking.save()
        
        # 2. Make Worker Available again
        worker = booking.worker
        worker.is_available = True
        worker.current_employer = None
        worker.save()
        
        return Response({
            "message": f"{worker.first_name} has been released and is now available for others."
        })

    @action(detail=True, methods=['post'])
    def accept_booking(self, request, pk=None):
        booking = self.get_object()
        booking.status = 'accepted'
        booking.save()

        # Automatically set worker to unavailable
        worker = booking.worker
        worker.is_available = False
        worker.current_employer = booking.employer
        worker.save()
        
        return Response({"message": "You are now hired!"})

    @action(detail=True, methods=['post'])
    def hire(self, request, pk=None):
        worker_user = self.get_object()
        
        if request.user.id == worker_user.id:
            return Response({"error": "You cannot hire yourself."}, status=400)

        existing = Booking.objects.filter(
            employer=request.user, 
            worker=worker_user, 
            status='pending'
        ).exists()

        if existing:
            return Response({"error": "You already have a pending request with this worker."}, status=400)

        # Create the booking
        Booking.objects.create(
            employer=request.user, 
            worker=worker_user, 
            status='pending'
        )
        subject = "New Hire Request - Kykam Agencies"
        from_email = settings.DEFAULT_FROM_EMAIL
        to = worker_user.email

        # HTML Body (This looks better to the user)
        html_content = f"""
        <h3>Hello {worker_user.first_name},</h3>
        <p>Exciting news! <strong>{request.user.first_name} {request.user.last_name}</strong> is interested in hiring you via Kykam Agencies.</p>
        <p>Please log in to your dashboard to accept or decline this request.</p>
        <br>
        <p>Best regards,<br>The Kykam Team</p>
        """
        
        # Plain text version (Crucial for avoiding spam filters)
        text_content = strip_tags(html_content)

        try:
            msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=False)
            print(f"--- SUCCESS: Hire request email sent to {to} via SendGrid ---")
            print(f"email sending is {from_email}")
        except Exception as e:
            # We log the error but don't break the response for the user
            print(f"--- SENDGRID ERROR: {str(e)} ---")

        return Response({"message": "Hire request sent successfully!"})

    @action(detail=True, methods=['post'])
    def withdraw_request(self, request, pk=None):
        worker_user = self.get_object()
        # Only delete if it's still pending
        booking = Booking.objects.filter(
            employer=request.user, 
            worker=worker_user, 
            status='pending'
        ).first()

        if booking:
            booking.delete()
            return Response({"message": "Request withdrawn successfully."})
        return Response({"error": "No pending request found to withdraw."}, status=404)