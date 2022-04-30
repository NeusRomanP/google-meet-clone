<template>
    <div class="home-view">
        <div>
            <label for="roomname">Enter the name of the room you want to join</label>
            <input type="text" id="roomname" name="roomname" placeholder="Type the room name...">
            <button id="join" @click="submitForm()">Join Room</button>
        </div>
    </div>
</template>
<script>
export default {
    methods:{
        submitForm(){
            let roomname = document.getElementById("roomname").value;
            if(roomname != ""){
                this.$router.push(`/${roomname}`);
            }
        }
    }
}
</script>