<template>
  <div class="journal-page" :class="{ 'dark-mode': isDarkMode }">
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
          <router-link to="/journal" class="nav-item active">
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
          <router-link to="/profile" class="nav-item">
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
            <img v-if="userAvatar" :src="userAvatar" class="avatar-img" />
            <i v-else class="bi bi-person-circle"></i>
          </div>
          <div class="user-details">
            <p class="user-name">{{ userName }}</p>
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
      <!-- Top Bar with Currency Selector -->
      <header class="top-bar" :class="{ 'dark-mode': isDarkMode }">
        <div class="page-header-compact">
          <h1><i class="bi bi-journal-text"></i> {{ t.financialJournal || 'Financial Journal' }}</h1>
          <p class="subtitle">{{ t.trackYourThoughts || 'Track your thoughts and reflect on your financial journey' }}</p>
        </div>
        
        <div class="top-bar-actions">
          <!-- Currency Selector -->
          <div class="currency-selector-wrapper">
            <i class="bi bi-arrow-left-right"></i>
            <select v-model="selectedCurrency" @change="handleCurrencyChange" class="currency-select">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="MYR">MYR (RM)</option>
              <option value="PHP">PHP (₱)</option>
            </select>
          </div>
          
          <button @click="openAddModal" class="add-entry-btn">
            <i class="bi bi-plus-lg"></i> {{ t.newEntry || 'New Entry' }}
          </button>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="userStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t.loadingJournalEntries || 'Loading journal entries...' }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="userStore.userJournals.length === 0" class="empty-state" :class="{ 'dark-mode': isDarkMode }">
        <div class="empty-icon-wrapper">
          <i class="bi bi-journal-bookmark-fill"></i>
        </div>
        <h3>{{ t.noEntriesYet || 'No Journal Entries Yet' }}</h3>
        <p>{{ t.startWriting || 'Start writing about your financial thoughts, goals, and progress.' }}</p>
        <button @click="openAddModal" class="empty-add-btn">
          <i class="bi bi-plus-circle"></i> {{ t.writeFirstEntry || 'Write Your First Entry' }}
        </button>
      </div>

      <!-- Journal List -->
      <div v-else class="journal-list">
        <div 
          v-for="entry in userStore.userJournals" 
          :key="entry.id" 
          class="journal-card" 
          :class="{ 'dark-mode': isDarkMode, [getMoodClass(entry.mood)]: true }"
        >
          <div class="journal-header">
            <div class="journal-date-mood">
              <div class="journal-date">
                <i class="bi bi-calendar3"></i>
                <span>{{ formatDate(entry.date) }}</span>
              </div>
              <div class="mood-badge" :class="getMoodBadgeClass(entry.mood)">
                <i :class="getMoodIcon(entry.mood)"></i>
                <span>{{ getMoodLabel(entry.mood) }}</span>
              </div>
            </div>
            <div class="journal-actions">
              <button @click="handleDeleteEntry(entry.id)" class="icon-btn delete-btn" :title="t.delete || 'Delete'">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
          <div class="journal-content">
            <p>{{ entry.content }}</p>
          </div>
        </div>
      </div>

      <!-- Summary Card -->
      <div v-if="userStore.userJournals.length > 0" class="summary-card" :class="{ 'dark-mode': isDarkMode }">
        <div class="summary-header">
          <i class="bi bi-graph-up"></i>
          <h3>{{ t.journalSummary || 'Journal Summary' }}</h3>
        </div>
        <div class="summary-stats">
          <div class="summary-stat">
            <span class="stat-label">{{ t.totalEntries || 'Total Entries' }}</span>
            <span class="stat-value">{{ userStore.userJournals.length }}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">{{ t.mostRecent || 'Most Recent' }}</span>
            <span class="stat-value">{{ getMostRecentDate() }}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">{{ t.commonMood || 'Common Mood' }}</span>
            <span class="stat-value">{{ getMostCommonMood() }}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">{{ t.firstEntry || 'First Entry' }}</span>
            <span class="stat-value">{{ getOldestDate() }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Journal Entry Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container horizontal-modal" :class="{ 'dark-mode': isDarkMode }">
        <div class="modal-header">
          <h3>
            <i class="bi bi-journal-plus"></i>
            {{ t.newJournalEntry || 'New Journal Entry' }}
          </h3>
          <button @click="closeModal" class="modal-close-btn">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleSaveEntry" class="modal-form horizontal-form">
          <div class="form-row">
            <div class="form-group">
              <label><i class="bi bi-calendar3"></i> {{ t.dateLabel || 'Date' }}</label>
              <input 
                type="date" 
                v-model="newEntry.date" 
                required
                class="form-input" 
                :class="{ 'dark-mode': isDarkMode }"
              />
            </div>
            
            <div class="form-group">
              <label><i class="bi bi-emoji-smile"></i> {{ t.mood || 'Mood' }}</label>
              <div class="custom-select" :class="{ 'dark-mode': isDarkMode }">
                <div class="select-trigger" @click="toggleMoodDropdown">
                  <div class="selected-value">
                    <i :class="getMoodIcon(newEntry.mood)"></i>
                    <span>{{ getMoodLabel(newEntry.mood) }}</span>
                  </div>
                  <i class="bi bi-chevron-down dropdown-icon"></i>
                </div>
                <div v-if="isMoodDropdownOpen" class="select-dropdown" :class="{ 'dark-mode': isDarkMode }">
                  <div 
                    v-for="mood in moodOptions" 
                    :key="mood.value" 
                    class="select-option" 
                    :class="{ active: newEntry.mood === mood.value }" 
                    @click="selectMood(mood)"
                  >
                    <i :class="mood.icon"></i>
                    <span>{{ mood.label }}</span>
                    <i v-if="newEntry.mood === mood.value" class="bi bi-check-lg check-icon"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-group full-width">
            <label><i class="bi bi-pencil"></i> {{ t.journalEntry || 'Journal Entry' }}</label>
            <textarea 
              v-model="newEntry.content" 
              :placeholder="t.journalPlaceholder || 'Write your thoughts about your finances today... How are you feeling about your spending, savings, or financial goals?'"
              rows="6"
              required
              class="form-textarea"
              :class="{ 'dark-mode': isDarkMode }"
            ></textarea>
          </div>
          
          <div v-if="errorMessage" class="error-message full-width">
            <i class="bi bi-exclamation-triangle-fill"></i> {{ errorMessage }}
          </div>
          
          <div class="action-buttons">
            <button type="submit" class="submit-btn">
              <i class="bi bi-check-lg"></i> {{ t.saveEntry || 'Save Entry' }}
            </button>
            <button type="button" @click="closeModal" class="cancel-btn">
              <i class="bi bi-x-lg"></i> {{ t.cancel || 'Cancel' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useCurrencyStore } from '../stores/currencyStore'
import { useLanguageStore } from '../stores/languageStore'

const router = useRouter()
const userStore = useUserStore()
const currencyStore = useCurrencyStore()
const languageStore = useLanguageStore()

const t = languageStore.t
const selectedCurrency = computed(() => currencyStore.selectedCurrency)
const currencySymbol = computed(() => currencyStore.currencySymbol)
const userName = computed(() => userStore.userName || 'User')
const userAvatar = computed(() => userStore.userAvatarUrl)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

const showModal = ref(false)
const errorMessage = ref('')
const isMoodDropdownOpen = ref(false)

const newEntry = ref({ 
  date: new Date().toISOString().split('T')[0], 
  mood: 'happy', 
  content: '' 
})

// Handle currency change
function handleCurrencyChange(event) {
  currencyStore.setCurrency(event.target.value)
}

const moodOptions = [
  { value: 'happy', label: 'Happy', icon: 'bi bi-emoji-smile', moodClass: 'mood-happy' },
  { value: 'excited', label: 'Excited', icon: 'bi bi-emoji-laughing', moodClass: 'mood-excited' },
  { value: 'neutral', label: 'Neutral', icon: 'bi bi-emoji-neutral', moodClass: 'mood-neutral' },
  { value: 'thoughtful', label: 'Thoughtful', icon: 'bi bi-emoji-sunglasses', moodClass: 'mood-thoughtful' },
  { value: 'worried', label: 'Worried', icon: 'bi bi-emoji-frown', moodClass: 'mood-worried' },
  { value: 'sad', label: 'Sad', icon: 'bi bi-emoji-tear', moodClass: 'mood-sad' },
  { value: 'frustrated', label: 'Frustrated', icon: 'bi bi-emoji-angry', moodClass: 'mood-frustrated' },
  { value: 'relieved', label: 'Relieved', icon: 'bi bi-emoji-smile', moodClass: 'mood-relieved' }
]

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getMoodClass(mood) {
  const moodClasses = {
    'happy': 'mood-happy',
    'excited': 'mood-excited',
    'neutral': 'mood-neutral',
    'thoughtful': 'mood-thoughtful',
    'worried': 'mood-worried',
    'sad': 'mood-sad',
    'frustrated': 'mood-frustrated',
    'relieved': 'mood-relieved'
  }
  return moodClasses[mood] || 'mood-neutral'
}

function getMoodBadgeClass(mood) {
  const badgeClasses = {
    'happy': 'badge-happy',
    'excited': 'badge-excited',
    'neutral': 'badge-neutral',
    'thoughtful': 'badge-thoughtful',
    'worried': 'badge-worried',
    'sad': 'badge-sad',
    'frustrated': 'badge-frustrated',
    'relieved': 'badge-relieved'
  }
  return badgeClasses[mood] || 'badge-neutral'
}

function getMoodIcon(mood) {
  const found = moodOptions.find(m => m.value === mood)
  return found ? found.icon : 'bi bi-emoji-neutral'
}

function getMoodLabel(mood) {
  const found = moodOptions.find(m => m.value === mood)
  return found ? found.label : mood
}

function getMostRecentDate() {
  if (userStore.userJournals.length === 0) return 'N/A'
  const dates = userStore.userJournals.map(e => new Date(e.date))
  const mostRecent = new Date(Math.max(...dates))
  return mostRecent.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getOldestDate() {
  if (userStore.userJournals.length === 0) return 'N/A'
  const dates = userStore.userJournals.map(e => new Date(e.date))
  const oldest = new Date(Math.min(...dates))
  return oldest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getMostCommonMood() {
  if (userStore.userJournals.length === 0) return 'N/A'
  const moodCounts = {}
  userStore.userJournals.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
  })
  let mostCommon = ''
  let highestCount = 0
  for (const [mood, count] of Object.entries(moodCounts)) {
    if (count > highestCount) {
      highestCount = count
      mostCommon = mood
    }
  }
  const found = moodOptions.find(m => m.value === mostCommon)
  return found ? found.label : mostCommon
}

function toggleMoodDropdown() {
  isMoodDropdownOpen.value = !isMoodDropdownOpen.value
}

function selectMood(mood) {
  newEntry.value.mood = mood.value
  isMoodDropdownOpen.value = false
}

function handleClickOutside(event) {
  const customSelect = document.querySelector('.custom-select')
  if (customSelect && !customSelect.contains(event.target)) {
    isMoodDropdownOpen.value = false
  }
}

function openAddModal() {
  newEntry.value = { 
    date: new Date().toISOString().split('T')[0], 
    mood: 'happy', 
    content: '' 
  }
  errorMessage.value = ''
  showModal.value = true
}

async function handleSaveEntry() {
  if (!newEntry.value.content.trim()) {
    errorMessage.value = t.pleaseWriteEntry || 'Please write something in your journal entry'
    return
  }
  
  if (!newEntry.value.date) {
    errorMessage.value = t.pleaseSelectDate || 'Please select a date'
    return
  }
  
  await userStore.addJournalEntry({
    date: newEntry.value.date,
    mood: newEntry.value.mood,
    content: newEntry.value.content
  })
  closeModal()
}

async function handleDeleteEntry(id) {
  if (confirm(t.deleteEntry || 'Delete this journal entry? This action cannot be undone.')) {
    await userStore.deleteJournalEntry(id)
  }
}

function closeModal() {
  showModal.value = false
  errorMessage.value = ''
  isMoodDropdownOpen.value = false
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  document.body.classList.toggle('dark-mode', isDarkMode.value)
}

function logout() {
  userStore.logout()
  router.push('/')
}

onMounted(async () => {
  currencyStore.loadCurrency()
  if (isDarkMode.value) document.body.classList.add('dark-mode')
  window.addEventListener('click', handleClickOutside)

  userStore.loadUserAvatar()
  
  if (userStore.currentUser?.supabaseId) {
    await userStore.loadUserData(userStore.currentUser.supabaseId)
  } else {
    await userStore.loadUserFromStorage()
  }
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Top Bar Styles */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.top-bar.dark-mode {
  background: #1e293b;
}

.page-header-compact h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dark-mode .page-header-compact h1 {
  color: #f1f5f9;
}

.page-header-compact .subtitle {
  color: #64748b;
  font-size: 13px;
  margin: 0;
}

.dark-mode .page-header-compact .subtitle {
  color: #94a3b8;
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Currency Selector Styles */
.currency-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(139, 92, 246, 0.15);
  padding: 8px 16px;
  border-radius: 30px;
  backdrop-filter: blur(10px);
}

.currency-selector-wrapper i {
  font-size: 18px;
  color: #8b5cf6;
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

/* Hide the old currency badge */
.currency-badge {
  display: none;
}

/* Responsive adjustments for top bar */
@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    gap: 16px;
  }
  
  .top-bar-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .currency-selector-wrapper {
    flex: 1;
    justify-content: center;
  }
}

/* Button styles */
.add-entry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
}

.add-entry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.empty-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
}

.empty-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.submit-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.cancel-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.dark-mode .cancel-btn {
  background: #334155;
  color: #94a3b8;
}

/* Rest of your existing styles remain the same */
.journal-page {
  display: flex;
  min-height: 100vh;
}





/* Top Bar Styles */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.top-bar.dark-mode {
  background: #1e293b;
}

.page-header-compact h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dark-mode .page-header-compact h1 {
  color: #f1f5f9;
}

.page-header-compact .subtitle {
  color: #64748b;
  font-size: 13px;
  margin: 0;
}

.dark-mode .page-header-compact .subtitle {
  color: #94a3b8;
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Currency Selector Styles */
.currency-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(139, 92, 246, 0.15);
  padding: 8px 16px;
  border-radius: 30px;
  backdrop-filter: blur(10px);
}

.currency-selector-wrapper i {
  font-size: 18px;
  color: #8b5cf6;
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

/* Hide the old currency badge */
.currency-badge {
  display: none;
}

/* Responsive adjustments for top bar */
@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    gap: 16px;
  }
  
  .top-bar-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .currency-selector-wrapper {
    flex: 1;
    justify-content: center;
  }
}

