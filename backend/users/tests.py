from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import Booking, ManualPaymentSubmission

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

    def create_employer(self, **overrides):
        defaults = {
            "username": overrides.get("email", "employer@example.com"),
            "email": overrides.get("email", "employer@example.com"),
            "first_name": "Test",
            "last_name": "Employer",
            "phone": overrides.get("phone", "254700000010"),
            "role": "employer",
            "is_verified": True,
            "status": "approved",
            "password": "SafePass123!",
        }
        password = overrides.pop("password", defaults.pop("password"))
        defaults.update(overrides)
        user = User.objects.create_user(**defaults)
        user.set_password(password)
        user.save()
        return user

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
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["verification_status"], "verified")
        self.assertEqual(response.data["user"]["role"], "worker")
        self.assertEqual(response.data["user"]["status"], "approved")
        self.assertEqual(response.data["redirect"], "/worker/dashboard")
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

    def test_employer_registration_returns_success_and_login_redirect(self):
        response = self.client.post(
            "/api/register/employer/",
            {
                "full_name": "Jane Employer",
                "email": "jane@example.com",
                "password": "SafePass123!",
                "phone": "0712345678",
                "location": "Nairobi",
                "family_size": "4",
                "worker_type": "general_househelp",
                "salary": "25000",
                "requirements": "Need a live-out nanny",
                "start_date": "2026-04-20",
                "accommodation": "live_out",
                "id_number": "EMP123456",
                "accepted_terms": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["redirect"], "/login")
        self.assertEqual(response.data["user"]["role"], "employer")
        self.assertEqual(response.data["user"]["status"], "pending")

    def test_employer_login_returns_role_status_and_dashboard_redirect(self):
        employer = self.create_employer()

        response = self.client.post(
            "/api/login/employer/",
            {"phone": employer.phone, "password": "SafePass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["role"], "employer")
        self.assertEqual(response.data["status"], "approved")
        self.assertEqual(response.data["user"]["role"], "employer")
        self.assertEqual(response.data["user"]["status"], "approved")
        self.assertEqual(response.data["redirect"], "/employer/dashboard")
        self.assertIn("token", response.data)

    def test_employer_dashboard_stats_and_hires_include_worker_metadata(self):
        employer = self.create_employer(phone="254700000011", email="dashboard@example.com")
        worker = self.create_worker(
            phone="254700000012",
            email="hire-worker@example.com",
            first_name="Alice",
            last_name="Helper",
            worker_type="nanny",
            status="approved",
            is_verified=True,
            is_available=False,
        )
        Booking.objects.create(employer=employer, worker=worker, status="accepted")

        token = Token.objects.create(user=employer)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        stats_response = self.client.get("/api/employer-dashboard/stats/")
        hires_response = self.client.get("/api/employer-dashboard/my_requests/")

        self.assertEqual(stats_response.status_code, 200)
        self.assertEqual(stats_response.data["total_sent"], 1)
        self.assertEqual(stats_response.data["accepted"], 1)

        self.assertEqual(hires_response.status_code, 200)
        self.assertEqual(len(hires_response.data), 1)
        self.assertEqual(hires_response.data[0]["worker_name"], "Alice Helper")
        self.assertEqual(hires_response.data[0]["worker_type"], "nanny")
        self.assertEqual(hires_response.data[0]["worker_phone"], worker.phone)
        self.assertIn("passport_img", hires_response.data[0])

    def test_workers_endpoint_returns_only_available_workers(self):
        employer = self.create_employer(phone="254700000013", email="directory@example.com")
        available_worker = self.create_worker(
            phone="254700000014",
            email="available@example.com",
            first_name="Available",
            last_name="Worker",
            worker_type="cook",
            status="approved",
            is_verified=True,
            is_available=True,
        )
        self.create_worker(
            phone="254700000015",
            email="busy@example.com",
            first_name="Busy",
            last_name="Worker",
            worker_type="cook",
            status="approved",
            is_verified=True,
            is_available=False,
        )

        token = Token.objects.create(user=employer)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        response = self.client.get("/api/workers/", {"search": "Available", "worker_type": "cook"})

        self.assertEqual(response.status_code, 200)
        worker_ids = [worker["id"] for worker in response.data]
        self.assertEqual(worker_ids, [available_worker.id])
