import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCurrencyStore } from './currencyStore'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const lastNotificationTime = ref({})

  // Helper to format currency based on the amount's own currency
  function formatCurrencyAmount(amount, currencyCode) {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      MYR: 'RM'
    }
    const symbol = symbols[currencyCode] || '$'
    const absAmount = Math.abs(amount).toFixed(2)
    const sign = amount < 0 ? '-' : ''
    
    if (currencyCode === 'MYR') {
      return `${symbol} ${sign}${absAmount}`
    }
    return `${symbol}${sign}${absAmount}`
  }

  function addNotification(notification) {
    // Format message if it contains amount information
    let formattedMessage = notification.message
    let formattedTitle = notification.title
    
    // Format amount if provided
    if (notification.amount !== undefined && notification.amount !== null) {
      // Use the currency from the notification or default to MYR
      const currency = notification.currency || 'MYR'
      const formattedAmount = formatCurrencyAmount(notification.amount, currency)
      
      // Replace any amount patterns in the message
      const amountPattern = new RegExp(`\\b${Math.abs(notification.amount).toFixed(2)}\\b`, 'g')
      formattedMessage = formattedMessage.replace(amountPattern, Math.abs(notification.amount).toFixed(2))
      formattedMessage = formattedMessage.replace(/[+-]?RM?\s?[\d,]+\.?\d*/g, formattedAmount)
      formattedMessage = formattedMessage.replace(/[+-]?\$[\d,]+\.?\d*/g, formattedAmount)
    }
    
    // Create unique key from title and message
    const notificationKey = `${formattedTitle}-${formattedMessage}`
    const now = Date.now()
    const lastTime = lastNotificationTime.value[notificationKey]
    
    // Block duplicates within 3 seconds
    if (lastTime && (now - lastTime) < 3000) {
      console.log('⚠️ Duplicate blocked:', formattedTitle)
      return
    }
    
    lastNotificationTime.value[notificationKey] = now
    
    // Map notification type to Bootstrap icon
    const typeIcons = {
      'success': 'bi bi-check-circle-fill',
      'warning': 'bi bi-exclamation-triangle-fill',
      'error': 'bi bi-x-circle-fill',
      'info': 'bi bi-info-circle-fill'
    }
    
    const icon = typeIcons[notification.type] || 'bi bi-bell-fill'
    
    const newNotification = {
      id: now,
      title: formattedTitle,
      message: formattedMessage,
      icon: icon,
      type: notification.type || 'info',
      originalAmount: notification.amount || null,
      originalCurrency: notification.currency || 'MYR',
      time: 'Just now',
      read: false
    }
    
    notifications.value.unshift(newNotification)
    
    // Keep only last 50
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
    
    saveToStorage()
    console.log('📢 Notification added:', newNotification.title)
  }

  function markAsRead(id) {
    const notif = notifications.value.find(n => n.id === id)
    if (notif) notif.read = true
    saveToStorage()
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
    saveToStorage()
  }

  function deleteNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) notifications.value.splice(index, 1)
    saveToStorage()
  }

  function saveToStorage() {
    localStorage.setItem('notifications', JSON.stringify(notifications.value))
  }

  function loadFromStorage() {
    const saved = localStorage.getItem('notifications')
    if (saved) {
      notifications.value = JSON.parse(saved)
    } else {
      notifications.value = [{
        id: Date.now(),
        title: 'Welcome!',
        message: 'Start adding transactions to see notifications here',
        icon: 'bi bi-info-circle-fill',
        type: 'info',
        time: 'Just now',
        read: false
      }]
      saveToStorage()
    }
  }

  // Update notifications if needed (for currency changes)
  function updateNotificationsCurrency() {
    // For now, just keep as-is since amounts are stored with their currency
    saveToStorage()
  }

  // Clear all notifications
  function clearAll() {
    notifications.value = []
    saveToStorage()
  }

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  loadFromStorage()

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateNotificationsCurrency,
    clearAll
  }
})