var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

function onYouTubeIframeAPIReady() {
    console.log("ready");
    player = new YT.Player('player', {
        videoId: 'G5RpJwCJDqc',
        width: "560",
        height:"315",
        events: {
            'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();

    var interval = 500;

    var checkPlayerTime = function () {
        if(player.getPlayerState() == YT.PlayerState.PLAYING ) {
          var t = player.getCurrentTime();
          console.log(t)
        }

        setTimeout(checkPlayerTime, interval);
    }

    checkPlayerTime()
}

function onPlayerStateChange(event) {

}