from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import ManualPaymentSubmission

User = get_user_model()


@override_settings(
    CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}},
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
class WorkerVerificationAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def create_worker(self, **overrides):
        defaults = {
            "username": overrides.get("email", "worker@example.com"),
            "email": overrides.get("email", "worker@example.com"),
            "first_name": "Test",
            "last_name": "Worker",
            "phone": overrides.get("phone", "254700000001"),
            "role": "worker",
            "password": "SafePass123!",
        }
        password = overrides.pop("password", defaults.pop("password"))
        defaults.update(overrides)
        user = User.objects.create_user(**defaults)
        user.set_password(password)
        user.save()
        return user

    def create_admin(self):
        return User.objects.create_user(
            username="admin@example.com",
            email="admin@example.com",
            first_name="Admin",
            last_name="User",
            phone="254700000099",
            role="admin",
            is_staff=True,
            is_superuser=True,
            password="AdminPass123!",
        )

    def test_verified_worker_can_log_in_even_if_old_review_timestamp_exists(self):
        worker = self.create_worker(
            verification_status="verified",
            is_verified=True,
            status="approved",
            payment_submitted_at=timezone.now() - timedelta(minutes=10),
        )

        response = self.client.post(
            "/api/login/worker/",
            {"phone": worker.phone, "password": "SafePass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["verification_status"], "verified")
        self.assertIn("token", response.data)

    def test_expired_under_review_worker_is_blocked_from_login(self):
        worker = self.create_worker(
            phone="254700000002",
            email="review@example.com",
            verification_status="under_review",
            payment_submitted_at=timezone.now() - timedelta(minutes=10),
        )

        response = self.client.post(
            "/api/login/worker/",
            {"phone": worker.phone, "password": "SafePass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["requires_payment"], False)
        self.assertIn("under review", response.data["error"].lower())

    def test_verified_worker_profile_status_bypasses_expiry_checks(self):
        worker = self.create_worker(
            phone="254700000003",
            email="profile@example.com",
            verification_status="verified",
            is_verified=True,
            status="approved",
            payment_submitted_at=timezone.now() - timedelta(minutes=10),
        )
        token = Token.objects.create(user=worker)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        response = self.client.get("/api/worker/dashboard/profile_status/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["verification_status"], "verified")
        self.assertTrue(response.data["is_verified"])

    def test_admin_approval_sets_verified_state_and_clears_review_timestamp(self):
        admin = self.create_admin()
        worker = self.create_worker(
            phone="254700000004",
            email="approve@example.com",
            verification_status="under_review",
            payment_submitted_at=timezone.now(),
        )
        self.client.force_authenticate(user=admin)

        response = self.client.post(f"/api/admin/manage-users/{worker.id}/approve_worker/")

        self.assertEqual(response.status_code, 200)

        worker.refresh_from_db()
        self.assertEqual(worker.verification_status, "verified")
        self.assertTrue(worker.is_verified)
        self.assertEqual(worker.status, "approved")
        self.assertIsNone(worker.payment_submitted_at)

    def test_manual_payment_approval_clears_review_timestamp_for_verified_user(self):
        admin = self.create_admin()
        worker = self.create_worker(
            phone="254700000005",
            email="payment@example.com",
            verification_status="under_review",
            payment_submitted_at=timezone.now(),
        )
        submission = ManualPaymentSubmission.objects.create(
            user=worker,
            phone_number=worker.phone,
            mpesa_transaction_code="SLK4H7R2T0",
            amount=99,
            status=ManualPaymentSubmission.Status.PENDING,
        )
        self.client.force_authenticate(user=admin)

        response = self.client.post(f"/api/admin/payments/{submission.id}/approve/")

        self.assertEqual(response.status_code, 200)

        worker.refresh_from_db()
        submission.refresh_from_db()
        self.assertEqual(worker.verification_status, "verified")
        self.assertTrue(worker.is_verified)
        self.assertEqual(worker.status, "approved")
        self.assertIsNone(worker.payment_submitted_at)
        self.assertEqual(submission.status, ManualPaymentSubmission.Status.APPROVED)
