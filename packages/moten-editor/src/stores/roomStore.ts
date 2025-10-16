import { defineStore } from 'pinia'
import { useCollaborationStore } from './collaborationStore'

export const useRoomStore = defineStore('room', () => {
  const collab = useCollaborationStore()

  function hasSaveRoom() {
    return !!localStorage.getItem('collab_room_id')
  }

  function resumeRoom() {
    const roomId = localStorage.getItem('collab_room_id')
    const userName = localStorage.getItem('collab_user_name')
    const isEditor = localStorage.getItem('collab_isEditor') === 'true'
    if (roomId && userName) {
      collab.connect(roomId, isEditor, userName)
      return true
    }
    return false
  }

  function createRoom(userName: string, roomName: string) {
    const roomId = roomName
    localStorage.setItem('collab_room_id', roomId)
    localStorage.setItem('collab_user_name', userName)
    localStorage.setItem('collab_isEditor', 'true')
    collab.connect(roomId, true, userName)
    return roomId
  }

  function joinRoom(userName: string, roomId: string) {
    localStorage.setItem('collab_room_id', roomId)
    localStorage.setItem('collab_user_name', userName)
    localStorage.setItem('collab_isEditor', 'true')
    collab.connect(roomId, true, userName)
  }

  function leaveRoom() {
    collab.disconnect()
    localStorage.removeItem('collab_room_id')
    localStorage.removeItem('collab_user_name')
    localStorage.removeItem('collab_isEditor')
  }
  return {
    createRoom,
    joinRoom,
    leaveRoom,
    hasSaveRoom,
    resumeRoom,
  }
})
