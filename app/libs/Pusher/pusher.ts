import PusherServer from "pusher"
import Pusher from "pusher-js"
import { PusherEventMap, EventName } from "./pusherInterfaces"

export class TypedPusherServer extends PusherServer {
  constructor(options: PusherServer.Options) {
    super(options)
  }

  async trigger<K extends EventName>(
    channel: string | string[],
    event: K,
    data: PusherEventMap[K],
  ): Promise<PusherServer.Response> {
    return super.trigger(channel, event, data)
  }
}

export class TypedPusherClient {
  private client: Pusher

  constructor(key: string, options?: any) {
    this.client = new Pusher(key, options)
  }

  subscribe(channelName: string) {
    const channel = this.client.subscribe(channelName)

    return {
      ...channel,
      bind: <K extends EventName>(eventName: K, callback: (data: PusherEventMap[K]) => void, context?: any) => {
        channel.bind(eventName, callback, context)
      },
      unbind: <K extends EventName>(eventName?: K, callback?: (data: PusherEventMap[K]) => void, context?: any) => {
        channel.unbind(eventName, callback, context)
      },
    }
  }

  unsubscribe(channelName: string): void {
    this.client.unsubscribe(channelName)
  }

  disconnect(): void {
    this.client.disconnect()
  }

  bind<K extends EventName>(eventName: K, callback: (data: PusherEventMap[K]) => void, context?: any): void {
    this.client.bind(eventName, callback, context)
  }

  unbind<K extends EventName>(eventName?: K, callback?: (data: PusherEventMap[K]) => void, context?: any): void {
    this.client.unbind(eventName, callback, context)
  }

  get channels(): any {
    return (this.client as any).channels
  }
}

let pusherServerInstance: TypedPusherServer | null = null

export const getPusherServer = () => {
  if (!pusherServerInstance) {
    pusherServerInstance = new TypedPusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: "eu",
      useTLS: true,
    })
  }
  return pusherServerInstance
}

let pusherClientInstance: TypedPusherClient | null = null

export const getPusherClient = () => {
  if (!pusherClientInstance) {
    pusherClientInstance = new TypedPusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: "eu",
      disableStats: true,
    })
  }
  return pusherClientInstance
}
