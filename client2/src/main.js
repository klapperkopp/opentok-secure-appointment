import Vue from "vue";
import VueRouter from "vue-router";
import VueMeta from "vue-meta";
import VueAxios from "vue-axios";
import axios from "axios";
import VueSwal from "vue-swal";
import App from "./App.vue";
import { BootstrapVue } from "bootstrap-vue";
import VueClipboard from "vue-clipboard2";

import VideoCall from "./components/VideoCall";
import Booking from "./components/Booking";
import Landing from "./components/Landing";

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(VueRouter);
Vue.use(VueMeta, {
  keyName: "metaInfo",
  attribute: "data-vue-meta",
  ssrAttribute: "data-vue-meta-server-rendered",
  tagIDKeyName: "vmid",
  refreshOnceOnNavigation: true,
});
Vue.use(VueSwal);
Vue.use(VueClipboard);

Vue.use(BootstrapVue);

const routes = [
  { path: "/booking", component: Booking },
  { path: "/video", component: VideoCall, query: { token: "" } },
  { path: "/home", component: Landing },
  { path: "*", redirect: "/booking" },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

new Vue({
  components: { App, Booking, VideoCall, Landing },
  render: (h) => h(App),
  router,
}).$mount("#app");
