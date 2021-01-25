<template>
  <div id="app">
    <Header :company-name="companyName" :logo="logo" />
    <router-view :origin-api-url="originApiUrl" />
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
export default {
  name: "App",
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: `${process.env.VUE_APP_VIDEO_CALL_COMPANY_NAME}`,
    // all titles will be injected into this template
    titleTemplate: `%s | Vonage`,
    meta: [
      // { charset: 'utf-8' },
      // { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      {
        name: "og:image",
        content: `${process.env.VUE_APP_API_SERVER_URL}/logo.png`,
      },
      {
        name: "og:title",
        content: `${process.env.VUE_APP_VIDEO_CALL_COMPANY_NAME}`,
      },
      {
        name: "og:description",
        content: "This is a demo showing Vonage API capabilities.",
      },
      {
        name: "og:url",
        content: `${process.env.VUE_APP_API_SERVER_URL}`,
      },
    ],
  },
  components: {
    Header,
  },
  data: function() {
    return {
      companyName: process.env.VUE_APP_VIDEO_CALL_COMPANY_NAME,
      logo: process.env.VUE_APP_VIDEO_CALL_LOGO_URL,
      serverUrl: process.env.VUE_APP_API_SERVER_URL,
    };
  },
  computed: {
    originApiUrl: function() {
      let url = location.origin;
      if (process.env.NODE_ENV === "development") {
        url = this.serverUrl;
      }
      return url;
    },
  },
};
</script>

<style>
*,
*:before,
*:after {
  box-sizing: inherit;
}
html {
  box-sizing: border-box;
}
body {
  margin: 0;
  height: 100vh;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
