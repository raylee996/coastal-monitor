import { WebsocketBuilder, Websocket } from 'websocket-ts';

type MessageFn = (data: any) => void

class ClientWebsocket {

  ws: Websocket | null = null
  private messageList: any[] = []
  private repeatMessageList: any[] = []
  private isReady: boolean = false
  private isClose: boolean = false
  private isReBuilds: boolean = false
  private errorCount: number = 0
  private reconnectTimer: NodeJS.Timer | undefined = undefined

  callMessageFn: MessageFn | null = null

  constructor(url: string, protocols?: string | string[]) {
    console.debug('ClientWebsocket')
    this.createClient(url, protocols || '')
  }

  createClient(url: string, protocols: string | string[]) {
    console.debug("[Websocket]:createClient");

    let timer: NodeJS.Timer

    this.isReady = false

    this.ws = new WebsocketBuilder(url)
      .withProtocols(protocols || '')
      .onMessage((i, ev) => {
        this.callMessageFn && this.callMessageFn(ev.data)
      })
      .onError((i, ev) => {
        console.warn("[Websocket]: An error occurred", ev)
        this.isReady = false

        clearInterval(timer)
        clearTimeout(this.reconnectTimer)

        if (!this.isClose) {
          if (this.errorCount < 10) {
            console.warn('[Websocket]: wait new create client 5s onec')
            this.errorCount += 1
            this.reconnectTimer = setTimeout(() => {
              this.isReBuilds = true
              this.createClient(url, protocols)
            }, 5 * 1000)
          } else {
            console.warn('[Websocket]: wait new create client 60s onec')
            this.reconnectTimer = setTimeout(() => {
              this.isReBuilds = true
              this.createClient(url, protocols)
            }, 60 * 1000)
          }
        } else {
          console.debug('[Websocket]: close')
        }

      })
      .onClose(() => {
        console.debug("[Websocket]: Connection is closed")
        this.isReady = false

        clearInterval(timer)

        if (!this.isClose) {
          console.debug('[Websocket]: wait new create client 60s onec')
          setTimeout(() => {
            this.isReBuilds = true
            this.createClient(url, protocols)
          }, 60 * 1000)
        }

      })
      .onRetry(() => {
        console.debug("[Websocket]: A try to re-connect is made")
        this.isReady = true
      })
      .onOpen(() => {
        console.debug("[Websocket]: Connection is opened or re-opened")

        if (this.isClose) {
          this.ws?.close(1000)
        } else {
          this.isReady = true
          this.messageList.forEach(data => {
            this.ws?.send(data)
          })
          this.messageList = []
        }

        if (this.isReBuilds) {
          this.isReBuilds = false
          this.repeatMessageList.forEach(data => {
            this.ws?.send(data)
          })
        }
      })
      .build();

    timer = setInterval(() => {
      this.ws?.send(JSON.stringify({
        module: "00",
        cmd: "0001"
      }))
    }, 30 * 1000)
  }

  send(data: any) {
    if (this.isReady && this.ws) {
      this.ws.send(data)
    } else {
      this.messageList.push(data)
    }
    if (this.repeatMessageList.length > 20) {
      this.repeatMessageList.splice(0, 1)
    }
    this.repeatMessageList.push(data)
  }

  onMessage(cb: MessageFn) {
    this.callMessageFn = cb
  }

  close() {
    this.isClose = true

    if (this.isReady) {
      this.ws?.close(1000)
    }
  }

}

export default ClientWebsocket