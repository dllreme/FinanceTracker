<template>
  <div id="app">
    <router-view />
    

    <div v-if="currencyStore.loading" class="exchange-rate-toast">
      <i class="bi bi-arrow-repeat spin"></i>
      Updating exchange rates...
    </div>
    
    <div v-if="currencyStore.error" class="exchange-rate-error">
      <i class="bi bi-exclamation-triangle-fill"></i>
      Failed to update exchange rates. Using cached rates.
      <button @click="retryFetchRates" class="retry-btn">Retry</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useUserStore } from './stores/userStore'
import { useCurrencyStore } from './stores/currencyStore'
import { useNotificationStore } from './stores/notificationStore'

const userStore = useUserStore()
const currencyStore = useCurrencyStore()
const notificationStore = useNotificationStore()

let refreshInterval = null

// Load saved user on app start
userStore.loadUserFromStorage()

// Load currency preferences and fetch exchange rates on app start
onMounted(async () => {
  // Load saved currency preference
  currencyStore.loadCurrency()
  
  // Fetch initial exchange rates
  await currencyStore.fetchExchangeRates()
  
  // Refresh exchange rates every hour (3600000 ms)
  refreshInterval = setInterval(async () => {
    console.log('Auto-refreshing exchange rates...')
    await currencyStore.fetchExchangeRates()
  }, 3600000)
  
  // Also refresh when app comes back online
  window.addEventListener('online', handleOnlineStatus)
})

onUnmounted(() => {
  // Clean up interval when app is destroyed
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  window.removeEventListener('online', handleOnlineStatus)
})

// Handle coming back online
async function handleOnlineStatus() {
  if (navigator.onLine) {
    console.log('App is back online, refreshing exchange rates...')
    await currencyStore.fetchExchangeRates()
  }
}

// Retry fetching rates
async function retryFetchRates() {
  await currencyStore.fetchExchangeRates()
}

// Watch for currency changes and update all notifications
watch(() => currencyStore.selectedCurrency, (newCurrency, oldCurrency) => {
  if (newCurrency !== oldCurrency && oldCurrency !== undefined) {
    console.log(`Currency changed from ${oldCurrency} to ${newCurrency}, updating notifications...`)
    notificationStore.updateNotificationsCurrency()
    
    // Show a temporary notification about currency change
    const toast = document.createElement('div')
    toast.className = 'currency-change-toast'
    toast.innerHTML = `
      <i class="bi bi-currency-exchange"></i>
      Currency changed to ${newCurrency}
      <button onclick="this.parentElement.remove()">✕</button>
    `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }
})

// Watch for exchange rates updates and refresh notifications
watch(() => currencyStore.exchangeRates, () => {
  if (currencyStore.lastUpdated && !currencyStore.error) {
    notificationStore.updateNotificationsCurrency()
  }
}, { deep: true })
</script>

<style>
/* Bootstrap Icons CDN */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  background-color: #f5f7fa;
  transition: background-color 0.3s ease;
}

/* Dark mode body styles */
body.dark-mode {
  background-color: #0f172a;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Dark mode scrollbar */
body.dark-mode ::-webkit-scrollbar-track {
  background: #1e293b;
}

body.dark-mode ::-webkit-scrollbar-thumb {
  background: #475569;
}

body.dark-mode ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Utility classes for dark mode */
.dark-mode-transition {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Loading animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
  display: inline-block;
}

/* Exchange rate toast notifications */
.exchange-rate-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease;
}

.exchange-rate-error {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #ef4444;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease;
}

.currency-change-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease;
}

.currency-change-toast button,
.exchange-rate-error button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  margin-left: 8px;
  transition: background 0.2s;
}

.currency-change-toast button:hover,
.exchange-rate-error button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.retry-btn {
  background: white;
  color: #ef4444;
  border: none;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #fef2f2;
  transform: scale(1.02);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Fade animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Responsive font sizes */
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
  
  .exchange-rate-toast,
  .exchange-rate-error,
  .currency-change-toast {
    bottom: 10px;
    right: 10px;
    left: 10px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  html {
    font-size: 12px;
  }
}

/* Print styles */
@media print {
  .sidebar,
  .theme-toggle,
  .cancel-main-btn,
  .action-buttons,
  .exchange-rate-toast,
  .exchange-rate-error,
  .currency-change-toast {
    display: none !important;
  }
  
  .main-content {
    margin-left: 0 !important;
    padding: 0 !important;
  }
}
</style>