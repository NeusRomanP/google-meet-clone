<template>
    <div>
        <div class="video-container">
            <div :class="isRemote? 'video remote-video' : 'local-video'" :id="isRemote ? '' : 'local-video'">
                
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
        'micro_color',
        'camera_color'
    ],
    data: function(){
        return{
            
        }
    },
    mounted(){
        
    }
}
</script>