/* Update button colors to purple */
.add-entry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
}

.add-entry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.empty-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
}

.empty-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

/* Save Entry button - changed to purple */
.submit-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}


.journal-page {
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
  font-size: 32px;
  color: #8b5cf6;
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

.user-role {
  font-size: 11px;
  color: #94a3b8;
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
  background: #f8fafc;
  min-height: 100vh;
}

.main-content.dark-mode {
  background: #0f172a;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.currency-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
}

.add-entry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
}

.add-entry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
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

.loading-state {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.empty-state.dark-mode {
  background: #1e293b;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state.dark-mode .empty-icon-wrapper {
  background: linear-gradient(135deg, #2d1b4e 0%, #1a0f2e 100%);
}

.empty-icon-wrapper i {
  font-size: 40px;
  color: #8b5cf6;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.empty-state.dark-mode h3 {
  color: #f1f5f9;
}

.empty-state p {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 24px;
}

.empty-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
}

.empty-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.journal-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.journal-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.journal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.journal-card.dark-mode {
  background: #1e293b;
  border-color: #334155;
}

/* Mood border styles */
.journal-card.mood-happy {
  border-left: 4px solid #10b981;
}
.journal-card.mood-excited {
  border-left: 4px solid #f59e0b;
}
.journal-card.mood-neutral {
  border-left: 4px solid #94a3b8;
}
.journal-card.mood-thoughtful {
  border-left: 4px solid #8b5cf6;
}
.journal-card.mood-worried {
  border-left: 4px solid #f97316;
}
.journal-card.mood-sad {
  border-left: 4px solid #3b82f6;
}
.journal-card.mood-frustrated {
  border-left: 4px solid #ef4444;
}
.journal-card.mood-relieved {
  border-left: 4px solid #06b6d4;
}

.journal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.journal-date-mood {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.journal-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.dark-mode .journal-date {
  color: #94a3b8;
}

.journal-date i {
  font-size: 14px;
  color: #8b5cf6;
}

.mood-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge-happy {
  background: #d1fae5;
  color: #10b981;
}
.badge-excited {
  background: #fef3c7;
  color: #f59e0b;
}
.badge-neutral {
  background: #f1f5f9;
  color: #64748b;
}
.badge-thoughtful {
  background: #f3e8ff;
  color: #8b5cf6;
}
.badge-worried {
  background: #ffedd5;
  color: #f97316;
}
.badge-sad {
  background: #dbeafe;
  color: #3b82f6;
}
.badge-frustrated {
  background: #fee2e2;
  color: #ef4444;
}
.badge-relieved {
  background: #cffafe;
  color: #06b6d4;
}

.dark-mode .badge-happy {
  background: #064e3b;
}
.dark-mode .badge-excited {
  background: #78350f;
}
.dark-mode .badge-neutral {
  background: #334155;
  color: #94a3b8;
}
.dark-mode .badge-thoughtful {
  background: #2d1b4e;
}
.dark-mode .badge-worried {
  background: #7c2d12;
}
.dark-mode .badge-sad {
  background: #1e3a8a;
}
.dark-mode .badge-frustrated {
  background: #7f1d1d;
}
.dark-mode .badge-relieved {
  background: #164e63;
}

.journal-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
  color: #94a3b8;
}

.icon-btn i {
  font-size: 18px;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.dark-mode .delete-btn:hover {
  background: #7f1d1d;
}

.journal-content p {
  font-size: 15px;
  line-height: 1.6;
  color: #1e293b;
  margin: 0;
  white-space: pre-wrap;
}

.dark-mode .journal-content p {
  color: #e2e8f0;
}

.summary-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.summary-card.dark-mode {
  background: #1e293b;
  border-color: #334155;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.summary-header i {
  font-size: 24px;
  color: #8b5cf6;
}

.summary-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.dark-mode .summary-header h3 {
  color: #f1f5f9;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.summary-stat {
  text-align: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.dark-mode .summary-stat {
  background: #334155;
}

.summary-stat .stat-label {
  display: block;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
}

.dark-mode .summary-stat .stat-label {
  color: #94a3b8;
}

.summary-stat .stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .summary-stat .stat-value {
  color: #f1f5f9;
}

/* Horizontal Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.horizontal-modal {
  max-width: 700px !important;
  width: 90% !important;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.2s ease-out;
}

.modal-container.dark-mode {
  background: #1e293b;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .modal-header {
  border-bottom-color: #334155;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dark-mode .modal-header h3 {
  color: #f1f5f9;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #94a3b8;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  background: #f1f5f9;
  color: #ef4444;
}

.dark-mode .modal-close-btn:hover {
  background: #334155;
}

.modal-form {
  padding: 24px;
}

.horizontal-form {
  padding: 24px !important;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-group.full-width {
  width: 100%;
  margin-bottom: 20px;
}

.full-width {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  font-size: 14px;
}

.dark-mode .form-group label {
  color: #f1f5f9;
}

.form-group label i {
  color: #8b5cf6;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-input.dark-mode, .form-textarea.dark-mode {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

/* Custom Select Dropdown */
.custom-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.select-trigger:hover {
  border-color: #8b5cf6;
}

.dark-mode .select-trigger {
  background: #334155;
  border-color: #475569;
}

.selected-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selected-value i {
  font-size: 18px;
  color: #8b5cf6;
}

.selected-value span {
  color: #1e293b;
}

.dark-mode .selected-value span {
  color: #f1f5f9 !important;
}

.dark-mode .selected-value i {
  color: #a78bfa;
}

.dropdown-icon {
  transition: transform 0.2s;
  color: #64748b;
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-top: 4px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.select-dropdown.dark-mode {
  background: #1e293b;
  border-color: #334155;
}

.select-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.select-option span {
  color: #1e293b;
}

.select-option:hover {
  background: #f1f5f9;
}

.select-option.active {
  background: #f3e8ff;
}

.select-option i {
  font-size: 16px;
  color: #8b5cf6;
}

.check-icon {
  margin-left: auto;
  color: #10b981;
}

.dark-mode .select-option span {
  color: #cbd5e1 !important;
}

.dark-mode .select-option i {
  color: #a78bfa;
}

.dark-mode .select-option:hover {
  background: #334155;
}

.dark-mode .select-option:hover span {
  color: #f1f5f9 !important;
}

.dark-mode .select-option.active {
  background: #4c1d95;
}

.dark-mode .select-option.active span {
  color: #f1f5f9 !important;
}

.dark-mode .select-option.active i {
  color: #f1f5f9;
}

.dark-mode .check-icon {
  color: #f1f5f9;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 12px;
  font-size: 14px;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.submit-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.cancel-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.dark-mode .cancel-btn {
  background: #334155;
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 1024px) {
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
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
  .summary-stats {
    grid-template-columns: 1fr;
  }
  .form-row {
    flex-direction: column;
    gap: 20px;
  }
  .horizontal-modal {
    max-width: 95% !important;
  }
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .currency-badge {
    justify-content: center;
  }
  .modal-container {
    width: 95%;
    margin: 16px;
  }
  .journal-header {
    flex-direction: column;
  }
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
</style>