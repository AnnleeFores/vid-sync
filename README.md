# Vid Sync

**Vid Sync** is a fully functional video chat platform that includes peer-to-peer video and audio calls as well as text chat. its built based on the WebRTC (Web Real-Time Communications) protocol. WebRTC is an open-source protocol that lets you build applications that work on peer to peer connection. More about WebRTC can be found here: [https://webrtc.org/](https://webrtc.org/)

In this project, I used Agora RTC SDK, which is an abstraction layer over WebRTC that, in exchange for money, reduces the complexity of building a WebRTC project. For this project, I chose Agora's free version, which includes 10000 minutes of Voice Call, Video Call, and Interactive Live Streaming. More about Agora: [https://www.agora.io/en/](https://www.agora.io/en/)

## Working

Vid Sync application handles the video and audio call with Agora RTC. Text Chat is implemented using the Django server, a database, and some ajax. 

The website consists primarily of two HTML pages: one for logging users into the room and another for displaying the video call and chat controls. By providing a room name and a user name, users can join or create a chat room. Other users can join this room by using the same room name. When a user joins the website, the website requests access to the camera and microphone feeds, and when the user agrees, the user feed is activated. To control these two feeds, there is also a camera and mic button. As new users join, the video feed will automatically adjust to accommodate them. The chat button opens the chat windows, where users can text chat. The close button terminates the user's call. If everyone leaves the room, the room is deleted.

## What’s contained in each part

### Video & audio Part

The user's username and room name that the users entered are saved into session storage, along with App ID, the UID (a random number generated between 1 and 230) and token obtained by passing agora id, UID certificate, and other details to the `agora_token_builder` module in the backend. All the confidential data are stored inside an environmental variable and is accessed by using python `dotenv` module. The user is then redirected to the room page, which includes a video feed, chat space, and controls. For responsiveness, everything is designed with Bootstrap columns and CSS. To enable real-time audio and video communications, `AgoraRTC_N-4.12.1.js` an SDK provided by agora, is used. `videochat.js` manages the video chat feed on the user's end by adding video and audio tracks to the videostream, handling users, and  other application controls.

When a user enters the room page, `videochat.js` retrieves information from session storage and uses it to generate local and remote tracks. Modifies the HTML to show the channel name and video feed. Details are saved in a database and can be accessed or deleted as needed.

### Text Chat Part

The chat box portion of `room.html` is normally hidden using Javascript; however, when the user clicks the chat button, it becomes visible. Chat works by saving the text chat with a timestamp on the database and retrieving it every 2000ms. This information is then displayed asynchronously in the chat box.

## Distinctiveness and Complexity

I believe my project is sufficiently distinct from the other projects listed in the requirements, and I have had the opportunity to learn things outside of the course and apply them to this project.

This project primarily employs WebRTC to serve as a video chat platform. Because I had no prior experience with WebRTC, I followed its documentation and conducted extensive research to finally find a perfect solution for my project. The plain WebRTC implementation was difficult, so I chose agora for this project.

These are some of the other things I learned and put into practise during this project.

- Data storage and retrieval from session storage.
- Running API fetches every 2000ms to reduce chat latency.
- How to Use Async/Await in JS
- Developing RESTful APIs.
- Designing a mobile-responsive frontend.

I couldn't figure out how to do this project without `csrf_exempt`. Even though I was able to get the CSRF to work on a single session using this [documentation](https://docs.djangoproject.com/en/4.0/ref/csrf/), the CSRF verification failed when multiple sessions were running concurrently. So I'm still working on a solution for this. For the time being, it works flawlessly with `csrf_exempt`.

## How to run the application

- Run to install required dependencies `pip install -r requirements.txt`
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