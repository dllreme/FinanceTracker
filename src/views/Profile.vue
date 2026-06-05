<template>
  <div class="profile-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" :class="{ 'dark-mode': isDarkMode }">
      <div class="logo">
        <div class="logo-icon-wrapper">
          <img 
            src="@/assets/equilibri.png" 
            alt="Equilibri Logo" 
            class="logo-img"
          />
        </div>
        <div class="logo-text-container">
          <span class="logo-text">EQUILIBRI</span>
          <span class="logo-slogan">BALANCE YOUR FLOW</span>
        </div>
      </div>
      
      <nav class="nav-menu">
        <div class="nav-section">
          <p class="nav-label">{{ t.menu }}</p>
          <router-link to="/dashboard" class="nav-item">
            <i class="bi bi-grid-1x2-fill nav-icon"></i>
            <span>{{ t.dashboard }}</span>
          </router-link>
          <router-link to="/transactions" class="nav-item">
            <i class="bi bi-journal-bookmark-fill nav-icon"></i>
            <span>{{ t.transactions }}</span>
          </router-link>
          <router-link to="/budget" class="nav-item">
            <i class="bi bi-wallet2 nav-icon"></i>
            <span>{{ t.budgeting }}</span>
          </router-link>
          <router-link to="/goals" class="nav-item">
            <i class="bi bi-trophy-fill nav-icon"></i>
            <span>{{ t.goals }}</span>
          </router-link>
          <router-link to="/journal" class="nav-item">
            <i class="bi bi-journal-text nav-icon"></i>
            <span>{{ t.journal || 'Journal' }}</span>
          </router-link>
          <router-link to="/reports" class="nav-item">
            <i class="bi bi-file-bar-graph-fill nav-icon"></i>
            <span>{{ t.reports }}</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <p class="nav-label">{{ t.subscriptions }}</p>
          <router-link to="/subscriptions" class="nav-item">
            <i class="bi bi-arrow-repeat nav-icon"></i>
            <span>{{ t.subscriptions }}</span>
          </router-link>
        </div>
        
        <div class="nav-section">
          <p class="nav-label">{{ t.system }}</p>
          <router-link to="/profile" class="nav-item active">
            <i class="bi bi-gear-fill nav-icon"></i>
            <span>{{ t.settings }}</span>
          </router-link>
        </div>
      </nav>
      
      <div class="sidebar-footer">
        <div class="theme-toggle" @click="toggleTheme">
          <i :class="isDarkMode ? 'bi bi-sun-fill' : 'bi bi-moon-fill'"></i>
          <span>{{ isDarkMode ? t.darkMode : t.lightMode }}</span>
        </div>
        <router-link to="/profile" class="user-info-sidebar">
          <div class="user-avatar-small">
            <img v-if="profileImageUrl" :src="profileImageUrl" class="avatar-img" />
            <i v-else class="bi bi-person-circle"></i>
          </div>
          <div class="user-details">
            <p class="user-name">{{ displayUserName }}</p>
          </div>
        </router-link>
        <button @click="logout" class="logout-sidebar-btn">
          <i class="bi bi-box-arrow-right"></i>
          <span>{{ t.logout }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'dark-mode': isDarkMode }">
      <!-- Top Bar with Currency Selector (Like Dashboard) -->
      <header class="top-bar" :class="{ 'dark-mode': isDarkMode }">
        <div class="page-title">
          <h1><i class="bi bi-gear-fill"></i> {{ t.profileAndSettings || 'Profile & Settings' }}</h1>
        </div>
        
        <div class="top-bar-actions">
          <!-- Currency Selector (Same as Dashboard) -->
          <div class="currency-selector-wrapper">
            <i class="bi bi-arrow-left-right"></i> 
            <select v-model="localCurrency" @change="handleCurrencyChange" class="currency-select">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="MYR">MYR (RM)</option>
              <option value="PHP">PHP (₱)</option>
            </select>
          </div>
        </div>
      </header>

      <!-- Profile Overview Section -->
      <div class="profile-overview" :class="{ 'dark-mode': isDarkMode }">
        <div class="profile-avatar-section">
          <div class="avatar-container">
            <div class="avatar-circle">
              <img v-if="profileImageUrl" :src="profileImageUrl" class="profile-img" />
              <i v-else class="bi bi-person-fill"></i>
            </div>
            <button class="upload-avatar-btn" @click="triggerFileUpload">
              <i class="bi bi-camera-fill"></i>
            </button>
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              style="display: none" 
              @change="handleImageUpload"
            />
          </div>
          <div class="profile-info">
            <h2>{{ displayUserName }}</h2>
            <p class="user-email"><i class="bi bi-envelope-fill"></i> {{ userEmail }}</p>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <i class="bi bi-journal-bookmark-fill"></i>
            <div>
              <span class="stat-value">{{ userStore.userTransactions.length }}</span>
              <span class="stat-label">{{ t.transactions }}</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="bi bi-arrow-repeat"></i>
            <div>
              <span class="stat-value">{{ userStore.userSubscriptions.length }}</span>
              <span class="stat-label">{{ t.subscriptions }}</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="bi bi-trophy-fill"></i>
            <div>
              <span class="stat-value">{{ userStore.userGoals.length }}</span>
              <span class="stat-label">{{ t.goals }}</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="bi bi-journal-text"></i>
            <div>
              <span class="stat-value">{{ userStore.userJournals.length }}</span>
              <span class="stat-label">{{ t.journalEntries || 'Journal Entries' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Grid - Two Column Layout -->
      <div class="settings-grid">
        <!-- Left Column -->
        <div class="settings-column">
          <!-- User Information -->
          <div class="setting-group" :class="{ 'dark-mode': isDarkMode }">
            <div class="group-header">
              <i class="bi bi-person-circle"></i>
              <h3>{{ t.userInformation || 'User Information' }}</h3>
            </div>
            <div class="group-content">
              <div class="input-group">
                <label><i class="bi bi-person-fill"></i> {{ t.fullName || 'Full Name' }}</label>
                <input 
                  type="text" 
                  v-model="localUserName" 
                  class="modern-input" 
                  :class="{ 'dark-mode': isDarkMode }"
                />
              </div>
              <div class="input-group">
                <label><i class="bi bi-envelope-fill"></i> {{ t.emailAddress || 'Email Address' }}</label>
                <input 
                  type="email" 
                  v-model="userEmail" 
                  readonly 
                  class="modern-input readonly" 
                  :class="{ 'dark-mode': isDarkMode }"
                />
              </div>
              <button @click="updateProfile" :disabled="saving" class="action-btn primary-btn">
                <i class="bi bi-check-lg"></i> {{ saving ? (t.saving || 'Saving...') : (t.updateProfile || 'Update Profile') }}
              </button>
              <div v-if="updateMessage" class="update-message success">
                <i class="bi bi-check-circle-fill"></i> {{ updateMessage }}
              </div>
            </div>
          </div>

          <!-- Theme Preferences -->
          <div class="setting-group" :class="{ 'dark-mode': isDarkMode }">
            <div class="group-header">
              <i class="bi bi-palette-fill"></i>
              <h3>{{ t.appearance || 'Appearance' }}</h3>
            </div>
            <div class="group-content">
              <div class="theme-switch">
                <button 
                  @click="setTheme('light')" 
                  class="theme-option"
                  :class="{ active: currentTheme === 'light' }"
                >
                  <i class="bi bi-sun-fill"></i>
                  <span>{{ t.lightMode || 'Light Mode' }}</span>
                </button>
                <button 
                  @click="setTheme('dark')" 
                  class="theme-option"
                  :class="{ active: currentTheme === 'dark' }"
                >
                  <i class="bi bi-moon-fill"></i>
                  <span>{{ t.darkMode || 'Dark Mode' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Data Management -->
          <div class="setting-group" :class="{ 'dark-mode': isDarkMode }">
            <div class="group-header">
              <i class="bi bi-database-fill"></i>
              <h3>{{ t.dataManagement || 'Data Management' }}</h3>
            </div>
            <div class="group-content">
              <button @click="exportData" class="action-btn secondary-btn">
                <i class="bi bi-download"></i> {{ t.exportData || 'Export Data (CSV)' }}
              </button>
              <button @click="deleteAllData" class="action-btn danger-btn">
                <i class="bi bi-trash3-fill"></i> {{ t.deleteAllData || 'Delete All Data' }}
              </button>
              <p class="warning-note">
                <i class="bi bi-exclamation-triangle-fill"></i> 
                {{ t.permanentWarning || 'This action is permanent and cannot be undone!' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="settings-column">
          <!-- Exchange Rates -->
          <div class="setting-group" :class="{ 'dark-mode': isDarkMode }">
            <div class="group-header">
              <i class="bi bi-graph-up"></i>
              <h3>{{ t.liveExchangeRates || 'Live Exchange Rates' }}</h3>
              <button @click="refreshRates" :disabled="currencyStore.loading" class="refresh-icon">
                <i class="bi bi-arrow-repeat" :class="{ spinning: currencyStore.loading }"></i>
              </button>
            </div>
            <div class="group-content">
              <div v-if="currencyStore.loading" class="loading-rates">
                <div class="spinner-small"></div>
                <span>{{ t.fetchingRates || 'Fetching rates...' }}</span>
              </div>
              <div v-else class="rates-list">
                <div class="rate-row">
                  <span class="currency">USD</span>
                  <span class="rate">1.0000</span>
                  <span class="base">{{ t.baseCurrency || 'Base Currency' }}</span>
                </div>
                <div class="rate-row">
                  <span class="currency">EUR</span>
                  <span class="rate">{{ currencyStore.exchangeRates.EUR?.toFixed(4) }}</span>
                </div>
                <div class="rate-row">
                  <span class="currency">GBP</span>
                  <span class="rate">{{ currencyStore.exchangeRates.GBP?.toFixed(4) }}</span>
                </div>
                <div class="rate-row">
                  <span class="currency">MYR</span>
                  <span class="rate">{{ currencyStore.exchangeRates.MYR?.toFixed(4) }}</span>
                </div>
                <div class="rate-row">
                  <span class="currency">PHP</span>
                  <span class="rate">{{ currencyStore.exchangeRates.PHP?.toFixed(4) }}</span>
                </div>
              </div>
              <p v-if="currencyStore.lastUpdated" class="update-info">
                <i class="bi bi-clock-history"></i> {{ t.lastUpdated || 'Last updated' }}: {{ currencyStore.lastUpdated }}
              </p>
            </div>
          </div>

          <!-- API Status -->
          <div class="setting-group" :class="{ 'dark-mode': isDarkMode }">
            <div class="group-header">
              <i class="bi bi-plug-fill"></i>
              <h3>{{ t.systemStatus || 'System Status' }}</h3>
            </div>
            <div class="group-content">
              <div class="status-row">
                <span class="status-label">{{ t.exchangeRateAPI || 'Exchange Rate API' }}</span>
                <span :class="currencyStore.error ? 'status-badge offline' : 'status-badge online'">
                  <i :class="currencyStore.error ? 'bi bi-x-circle-fill' : 'bi bi-check-circle-fill'"></i>
                  {{ currencyStore.error ? (t.offline || 'Offline') : (t.online || 'Online') }}
                </span>
              </div>
              <div class="status-row">
                <span class="status-label">{{ t.databaseConnection || 'Database Connection' }}</span>
                <span class="status-badge online">
                  <i class="bi bi-check-circle-fill"></i>
                  {{ t.connected || 'Connected' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useCurrencyStore } from '../stores/currencyStore'
import { useLanguageStore } from '../stores/languageStore'
import { supabase } from '../lib/supabase.js'

const router = useRouter()
const userStore = useUserStore()
const currencyStore = useCurrencyStore()
const languageStore = useLanguageStore()

const t = languageStore.t
const currencySymbol = computed(() => currencyStore.currencySymbol)
const userName = computed(() => userStore.userName || 'User')
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

// Use local reactive copy of currency
const localCurrency = ref(currencyStore.selectedCurrency)

const localUserName = ref(userStore.userName)
const userEmail = ref(userStore.currentUser?.email || '')
const currentTheme = ref('light')
const saving = ref(false)
const updateMessage = ref('')
const profileImageUrl = ref(null)
const fileInput = ref(null)

// Display name that updates instantly
const displayUserName = computed(() => localUserName.value || userName.value)

// Watch for store currency changes and update local copy
watch(() => currencyStore.selectedCurrency, (newCurrency) => {
  console.log(`Profile: Store currency changed to ${newCurrency}, updating local`)
  localCurrency.value = newCurrency
})

onMounted(async () => {
  currencyStore.loadCurrency()
  await currencyStore.fetchExchangeRates()
  
  // Set local currency from store
  localCurrency.value = currencyStore.selectedCurrency
  console.log(`Profile mounted with currency: ${localCurrency.value}`)
  
  const savedTheme = localStorage.getItem('theme') || 'light'
  currentTheme.value = savedTheme
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode')
  }
  isDarkMode.value = savedTheme === 'dark'
  
  localUserName.value = userStore.userName
  userEmail.value = userStore.currentUser?.email || ''
  
  if (userStore.userAvatarUrl) {
    profileImageUrl.value = userStore.userAvatarUrl
  } else {
    const savedImage = localStorage.getItem('profileImage')
    if (savedImage) {
      profileImageUrl.value = savedImage
      userStore.updateUserAvatar(savedImage)
    }
  }
})

async function updateProfile() {
  saving.value = true
  updateMessage.value = ''
  
  const success = await userStore.updateUserName(localUserName.value)
  
  if (success) {
    updateMessage.value = t.profileUpdated || 'Profile updated successfully!'
    userStore.currentUser.name = localUserName.value
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      userData.name = localUserName.value
      localStorage.setItem('user', JSON.stringify(userData))
    }
    setTimeout(() => {
      updateMessage.value = ''
    }, 3000)
  } else {
    updateMessage.value = t.profileUpdateFailed || 'Failed to update profile'
    setTimeout(() => {
      updateMessage.value = ''
    }, 3000)
  }
  
  saving.value = false
}

function triggerFileUpload() {
  fileInput.value.click()
}

async function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    alert(t.uploadImageOnly || 'Please upload an image file')
    return
  }
  
  if (file.size > 10 * 1024 * 1024) {
    alert(t.imageSizeLimit || 'Image size should be less than 10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    const base64Image = e.target.result
    profileImageUrl.value = base64Image
    localStorage.setItem('profileImage', base64Image)
    
    userStore.updateUserAvatar(base64Image)
    
    const userId = userStore.currentUser?.supabaseId
    if (userId) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ avatar_url: base64Image })
          .eq('id', userId)
        if (error) console.error('Error saving avatar:', error)
      } catch (err) {
        console.error('Error:', err)
      }
    }
    
    alert(t.profilePictureUpdated || 'Profile picture updated successfully!')
  }
  reader.readAsDataURL(file)
}

