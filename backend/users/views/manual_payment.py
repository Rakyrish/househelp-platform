import logging
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import threading

def send_email_async(subject, message, to_email):
    def send():
        try:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@kykam.com')
            send_mail(subject, message, from_email, [to_email], fail_silently=False)
            logger.info("Email sent to %s with subject %s", to_email, subject)
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
    threading.Thread(target=send, daemon=True).start()


def get_admin_notification_email():
    platform_settings = PlatformSetting.objects.first()
    if platform_settings and platform_settings.support_email:
        return platform_settings.support_email

    return getattr(settings, 'ADMIN_NOTIFICATION_EMAIL', None) or getattr(settings, 'DEFAULT_FROM_EMAIL', None)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication

from ..authentication import CsrfExemptSessionAuthentication
from ..models import ManualPaymentSubmission, AdminNotification, PlatformSetting
from ..serializers import ManualPaymentSubmitSerializer, ManualPaymentListSerializer

User = get_user_model()
logger = logging.getLogger(__name__)


class SubmitManualPaymentView(APIView):
    """
    Accepts manual M-Pesa payment submissions from workers.
    Uses payment_token (cache) to identify the user since unverified
    workers don't have auth tokens.
    """
    permission_classes = [AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def post(self, request):
        payment_token = request.data.get('payment_token')
        if not payment_token:
            return Response(
                {"error": "Payment token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_id = cache.get(f"pay_token:{payment_token}")
        if not user_id:
            return Response(
                {"error": "Invalid or expired payment token. Please log in again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ManualPaymentSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        ManualPaymentSubmission.objects.create(
            user=user,
            phone_number=serializer.validated_data['phone_number'],
            mpesa_transaction_code=serializer.validated_data['mpesa_transaction_code'],
            amount=99,
            status=ManualPaymentSubmission.Status.PENDING,
        )

        user.verification_status = 'under_review'
        user.payment_submitted_at = timezone.now()
        user.save()

        # Clear the payment token after successful submission
        cache.delete(f"pay_token:{payment_token}")

        # Send email notification to user
        if user.email:
            send_email_async(
                subject="Payment Received",
                message="Your payment of KES 99 has been received and is under review. You will be notified once verification is complete.",
                to_email=user.email
            )

        # Notify admin about new payment submission
        admin_email = get_admin_notification_email()
        message_body = f"A new payment has been submitted and is awaiting verification.\n\nUser: {user.first_name} {user.last_name}\nEmail: {user.email}\nPhone: {serializer.validated_data['phone_number']}\nTransaction Code: {serializer.validated_data['mpesa_transaction_code']}\nAmount: KES 99\n\nPlease review this payment in the admin dashboard."
        
        if admin_email:
            send_email_async(
                subject="New Payment Submitted — Action Required",
                message=message_body,
                to_email=admin_email
            )
        else:
            logger.warning("No admin notification email configured for worker payment submission %s", user.id)

        AdminNotification.objects.create(
            notification_type='payment_submission',
            message=f"New manual payment from {user.first_name} {user.last_name} ({user.email}). Phone: {serializer.validated_data['phone_number']}",
            related_user=user
        )

        return Response(
            {"message": "Your payment has been received and is under review. You will be verified shortly."},
            status=status.HTTP_201_CREATED
        )


class AdminPaymentListView(APIView):
    """List all manual payment submissions for admin review."""
    permission_classes = [IsAuthenticated, IsAdminUser]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def get(self, request):
        submissions = ManualPaymentSubmission.objects.select_related('user').all()
        serializer = ManualPaymentListSerializer(submissions, many=True)
        return Response(serializer.data)


class AdminPaymentApproveView(APIView):
    """Approve a manual payment and verify the user."""
    permission_classes = [IsAuthenticated, IsAdminUser]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def post(self, request, pk):
        try:
            submission = ManualPaymentSubmission.objects.get(id=pk)
        except ManualPaymentSubmission.DoesNotExist:
            return Response({"error": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)

        if submission.status != ManualPaymentSubmission.Status.PENDING:
            return Response(
                {"error": f"This submission has already been {submission.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Approve the submission
        submission.status = ManualPaymentSubmission.Status.APPROVED
        submission.reviewed_by = request.user
        submission.reviewed_at = timezone.now()
        submission.save()

        # Verify the user
        user = submission.user
        user.is_verified = True
        user.status = 'approved'
        user.is_active = True
        user.verification_status = 'verified'
        user.payment_submitted_at = None
        user.save(update_fields=['is_verified', 'status', 'is_active', 'verification_status', 'payment_submitted_at'])

        # Mark notification as read
        AdminNotification.objects.filter(related_user=user, notification_type='payment_submission', is_read=False).update(is_read=True)

        logger.info(f"Payment {submission.id} approved by {request.user}. User {user} verified.")
        
        if user.email:
            send_email_async(
                subject="Account Verified",
                message="Your account has been successfully verified. You now have full access.",
                to_email=user.email
            )
            
        return Response({"message": f"Payment approved. {user.first_name} {user.last_name} is now verified."})


class AdminPaymentRejectView(APIView):
    """Reject a manual payment submission."""
    permission_classes = [IsAuthenticated, IsAdminUser]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def post(self, request, pk):
        try:
            submission = ManualPaymentSubmission.objects.get(id=pk)
        except ManualPaymentSubmission.DoesNotExist:
            return Response({"error": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)

        if submission.status != ManualPaymentSubmission.Status.PENDING:
            return Response(
                {"error": f"This submission has already been {submission.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        submission.status = ManualPaymentSubmission.Status.REJECTED
        submission.reviewed_by = request.user
        submission.reviewed_at = timezone.now()
        submission.save()

        user = submission.user
        user.verification_status = 'rejected'
        user.save()

        # Mark notification as read
        AdminNotification.objects.filter(related_user=user, notification_type='payment_submission', is_read=False).update(is_read=True)

        logger.info(f"Payment {submission.id} rejected by {request.user}.")
        
        if user.email:
            send_email_async(
                subject="Payment Failed",
                message="Your payment could not be verified. Please try again.",
                to_email=user.email
            )
            
        return Response({"message": "Payment submission has been rejected."})
