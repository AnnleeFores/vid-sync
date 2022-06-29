from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
import random
import time
import json


def index(request):
    return render(request, 'vidsync_app/index.html')

def room(request):
    return render(request, 'vidsync_app/room.html')