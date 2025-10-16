<template>
  <div class="collab-modal-overlay" v-if="visible">
    <div class="collab-modal">
      <h3>协同编辑</h3>
      <div v-if="showResumePrompt" class="resume-prompt">
        检测之前已经加入房间"{{ savedRoomId }}", 是否进行重连
        <div class="resume-buttons">
          <button @click="handleResume">Yes</button>
          <button @click="showResumePrompt = false">No</button>
        </div>
      </div>
      <div class="form-group">
        <label>name</label>
        <input v-model="userName" placeholder="请输入你的名字" />
      </div>
      <div class="form-group">
        <label>RoomName</label>
        <input v-model="roomName" placeholder="请输入房间名（加入时填写对方的房间名）" />
      </div>
      <div class="button-group">
        <button @click="handleCreate" :disabled="!isValid">创建房间</button>
        <button @click="handleJoin" :disabled="!isValid">加入房间</button>
      </div>
      <div v-if="collabStatus" class="status-indicator">
        {{ collabStatus }}
      </div>
      <button class="close-btn" @click="close">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCollaborationStore } from '@/stores/collaborationStore'
import { useRoomStore } from '@/stores/roomStore'
import { computed, onMounted, ref } from 'vue'

const visible = defineModel<boolean>('visible', { required: true })
const showResumePrompt = ref(false)
const userName = ref('')
const roomName = ref('')
const savedRoomId = ref('')
const isValid = computed(() => userName.value.trim() && roomName.value.trim())
const collabStore = useCollaborationStore()
const collabStatus = computed(() => {
  switch (collabStore.connectionStatus) {
    case 'connecting':
      return '正在连接中...'
    case 'connected':
      return '连接到房间'
    case 'disconnected':
      return collabStore.isConnected ? '' : '已经断开连接'
    default:
      return ''
  }
})
onMounted(() => {
  if (roomStore.hasSaveRoom() && !collabStore.isConnected) {
    savedRoomId.value = localStorage.getItem('collab_room_id') || ''
    showResumePrompt.value = true
  }
})
const roomStore = useRoomStore()
const handleResume = () => {
  roomStore.resumeRoom()
  visible.value = false
}
const handleCreate = () => {
  roomStore.createRoom(userName.value.trim(), roomName.value.trim())
  visible.value = false
}
const handleJoin = () => {
  roomStore.joinRoom(userName.value.trim(), roomName.value.trim())
  visible.value = false
}
const close = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.collab-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.collab-modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  position: relative;
}

.resume-prompt {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.resume-buttons {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.resume-buttons button {
  padding: 4px 8px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 12px;
}

.button-group button {
  flex: 1;
  padding: 8px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.status-indicator {
  color: #666;
  font-size: 14px;
  text-align: center;
  margin-bottom: 8px;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
</style>
