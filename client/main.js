import Vue from "vue";

const app = new Vue({
  el: "#app",
  data: {
    status: 'OFFLINE',
    message: "Hello Vue!",
    ws: new WebSocket('ws://localhost:3000')
  },
  render (h) {
    return h('div', {  }, [
      h('p', `status: ${this.status}`),
      h('p', `message: ${this.message}`)
    ])
  },
  created() {
    this.ws.onopen = () => this.status = 'ONLINE'
    this.ws.onclose = () => this.status = 'OFFLINE'
    this.ws.onmessage = res => this.message = res.data
  }
});
