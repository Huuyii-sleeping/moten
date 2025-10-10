import { defineStore } from 'pinia'
import { useCollaborationStore } from './collaborationStore'

export const useRoomStore = defineStore('room', () => {
  const collab = useCollaborationStore()

  function createRoom(userName: string, roomName: string) {
    const roomId = roomName
    localStorage.setItem('collab_user_name', userName)
    collab.connect(roomId, true, userName)
    return roomId
  }

  function joinRoom(userName: string, roomId: string) {
    localStorage.setItem('collab_user_name', userName)
    collab.connect(roomId, true, userName)
  }
  return {
    createRoom,
    joinRoom,
  }
})
