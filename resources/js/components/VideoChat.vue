<template>
    <div>
        <h1>Video Chat</h1>
        
            <label for="name">Name</label>
            <input type="text" id="username" name="name" placeholder="Type your name...">
            <button id="join" @click="submitForm()">Join Room</button>
        
        <p id="count"></p>
        <div id="container">
            <div id="local" class="participant">
                <div id="local-video"></div>
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
            connected: false,
            room: null,
            videos: [],
            userNameInput:"",
            joinButton: null,
            form: null,
            container: null,
            count: null
        }
    },
    methods : {
        /*getAccessToken : function () {

            const _this = this
            const axios = require('axios')
            
            // Request a new token
            axios.get('/api/access_token')
                .then(function (response) {
                    _this.accessToken = response.data
                })
                .catch(function (error) {
                    console.log(error);
                })
                .then(function () {
                    _this.connectToRoom();
                });
        },
        connectToRoom : function () {

            const { connect, createLocalVideoTrack } = require('twilio-video');

            connect( this.accessToken, { name:'cool room' }).then(room => {
                
                console.log(`Successfully joined a Room: ${room}`);

                const videoChatWindow = document.getElementById('video-chat');

                createLocalVideoTrack().then(track => {
                    videoChatWindow.appendChild(track.attach());
                });

                room.on('participantConnected', participant => {
                    console.log(`Participant "${participant.identity}" connected`);

                    participant.tracks.forEach(publication => {
                        if (publication.isSubscribed) {
                            const track = publication.track;
                            videoChatWindow.appendChild(track.attach());
                        }
                    });

                    participant.on('trackSubscribed', track => {
                        videoChatWindow.appendChild(track.attach());
                    });
                });
            }, error => {
                console.error(`Unable to connect to Room: ${error.message}`);
            });
        },*/
        async addLocalVideo() {
            const localVideo = document.getElementById('local-video');
            const { connect, createLocalVideoTrack } = require('twilio-video');
            const track = await createLocalVideoTrack();
            localVideo.appendChild(track.attach());
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
                console.log(username)
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
            /*const response = await fetch('/get_token', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({username})
            })*/

            const _this = this;


            let formData = new FormData;
            formData.append('username', username);
            const axios = require('axios');
            axios.post('/api/access_token', JSON.stringify({username}),{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(function (response) {
                    console.log(response.data)
                    _this.accessToken = response.data;
                    console.log(response.data)
                })
                .catch(function (error) {
                    console.log(error);
                })
                .then(async function () {
                    const data = await _this.accessToken;

                    console.log(data);
            
                    const { connect, createLocalVideoTrack } = require('twilio-video');

                    _this.room = await connect(data);
                    let index = 0;
                    _this.room.participants.forEach(async (participant) =>{
                        await _this.participantConnected(participant);
                        console.log(participant.identity);
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
                        console.log(remoteParticipant.identity)
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

            this.connected = false;
            this.updateParticipantCount();
        },
        updateParticipantCount(){
            this.count.innerHTML = `${this.room.participants.size + 1} online users`;
        },
        participantConnected(participant){
            const template = `<div id="participant-${participant.sid}" class="participant">
                <div class="video"></div>
                <div>${participant.identity}</div>
            </div>`
            
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
            video.appendChild(track.attach());
            
        },
        participantDisconnected(participant){
            let id = `participant-${participant.sid}`;
            console.log(id);
            let participant_video = document.getElementById(id);
            participant_video.remove();
            this.updateParticipantCount();

        }
    },
    mounted : function () {
        const $ = selector => document.querySelector(selector);

        this.userNameInput = $('#username');
        this.form = $('#form');
        this.joinButton = $('#join');
        this.container = $('#container');
        this.count = $('#count');

        this.addLocalVideo();
    }
}
</script>