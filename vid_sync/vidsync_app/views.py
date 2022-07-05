from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
import random
import time
import json
import os
from dotenv import load_dotenv

from .models import RoomMember, Chat
# Create your views here.
from django.views.decorators.csrf import csrf_exempt


load_dotenv()


def getToken(request):
    appId = os.getenv('appId')
    appCertificate = os.getenv('appCertificate')
    channelName = request.GET.get('channel')
    uid = random.randint(1,230)
    expirationTimeInSeconds  = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1

    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token': token, 
    'uid': uid}, 
    safe=False)

def index(request):
    return render(request, 'vidsync_app/index.html')

def room(request):
    return render(request, 'vidsync_app/room.html')

@csrf_exempt
def createMember(request):
    data = json.loads(request.body)

    member, created = RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name'] 
    )
    return JsonResponse({'name': data['name']}, safe=False)


def getMember(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')

    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name,
    )

    name = member.name
    return JsonResponse({'name': name}, safe=False)

@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)
    
    try:

        member = RoomMember.objects.get(
            name=data['name'],
            uid=data['UID'],
            room_name=data['room_name'],
        )
        member.delete()
    except:
        pass

    return JsonResponse("member was deleted", safe=False)

@csrf_exempt
def chat(request, room_name):

    if request.method == "POST":
        data = json.loads(request.body)
        chat=data['text']

        try:
            member = RoomMember.objects.get(
                name=data['name'],
                uid=data['UID'],
                room_name=room_name,
            )

            chat = Chat.objects.create(member=member, chat=chat)
        except:
            pass

        return JsonResponse({'message': 'success'}, safe=False)

    else:
        try:
            chats = Chat.objects.filter(member__room_name=room_name).order_by("date")
        except:
            pass
        return JsonResponse([chat.serialize() for chat in chats], safe=False)
