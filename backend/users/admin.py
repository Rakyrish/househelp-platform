from django.contrib import admin
from django.utils.html import format_html
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    # What you see in the main list
    list_display = ('username', 'full_name', 'role', 'id_number', 'display_id_front', 'is_verified')
    list_filter = ('role', 'is_verified', 'location')
    search_fields = ('username', 'id_number', 'phone')
    list_editable = ('is_verified',) # Quick toggle verification without leaving the page

    # Function to show the image in the list
    def display_id_front(self, obj):
        if obj.id_photo_front:
            return format_html('<img src="{}" style="width: 100px; height: auto; border-radius: 5px;" />', obj.id_photo_front.url)
        return "No ID Uploaded"
    
    display_id_front.short_description = 'ID Photo'
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'Full Name'
    

    # Organize the detail view when you click a user
    fieldsets = (
        ('Authentication', {'fields': ('username', 'password', 'email', 'role')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone', 'location')}),
        ('Traceability & Docs', {'fields': ('id_number', 'id_photo_front', 'id_photo_back', 'is_verified')}),
        ('Emergency Contact', {'fields': ('kin_name', 'kin_phone', 'kin_relationship')}),
    )