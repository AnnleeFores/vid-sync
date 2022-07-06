from django.db import models

# Create your models here.
class RoomMember(models.Model):
    name = models.CharField(max_length=200)
    uid = models.CharField(max_length=200)
    room_name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Chat(models.Model):
    member = models.ForeignKey(RoomMember, on_delete=models.CASCADE, related_name="member")
    chat = models.CharField(max_length=400)
    date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.member}, {self.chat}, {self.date}"

    def serialize(self):
        return {
            "id": self.id,
            "chat": self.chat,
            "name": self.member.name,
            "uid": self.member.uid,
            "room_name": self.member.room_name,
            "timestamp": self.date.strftime("%I:%M %p")
        }
