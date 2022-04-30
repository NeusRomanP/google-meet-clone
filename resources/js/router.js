import Vue from "vue"
import VueRouter from "vue-router"
import Home from "./components/Home.vue"
import Room from "./components/VideoChat.vue"
import App from "./App.vue"

Vue.use(VueRouter)

const router = new VueRouter({
    mode:'history',
    routes: [
        {
            path: '/',
            component: Home,
            name: 'home',
        },
        {
            path: '/:room',
            component: Room,
            name: 'room',
        },

    ]
})

export default router