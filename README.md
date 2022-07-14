# Vid Sync

**Vid Sync** is a fully functional video chat platform that includes peer-to-peer video and audio calls as well as text chat. its built based on the WebRTC (Web Real-Time Communications) protocol. WebRTC is an open-source protocol that lets you build applications that work on peer to peer connection. More about WebRTC can be found here: [https://webrtc.org/](https://webrtc.org/)

In this project, I used Agora RTC SDK, which is an abstraction layer over WebRTC that reduces the complexity of building a WebRTC project. I chose Agora's free version, which includes 10000 minutes of Voice Call, Video Call, and Interactive Live Streaming. More about Agora: [https://www.agora.io/en/](https://www.agora.io/en/)

## How to run the application

- Run to install required dependencies `pip install -r requirements.txt`
- Then change directory `cd vid_sync`
- Go to [https://www.agora.io/en/](https://www.agora.io/en/) and sign up for an account
- Create a new project under **Project Management**. Give it a name and for **use case** select **social → chatroom**
- Select **secured mode** under **Authentication Mechanism** and click submit.
- Go to the **config** of that new project. Scroll down and wait for the **Web demo**: syncing to be completed.
- Copy **App ID & Primary Certificate** and store it inside a `.env` file as

```bash
appId=<app_id_value>  
appCertificate=<app_certificate_value> 
```

This is used for authentication and creation of token.

- Run this to make migrations: `python manage.py migrate`
- `python manage.py runserver` to run the application.


