/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

window.Vue = require('vue').default;

import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'

/* import specific icons */
import { faMicrophone, faVideo } from '@fortawesome/free-solid-svg-icons'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* add icons to the library */
library.add(faMicrophone, faVideo)

/* add font awesome icon component */
Vue.component('font-awesome-icon', FontAwesomeIcon)

// const files = require.context('./', true, /\.vue$/i)
// files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

Vue.component('example-component', require('./components/ExampleComponent.vue').default);
Vue.component('video-chat', require('./components/VideoChat.vue').default);
Vue.component('home-view', require('./components/Home.vue').default);
Vue.component('main-view', require('./App.vue').default);
Vue.component('has-no-video-component', require('./components/HasNoVideoComponent.vue').default);
Vue.component('has-video-component', require('./components/HasVideoComponent.vue').default);

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

const app = new Vue({
    router,
    el: '#app',
});
