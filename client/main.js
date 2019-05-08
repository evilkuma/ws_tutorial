import Vue from "vue";

let user_name = localStorage.getItem('username')
while(!user_name) { user_name = prompt('Your name?') }
localStorage.setItem('username', user_name)

var chat

const app = new Vue({
  el: "#app",
  data: {
    status: 'OFFLINE',
    message: `Hello ${user_name}!`,
    ws: new WebSocket('ws://localhost:3000'),
    send_data: '',
    chat: [],
    chat_el: null,
    scroll: 100
  },
  methods: {
    send() {
      this.ws.send(JSON.stringify([user_name, this.send_data]))
      this.send_data = ''
    }
  },
  render (h) {
    chat = h('div', {
      domProps: {scrollTop: this.scroll},
      class: 'chat'
    }, this.chat.map(li => {
      return h('div', {class: 'item'}, [
        h('div', {class: 'name'}, li[0]),
        h('div', {class: 'mess'}, li[1]),
        h('div', {class: 'time'}, li[2])
      ])
    }))

    return h('div', {  }, [
      h('p', `status: ${this.status}`),
      h('p', `message: ${this.message}`),
      
      //chat
      chat,

      // sender
      h('div', {}, [
        h('input', {
          domProps: { value: this.send_data },
          attrs: {
            type: 'text',
            value: this.send_data
          },
          on: {
            input: e => {
              this.send_data = e.target.value
            },
            keydown: e => {
              if(e.keyCode === 13) this.send()
            }
          }
        }),
        h('button', {
          on: {
            click: this.send
          }
        }, 'send')
      ])
    ])
  },
  created() {
    this.ws.onopen = () => this.status = 'ONLINE'
    this.ws.onclose = () => this.status = 'OFFLINE'
    this.ws.onmessage = res => {
      const data = JSON.parse(res.data)
      // проверка на вложеность (пришло много сообщение или одно)
      if(res.data.slice(0, 3) === '["[') {
        this.chat.push(...data.map(e => JSON.parse(e)))
      } else {
        this.chat.push(data)
      }
      
      // хз как сделать, что бы сеттился после перерендеринга хтмл
      setTimeout(e => {this.scroll = chat.elm.scrollHeight - chat.elm.clientHeight}, 20)
    }
  }
});
