// collects details from session storage
const APP_ID = sessionStorage.getItem('app_id')
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
let UID = Number(sessionStorage.getItem('UID'))
let NAME = sessionStorage.getItem('name')

// enables Agora RTC client
const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}

// provides local stream of videochat
let joinAndDisplayLocalStream = async () => {

    document.getElementById('room-name').innerText = CHANNEL

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try {
        await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch(error) {
        console.error(error)
        window.open('/','_self')
    }

    

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let member = await createMember()

    
          


    let player = `<div class="video-container" id="user-container-${UID}">
    <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
    <div class="video-player" id="user-${UID}"></div>
</div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0], localTracks[1]])
}

// function to handle joining users
let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if(mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player !== null) {
            player.remove() 
        }

        let member = await getMember(user)
        
        player = `<div class="video-container" id="user-container-${user.uid}">
        <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
        <div class="video-player" id="user-${user.uid}"></div>
    </div>`

        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`)
    }

    if(mediaType === 'audio') {
        user.audioTrack.play()
    }
}

// function to delete user display when a person leaves
let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

// function to remove local stream and remove member
let leaveAndRemoveLocalStream = async () => {
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    deleteMember()
    window.open('/', '_self')
}

// camera toggle function
let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}

// mic toggle function
let toggleMic = async (e) => {
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}

// POST createmember data to server to be stored in database
let createMember = async () => {

    let response = await fetch(`/member/`, {
        method:'POST',
        headers: {
            'Content-Type':'application/json',
        },
        body: JSON.stringify({'name': NAME, 'room_name':CHANNEL, 'UID':UID})
    })
    let member = await response.json()
    return member
}

// get member details from database
let getMember = async (user) => {
    let response = await fetch(`/member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}

// delete a member from stream and database
let deleteMember = async () => {

    let response = await fetch(`/delete_member/`, {
        method:'POST',
        headers: {
            'Content-Type':'application/json',

        },
        body: JSON.stringify({'name': NAME, 'room_name':CHANNEL, 'UID':UID})
    })
}

// function to get chat from database and display them on chat section
let getmsg = async () => {

    let chats = await fetch(`/chat/${CHANNEL}`)
    let chat = await chats.json()

    let chatmsg = ''
    let tid = ''

    chat.forEach(element => {

        tid = `t${element.id}`
        let ifthere = document.getElementById(tid);

        if (ifthere === null) {
            if (Number(element.uid) === UID) {
                chatmsg = `<div id="t${element.id}" style="word-wrap: break-word;" class="my-4 text-end"><p class="chatuser">${element.name} - ${element.timestamp}</p><span class="chatmsg" style="max-width: 100px;">${element.chat}</span></div>`
                document.getElementById('msgbox').insertAdjacentHTML('beforeend', chatmsg)
            } else {
                chatmsg = `<div id="t${element.id}" style="word-wrap: break-word;" class="my-4 text-start"><p class="chatuser">${element.name} - ${element.timestamp}</p><span class="chatmsg">${element.chat}</span></div>`
                document.getElementById('msgbox').insertAdjacentHTML('beforeend', chatmsg)
            }
        }
  });
  return tid;
}

    // function to POST text chat to database
  let chat = async (e) => {
      e.preventDefault() //prevents default submission of form and reloading the site


      let text = e.target.text.value

      let response = await fetch(`/chat/${CHANNEL}`, {
        method:'POST',
        headers: {
            'Content-Type':'application/json',
        },
        body: JSON.stringify({'text': text, "name": NAME, "UID": UID})
      })
      let resp = await response.json()
      console.log(resp)

      document.getElementById('text').value = ""

      document.getElementById('msgbox').value = ''

      
      
        let the_tid = await getmsg()
        let elem = document.getElementById(the_tid);
        elem.scrollIntoView({ block: 'center', inline: 'start' })
  }

  
// function to enable and disable chat section
let enable_chat = async (e) => {

    let thiselem = document.getElementById("videoaudiopart").classList  
    
    if(thiselem[1] === "col-lg-9"){
        thiselem.remove("col-lg-9");
        document.getElementById("chatpart").style.display = "none";
        e.target.style.backgroundColor = '#fff'
    } else {
        setInterval(getmsg, 2000);
        thiselem.add("col-lg-9")
        document.getElementById("chatpart").style.display = "block"; //displays chat section when clicked
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
    
}


joinAndDisplayLocalStream()

// various event listeners

window.addEventListener('beforeunload', deleteMember)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('chat-btn').addEventListener('click', enable_chat)
document.getElementById('chatform').addEventListener('submit', chat)