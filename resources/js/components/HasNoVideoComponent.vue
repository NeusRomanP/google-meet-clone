<template>
    <div>
        <div class="video-container">
            <div :class="isRemote? 'no-video black remote-video' : 'no-video black local-video'" :id="isRemote ? '' : 'local-video'">
                <div class="circle blue">{{identity.charAt(0).toUpperCase()}}</div>
            </div>
            <div v-if="!isRemote" class="icons">
                <font-awesome-icon class="icon" id="microphone" @click="toggleMicro()" :icon="[ 'fas', 'microphone' ]" />
                <font-awesome-icon class="icon" id="camera" @click="toggleVideo()" :icon="[ 'fas', 'video' ]" />
            </div>
            <div class="responsive"></div>
        </div>
        <div>{{ identity }}</div>
    </div>
</template>
<script>
export default {
    props:[
        'toggleMicro',
        'toggleVideo',
        'isRemote',
        'identity'
    ],
    mounted(){
        console.log("entra");
    }
}
</script>