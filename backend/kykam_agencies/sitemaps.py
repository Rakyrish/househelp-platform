from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from django.utils import timezone
from users.models import User

# ─── 1. Static Frontend Pages ───────────────────────────────────────────────
class StaticViewSitemap(Sitemap):
    """Covers all static public-facing frontend routes."""
    priority = 0.9
    changefreq = 'weekly'

    def items(self):
        return [
            ('/', 1.0),
            ('/about', 0.8),
            ('/services', 0.85),
            ('/why-kykam', 0.8),
            ('/contact', 0.7),
            ('/register/worker', 0.9),
            ('/register/employer', 0.95),
            ('/login/worker', 0.6),
            ('/login/employer', 0.6),
        ]

    def location(self, item):
        path, _ = item

        return path

    def priority(self, item):
        _, prio = item
        return prio


# ─── 2. Public Worker Profile Pages ─────────────────────────────────────────
class WorkerProfileSitemap(Sitemap):
    """One URL per verified, active worker — grows automatically with the platform."""
    changefreq = 'daily'
    priority = 0.9

    def items(self):
        return User.objects.filter(
            role='worker',
            verification_status='verified',
            is_deleted=False,
            is_active=True,
        ).order_by('-date_joined')

    def location(self, obj):
        from django.utils.text import slugify
        name_slug = slugify(f"{obj.first_name}-{obj.last_name}")
        return f'/workers/{obj.id}-{name_slug}'

    def lastmod(self, obj):
        return obj.date_joined


# ─── 3. Location × Role Programmatic SEO Pages ──────────────────────────────
class LocationRoleSitemap(Sitemap):
    """
    Generates one URL per county × worker-type combination.
    These are the highest-volume local SEO targets:
      /hire/nannies-in-nairobi
      /hire/housemaids-in-mombasa
      etc.
    """
    changefreq = 'weekly'
    priority = 0.85

    # Kenya's top counties by population / search volume
    COUNTIES = [
        'nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret',
        'kiambu', 'machakos', 'thika', 'nyeri', 'meru',
        'kakamega', 'kisii', 'garissa', 'embu', 'kericho',
    ]

    # Worker roles (plural form for URL)
    ROLES = [
        'nannies',
        'housemaids',
        'cooks',
        'cleaners',
        'gardeners',
        'elderly-carers',
    ]

    def items(self):
        return [
            (role, county)
            for county in self.COUNTIES
            for role in self.ROLES
        ]

    def location(self, item):
        role, county = item
        return f'/hire/{role}-in-{county}'