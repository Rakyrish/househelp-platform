from django.contrib.sitemaps import Sitemap
from django.urls import reverse

class StaticViewSitemap(Sitemap):
    priority = 0.8
    changefreq = 'weekly'

    def items(self):
        # These names must match the 'name=' in your urls.py
        # Since you are an API, we will point to your registration/login pages
        return ['register-worker', 'register-employer', 'login-worker', 'set-csrf']

    def location(self, item):
        return reverse(item)