const APP_ID = '98677a6e35094190875e4203aaf61771'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
let UID = Number(sessionStorage.getItem('UID'))
let NAME = sessionStorage.getItem('name')





const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}

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


let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    deleteMember()
    window.open('/', '_self')
}

let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}

let toggleMic = async (e) => {
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}

let createMember = async () => {

    let response = await fetch(`/create_member/`, {
        method:'POST',
        headers: {
            'Content-Type':'application/json',
        },
        body: JSON.stringify({'name': NAME, 'room_name':CHANNEL, 'UID':UID})
    })
    let member = await response.json()
    return member
}


let getMember = async (user) => {
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}

let deleteMember = async () => {

    let response = await fetch(`/delete_member/`, {
        method:'POST',
        headers: {
            'Content-Type':'application/json',

        },
        body: JSON.stringify({'name': NAME, 'room_name':CHANNEL, 'UID':UID})
    })
}

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


  let chat = async (e) => {
      e.preventDefault()


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
        console.log(the_tid)
        let elem = document.getElementById(the_tid);
        elem.scrollIntoView({ block: 'center', inline: 'start' })

    
  }


  document.getElementById("chatpart").style.display = "none";
  
let enable_chat = async (e) => {

    let thiselem = document.getElementById("videoaudiopart").classList
    
    if(thiselem[1] === "col-lg-9"){
        thiselem.remove("col-lg-9");
        document.getElementById("chatpart").style.display = "none";
        e.target.style.backgroundColor = '#fff'
    } else {
        thiselem.add("col-lg-9")
        document.getElementById("chatpart").style.display = "block";
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
    
}

  
setInterval(getmsg, 2000);


joinAndDisplayLocalStream()

window.addEventListener('beforeunload', deleteMember)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('chat-btn').addEventListener('click', enable_chat)
document.getElementById('chatform').addEventListener('submit', chat)