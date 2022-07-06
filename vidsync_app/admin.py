from django.contrib import admin
from .models import Chat, RoomMember
# Register your models here.

admin.site.register(RoomMember)
admin.site.register(Chat)