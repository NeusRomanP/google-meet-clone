<template>
    <div>
        <h1>Video Chat</h1>        
        <label for="name">Name</label>
        <input type="text" id="username" name="name" placeholder="Type your name...">
        <button id="join" @click="submitForm()">Join Room</button>
        <p id="count"></p>
        <div id="container" class="one-item">
            <div id="local" class="participant">
                <div class="video-container">
                    <div id="local-video" class="local-video"></div>
                    <div class="responsive"></div>
                </div>
                <div>Yo</div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'video-chat',
    data: function () {
        return {
            accessToken: '',
            navigator: null,
            hasVideo: true,
            hasAudio: true,
            connected: false,
            room: null,
            videos: [],
            userNameInput:"",
            joinButton: null,
            form: null,
            container: null,
            count: null,
        }
    },
    methods : {
        async addLocalVideo() {
            const localVideo = document.getElementById('local-video');
            const { connect, createLocalVideoTrack } = require('twilio-video');
            const track = await createLocalVideoTrack();
            localVideo.appendChild(track.attach());
            this.hasVideo = true;
        },
        async addNoVideo() {
            const localVideo = document.getElementById('local');
            const template = `
            <div class="video-container">
                <div class="no-video black local-video">
                    <div class="circle blue"></div>
                </div>
                <div class="responsive"></div>
            </div>
            <div>Yo</div>`
            localVideo.innerHTML = template;
            this.hasVideo = false;
        },
        async submitForm(){
            this.videos = document.getElementsByClassName('participant');
            if(this.connected){
                this.disconnect();
                this.joinButton.disabled = false;
                this.joinButton.innerText = 'Join room'
                return
            }

            if(!this.connected){
                const username = this.userNameInput.value;
                if(!username){
                    return alert('Please, provide an username');
                }
                this.joinButton.disabled = true;
                this.joinButton.innerText = 'Connecting...'

                try{
                    await this.connect({username})
                    this.joinButton.disabled = false;
                    this.joinButton.innerText = 'Leave room'
                }catch(e){
                    console.log(e)
                    alert('Failed to connect');
                    this.joinButton.disabled = false;
                    this.joinButton.innerText = 'Join room'
                }
            }
        },
        async connect ({username}){
            const _this = this;
            let formData = new FormData;
            let url = location.href
            let splited = url.split("/");
            let room = splited[splited.length-1];
            
            const axios = require('axios');
            axios.post('/api/access_token', JSON.stringify({username, room}),{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(function (response) {
                    _this.accessToken = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                })
                .then(async function () {
                    const data = await _this.accessToken;

                    //console.log(data);
            
                    const { connect, createLocalVideoTrack } = require('twilio-video');
                    
                    _this.room = await connect(data, {video: _this.hasVideo, audio: _this.hasAudio});
                    
                    _this.room.participants.forEach(async (participant) =>{
                        await _this.participantConnected(participant);
                        //console.log(participant.identity);
                        //window.onbeforeunload = participantDisconnected(participant);
                        window.onbeforeunload = function(e){
                            e.preventDefault()
                            _this.disconnect();
                            _this.joinButton.disabled = false;
                            _this.joinButton.innerText = 'Join room'
                            return
                            
                        }
                        
                    });

                    _this.room.on('participantConnected', remoteParticipant =>{
                        //console.log(remoteParticipant.identity)
                        _this.participantConnected(remoteParticipant)
                        _this.videos = document.getElementsByClassName('participant');
                        
                        window.onbeforeunload = function(e){
                            e.preventDefault()
                            participantDisconnected(remoteParticipant);
                            return
                            //participantDisconnected(remoteParticipant);
                        }
                    });
                    _this.room.on('participantDisconnected', _this.participantDisconnected);
                    //console.log(room);
                    _this.connected = true;
                    _this.updateParticipantCount();
                });

            
        },
        disconnect(){
            let videos_length = this.videos.length;
            let videos_to_remove = [];
            for(let i = 0; i < videos_length; i++){
                let video_id = this.videos[i].id;
                if(video_id != "local"){
                    videos_to_remove.push(video_id);
                }
            }

            videos_to_remove.forEach(element => {
                document.getElementById(element).remove();
            });
            
            this.room.disconnect();

            this.count.innerHTML="";
            this.connected = false;
            container.classList.add("one-item");
            //this.updateParticipantCount();
        },
        updateParticipantCount(){
            let container = document.getElementById("container");
            this.count.innerHTML = `${this.room.participants.size + 1} online users`;
            if(this.room.participants.size == 0){
                container.classList.add("one-item");
            }else{
                container.classList.remove("one-item");
            }
        },
        participantConnected(participant){
            let template = "";

            if(participant.videoTracks.size != 0){
                template = `
                <div id="participant-${participant.sid}" class="participant">
                    <div class="video-container">
                        <div class="video remote-video"></div>
                        <div class="responsive"></div>
                    </div>
                    <div>${participant.identity}</div>
                </div>`
            }else{
                template = `
                <div class="participant" id="participant-${participant.sid}">
                    <div class="video-container">
                        <div class="no-video black remote-video">
                            <div class="circle blue"><p>${participant.identity.charAt(0).toUpperCase()}</p></div>
                        </div>
                        <div class="responsive"></div>
                    </div>
                    <div>${participant.identity}</div>
                </div>`
            }
            
            

            console.log(participant.videoTracks.size);
            
            this.container.insertAdjacentHTML('beforeend', template);

            participant.tracks.forEach((localTrackPublication) =>{
                
                const {isSubscribed, track} = localTrackPublication;
                if(isSubscribed){
                    this.attachTrack(track, participant);
                }
            });
            participant.on('trackSubscribed', (track) => {
                this.attachTrack(track, participant)
            })

            participant.on('trackUnsubscribed', track => track.detach());

            this.updateParticipantCount();
        },
        attachTrack(track, participant){
            const video = container.querySelector(`#participant-${participant.sid} .video`);
            if(video){
                video.appendChild(track.attach());
            }
        },
        participantDisconnected(participant){
            let id = `participant-${participant.sid}`;
            let participant_video = document.getElementById(id);
            participant_video.remove();
            this.updateParticipantCount();

        },
    },
    mounted : function () {
        const $ = selector => document.querySelector(selector);

        this.userNameInput = $('#username');
        this.form = $('#form');
        this.joinButton = $('#join');
        this.container = $('#container');
        this.count = $('#count');

        this.navigator = navigator || navigator.mediaDevices;
        let _this = this;

        this.navigator.getUserMedia(
            {video: true},
            function(){
                console.log("has video")
                _this.addLocalVideo();
            }, 
            function(){
                console.log("doesn't have video")
                _this.addNoVideo();
            }
        )
        
    }
}
</script>