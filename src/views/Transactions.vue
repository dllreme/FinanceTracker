<template>
  <div class="transactions-container" :class="{ 'dark-mode': isDarkMode }">
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
          <router-link to="/transactions" class="nav-item active">
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
          <span>{{ isDarkMode ? t.lightMode : t.darkMode }}</span>
        </div>
        
        <router-link to="/profile" class="user-info-sidebar">
          <div class="user-avatar-small">
            <img v-if="userAvatar" :src="userAvatar" class="avatar-img" />
            <i v-else class="bi bi-person-circle"></i>
          </div>
          <div>
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
          <h1><i class="bi bi-journal-bookmark-fill"></i> {{ t.transactions }}</h1>
          <p class="subtitle">{{ t.trackManageTransactions }}</p>
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
          
          <button @click="openAddModal" class="add-btn">
            <i class="bi bi-plus-lg"></i> {{ t.addTransaction }}
          </button>
        </div>
      </header>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon income-icon">
            <i class="bi bi-arrow-down-circle-fill"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ t.totalIncome }}</span>
            <span class="card-value income">{{ formatAmountDisplay(totalIncome) }}</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon expense-icon">
            <i class="bi bi-arrow-up-circle-fill"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ t.totalExpenses }}</span>
            <span class="card-value expense">{{ formatAmountDisplay(totalExpenses) }}</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon balance-icon">
            <i class="bi bi-wallet2"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ t.netBalance }}</span>
            <span class="card-value" :class="netBalance >= 0 ? 'income' : 'expense'">
              {{ formatAmountDisplay(netBalance) }}
            </span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon count-icon">
            <i class="bi bi-receipt"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ t.transactionsCount }}</span>
            <span class="card-value">{{ filteredTransactions.length }}</span>
          </div>
        </div>
      </div>

      <!-- Category Breakdown Row with View All -->
      <div class="category-breakdown">
        <div class="section-header">
          <div class="section-title">
            <i class="bi bi-pie-chart-fill"></i>
            <span>{{ t.spendingByCategory }}</span>
          </div>
          <button v-if="categoryFilter" @click="clearCategoryFilter" class="clear-filter-btn">
            <i class="bi bi-x-circle-fill"></i> {{ t.viewAllCategories }}
          </button>
        </div>
        <div class="category-chips">
          <div 
            v-for="(amount, category) in categorySpending" 
            :key="category" 
            class="category-chip"
            :class="{ active: categoryFilter === category }"
            @click="categoryFilter = category"
          >
            <i :class="getCategoryIcon(category)"></i>
            <span>{{ translateCategory(category) }}</span>
            <span class="chip-amount">{{ formatAmountDisplay(amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="filters-bar">
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="t.searchByDescription" 
            class="search-input"
            :class="{ 'dark-mode': isDarkMode }"
          />
        </div>
        
        <div class="filter-group">
          <select v-model="typeFilter" class="filter-select" :class="{ 'dark-mode': isDarkMode }">
            <option value="">{{ t.allTypes }}</option>
            <option value="income">{{ t.income }}</option>
            <option value="expense">{{ t.expense }}</option>
          </select>
          
          <select v-model="categoryFilter" class="filter-select" :class="{ 'dark-mode': isDarkMode }">
            <option value="">{{ t.allCategories }}</option>
            <option value="Food">{{ translateCategory('Food') }}</option>
            <option value="Transport">{{ translateCategory('Transport') }}</option>
            <option value="Entertainment">{{ translateCategory('Entertainment') }}</option>
            <option value="Bills">{{ translateCategory('Bills') }}</option>
            <option value="Housing">{{ translateCategory('Housing') }}</option>
            <option value="Utilities">{{ translateCategory('Utilities') }}</option>
            <option value="Shopping">{{ translateCategory('Shopping') }}</option>
            <option value="Income">{{ translateCategory('Income') }}</option>
          </select>
          
          <select v-model="sortBy" class="filter-select" :class="{ 'dark-mode': isDarkMode }">
            <option value="date_desc">{{ t.latestFirst }}</option>
            <option value="date_asc">{{ t.oldestFirst }}</option>
            <option value="amount_desc">{{ t.highestAmount }}</option>
            <option value="amount_asc">{{ t.lowestAmount }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t.loadingTransactions }}</p>
      </div>

      <!-- Enhanced Empty State -->
      <div v-else-if="filteredTransactions.length === 0" class="empty-state" :class="{ 'dark-mode': isDarkMode }">
        <div class="empty-icon-wrapper">
          <i class="bi bi-inbox"></i>
        </div>
        <h3>{{ t.noTransactionsFound }}</h3>
        
        <p v-if="categoryFilter || searchQuery || typeFilter">
          <i class="bi bi-funnel-fill"></i> {{ t.noResultsMatchFilters }}
        </p>
        <p v-else>
          <i class="bi bi-coin"></i> {{ t.startTracking }}
        </p>
        
        <div class="quick-tips">
          <div class="tip-item">
            <i class="bi bi-lightbulb-fill"></i>
            <span>{{ t.tipIncome }}</span>
          </div>
          <div class="tip-item">
            <i class="bi bi-cart-fill"></i>
            <span>{{ t.tipExpenses }}</span>
          </div>
          <div class="tip-item">
            <i class="bi bi-graph-up"></i>
            <span>{{ t.tipTrack }}</span>
          </div>
        </div>
        
        <div class="empty-actions">
          <button v-if="categoryFilter || searchQuery || typeFilter" @click="clearAllFilters" class="clear-filters-btn">
            <i class="bi bi-eraser-fill"></i> {{ t.clearAllFilters }}
          </button>
          <button @click="openAddModal" class="empty-add-btn">
            <i class="bi bi-plus-lg"></i> {{ t.addYourFirstTransaction }}
          </button>
        </div>
      </div>

      <!-- Transactions List -->
      <div v-else class="transactions-list">
        <!-- Income Section -->
        <div v-if="incomeTransactions.length > 0" class="transaction-section">
          <div class="section-divider">
            <i class="bi bi-arrow-down-circle-fill"></i>
            <span>{{ t.income }}</span>
          </div>
          <div 
            v-for="transaction in incomeTransactions" 
            :key="transaction.id" 
            class="transaction-card"
            :class="{ 'dark-mode': isDarkMode }"
          >
            <div class="transaction-icon income-bg">
              <i :class="getCategoryIcon(transaction.category)"></i>
            </div>
            <div class="transaction-details">
              <div class="transaction-header">
                <span class="transaction-desc">{{ transaction.description }}</span>
                <span class="transaction-date">
                  <i class="bi bi-calendar3"></i> {{ formatDate(transaction.date) }}
                </span>
              </div>
              <div class="transaction-meta">
                <span class="transaction-category">
                  <i :class="getCategoryIcon(transaction.category)"></i> {{ translateCategory(transaction.category) }}
                </span>
              </div>
            </div>
            <div class="transaction-amount income">
              {{ convertAndFormatAmount(transaction.amount, transaction.currency) }}
            </div>
            <div class="transaction-actions">
              <button @click="deleteTransaction(transaction.id)" class="delete-btn" :title="t.delete">
                <i class="bi bi-trash3-fill"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Expenses Section -->
        <div v-if="expenseTransactions.length > 0" class="transaction-section">
          <div class="section-divider">
            <i class="bi bi-arrow-up-circle-fill"></i>
            <span>{{ t.expense }}</span>
          </div>
          <div 
            v-for="transaction in expenseTransactions" 
            :key="transaction.id" 
            class="transaction-card"
            :class="{ 'dark-mode': isDarkMode }"
          >
            <div class="transaction-icon expense-bg">
              <i :class="getCategoryIcon(transaction.category)"></i>
            </div>
            <div class="transaction-details">
              <div class="transaction-header">
                <span class="transaction-desc">{{ transaction.description }}</span>
                <span class="transaction-date">
                  <i class="bi bi-calendar3"></i> {{ formatDate(transaction.date) }}
                </span>
              </div>
              <div class="transaction-meta">
                <span class="transaction-category">
                  <i :class="getCategoryIcon(transaction.category)"></i> {{ translateCategory(transaction.category) }}
                </span>
              </div>
            </div>
            <div class="transaction-amount expense">
              {{ convertAndFormatAmount(transaction.amount, transaction.currency) }}
            </div>
            <div class="transaction-actions">
              <button @click="deleteTransaction(transaction.id)" class="delete-btn" :title="t.delete">
                <i class="bi bi-trash3-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Transaction Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
        <div class="modal-header">
          <h3><i class="bi bi-plus-circle-fill"></i> {{ t.addTransaction }}</h3>
          <button @click="closeAddModal" class="modal-close-btn">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveTransaction" class="modal-form">
          <!-- Description Field -->
          <div class="form-group">
            <label><i class="bi bi-pencil-fill"></i> {{ t.descriptionLabel }}</label>
            <input 
              type="text" 
              v-model="modalForm.description" 
              :placeholder="t.descriptionPlaceholder" 
              required 
              class="form-input"
              :class="{ 'dark-mode': isDarkMode }"
            />
          </div>

          <!-- Amount Field -->
          <div class="form-group">
            <label><i class="bi bi-calculator-fill"></i> {{ t.amountLabel }} ({{ currencySymbol }})</label>
            <input 
              type="number" 
              v-model="modalForm.amount" 
              placeholder="0.00" 
              required 
              class="form-input"
              :class="{ 'dark-mode': isDarkMode }"
              step="0.01"
            />
          </div>
          
          <!-- Quick Amount Buttons -->
          <div class="quick-amounts">
            <button type="button" @click="setModalQuickAmount(-20)" class="quick-amount-btn">-{{ currencySymbol }}20</button>
            <button type="button" @click="setModalQuickAmount(-50)" class="quick-amount-btn">-{{ currencySymbol }}50</button>
            <button type="button" @click="setModalQuickAmount(-100)" class="quick-amount-btn">-{{ currencySymbol }}100</button>
            <button type="button" @click="setModalQuickAmount(500)" class="quick-amount-btn income-btn">+{{ currencySymbol }}500</button>
            <button type="button" @click="setModalQuickAmount(1000)" class="quick-amount-btn income-btn">+{{ currencySymbol }}1,000</button>
          </div>

          <!-- Category Select -->
          <div class="form-group">
            <label><i class="bi bi-tags-fill"></i> {{ t.categoryLabel }}</label>
            <div class="custom-select" :class="{ 'dark-mode': isDarkMode }">
              <div class="select-trigger" @click="toggleModalDropdown">
                <div class="selected-value">
                  <i v-if="selectedModalCategory.icon" :class="selectedModalCategory.icon"></i>
                  <span>{{ selectedModalCategory.label || t.selectCategory }}</span>
                </div>
                <i class="bi bi-chevron-down dropdown-icon"></i>
              </div>
              <div v-if="isModalDropdownOpen" class="select-dropdown" :class="{ 'dark-mode': isDarkMode }">
                <div 
                  v-for="cat in categories" 
                  :key="cat.value"
                  class="select-option"
                  :class="{ active: modalForm.category === cat.value }"
                  @click="selectModalCategory(cat)"
                >
                  <i :class="cat.icon"></i>
                  <span>{{ cat.label }}</span>
                  <i v-if="modalForm.category === cat.value" class="bi bi-check-lg check-icon"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Date Field -->
          <div class="form-group">
            <label><i class="bi bi-calendar3-fill"></i> {{ t.dateLabel }}</label>
            <input 
              type="date" 
              v-model="modalForm.date" 
              required 
              class="form-input"
              :class="{ 'dark-mode': isDarkMode }"
            />
          </div>

          <!-- Preview Section -->
          <div class="preview-section" v-if="modalForm.amount && modalForm.description">
            <div class="preview-header">
              <i class="bi bi-eye-fill"></i>
              <span>{{ t.preview }}</span>
            </div>
            <div class="preview-content">
              <div class="preview-item">
                <span>{{ t.descriptionLabel }}:</span>
                <strong>{{ modalForm.description }}</strong>
              </div>
              <div class="preview-item">
                <span>{{ t.amountLabel }} ({{ currencySymbol }}):</span>
                <strong :class="modalForm.amount < 0 ? 'preview-expense' : 'preview-income'">
                  {{ formatModalAmountDisplay(modalForm.amount) }}
                </strong>
              </div>
              <div class="preview-item">
                <span>{{ t.categoryLabel }}:</span>
                <strong>{{ selectedModalCategory.label || translateCategory(modalForm.category) }}</strong>
              </div>
              <div class="preview-item">
                <span>{{ t.dateLabel }}:</span>
                <strong>{{ modalForm.date }}</strong>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button type="submit" :disabled="modalSaving" class="submit-btn">
              <i class="bi bi-check-lg"></i> {{ modalSaving ? t.saving : t.saveTransaction }}
            </button>
            <button type="button" @click="closeAddModal" class="cancel-btn">
              <i class="bi bi-x-lg"></i> {{ t.cancel }}
            </button>
          </div>

          <!-- Messages -->
          <div v-if="modalError" class="error-message">
            <i class="bi bi-exclamation-triangle-fill"></i> {{ modalError }}
          </div>
          <div v-if="modalSuccess" class="success-message">
            <i class="bi bi-check-circle-fill"></i> {{ modalSuccess }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import { useUserStore } from '../stores/userStore'
import { useCurrencyStore } from '../stores/currencyStore'
import { useLanguageStore } from '../stores/languageStore'

const router = useRouter()
const userStore = useUserStore()
const currencyStore = useCurrencyStore()
const languageStore = useLanguageStore()

// Get translations and helper
const t = languageStore.t
const translateCategory = languageStore.translateCategory

// Currency store reactive properties
const selectedCurrency = computed(() => currencyStore.selectedCurrency)
const currencySymbol = computed(() => currencyStore.currencySymbol)
const exchangeRates = computed(() => currencyStore.exchangeRates)

// Handle currency change
function handleCurrencyChange(event) {
  currencyStore.setCurrency(event.target.value)
}

// Modal state
const showAddModal = ref(false)
const modalSaving = ref(false)
const modalError = ref('')
const modalSuccess = ref('')
const isModalDropdownOpen = ref(false)

const modalForm = ref({
  description: '',
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0]
})

// Format modal amount display
function formatModalAmountDisplay(amount) {
  if (!amount && amount !== 0) return `${currencySymbol.value}0.00`
  const symbol = currencySymbol.value
  const absAmount = Math.abs(parseFloat(amount)).toFixed(2)
  const sign = parseFloat(amount) < 0 ? '-' : ''
  
  if (selectedCurrency.value === 'MYR') {
    return `${symbol} ${sign}${absAmount}`
  }
  return `${symbol}${sign}${absAmount}`
}

// Convert amount from its original currency to selected currency
function convertAmount(amount, fromCurrency) {
  if (!fromCurrency || fromCurrency === selectedCurrency.value) {
    return amount
  }
  
  const rates = exchangeRates.value
  const toCurrency = selectedCurrency.value
  
  let amountInUSD = amount
  if (fromCurrency !== 'USD') {
    const fromRate = rates[fromCurrency]
    if (fromRate) {
      amountInUSD = amount / fromRate
    }
  }
  
  const toRate = rates[toCurrency]
  if (toRate) {
    return amountInUSD * toRate
  }
  
  return amount
}

// Format converted amount for display
function convertAndFormatAmount(amount, transactionCurrency) {
  if (amount === undefined || amount === null) return `${currencySymbol.value}0.00`
  
  const convertedAmount = convertAmount(amount, transactionCurrency)
  const absAmount = Math.abs(convertedAmount).toFixed(2)
  const sign = convertedAmount < 0 ? '-' : ''
  const symbol = currencySymbol.value
  
  if (selectedCurrency.value === 'MYR') {
    return `${symbol} ${sign}${absAmount}`
  }
  return `${symbol}${sign}${absAmount}`
}

// Format amount display (for totals which are already in selected currency)
function formatAmountDisplay(amount) {
  if (amount === undefined || amount === null) return `${currencySymbol.value}0.00`
  
  const absAmount = Math.abs(amount).toFixed(2)
  const sign = amount < 0 ? '-' : ''
  const symbol = currencySymbol.value
  
  if (selectedCurrency.value === 'MYR') {
    return `${symbol} ${sign}${absAmount}`
  }
  return `${symbol}${sign}${absAmount}`
}

// State
const transactions = ref([])
const loading = ref(true)
const searchQuery = ref('')
const categoryFilter = ref('')
const typeFilter = ref('')
const sortBy = ref('date_desc')
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

const userName = computed(() => userStore.userName || 'User')
const userAvatar = computed(() => userStore.userAvatarUrl)  

// Separate income and expense transactions
const incomeTransactions = computed(() => {
  let filtered = [...transactions.value]
  
  if (searchQuery.value) {
    filtered = filtered.filter(t => 
      t.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (categoryFilter.value) {
    filtered = filtered.filter(t => t.category === categoryFilter.value)
  }
  
  filtered = filtered.filter(t => t.amount > 0)
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  return filtered
})

const expenseTransactions = computed(() => {
  let filtered = [...transactions.value]
  
  if (searchQuery.value) {
    filtered = filtered.filter(t => 
      t.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (categoryFilter.value) {
    filtered = filtered.filter(t => t.category === categoryFilter.value)
  }
  
  // Exclude subscription billings from regular transactions view
  filtered = filtered.filter(t => t.amount < 0 && !t.is_subscription_billing)
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  return filtered
})

// Computed totals
const totalIncome = computed(() => {
  let total = 0
  transactions.value.forEach(t => {
    if (t.amount > 0) {
      const converted = convertAmount(t.amount, t.currency)
      total += converted
    }
  })
  return total
})

const totalExpenses = computed(() => {
  let total = 0
  transactions.value.forEach(t => {
    if (t.amount < 0) {
      const converted = convertAmount(Math.abs(t.amount), t.currency)
      total += converted
    }
  })
  return total
})

const netBalance = computed(() => {
  return totalIncome.value - totalExpenses.value
})

// Category spending
const categorySpending = computed(() => {
  const expenseCategories = {}
  let totalIncomeAmount = 0
  
  transactions.value.forEach(t => {
    const convertedAmount = convertAmount(Math.abs(t.amount), t.currency)
    if (t.amount < 0) {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + convertedAmount
    } else if (t.amount > 0) {
      totalIncomeAmount += convertedAmount
    }
  })
  
  const sortedExpenses = Object.fromEntries(
    Object.entries(expenseCategories).sort((a, b) => b[1] - a[1])
  )
  
  const result = {}
  if (totalIncomeAmount > 0) {
    result['Income'] = totalIncomeAmount
  }
  Object.assign(result, sortedExpenses)
  
  return result
})

// Filtered transactions for count
const filteredTransactions = computed(() => {
  let filtered = [...transactions.value]
  
  if (searchQuery.value) {
    filtered = filtered.filter(t => 
      t.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (categoryFilter.value) {
    filtered = filtered.filter(t => t.category === categoryFilter.value)
  }
  
  if (typeFilter.value === 'income') {
    filtered = filtered.filter(t => t.amount > 0)
  } else if (typeFilter.value === 'expense') {
    filtered = filtered.filter(t => t.amount < 0)
  }
  
  return filtered
})

// Category options
const categories = [
  { value: 'Food', icon: 'bi bi-egg-fried', label: translateCategory('Food') },
  { value: 'Transport', icon: 'bi bi-fuel-pump', label: translateCategory('Transport') },
  { value: 'Entertainment', icon: 'bi bi-ticket-perforated', label: translateCategory('Entertainment') },
  { value: 'Bills', icon: 'bi bi-receipt', label: translateCategory('Bills') },
  { value: 'Housing', icon: 'bi bi-house-heart', label: translateCategory('Housing') },
  { value: 'Utilities', icon: 'bi bi-droplet', label: translateCategory('Utilities') },
  { value: 'Shopping', icon: 'bi bi-bag', label: translateCategory('Shopping') },
  { value: 'Healthcare', icon: 'bi bi-heart-pulse', label: translateCategory('Healthcare') },
  { value: 'Education', icon: 'bi bi-book', label: translateCategory('Education') },
  { value: 'Fitness', icon: 'bi bi-heart-pulse-fill', label: translateCategory('Fitness') },
  { value: 'Productivity', icon: 'bi bi-briefcase-fill', label: translateCategory('Productivity') },
  { value: 'Music', icon: 'bi bi-music-note-beamed', label: translateCategory('Music') },
  { value: 'Cloud Storage', icon: 'bi bi-cloud-upload-fill', label: translateCategory('Cloud Storage') },
  { value: 'Maintenance', icon: 'bi bi-tools', label: translateCategory('Maintenance') },
  { value: 'Rent', icon: 'bi bi-house-heart', label: translateCategory('Rent') },
  { value: 'Income', icon: 'bi bi-cash-stack', label: translateCategory('Income') },
  { value: 'Other', icon: 'bi bi-box-seam-fill', label: translateCategory('Other') }
]

// Selected category for modal display
const selectedModalCategory = computed(() => {
  return categories.find(c => c.value === modalForm.value.category) || { label: '', icon: '' }
})

// Modal functions
function openAddModal() {
  modalForm.value = {
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  }
  modalError.value = ''
  modalSuccess.value = ''
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
  isModalDropdownOpen.value = false
}

function toggleModalDropdown() {
  isModalDropdownOpen.value = !isModalDropdownOpen.value
}

function selectModalCategory(category) {
  modalForm.value.category = category.value
  isModalDropdownOpen.value = false
}

function setModalQuickAmount(amountInLocal) {
  modalForm.value.amount = amountInLocal.toString()
}

async function saveTransaction() {
  modalSaving.value = true
  modalError.value = ''
  modalSuccess.value = ''
  
  try {
    const amount = parseFloat(modalForm.value.amount)
    if (isNaN(amount)) {
      modalError.value = 'Please enter a valid amount'
      modalSaving.value = false
      return
    }
    
    if (!modalForm.value.category) {
      modalError.value = 'Please select a category'
      modalSaving.value = false
      return
    }
    
    const result = await userStore.addTransaction({
      description: modalForm.value.description,
      amount: amount,
      amount_currency: selectedCurrency.value,
      category: modalForm.value.category,
      date: modalForm.value.date
    })
    
    if (result) {
      modalSuccess.value = t.saveSuccess
      setTimeout(() => {
        closeAddModal()
        loadTransactions()
      }, 1000)
    } else {
      modalError.value = t.saveFailed
    }
    
  } catch (err) {
    console.error('Save error:', err)
    modalError.value = t.saveFailed + ': ' + err.message
  } finally {
    modalSaving.value = false
  }
}

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
    'Fitness': 'bi bi-heart-pulse-fill',
    'Productivity': 'bi bi-briefcase-fill',
    'Music': 'bi bi-music-note-beamed',
    'Cloud Storage': 'bi bi-cloud-upload-fill',
    'Maintenance': 'bi bi-tools',
    'Rent': 'bi bi-house-heart',
    'Income': 'bi bi-cash-stack',
    'Other': 'bi bi-box-seam-fill',
    'default': 'bi bi-tag-fill'
  }
  return icons[category] || icons.default
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function clearCategoryFilter() {
  categoryFilter.value = ''
}

function clearAllFilters() {
  searchQuery.value = ''
  categoryFilter.value = ''
  typeFilter.value = ''
  sortBy.value = 'date_desc'
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  document.body.classList.toggle('dark-mode', isDarkMode.value)
}

// Load transactions from Supabase
async function loadTransactions() {
  loading.value = true
  try {
    const userId = userStore.currentUser?.supabaseId || userStore.currentUser?.id
    if (!userId) {
      transactions.value = userStore.userTransactions
      loading.value = false
      return
    }
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) throw error
    transactions.value = data || []
  } catch (err) {
    console.error('Load error:', err)
    transactions.value = userStore.userTransactions
  } finally {
    loading.value = false
  }
}

// Delete transaction
async function deleteTransaction(id) {
  if (!confirm(t.deleteConfirm)) return
  try {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    await loadTransactions()
  } catch (err) {
    const index = userStore.userTransactions.findIndex(t => t.id === id)
    if (index !== -1) userStore.userTransactions.splice(index, 1)
    transactions.value = userStore.userTransactions
  }
}

function logout() {
  userStore.logout()
  router.push('/')
}

// Watch for currency changes
watch([selectedCurrency, exchangeRates], () => {
  loadTransactions()
})

// Close modal dropdown when clicking outside
function handleClickOutside(event) {
  const customSelect = document.querySelector('.custom-select')
  if (customSelect && !customSelect.contains(event.target)) {
    isModalDropdownOpen.value = false
  }
}

onMounted(() => {
  loadTransactions()
  currencyStore.loadCurrency()
  if (isDarkMode.value) document.body.classList.add('dark-mode')
  window.addEventListener('click', handleClickOutside)
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
  max-width: 550px;
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

/* Preview Section inside Modal */
.preview-section {
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
}

.dark-mode .preview-section {
  background: #334155;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .preview-header {
  color: #f1f5f9;
  border-bottom-color: #475569;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.preview-item span:first-child {
  color: #64748b;
}

.dark-mode .preview-item span:first-child {
  color: #94a3b8;
}

.preview-item strong {
  color: #1e293b;
}

.dark-mode .preview-item strong {
  color: #f1f5f9 !important;
}

.preview-expense {
  color: #ef4444;
}

.preview-income {
  color: #10b981;
}

/* Rest of your existing styles remain the same */
.transactions-container {
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

.currency-badge i {
  font-size: 16px;
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

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.dark-mode .summary-card {
  background: #1e293b;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.income-icon {
  background: #d1fae5;
  color: #10b981;
}

.expense-icon {
  background: #fee2e2;
  color: #ef4444;
}

.balance-icon {
  background: #e0e7ff;
  color: #8b5cf6;
}

.count-icon {
  background: #fef3c7;
  color: #f59e0b;
}

.dark-mode .income-icon {
  background: #064e3b;
}

.dark-mode .expense-icon {
  background: #7f1d1d;
}

.dark-mode .balance-icon {
  background: #312e81;
}

.dark-mode .count-icon {
  background: #78350f;
}

.card-info {
  flex: 1;
}

.card-label {
  font-size: 13px;
  color: #64748b;
  display: block;
  margin-bottom: 4px;
}

.dark-mode .card-label {
  color: #94a3b8;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .card-value {
  color: #f1f5f9;
}

.card-value.income {
  color: #10b981;
}

.card-value.expense {
  color: #ef4444;
}

.category-breakdown {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.dark-mode .category-breakdown {
  background: #1e293b;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.dark-mode .section-title {
  color: #94a3b8;
}

.clear-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f1f5f9;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  color: #8b5cf6;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filter-btn:hover {
  background: #e2e8f0;
}

.dark-mode .clear-filter-btn {
  background: #334155;
  color: #a78bfa;
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f1f5f9;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #475569;
}

.category-chip:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.category-chip.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
}

.dark-mode .category-chip {
  background: #334155;
  color: #94a3b8;
}

.chip-amount {
  font-weight: 600;
  margin-left: 4px;
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  position: relative;
  max-width: 320px;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 42px;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.search-input.dark-mode {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.filter-select.dark-mode {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

.loading-state {
  text-align: center;
  padding: 60px;
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
  padding: 48px 32px;
  background: white;
  border-radius: 24px;
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
  font-size: 22px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.empty-state.dark-mode p {
  color: #94a3b8;
}

.quick-tips {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 32px;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 16px;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
}

.empty-state.dark-mode .quick-tips {
  background: #334155;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
}

.empty-state.dark-mode .tip-item {
  color: #cbd5e1;
}

.tip-item i {
  font-size: 16px;
  color: #8b5cf6;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.clear-filters-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.empty-state.dark-mode .clear-filters-btn {
  background: #334155;
  color: #94a3b8;
}

.empty-state.dark-mode .clear-filters-btn:hover {
  background: #475569;
}

.empty-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 28px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  text-decoration: none;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.empty-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.transaction-section {
  margin-bottom: 24px;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  color: #475569;
}

.dark-mode .section-divider {
  border-bottom-color: #334155;
  color: #94a3b8;
}

.section-divider i {
  font-size: 18px;
}

.section-divider i.bi-arrow-down-circle-fill {
  color: #10b981;
}

.section-divider i.bi-arrow-up-circle-fill {
  color: #ef4444;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-card {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.transaction-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.transaction-card.dark-mode {
  background: #1e293b;
}

.transaction-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.transaction-icon.expense-bg {
  background: #fee2e2;
  color: #ef4444;
}

.transaction-icon.income-bg {
  background: #d1fae5;
  color: #10b981;
}

.dark-mode .transaction-icon.expense-bg {
  background: #7f1d1d;
}

.dark-mode .transaction-icon.income-bg {
  background: #064e3b;
}

.transaction-details {
  flex: 1;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.transaction-desc {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
}

.dark-mode .transaction-desc {
  color: #f1f5f9;
}

.transaction-date {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.transaction-category {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
}

.dark-mode .transaction-category {
  background: #334155;
  color: #cbd5e1;
}

.dark-mode .transaction-category i {
  color: #a78bfa;
}

.transaction-amount {
  font-size: 18px;
  font-weight: 700;
  min-width: 120px;
  text-align: right;
}

.transaction-amount.expense {
  color: #ef4444;
}

.transaction-amount.income {
  color: #10b981;
}

.delete-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.dark-mode .delete-btn:hover {
  background: #7f1d1d;
}

/* Form group styles for modal */
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

/* Quick Amount Buttons */
.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.quick-amount-btn {
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 13px;
  color: #64748b;
  transition: all 0.2s;
}

.quick-amount-btn:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.quick-amount-btn.income-btn {
  background: #d1fae5;
  color: #10b981;
}

.dark-mode .quick-amount-btn {
  background: #334155;
  color: #94a3b8;
}

.dark-mode .quick-amount-btn.income-btn {
  background: #064e3b;
  color: #34d399;
}

/* Custom Category Select */
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

.custom-select .select-dropdown {
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

.custom-select .select-dropdown.dark-mode {
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
  background: #e8f5e9;
}

.select-option i {
  font-size: 16px;
  color: #8b5cf6;
}

.check-icon {
  margin-left: auto;
  color: #10b981;
}

/* Dark mode select options */
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

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 16px;
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
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  font-size: 16px;
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

/* Messages */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 12px;
  font-size: 14px;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #d1fae5;
  color: #059669;
  border-radius: 12px;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 80px;
    padding: 20px 10px;
  }
  .logo-text, .nav-label, .nav-item span, .user-info-sidebar div:last-child, .theme-toggle span, .logout-sidebar-btn span {
    display: none;
  }
  .main-content {
    margin-left: 80px;
    padding: 16px;
  }
  .summary-cards {
    grid-template-columns: 1fr;
  }
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: 100%;
  }
  .filter-group {
    justify-content: space-between;
  }
  .transaction-card {
    flex-wrap: wrap;
  }
  .transaction-amount {
    margin-left: 64px;
    text-align: left;
  }
  .transaction-actions {
    margin-left: auto;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .quick-tips {
    flex-direction: column;
    align-items: flex-start;
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