async function handleCurrencyChange() {
  const oldCurrency = currencyStore.selectedCurrency
  const newCurrency = localCurrency.value
  
  if (oldCurrency === newCurrency) return
  
  console.log(`💰 Profile: Changing currency from ${oldCurrency} to ${newCurrency}`)
  
  // Set the currency in the store (this will broadcast to all pages)
  currencyStore.setCurrency(newCurrency)
  
  // Show visual notification
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱'
  }
  const symbol = symbols[newCurrency] || '$'
  
  // Create and show notification
  const notification = document.createElement('div')
  notification.className = 'currency-change-notification'
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <i class="bi bi-currency-exchange" style="font-size: 20px;"></i>
      <div>
        <strong>Currency Changed</strong>
        <div style="font-size: 13px; opacity: 0.9;">Now using ${newCurrency} (${symbol})</div>
      </div>
    </div>
  `
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out forwards'
    setTimeout(() => notification.remove(), 300)
  }, 2000)
  
  // Force refresh rates
  await currencyStore.fetchExchangeRates()
  
  console.log(`✅ Profile: Currency changed successfully to ${newCurrency}`)
}

async function setTheme(theme) {
  currentTheme.value = theme
  localStorage.setItem('theme', theme)
  isDarkMode.value = theme === 'dark'
  
  if (theme === 'dark') {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }
}

async function refreshRates() {
  await currencyStore.fetchExchangeRates()
  
  const notification = document.createElement('div')
  notification.className = 'currency-change-notification refresh'
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <i class="bi bi-check-circle-fill" style="font-size: 18px;"></i>
      <div>
        <strong>Exchange Rates Updated</strong>
        <div style="font-size: 12px;">${new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  `
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out forwards'
    setTimeout(() => notification.remove(), 300)
  }, 1500)
}

