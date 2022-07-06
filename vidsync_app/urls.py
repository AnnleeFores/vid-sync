from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('room/', views.room, name='room'),


    path('get_token/', views.getToken),
    path('member/', views.member),
    path('delete_member/', views.deleteMember),
    path('chat/<str:room_name>', views.chat),
]