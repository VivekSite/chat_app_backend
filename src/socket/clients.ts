import cache from 'persistent-cache'
import { SocketClient } from './../types/types'

export const clients = new Map<String, SocketClient>()
export const clientsCache = cache({
  base: '.cache',
  name: "clients",
  persist: true
})