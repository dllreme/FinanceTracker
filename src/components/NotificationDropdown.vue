<template>
  <div class="notification-wrapper">
    <button class="notif-bell" @click.stop="showDropdown = !showDropdown">
      <i class="bi bi-bell-fill"></i>
      <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
    </button>
    
    <div v-if="showDropdown" class="notif-dropdown" :class="{ 'dark-mode': isDarkMode }">
      <div class="notif-header" :class="{ 'dark-mode': isDarkMode }">
        <span>{{ languageStore.t.notifications }}</span>
        <button v-if="unreadCount > 0" @click="markAllAsRead" class="mark-read-btn">
          {{ languageStore.t.markAllRead }}
        </button>
      </div>
      
      <div v-if="notifications.length === 0" class="notif-empty" :class="{ 'dark-mode': isDarkMode }">
        <i class="bi bi-bell-slash-fill"></i>
        <p>{{ languageStore.t.noNotifications }}</p>
      </div>
      
      <div v-else class="notif-list">
        <div 
          v-for="notif in notifications" 
          :key="notif.id" 
          class="notif-item"
          :class="{ 'notif-unread': !notif.read, 'dark-mode': isDarkMode }"
          @click="markAsRead(notif.id)"
        >
          <!-- NO ICON DIV HERE - COMPLETELY REMOVED -->
          <div class="notif-content">
            <div class="notif-title">{{ notif.title }}</div>
            <div class="notif-message">{{ notif.message }}</div>
            <div class="notif-time">{{ notif.time }}</div>
          </div>
          <button @click.stop="deleteNotification(notif.id)" class="notif-delete">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '../stores/notificationStore'
import { useLanguageStore } from '../stores/languageStore'

const notificationStore = useNotificationStore()
const languageStore = useLanguageStore()
const showDropdown = ref(false)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)

function markAsRead(id) {
  notificationStore.markAsRead(id)
}

function markAllAsRead() {
  notificationStore.markAllAsRead()
}

function deleteNotification(id) {
  notificationStore.deleteNotification(id)
}

// Close dropdown when clicking outside
const handleClickOutside = (e) => {
  if (!e.target.closest('.notification-wrapper')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notification-wrapper {
  position: relative;
  display: inline-block;
}

.notif-bell {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  position: relative;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  color: #64748b;
}

.notif-bell:hover {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #8b5cf6;
}

.dark-mode .notif-bell {
  color: #94a3b8;
}

.dark-mode .notif-bell:hover {
  background: #334155;
  color: #a78bfa;
}

.notif-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
}

.notif-dropdown {
  position: absolute;
  top: 45px;
  right: 0;
  width: 340px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  z-index: 10000;
  overflow: hidden;
}

.notif-dropdown.dark-mode {
  background: #1e293b;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  color: #1e293b;
}

.notif-header.dark-mode {
  background: #334155;
  border-bottom-color: #475569;
  color: #f1f5f9;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #8b5cf6;
  font-size: 12px;
  cursor: pointer;
}

.mark-read-btn:hover {
  color: #6d28d9;
  text-decoration: underline;
}

.notif-list {
  max-height: 400px;
  overflow-y: auto;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.notif-item:hover {
  background: #f5f5f5;
}

.notif-item.dark-mode {
  border-bottom-color: #334155;
}

.notif-item.dark-mode:hover {
  background: #334155;
}

.notif-unread {
  background: #f3e8ff;
}

.notif-unread.dark-mode {
  background: #2d1b4e;
}

/* Content takes full width - NO ICON */
.notif-content {
  flex: 1;
}

.notif-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  font-size: 13px;
}

.notif-item.dark-mode .notif-title {
  color: #f1f5f9;
}

.notif-message {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.notif-item.dark-mode .notif-message {
  color: #94a3b8;
}

.notif-time {
  font-size: 10px;
  color: #94a3b8;
}

.notif-delete {
  background: none;
  border: none;
  font-size: 12px;
  color: #cbd5e1;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.notif-item:hover .notif-delete {
  opacity: 1;
}

.notif-delete:hover {
  color: #ef4444;
  background: #fef2f2;
}

.notif-empty {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.notif-empty i {
  font-size: 40px;
  margin-bottom: 12px;
  display: block;
  color: #cbd5e1;
}

.notif-empty.dark-mode {
  color: #64748b;
}

.notif-empty.dark-mode i {
  color: #475569;
}

.notif-empty p {
  margin: 0;
  font-size: 14px;
}
</style>