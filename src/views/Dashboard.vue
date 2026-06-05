<template>
  <div class="dashboard-container" :class="{ 'dark-mode': isDarkMode }">
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
      <!-- Top Bar -->
      <header class="top-bar" :class="{ 'dark-mode': isDarkMode }">
        <div class="search-container">
          <i class="bi bi-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="t.searchTransactions" 
            class="search-input"
            :class="{ 'dark-mode': isDarkMode }"
          />
        </div>
        
        <div class="top-bar-actions">
          <router-link to="/transactions" class="add-transaction-btn">
            <i class="bi bi-plus-lg"></i>
            <span>{{ t.addTransaction }}</span>
          </router-link>
          
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
          
          <NotificationDropdown />
          
          <LanguageSwitcher />
        </div>
      </header>

      <div class="welcome-section">
        <h1>{{ t.financialOverview }}</h1>
        <p>{{ t.realTimeSnapshot }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t.loadingData }}</p>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card" style="background: linear-gradient(135deg, #FFE4E1 0%, #FFDAB9 100%)">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <i class="bi bi-wallet2 stat-icon"></i>
              </div>
            </div>
            <h3>{{ t.totalBalance }}</h3>
            <p class="stat-value">{{ formatDashboardAmount(totalBalance6Months) }}</p>
            <p class="stat-sub">{{ t.last6Months }}</p>
          </div>
          
          <div class="stat-card" style="background: linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <i class="bi bi-graph-up stat-icon"></i>
              </div>
            </div>
            <h3>{{ t.income }}</h3>
            <p class="stat-value">{{ formatDashboardAmount(totalIncome6Months) }}</p>
            <p class="stat-sub">{{ t.last6Months }}</p>
          </div>
          
          <div class="stat-card" style="background: linear-gradient(135deg, #FFE0E0 0%, #FFCDCD 100%)">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <i class="bi bi-graph-down stat-icon"></i>
              </div>
            </div>
            <h3>{{ t.expenses }}</h3>
            <p class="stat-value">{{ formatDashboardAmount(totalExpenses6Months) }}</p>
            <p class="stat-sub">{{ t.last6Months }}</p>
          </div>
          
          <div class="stat-card" style="background: linear-gradient(135deg, #E8E0F7 0%, #D4C5F0 100%)">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <i class="bi bi-calculator-fill stat-icon"></i>
              </div>
            </div>
            <h3>{{ t.net }}</h3>
            <p class="stat-value" :class="netSavings6Months >= 0 ? 'positive' : 'negative'">
              {{ formatDashboardAmount(netSavings6Months) }}
            </p>
            <p class="stat-sub">{{ t.netIncomeAfterExpenses }}</p>
          </div>
        </div>

        <!-- Mini Stats Row -->
        <div class="mini-stats">
          <div class="mini-stat-card">
            <i class="bi bi-arrow-repeat"></i>
            <div>
              <h4>{{ t.subscriptions }}</h4>
              <p>{{ formatDashboardAmount(monthlySubscriptionsTotal) }}</p>
            </div>
          </div>
          <div class="mini-stat-card">
            <i class="bi bi-trophy-fill"></i>
            <div>
              <h4>{{ t.goals }}</h4>
              <p>{{ goalsProgress }}%</p>
            </div>
          </div>
          <div class="mini-stat-card">
            <i class="bi bi-journal-text"></i>
            <div>
              <h4>{{ t.journalEntries }}</h4>
              <p>{{ userStore.userJournals.length }}</p>
            </div>
          </div>
          <div class="mini-stat-card">
            <i class="bi bi-check-circle-fill"></i>
            <div>
              <h4>{{ t.activeSubscriptions }}</h4>
              <p>{{ activeSubscriptionsCount }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card" :class="{ 'dark-mode': isDarkMode }">
          <div class="card-header">
            <h3><i class="bi bi-clock-history"></i> {{ t.recentTransactions }}</h3>
            <router-link to="/transactions" class="view-all-link">{{ t.viewAll }} <i class="bi bi-arrow-right"></i></router-link>
          </div>
          <div class="recent-transactions">
            <div v-for="transaction in recentTransactions" :key="transaction.id" class="recent-item" :class="{ 'dark-mode': isDarkMode }">
              <div class="recent-icon" :class="transaction.amount > 0 ? 'income-icon' : 'expense-icon'">
                <i :class="getCategoryIcon(transaction.category)"></i>
              </div>
              <div class="recent-details">
                <div class="recent-desc">{{ transaction.description }}</div>
                <div class="recent-date">{{ formatDate(transaction.date) }}</div>
              </div>
              <div class="recent-amount" :class="transaction.amount > 0 ? 'text-income' : 'text-expense'">
                {{ formatDashboardAmount(transaction.amount) }}
              </div>
            </div>
            <div v-if="recentTransactions.length === 0" class="no-data-message">
              <i class="bi bi-inbox"></i>
              <p>{{ t.noTransactionsFound }}. {{ t.addYourFirstTransaction }}</p>
              <router-link to="/transactions" class="add-first-btn">+ {{ t.addTransaction }}</router-link>
            </div>
          </div>
        </div>

        <!-- Two Column Layout: Goals + Upcoming Subscriptions -->
        <div class="two-columns">
          <!-- Goals Progress -->
          <div class="card" :class="{ 'dark-mode': isDarkMode }">
            <div class="card-header">
              <h3><i class="bi bi-trophy-fill"></i> {{ t.goalsProgress }}</h3>
              <router-link to="/goals" class="view-all-link">{{ t.viewAllCategories || 'View All' }} <i class="bi bi-arrow-right"></i></router-link>
            </div>
            <div class="goals-list">
              <div v-for="goal in topGoals" :key="goal.id" class="goal-item">
                <div class="goal-info">
                  <span class="goal-name">{{ goal.name }}</span>
                  <span class="goal-amount">{{ formatDashboardAmount(goal.saved) }} / {{ formatDashboardAmount(goal.target) }}</span>
                </div>
                <div class="goal-progress-bar">
                  <div class="goal-progress-fill" :style="{ width: getGoalProgress(goal) + '%' }"></div>
                </div>
                <div class="goal-percent">{{ getGoalProgress(goal) }}%</div>
              </div>
              <div v-if="topGoals.length === 0" class="no-data-message-small">
                <i class="bi bi-flag"></i>
                <p>{{ t.noGoalsYet }} <router-link to="/goals">{{ t.createGoal }}</router-link></p>
              </div>
            </div>
          </div>

          <!-- Upcoming Subscriptions -->
          <div class="card" :class="{ 'dark-mode': isDarkMode }">
            <div class="card-header">
              <h3><i class="bi bi-bell-fill"></i> {{ t.upcomingSubscriptions }}</h3>
              <router-link to="/subscriptions" class="view-all-link">{{ t.viewAllCategories || 'View All' }} <i class="bi bi-arrow-right"></i></router-link>
            </div>
            <div class="upcoming-list">
              <div v-for="sub in upcomingSubscriptions" :key="sub.id" class="upcoming-item" :class="{ 'dark-mode': isDarkMode }">
                <div class="upcoming-icon" :class="getBillingClass(sub.billing_cycle)">
                  <i :class="getSubscriptionIcon(sub.name)"></i>
                </div>
                <div class="upcoming-info">
                  <div class="upcoming-name">{{ sub.name }}</div>
                  <div class="upcoming-date">
                    <i class="bi bi-calendar3"></i> Due: {{ formatDate(sub.next_billing_date) }}
                  </div>
                </div>
                <div class="upcoming-amount">{{ formatDashboardAmount(sub.amount) }}</div>
              </div>
              <div v-if="upcomingSubscriptions.length === 0" class="no-data-message-small">
                <i class="bi bi-arrow-repeat"></i>
                <p>{{ t.noUpcomingSubscriptions }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Action Buttons -->
        <div class="quick-actions">
          <router-link to="/transactions" class="action-btn">
            <i class="bi bi-plus-circle"></i>
            <span>{{ t.addTransaction }}</span>
          </router-link>
          <router-link to="/budget" class="action-btn">
            <i class="bi bi-cash-stack"></i>
            <span>{{ t.reviewBudget }}</span>
          </router-link>
          <router-link to="/journal" class="action-btn">
            <i class="bi bi-journal-text"></i>
            <span>{{ t.writeJournal }}</span>
          </router-link>
          <router-link to="/reports" class="action-btn">
            <i class="bi bi-file-bar-graph"></i>
            <span>{{ t.viewReports }}</span>
          </router-link>
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
import NotificationDropdown from '../components/NotificationDropdown.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const router = useRouter()
const userStore = useUserStore()
const currencyStore = useCurrencyStore()
const languageStore = useLanguageStore()

const t = languageStore.t

// Loading state
const loading = ref(true)

// Dark mode state
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const searchQuery = ref('')

const userName = computed(() => userStore.userName || 'User')
const userAvatar = computed(() => userStore.userAvatarUrl)
const selectedCurrency = computed(() => currencyStore.selectedCurrency)
const currencySymbol = computed(() => currencyStore.currencySymbol)

// Handle currency change
function handleCurrencyChange(event) {
  currencyStore.setCurrency(event.target.value)
}

// Helper to get transactions from last 6 months
const getLast6MonthsTransactions = computed(() => {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  
  return userStore.userTransactions.filter(t => {
    const date = new Date(t.date)
    return date >= sixMonthsAgo
  })
})

// 6 Months calculations
const totalIncome6Months = computed(() => {
  return getLast6MonthsTransactions.value
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalExpenses6Months = computed(() => {
  return getLast6MonthsTransactions.value
    .filter(t => t.amount < 0 && !t.is_subscription_billing)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
})

const netSavings6Months = computed(() => totalIncome6Months.value - totalExpenses6Months.value)

const totalBalance6Months = computed(() => {
  let balance = 0
  const sorted = [...getLast6MonthsTransactions.value].sort((a, b) => new Date(a.date) - new Date(b.date))
  sorted.forEach(t => {
    balance += t.amount
  })
  return balance
})

// Subscription totals
const monthlySubscriptionsTotal = computed(() => {
  let total = 0
  userStore.userSubscriptions.forEach(sub => {
    if (sub.status === 'active') {
      if (sub.billing_cycle === 'Monthly') total += sub.amount
      else if (sub.billing_cycle === 'Yearly') total += sub.amount / 12
      else if (sub.billing_cycle === 'Quarterly') total += sub.amount / 3
    }
  })
  return total
})

const activeSubscriptionsCount = computed(() => {
  return userStore.userSubscriptions.filter(sub => sub.status === 'active').length
})

// Goals progress
const goalsProgress = computed(() => {
  if (userStore.userGoals.length === 0) return 0
  const totalTarget = userStore.userGoals.reduce((sum, g) => sum + g.target, 0)
  const totalSaved = userStore.userGoals.reduce((sum, g) => sum + g.saved, 0)
  return totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0
})

const topGoals = computed(() => {
  return [...userStore.userGoals]
    .sort((a, b) => (b.saved / b.target) - (a.saved / a.target))
    .slice(0, 3)
})

function getGoalProgress(goal) {
  if (goal.target === 0) return 0
  return Math.min(Math.round((goal.saved / goal.target) * 100), 100)
}

// Recent transactions (last 5)
const recentTransactions = computed(() => {
  return [...userStore.userTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
})

// Upcoming subscriptions (next 7 days)
const upcomingSubscriptions = computed(() => {
  const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)
  
  return userStore.userSubscriptions
    .filter(sub => {
      if (sub.status !== 'active') return false
      const nextDate = new Date(sub.next_billing_date)
      return nextDate >= today && nextDate <= nextWeek
    })
    .sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date))
})

// Helper functions
function getCategoryIcon(category) {
  const icons = {
    'Food': 'bi bi-egg-fried',
    'Transport': 'bi bi-fuel-pump',
    'Entertainment': 'bi bi-ticket-perforated',
    'Bills': 'bi bi-receipt',
    'Housing': 'bi bi-house-heart',
    'Utilities': 'bi bi-droplet',
    'Shopping': 'bi bi-bag',
    'Healthcare': 'bi bi-heart-pulse',
    'Education': 'bi bi-book',
    'Income': 'bi bi-cash-stack',
    'Productivity': 'bi bi-briefcase-fill',
    'Cloud Storage': 'bi bi-cloud-upload-fill',
    'Music': 'bi bi-music-note-beamed',
    'Fitness': 'bi bi-heart-pulse-fill',
    'Rent': 'bi bi-house-heart',
    'Other': 'bi bi-tag-fill'
  }
  return icons[category] || 'bi bi-tag-fill'
}

function formatDashboardAmount(amount) {
  if (amount === undefined || amount === null) return `${currencyStore.currencySymbol}0.00`
  const absAmount = Math.abs(amount).toFixed(2)
  const sign = amount < 0 ? '-' : ''
  const symbol = currencyStore.currencySymbol
  
  if (currencyStore.selectedCurrency === 'MYR') {
    return `${symbol} ${sign}${absAmount}`
  }
  return `${symbol}${sign}${absAmount}`
}

function getSubscriptionIcon(name) {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('netflix')) return 'bi bi-film'
  if (nameLower.includes('spotify')) return 'bi bi-music-note-beamed'
  if (nameLower.includes('youtube')) return 'bi bi-youtube'
  if (nameLower.includes('gym')) return 'bi bi-heart-pulse'
  if (nameLower.includes('drive') || nameLower.includes('cloud')) return 'bi bi-cloud-upload'
  if (nameLower.includes('microsoft') || nameLower.includes('office')) return 'bi bi-windows'
  if (nameLower.includes('adobe')) return 'bi bi-brush'
  if (nameLower.includes('amazon') || nameLower.includes('prime')) return 'bi bi-amazon'
  if (nameLower.includes('disney')) return 'bi bi-tv'
  if (nameLower.includes('apple')) return 'bi bi-apple'
  return 'bi bi-arrow-repeat'
}

function getBillingClass(cycle) {
  if (cycle === 'Monthly') return 'monthly'
  if (cycle === 'Yearly') return 'yearly'
  return 'quarterly'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

// Watch for currency changes to refresh the display
watch(selectedCurrency, () => {
  // This will trigger re-rendering of all formatted amounts
  console.log('Currency changed to:', selectedCurrency.value)
})

onMounted(async () => {
  loading.value = true
  
  try {
    // Load user data first
    if (userStore.currentUser?.supabaseId) {
      await userStore.loadUserData(userStore.currentUser.supabaseId)
    } else {
      await userStore.loadUserFromStorage()
    }
    
    // Process subscriptions
    await userStore.processSubscriptionBilling()
    
    // Apply theme
    if (isDarkMode.value) document.body.classList.add('dark-mode')
    
    // Load avatar and currency
    userStore.loadUserAvatar()
    currencyStore.loadCurrency()
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Add these styles for the currency selector */
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


.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}


.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.dashboard-container.dark-mode {
  background: #0f172a;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px;
  background: white;
  border-radius: 20px;
  margin: 20px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #e2e8f0;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Sidebar */
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

.nav-item:hover, .nav-item.router-link-active {
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
  color: #64748b;
}

.theme-toggle:hover {
  background: #f1f5f9;
}

.sidebar.dark-mode .theme-toggle {
  color: #94a3b8;
}

.user-info-sidebar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  margin-bottom: 15px;
  text-decoration: none;
  border-radius: 10px;
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
}

.logout-sidebar-btn:hover {
  background: #fef2f2;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 24px 32px;
}

/* Top Bar */
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

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  font-size: 14px;
  background: #f8fafc;
}

.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: white;
}

.search-input.dark-mode {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.add-transaction-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
}

.add-transaction-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

/* Welcome Section */
.welcome-section {
  margin-bottom: 25px;
}

.welcome-section h1 {
  font-size: 28px;
  color: #1e293b;
  margin-bottom: 5px;
}

.dark-mode .welcome-section h1 {
  color: #f1f5f9;
}

.welcome-section p {
  color: #64748b;
}

.dark-mode .welcome-section p {
  color: #94a3b8;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  border-radius: 20px;
  padding: 20px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.stat-icon-wrapper {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  font-size: 20px;
  color: #8b5cf6;
}

.stat-card h3 {
  font-size: 13px;
  color: #475569;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 5px;
}

.stat-value.positive {
  color: #10b981;
}

.stat-value.negative {
  color: #ef4444;
}

.stat-sub {
  font-size: 11px;
  color: #64748b;
}

/* Mini Stats */
.mini-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.mini-stat-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s;
}

.mini-stat-card:hover {
  transform: translateY(-2px);
}

.dark-mode .mini-stat-card {
  background: #1e293b;
}

.mini-stat-card i {
  font-size: 28px;
  color: #8b5cf6;
}

.mini-stat-card h4 {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.dark-mode .mini-stat-card h4 {
  color: #94a3b8;
}

.mini-stat-card p {
  font-size: 18px;
  font-weight: bold;
  color: #1e293b;
}

.dark-mode .mini-stat-card p {
  color: #f1f5f9;
}

/* Card */
.card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 25px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card.dark-mode {
  background: #1e293b;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 16px;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark-mode .card-header h3 {
  color: #f1f5f9;
}

.view-all-link {
  font-size: 12px;
  color: #8b5cf6;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Recent Transactions */
.recent-transactions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s;
}

.recent-item:hover {
  transform: translateX(4px);
  background: #f1f5f9;
}

.recent-item.dark-mode {
  background: #334155;
}

.recent-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.recent-icon.income-icon {
  background: #d1fae5;
  color: #10b981;
}

.recent-icon.expense-icon {
  background: #fee2e2;
  color: #ef4444;
}

.dark-mode .recent-icon.income-icon {
  background: #064e3b;
}

.dark-mode .recent-icon.expense-icon {
  background: #7f1d1d;
}

.recent-details {
  flex: 1;
}

.recent-desc {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.dark-mode .recent-desc {
  color: #f1f5f9;
}

.recent-date {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.dark-mode .recent-date {
  color: #94a3b8;
}

.recent-amount {
  font-weight: 700;
  font-size: 16px;
}

.text-income {
  color: #10b981;
}

.text-expense {
  color: #ef4444;
}

/* Two Columns */
.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
}

/* Goals List */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.goal-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.dark-mode .goal-item {
  background: #334155;
}

.goal-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.goal-name {
  font-weight: 600;
  font-size: 13px;
  color: #1e293b;
}

.dark-mode .goal-name {
  color: #f1f5f9;
}

.goal-amount {
  font-size: 12px;
  color: #64748b;
}

.dark-mode .goal-amount {
  color: #94a3b8;
}

.goal-progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 6px;
}

.dark-mode .goal-progress-bar {
  background: #475569;
}

.goal-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #8b5cf6);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.goal-percent {
  font-size: 11px;
  color: #64748b;
  text-align: right;
}

.dark-mode .goal-percent {
  color: #94a3b8;
}

/* Upcoming Subscriptions */
.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s;
}

.upcoming-item:hover {
  transform: translateX(4px);
}

.upcoming-item.dark-mode {
  background: #334155;
}

.upcoming-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.upcoming-icon.monthly {
  background: #d1fae5;
  color: #10b981;
}

.upcoming-icon.yearly {
  background: #e0e7ff;
  color: #8b5cf6;
}

.upcoming-icon.quarterly {
  background: #fef3c7;
  color: #f59e0b;
}

.dark-mode .upcoming-icon.monthly {
  background: #064e3b;
}

.dark-mode .upcoming-icon.yearly {
  background: #312e81;
}

.dark-mode .upcoming-icon.quarterly {
  background: #78350f;
}

.upcoming-info {
  flex: 1;
}

.upcoming-name {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
}

.dark-mode .upcoming-name {
  color: #f1f5f9;
}

.upcoming-date {
  font-size: 11px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.dark-mode .upcoming-date {
  color: #94a3b8;
}

.upcoming-amount {
  font-weight: 700;
  font-size: 14px;
  color: #1e293b;
}

.dark-mode .upcoming-amount {
  color: #f1f5f9;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 10px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s;
  text-align: center;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.dark-mode .action-btn {
  background: #1e293b;
}

.action-btn i {
  font-size: 28px;
  color: #8b5cf6;
}

.action-btn span {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.dark-mode .action-btn span {
  color: #f1f5f9;
}

/* No Data Messages */
.no-data-message {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.no-data-message i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-data-message-small {
  text-align: center;
  padding: 30px;
  color: #64748b;
}

.no-data-message-small i {
  font-size: 32px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.add-first-btn {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid, .mini-stats, .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  .two-columns {
    grid-template-columns: 1fr;
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
  .stats-grid, .mini-stats, .quick-actions {
    grid-template-columns: 1fr;
  }
  .top-bar {
    flex-direction: column;
    gap: 15px;
  }
  .search-container {
    max-width: 100%;
  }
}
</style>