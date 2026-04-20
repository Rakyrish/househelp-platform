from django.contrib.auth import get_user_model, update_session_auth_hash
from django.db.models import Count, Q
from rest_framework import generics, status, permissions, viewsets, filters as drf_filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated

from ..models import VerificationLog, Booking
from ..serializers import (
     WorkerSerializer
)
from ..utils import send_verification_email
from django.shortcuts import get_object_or_404
from django.db import transaction

User = get_user_model()

# -----------------------------------------------------------
# WORKER DASHBOARD & DIRECTORY
# -----------------------------------------------------------

class WorkerDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def profile_status(self, request):
        user = User.objects.get(pk=request.user.pk)
        if user.role != 'worker':
            return Response({"error": "Not a worker"}, status=403)
        
        # --- CRITICAL: DRF-level expiry check ---
        if user.verification_status == 'under_review':
            if not user.has_timed_access:
                from rest_framework.authtoken.models import Token
                Token.objects.filter(user=user).delete()
                return Response({
                    "error": "Session expired",
                    "detail": "Your session has expired. Account still under review.",
                    "code": "temporary_access_expired"
                }, status=401)
        
        latest_log = VerificationLog.objects.filter(worker=user).order_by('-created_at').first()
        
        data = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "status": user.status, 
            "is_verified": user.is_verified,
            "verification_status": user.verification_status,
            "payment_submitted_at": user.payment_submitted_at.isoformat() if user.payment_submitted_at else None,
            "experience": user.experience,
            "worker_type": user.worker_type,
            "location": user.location,
            "date_joined": user.date_joined,
            "kin_name": user.kin_name,
            "kin_phone": user.kin_phone,
            "expected_salary": user.expected_salary,
            "passport_img": request.build_absolute_uri(user.passport_img.url) if user.passport_img else None,
            "id_photo_front": user.id_photo_front.url if user.id_photo_front else None,
            "id_photo_back": user.id_photo_back.url if user.id_photo_back else None,
            "missing_docs": {
                "id_front": not bool(user.id_photo_front),
                "id_back": not bool(user.id_photo_back),
                "passport": not bool(user.passport_img),
            },
            "rejection_feedback": latest_log.rejection_reasons if latest_log and user.status == 'rejected' else None,
            "admin_comment": latest_log.comment if latest_log and user.status == 'rejected' else None
        }
        return Response(data)

    @action(detail=False, methods=['patch'], parser_classes=[MultiPartParser, FormParser])
    def update_profile(self, request):
        user = request.user
        editable_text_fields = ['location', 'worker_type', 'experience', 'kin_name', 'kin_phone', 'expected_salary']
        
        for field in editable_text_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        if 'passport_img' in request.FILES:
            user.passport_img = request.FILES['passport_img']
        
        user.save()
        return Response({
            "message": "Profile updated successfully",
            "passport_img": request.build_absolute_uri(user.passport_img.url) if user.passport_img else None
        })

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response({"error": "Current password is incorrect"}, status=400)
        
        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)
        return Response({"message": "Password updated successfully"})
    @action(detail=False, methods=['get'], url_path='job_invites')
    def job_invites(self, request):
        invites = Booking.objects.filter(worker=request.user).order_by('-created_at')
        data = [{
            "id": i.id,
            "employer_name": f"{i.employer.first_name} {i.employer.last_name}",
            "location": i.employer.location,
            "status": i.status,
            "salary": i.employer.salary,
            "family_size": i.employer.family_size,
            "employer_phone": i.employer.phone,
            "start_date": i.employer.start_date,
            "requirements": i.employer.requirements,
            "created_at": i.created_at,
            "passport_img": request.build_absolute_uri(i.employer.passport_img.url) if i.employer.passport_img else None,
        } for i in invites]
        return Response(data)

from django.db.models import Q

# -----------------------------------------------------------
# 2. THE BOOKINGS (For Workers to see and respond to invites)
# -----------------------------------------------------------
class WorkerBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Booking.objects.all()

    # This fixes the 404 for /api/worker-requests/job_invites/
    @action(detail=False, methods=['get'], url_path='job_invites')
    def job_invites(self, request):
        invites = Booking.objects.filter(worker=request.user).order_by('-created_at')
        data = [{
            "id": i.id,
            "employer_name": f"{i.employer.first_name} {i.employer.last_name}",
            "location": i.employer.location,
            "status": i.status,
            "salary": i.employer.salary,
            "age": i.employer.age,
            "family_size": i.employer.family_size,
            "employer_phone": i.employer.phone,
            "requirements": i.employer.requirements,
            "start_date": i.employer.start_date,
            "created_at": i.created_at,
            "passport_img": request.build_absolute_uri(i.employer.passport_img.url) if i.employer.passport_img else None,
           
        } for i in invites]
        return Response(data)
    @action(detail=False, methods=['get'], url_path='my_invites')
    def my_invites(self, request):
        # We can just call the same logic as above
        return WorkerDashboardViewSet.job_invites(self, request)

   

    @action(detail=True, methods=['post'])
    def respond_to_request(self, request, pk=None):
        # Use a transaction to ensure either everything updates or nothing does
        with transaction.atomic():
            # 1. Locate the specific pending request for this worker
            booking = get_object_or_404(Booking, id=pk, worker=request.user, status='pending')
            new_status = request.data.get('status')

            if new_status == 'accepted':
                worker = booking.worker
                
                # 2. Update Worker to "Booked"
                worker.is_available = False
                worker.current_employer = booking.employer
                worker.save()

                # 3. Mark the current booking as Accepted
                booking.status = 'accepted'
                booking.save()

                # 4. AUTO-DECLINE: Cancel all other pending requests for this worker
                # This prevents other employers from being "stuck" waiting for a response
                other_requests = Booking.objects.filter(
                    worker=worker, 
                    status='pending'
                ).exclude(id=booking.id)
                
                other_requests.update(status='declined')

                return Response({
                    "message": "Job accepted. Other pending requests have been automatically declined."
                })

            elif new_status == 'declined':
                booking.status = 'declined'
                booking.save()
                return Response({"message": "Request declined."})

        return Response({"error": "Invalid status choice."}, status=400)
