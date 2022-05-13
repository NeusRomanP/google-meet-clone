<template>
    <div>
        <div class="video-container">
            <div :class="isRemote? 'no-video black remote-video' : 'no-video black local-video'" :id="isRemote ? '' : 'local-video'">
                <div class="circle blue">{{identity.charAt(0).toUpperCase()}}</div>
            </div>
            <div v-if="!isRemote" class="icons">
                <font-awesome-icon :class="'icon color-'+micro_color" id="microphone" @click="toggleMicro()" :icon="[ 'fas', 'microphone' ]" />
                <font-awesome-icon :class="'icon color-'+camera_color" id="camera" @click="toggleVideo()" :icon="[ 'fas', 'video' ]" />
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
        'identity',
        'camera_color',
        'micro_color'
    ],
    mounted(){
        
    }
}
</script>