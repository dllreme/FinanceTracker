<template>
  <div class="goals-page" :class="{ 'dark-mode': isDarkMode }">
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
          <router-link to="/goals" class="nav-item active">
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
          <h1><i class="bi bi-trophy-fill"></i> {{ t.goals || 'Financial Goals' }}</h1>
          <p class="subtitle">{{ t.trackYourSavings || 'Track your savings goals and watch your progress' }}</p>
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
          
          <button @click="openAddModal" class="add-goal-btn">
            <i class="bi bi-plus-lg"></i> {{ t.addNewGoal || 'Add New Goal' }}
          </button>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="userStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t.loadingGoals || 'Loading goals...' }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="userStore.userGoals.length === 0" class="empty-state" :class="{ 'dark-mode': isDarkMode }">
        <div class="empty-icon-wrapper">
          <i class="bi bi-flag"></i>
        </div>
        <h3>{{ t.noGoalsYet || 'No Goals Yet' }}</h3>
        <p>{{ t.startSaving || 'Start saving for something special! Add your first financial goal.' }}</p>
        <button @click="openAddModal" class="empty-add-btn">
          <i class="bi bi-plus-circle"></i> {{ t.createFirstGoal || 'Create Your First Goal' }}
        </button>
      </div>

      <!-- Goals Grid -->
      <div v-else class="goals-grid">
        <div v-for="goal in userStore.userGoals" :key="goal.id" class="goal-card" :class="{ 'dark-mode': isDarkMode, 'completed': getProgressPercent(goal) >= 100 }">
          <div class="goal-header">
            <div class="goal-title">
              <i :class="getGoalIcon(goal.name)"></i>
              <h3>{{ goal.name }}</h3>
            </div>
            <div class="goal-actions">
              <button @click="openEditModal(goal)" class="icon-btn edit-btn" :title="t.edit || 'Edit'">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button @click="handleDeleteGoal(goal.id)" class="icon-btn delete-btn" :title="t.delete || 'Delete'">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>

          <div class="goal-visual">
            <div class="goal-stats">
              <div class="goal-amounts">
                <span class="saved">{{ formatCurrency(goal.saved) }}</span>
                <span class="separator">/</span>
                <span class="target">{{ formatCurrency(goal.target) }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress" :style="{ width: getProgressPercent(goal) + '%' }"></div>
              </div>
              <div class="progress-stats">
                <span class="percent">{{ getProgressPercent(goal) }}% {{ t.complete || 'Complete' }}</span>
                <span class="remaining" v-if="getProgressPercent(goal) < 100">
                  {{ formatCurrency(goal.target - goal.saved) }} {{ t.left || 'left' }}
                </span>
                <span class="completed-badge" v-else>
                  <i class="bi bi-check-circle-fill"></i> {{ t.achieved || 'Achieved!' }}
                </span>
              </div>
            </div>
          </div>

          <div class="quick-add">
            <div class="quick-add-input">
              <i class="bi bi-plus-circle"></i>
              <input 
                type="number" 
                v-model.number="addAmount[goal.id]" 
                :placeholder="formatCurrency(0)" 
                @keyup.enter="handleUpdateProgress(goal.id)"
              />
            </div>
            <button @click="handleUpdateProgress(goal.id)" class="add-progress-btn" :disabled="!addAmount[goal.id] || addAmount[goal.id] <= 0">
              <i class="bi bi-plus-lg"></i> {{ t.addProgress || 'Add Progress' }}
            </button>
          </div>

          <!-- Achievement Celebration -->
          <div v-if="getProgressPercent(goal) >= 100 && !getGoalCelebrated(goal.id)" class="celebration-banner">
            <span>{{ t.congratulationsAchieved || 'Congratulations! You\'ve achieved your goal!' }}</span>
            <button @click="markCelebrated(goal.id)" class="close-celebration">×</button>
          </div>
        </div>
      </div>

      <!-- Summary Card -->
      <div v-if="userStore.userGoals.length > 0" class="summary-card" :class="{ 'dark-mode': isDarkMode }">
        <div class="summary-header">
          <i class="bi bi-graph-up"></i>
          <h3>{{ t.goalsSummary || 'Goals Summary' }}</h3>
        </div>
        <div class="summary-stats">
          <div class="summary-stat">
            <span class="stat-label">{{ t.totalGoals || 'Total Goals' }}</span>
            <span class="stat-value">{{ userStore.userGoals.length }}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">{{ t.totalTarget || 'Total Target' }}</span>
            <span class="stat-value">{{ formatCurrency(totalTarget) }}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">{{ t.totalSaved || 'Total Saved' }}</span>
            <span class="stat-value text-success">{{ formatCurrency(totalSaved) }}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">{{ t.overallProgress || 'Overall Progress' }}</span>
            <span class="stat-value">{{ overallProgress }}%</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">{{ t.goalsAchieved || 'Goals Achieved' }}</span>
            <span class="stat-value text-success">{{ achievedCount }} / {{ userStore.userGoals.length }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Add/Edit Goal Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
        <div class="modal-header">
          <h3>
            <i class="bi" :class="isEditing ? 'bi-pencil-square' : 'bi-plus-circle-fill'"></i>
            {{ isEditing ? (t.editGoal || 'Edit Goal') : (t.addNewGoal || 'Add New Goal') }}
          </h3>
          <button @click="closeModal" class="modal-close-btn">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleSaveGoal" class="modal-form">
          <div class="form-group">
            <label><i class="bi bi-tag-fill"></i> {{ t.goalName || 'Goal Name' }}</label>
            <input 
              v-model="goalForm.name" 
              type="text" 
              :placeholder="t.goalNamePlaceholder || 'e.g., Emergency Fund, New Laptop, Vacation'"
              required
              class="form-input" 
              :class="{ 'dark-mode': isDarkMode }"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label><i class="bi bi-cash-stack"></i> {{ t.targetAmount || 'Target Amount' }} ({{ currencySymbol }})</label>
              <input 
                v-model.number="goalForm.target" 
                type="number" 
                placeholder="0.00"
                required
                step="0.01"
                class="form-input" 
                :class="{ 'dark-mode': isDarkMode }"
                @input="handleTargetInput"
              />
            </div>
            
            <div class="form-group" v-if="isEditing">
              <label><i class="bi bi-wallet2"></i> {{ t.savedAmount || 'Saved Amount' }} ({{ currencySymbol }})</label>
              <input 
                v-model.number="goalForm.saved" 
                type="number" 
                placeholder="0.00"
                step="0.01"
                class="form-input" 
                :class="{ 'dark-mode': isDarkMode }"
                @input="handleSavedInput"
              />
            </div>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            <i class="bi bi-exclamation-triangle-fill"></i> {{ errorMessage }}
          </div>
          
          <div class="action-buttons">
            <button type="submit" class="submit-btn">
              <i class="bi bi-check-lg"></i> {{ isEditing ? (t.saveChanges || 'Save Changes') : (t.createGoal || 'Create Goal') }}
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
import { ref, computed, onMounted } from 'vue'
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
const isEditing = ref(false)
const editingId = ref(null)
const addAmount = ref({})
const celebratedGoals = ref(new Set())
const errorMessage = ref('')

const goalForm = ref({
  name: '',
  target: 0,
  saved: 0
})

// Handle currency change
function handleCurrencyChange(event) {
  currencyStore.setCurrency(event.target.value)
}

// Computed properties
const totalTarget = computed(() => {
  return userStore.userGoals.reduce((sum, goal) => sum + goal.target, 0)
})

const totalSaved = computed(() => {
  return userStore.userGoals.reduce((sum, goal) => sum + goal.saved, 0)
})

const overallProgress = computed(() => {
  if (totalTarget.value === 0) return 0
  return Math.round((totalSaved.value / totalTarget.value) * 100)
})

const achievedCount = computed(() => {
  return userStore.userGoals.filter(goal => goal.saved >= goal.target).length
})

// Helper functions
function roundToTwoDecimals(value) {
  if (isNaN(value) || value === null || value === undefined) return 0
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function formatCurrency(amount) {
  if (amount === undefined || amount === null) return `${currencySymbol.value}0.00`
  const roundedAmount = roundToTwoDecimals(amount)
  const absAmount = Math.abs(roundedAmount).toFixed(2)
  const sign = roundedAmount < 0 ? '-' : ''
  if (selectedCurrency.value === 'MYR') {
    return `${currencySymbol.value} ${sign}${absAmount}`
  }
  return `${currencySymbol.value}${sign}${absAmount}`
}

function getProgressPercent(goal) {
  if (goal.target === 0) return 0
  const percent = (goal.saved / goal.target) * 100
  return Math.min(Math.round(percent), 100)
}

function getGoalIcon(goalName) {
  const icons = {
    'Emergency': 'bi bi-shield-shaded',
    'Vacation': 'bi bi-umbrella',
    'Travel': 'bi bi-airplane',
    'Car': 'bi bi-car-front',
    'House': 'bi bi-house-heart',
    'Home': 'bi bi-building',
    'Education': 'bi bi-book',
    'Laptop': 'bi bi-laptop',
    'Computer': 'bi bi-pc-display',
    'Phone': 'bi bi-phone',
    'Wedding': 'bi bi-heart',
    'Retirement': 'bi bi-umbrella',
    'Investment': 'bi bi-graph-up',
    'Business': 'bi bi-briefcase',
    'Gift': 'bi bi-gift',
    'Charity': 'bi bi-heart',
    'Health': 'bi bi-heart-pulse',
    'Fitness': 'bi bi-bicycle',
    'Debt': 'bi bi-credit-card',
    'Savings': 'bi bi-piggy-bank'
  }
  
  for (const [key, icon] of Object.entries(icons)) {
    if (goalName.toLowerCase().includes(key.toLowerCase())) {
      return icon
    }
  }
  return 'bi bi-flag-fill'
}

function getGoalCelebrated(goalId) {
  return celebratedGoals.value.has(goalId)
}

function markCelebrated(goalId) {
  celebratedGoals.value.add(goalId)
  setTimeout(() => {
    celebratedGoals.value.delete(goalId)
  }, 5000)
}

function handleTargetInput(event) {
  goalForm.value.target = roundToTwoDecimals(parseFloat(event.target.value) || 0)
}

function handleSavedInput(event) {
  goalForm.value.saved = roundToTwoDecimals(parseFloat(event.target.value) || 0)
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  goalForm.value = { name: '', target: 0, saved: 0 }
  errorMessage.value = ''
  showModal.value = true
}

function openEditModal(goal) {
  isEditing.value = true
  editingId.value = goal.id
  goalForm.value = {
    name: goal.name,
    target: roundToTwoDecimals(goal.target),
    saved: roundToTwoDecimals(goal.saved)
  }
  errorMessage.value = ''
  showModal.value = true
}

async function handleSaveGoal() {
  if (!goalForm.value.name.trim()) {
    errorMessage.value = t.pleaseEnterGoalName || 'Please enter a goal name'
    return
  }
  if (!goalForm.value.target || goalForm.value.target <= 0) {
    errorMessage.value = t.pleaseEnterValidTarget || 'Please enter a valid target amount'
    return
  }
  
  if (isEditing.value) {
    const roundedSaved = roundToTwoDecimals(goalForm.value.saved)
    await userStore.updateGoal(editingId.value, roundedSaved)
  } else {
    const roundedTarget = roundToTwoDecimals(goalForm.value.target)
    await userStore.addGoal({
      name: goalForm.value.name,
      target: roundedTarget,
      saved: 0
    })
  }
  closeModal()
}

async function handleUpdateProgress(goalId) {
  const amount = addAmount.value[goalId]
  if (amount && amount > 0) {
    const roundedAmount = roundToTwoDecimals(amount)
    const goal = userStore.userGoals.find(g => g.id === goalId)
    if (goal) {
      const newSaved = roundToTwoDecimals(goal.saved + roundedAmount)
      await userStore.updateGoal(goalId, newSaved)
      addAmount.value[goalId] = ''
    }
  }
}

async function handleDeleteGoal(id) {
  if (confirm(t.deleteGoalConfirm || 'Are you sure you want to delete this goal?')) {
    await userStore.deleteGoal(id)
  }
}

function closeModal() {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
  goalForm.value = { name: '', target: 0, saved: 0 }
  errorMessage.value = ''
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
  
  if (userStore.currentUser?.supabaseId) {
    await userStore.loadUserData(userStore.currentUser.supabaseId)
  } else {
    await userStore.loadUserFromStorage()
  }

  userStore.loadUserAvatar()
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

/* Add Goal Button */
.add-goal-btn {
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

.add-goal-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
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

.goals-page {
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
  background: #f8fafc;
  min-height: 100vh;
}

.main-content.dark-mode {
  background: #0f172a;
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

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.goal-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.goal-card.dark-mode {
  background: #1e293b;
  border-color: #334155;
}

.goal-card.completed {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.dark-mode .goal-card.completed {
  background: linear-gradient(135deg, #1e293b 0%, #064e3b 100%);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.goal-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.goal-title i {
  font-size: 24px;
  color: #8b5cf6;
}

.goal-title h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.dark-mode .goal-title h3 {
  color: #f1f5f9;
}

.goal-actions {
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
}

.icon-btn i {
  font-size: 18px;
}

.edit-btn {
  color: #3b82f6;
}

.edit-btn:hover {
  background: #eff6ff;
}

.delete-btn {
  color: #ef4444;
}

.delete-btn:hover {
  background: #fef2f2;
}

.goal-stats {
  flex: 1;
}

.goal-amounts {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 10px;
  justify-content: center;
}

.saved {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
}

.target {
  font-size: 16px;
  color: #64748b;
}

.separator {
  font-size: 18px;
  color: #cbd5e1;
}

.progress-bar {
  background: #e2e8f0;
  border-radius: 10px;
  height: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}

.dark-mode .progress-bar {
  background: #334155;
}

.progress {
  background: linear-gradient(90deg, #10b981, #8b5cf6);
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.percent {
  color: #64748b;
}

.remaining {
  color: #f59e0b;
}

.completed-badge {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Update the quick-add section in your Goals page CSS */
.quick-add {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.dark-mode .quick-add {
  border-top-color: #334155;
}

.quick-add-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 12px;
  min-width: 0; /* Allow flex item to shrink */
}

.dark-mode .quick-add-input {
  background: #334155;
  border-color: #475569;
}

.quick-add-input i {
  color: #8b5cf6;
  font-size: 16px;
  flex-shrink: 0;
}

.quick-add-input input {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: none;
  font-size: 14px;
  outline: none;
  min-width: 0;
  width: 100%;
}

.dark-mode .quick-add-input input {
  color: #f1f5f9;
}

.quick-add-input input::placeholder {
  color: #94a3b8;
}

.add-progress-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.add-progress-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.add-progress-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #94a3b8;
}

/* Responsive fix for mobile */
@media (max-width: 768px) {
  .quick-add {
    flex-direction: column;
  }
  
  .add-progress-btn {
    width: 100%;
    white-space: normal;
  }
  
  .quick-add-input {
    width: 100%;
  }
}

/* Ensure goal card has proper height and overflow handling */
.goal-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: auto;
  overflow: hidden;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.goal-amounts {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.saved {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
  word-break: break-word;
}

.target {
  font-size: 16px;
  color: #64748b;
  word-break: break-word;
}

/* Progress stats responsive */
.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.percent {
  color: #64748b;
}

.remaining {
  color: #f59e0b;
}

.completed-badge {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
}

.celebration-banner {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 13px;
}

.close-celebration {
  margin-left: auto;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.8;
}

.close-celebration:hover {
  opacity: 1;
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
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .summary-stat .stat-value {
  color: #f1f5f9;
}

.text-success {
  color: #10b981 !important;
}

/* Modal Styles */
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-input.dark-mode {
  background: #334155;
  border-color: #475569;
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
  .goals-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
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
  .goals-grid {
    grid-template-columns: 1fr;
  }
  .summary-stats {
    grid-template-columns: 1fr;
  }
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .modal-container {
    width: 95%;
    margin: 16px;
  }
  .quick-add {
    flex-direction: column;
  }
  .add-progress-btn {
    width: 100%;
  }
}
</style>