<template>
    <div>
        <h1>Video Chat</h1>        
        <label for="name">Name</label>
        <input type="text" id="username" name="name" placeholder="Type your name...">
        <button id="join" @click="submitForm()">Join Room</button>
        <p id="count"></p>
        <div id="container" class="container one-item">
            <div id="local" class="participant">
                <div :is="hasVideo ? HasVideo: HasNoVideo" :identity="'Yo'" :isRemote="false" :toggleMicro="toggleMicro" :toggleVideo="toggleVideo"  :micro_color="changeMicroColor" :camera_color="camera_color"></div>
            </div>
           
           <div v-for="(remote, key) in remotes" :key="key" :id="'participant-'+remote.sid" class="participant">
                <div :is="remote.videoTracks.size != 0 ? HasVideo: HasNoVideo" :identity="remote.identity" 
                :isRemote="true" :toggleMicro="toggleMicro" 
                :toggleVideo="toggleVideo" :micro_color="micro_color" :camera_color="camera_color"></div>
            </div>
            
        </div>
    </div>
</template>
<script>
import HasNoVideo from "./HasNoVideoComponent.vue"
import HasVideo from "./HasVideoComponent.vue"
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
            audioEnabled: true,
            videoEnabled: true,
            localVideoTrack: null,
            HasNoVideo: HasNoVideo,
            HasVideo: HasVideo,
            tmp: null,
            remotes: [],
            micro_color:"white",
            camera_color:"white",
        }
    },
    computed:{
        remoteVideos(){
            return this.remotes;
        },
        changeCameraColor(){
            return this.camera_color;
        },
        changeMicroColor(){
            return this.micro_color;
        }
    },
    components: {
        HasNoVideo: HasNoVideo,
        HasVideo: HasVideo,
    },
    methods : {
        async addLocalVideo() {
            this.hasVideo = true;
            
            const { connect, createLocalVideoTrack } = require('twilio-video');
            this.localVideoTrack = await createLocalVideoTrack();
                
            const localVideo = document.getElementById('local-video');
            localVideo.appendChild(this.localVideoTrack.attach());

            
        },
        async addNoVideo() {
            const localVideo = document.getElementById('local');
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
            
                    const { connect, createLocalVideoTrack } = require('twilio-video');
                    
                    _this.room = await connect(data, {video: _this.hasVideo, audio: _this.hasAudio});

                    if(!_this.audioEnabled){
                        _this.room.localParticipant.audioTracks.forEach(
                            publication => publication.track.disable()
                        );
                    }else{
                        _this.room.localParticipant.audioTracks.forEach(
                            publication => publication.track.enable()
                        );
                    }
                    
                    _this.room.participants.forEach(async (participant) =>{
                        await _this.participantConnected(participant);
                        window.onbeforeunload = function(e){
                            e.preventDefault()
                            _this.disconnect();
                            _this.joinButton.disabled = false;
                            _this.joinButton.innerText = 'Join room'
                            return
                            
                        }
                        
                    });
                    _this.room.on('participantConnected', remoteParticipant =>{
                        _this.participantConnected(remoteParticipant)
                        _this.videos = document.getElementsByClassName('participant');
                        
                        window.onbeforeunload = function(e){
                            e.preventDefault()
                            participantDisconnected(remoteParticipant);
                            return
                        }
                    });
                    _this.room.on('participantDisconnected', _this.participantDisconnected);
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
            container.classList.remove("more-two-items");
            //this.updateParticipantCount();
        },
        updateParticipantCount(){
            let container = document.getElementById("container");
            this.count.innerHTML = `${this.room.participants.size + 1} online users`;
            if(this.room.participants.size == 0){
                container.classList.add("one-item");
                container.classList.remove("more-two-items");
            }else if(this.room.participants.size + 1 > 2){
                container.classList.remove("one-item");
                container.classList.add("more-two-items");
            }else{
                container.classList.remove("one-item");
                container.classList.remove("more-two-items");
            }
        },
        participantConnected(participant){
            let template = "";
            
            this.remotes.push(participant);

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
        toggleMicro(){
            if(this.room){
                if(this.audioEnabled){
                    this.room.localParticipant.audioTracks.forEach(
                        publication => publication.track.disable()
                    );
                    this.audioEnabled = false;
                    this.micro_color='red';
                }else{
                    this.room.localParticipant.audioTracks.forEach(
                        publication => publication.track.enable()
                    );
                    this.audioEnabled = true;
                    this.micro_color='white';
                }
                
            }else{
                if(this.audioEnabled){
                    this.audioEnabled=false;
                    this.micro_color='red';
                }else{
                    this.audioEnabled=true;
                    this.micro_color='white';
                }
            }

            let mic = document.getElementById('microphone');
            mic.style.color= this.micro_color;
            
        },
        toggleVideo(){
            if(this.room){
                if(this.videoEnabled){
                    this.room.localParticipant.videoTracks.forEach(
                        publication => publication.track.disable()
                    );
                }else{
                    this.room.localParticipant.videoTracks.forEach(
                        publication => publication.track.enable()
                    );
                }
            }

            if(this.videoEnabled){
                this.hasVideo = false;
                this.videoEnabled=false;
                this.addNoVideo();
                this.camera_color="red";
            }else{
                this.videoEnabled=true;
                this.hasVideo = true;
                this.addLocalVideo();
                this.camera_color="white";
            }
        }
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
                
                _this.addLocalVideo();
            }, 
            function(){
               
                _this.addNoVideo();
            }
        )
        
    }
}
</script>