function exportData() {
  const transactions = userStore.userTransactions
  if (transactions.length === 0) {
    alert(t.noTransactionsToExport || 'No transactions to export')
    return
  }
  
  const csv = convertToCSV(transactions)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
  a.href = url
  a.click()
  URL.revokeObjectURL(url)
  alert(t.dataExportedSuccess || 'Data exported successfully!')
}

function convertToCSV(data) {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency']
  const rows = data.map(t => [t.date, t.description, t.category, t.amount, t.currency || 'MYR'])
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

function deleteAllData() {
  if (confirm(t.permanentDeleteConfirm || '⚠️ Are you sure? This will delete ALL your data and cannot be undone!')) {
    alert(t.dataDeletionComingSoon || 'Data deletion feature coming soon. Please contact support for data removal requests.')
  }
}

function toggleTheme() {
  setTheme(isDarkMode.value ? 'light' : 'dark')
}

function logout() {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
/* Top Bar styles */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 12px 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.top-bar.dark-mode {
  background: #1e293b;
}

.page-title h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dark-mode .page-title h1 {
  color: #f1f5f9;
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.currency-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(139, 92, 246, 0.15);
  padding: 8px 16px;
  border-radius: 30px;
  backdrop-filter: blur(10px);
}

.currency-select {
  background: transparent;
  border: none;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  cursor: pointer;
  outline: none;
  border-radius: 8px;
}

.currency-select:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dark-mode .currency-selector-wrapper {
  background: rgba(139, 92, 246, 0.25);
}

.dark-mode .currency-select {
  color: #f1f5f9;
}

.dark-mode .currency-select option {
  background: #1e293b;
  color: #f1f5f9;
}

/* Currency Change Notification */
.currency-change-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 14px 20px;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
  font-size: 14px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.currency-change-notification.refresh {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Keep all your existing styles below */
.profile-page {
  display: flex;
  min-height: 100vh;
}



/* Add notification styles at the end of the style section */
.currency-change-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 14px 20px;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
  font-size: 14px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.currency-change-notification.refresh {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Ensure the select dropdown has proper styling */
.modern-select {
  cursor: pointer;
}

.modern-select:hover {
  border-color: #8b5cf6;
}

/* Add a transition for the select */
.modern-select {
  transition: all 0.2s ease;
}

.profile-page {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 30px 24px;
  position: fixed;
  height: 100vh;
  border-right: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  overflow-y: auto;
  z-index: 100;
}

.sidebar.dark-mode {
  background: #1e293b;
  border-right-color: #334155;
}

/* Logo Styles */
.logo {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 48px;
  padding: 6px 0;
}

.logo-icon-wrapper {
  width: 56px;
  height: 56px;
  min-width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.12);
  border-radius: 18px;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  border: 1px solid rgba(139, 92, 246, 0.2);
  overflow: hidden; /* This ensures the image stays inside the radius */
  padding: 0; /* Remove any padding */
}

.logo-icon-wrapper:hover {
  background: rgba(139, 92, 246, 0.25);
  transform: scale(1.03);
  border-color: rgba(139, 92, 246, 0.5);
}

/* Updated - Image fills the entire radius icon */
.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Changed from 'contain' to 'cover' to fill completely */
  object-position: center;
  display: block;
}

/* Alternative if you want the image to fit without cropping */
.logo-img-fit {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Shows full image with possible letterboxing */
  object-position: center;
  background: rgba(139, 92, 246, 0.05); /* Optional: subtle background if image doesn't fill */
}

.logo-svg {
  width: 42px;
  height: 42px;
}

/* Text Container */
.logo-text-container {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

/* EQUILIBRI - The Seasons Font */
.logo-text {
  font-family: 'The Seasons', 'Cormorant Garamond', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1.5px;
  background: linear-gradient(135deg, #c084fc 0%, #8b5cf6 50%, #5b21b6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 2px;
}

/* BALANCE YOUR FLOW - Cinzel Font */
.logo-slogan {
  font-family: 'Cinzel', 'Georgia', serif;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 2.8px;
  color: #a855f7;
  text-transform: uppercase;
  margin-top: 0;
}

/* Dark Mode Specific */
.dark-mode .logo-icon-wrapper {
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.35);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.15);
}

.dark-mode .logo-icon-wrapper:hover {
  background: rgba(139, 92, 246, 0.35);
  box-shadow: 0 0 18px rgba(139, 92, 246, 0.3);
}

.dark-mode .logo-text {
  background: linear-gradient(135deg, #d8b4fe 0%, #a855f7 60%, #7c3aed 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.dark-mode .logo-slogan {
  color: #c084fc;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .logo {
    gap: 10px;
  }
  
  .logo-icon-wrapper {
    width: 48px;
    height: 48px;
    min-width: 48px;
  }
  
  .logo-text {
    font-size: 18px;
    letter-spacing: 1px;
  }
  
  .logo-slogan {
    font-size: 6.5px;
    letter-spacing: 2px;
  }
}

/* For very small screens, hide slogan */
@media (max-width: 480px) {
  .logo-slogan {
    display: none;
  }
  
  .logo-text {
    font-size: 16px;
  }
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 1px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  color: #64748b;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
}

.nav-icon {
  font-size: 18px;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.sidebar.dark-mode .sidebar-footer {
  border-top-color: #334155;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 15px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s;
  color: #64748b;
}

.theme-toggle:hover {
  background: #f1f5f9;
}

.sidebar.dark-mode .theme-toggle {
  color: #94a3b8;
}

.sidebar.dark-mode .theme-toggle:hover {
  background: #334155;
}

.user-info-sidebar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  margin-bottom: 15px;
  text-decoration: none;
  border-radius: 10px;
  transition: background 0.2s;
}

.user-info-sidebar:hover {
  background: #f1f5f9;
}

.sidebar.dark-mode .user-info-sidebar:hover {
  background: #334155;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-avatar-small i {
  font-size: 24px;
  color: white;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.sidebar.dark-mode .user-name {
  color: #f1f5f9;
}

.logout-sidebar-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 10px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-sidebar-btn:hover {
  background: #fef2f2;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

.main-content.dark-mode {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dark-mode .page-header h1 {
  color: #f1f5f9;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.dark-mode .subtitle {
  color: #94a3b8;
}

/* Profile Overview */
.profile-overview {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.dark-mode .profile-overview {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.avatar-container {
  position: relative;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-circle i {
  font-size: 50px;
  color: white;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s;
}

.upload-avatar-btn:hover {
  transform: scale(1.1);
}

.profile-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.dark-mode .profile-info h2 {
  color: #f1f5f9;
}

.user-email {
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.profile-stats {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item i {
  font-size: 28px;
  color: #8b5cf6;
}

.stat-item div {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .stat-value {
  color: #f1f5f9;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

.dark-mode .stat-label {
  color: #94a3b8;
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.settings-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-group {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.setting-group:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.setting-group.dark-mode {
  background: #1e293b;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .group-header {
  background: #0f172a;
  border-bottom-color: #334155;
}

.group-header i {
  font-size: 22px;
  color: #8b5cf6;
}

.group-header h3 {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.dark-mode .group-header h3 {
  color: #f1f5f9;
}

.refresh-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  color: #8b5cf6;
  transition: all 0.2s;
}

.refresh-icon:hover {
  background: #e2e8f0;
}

.dark-mode .refresh-icon:hover {
  background: #334155;
}

.group-content {
  padding: 24px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.dark-mode .input-group label {
  color: #f1f5f9;
}

.input-group label i {
  color: #8b5cf6;
}

.modern-input, .modern-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.modern-input:focus, .modern-select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.modern-input.dark-mode, .modern-select.dark-mode {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.modern-input.readonly {
  background: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
}

.dark-mode .modern-input.readonly {
  background: #334155;
  color: #94a3b8;
}

/* Theme Switch */
.theme-switch {
  display: flex;
  gap: 12px;
}

.theme-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
}

.theme-option:hover {
  transform: translateY(-2px);
}

.theme-option.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  border-color: transparent;
  color: white;
}

.dark-mode .theme-option {
  background: #334155;
  border-color: #475569;
  color: #94a3b8;
}

.dark-mode .theme-option.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
}

/* Action Buttons */
.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.action-btn:last-child {
  margin-bottom: 0;
}

.primary-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.secondary-btn {
  background: #3b82f6;
  color: white;
}

.secondary-btn:hover {
  transform: translateY(-2px);
  background: #2563eb;
}

.danger-btn {
  background: #ef4444;
  color: white;
}

.danger-btn:hover {
  transform: translateY(-2px);
  background: #dc2626;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.warning-note {
  margin-top: 12px;
  font-size: 11px;
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.update-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: #d1fae5;
  color: #10b981;
  border-radius: 12px;
  font-size: 13px;
}

/* Exchange Rates */
.rates-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.rate-row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.dark-mode .rate-row {
  background: #334155;
}

.rate-row .currency {
  width: 60px;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .rate-row .currency {
  color: #f1f5f9;
}

.rate-row .rate {
  flex: 1;
  font-family: monospace;
  font-weight: 600;
  color: #10b981;
}

.rate-row .base {
  font-size: 10px;
  color: #94a3b8;
}

.update-info {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  margin-top: 12px;
}

/* Status Row */
.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.status-label {
  font-weight: 500;
  color: #1e293b;
}

.dark-mode .status-label {
  color: #f1f5f9;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.online {
  background: #d1fae5;
  color: #10b981;
}

.status-badge.offline {
  background: #fee2e2;
  color: #ef4444;
}

.loading-rates {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  .profile-overview {
    flex-direction: column;
    text-align: center;
  }
  .profile-avatar-section {
    justify-content: center;
  }
  .profile-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 80px;
    padding: 20px 10px;
  }
  .logo-text, .nav-label, .nav-item span, .user-details, .theme-toggle span, .logout-sidebar-btn span {
    display: none;
  }
  .main-content {
    margin-left: 80px;
    padding: 16px;
  }
  .profile-stats {
    flex-direction: column;
    align-items: center;
  }
  .theme-switch {
    flex-direction: column;
  }
  .profile-avatar-section {
    flex-direction: column;
    align-items: center;
  }
  .profile-info {
    text-align: center;
  }
  .user-email {
    justify-content: center;
  }
}
</style>