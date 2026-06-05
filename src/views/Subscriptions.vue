<template>
  <div class="subscriptions-container" :class="{ 'dark-mode': isDarkMode }">
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
          <router-link to="/subscriptions" class="nav-item active">
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
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1><i class="bi bi-arrow-repeat"></i> {{ t.subscriptions }}</h1>
          <p class="subtitle">{{ t.trackManageSubscriptions || 'Track and manage your recurring subscriptions' }}</p>
        </div>
        <div class="header-actions">
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
            <i class="bi bi-plus-lg"></i> {{ t.addSubscription || 'Add Subscription' }}
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon monthly-icon">
            <i class="bi-calendar2"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ t.monthlySpending || 'Monthly Spending' }}</span>
            <span class="card-value">{{ formatMonthlyTotal() }}</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon yearly-icon">
            <i class="bi-calendar-range"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ t.yearlySpending || 'Yearly Spending' }}</span>
            <span class="card-value">{{ formatYearlyTotal() }}</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon active-icon">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ t.active || 'Active' }}</span>
            <span class="card-value">{{ activeSubscriptions.length }}</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon total-icon">
            <i class="bi bi-collection-fill"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ t.total || 'Total' }}</span>
            <span class="card-value">{{ subscriptions.length }}</span>
          </div>
        </div>
      </div>

      <!-- Status Filter Tabs -->
      <div class="status-tabs">
        <button 
          @click="statusFilter = 'all'" 
          class="status-tab" 
          :class="{ active: statusFilter === 'all', 'dark-mode': isDarkMode }"
        >
          {{ t.all || 'All' }} ({{ subscriptions.length }})
        </button>
        <button 
          @click="statusFilter = 'active'" 
          class="status-tab" 
          :class="{ active: statusFilter === 'active', 'dark-mode': isDarkMode }"
        >
          <i class="bi bi-check-circle-fill"></i> {{ t.active || 'Active' }} ({{ activeCount }})
        </button>
        <button 
          @click="statusFilter = 'paused'" 
          class="status-tab" 
          :class="{ active: statusFilter === 'paused', 'dark-mode': isDarkMode }"
        >
          <i class="bi bi-pause-circle-fill"></i> {{ t.paused || 'Paused' }} ({{ pausedCount }})
        </button>
        <button 
          @click="statusFilter = 'cancelled'" 
          class="status-tab" 
          :class="{ active: statusFilter === 'cancelled', 'dark-mode': isDarkMode }"
        >
          <i class="bi bi-x-circle-fill"></i> {{ t.cancelled || 'Cancelled' }} ({{ cancelledCount }})
        </button>
      </div>

      <!-- Subscriptions Grid -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t.loadingSubscriptions || 'Loading subscriptions...' }}</p>
      </div>

      <div v-else-if="filteredSubscriptions.length === 0" class="empty-state" :class="{ 'dark-mode': isDarkMode }">
        <div class="empty-icon-wrapper">
          <i class="bi bi-arrow-repeat"></i>
        </div>
        <h3>{{ t.noSubscriptionsFound || 'No Subscriptions Found' }}</h3>
        <p v-if="statusFilter !== 'all'">{{ t.noStatusSubscriptions || 'No' }} {{ statusFilter }} {{ t.subscriptionsFound || 'subscriptions found.' }}</p>
        <p v-else>{{ t.addFirstSubscription || 'Add your first subscription to track recurring payments' }}</p>
        <button @click="openAddModal" class="empty-add-btn">
          <i class="bi bi-plus-lg"></i> {{ t.addSubscription || 'Add Subscription' }}
        </button>
      </div>

      <div v-else class="subscriptions-grid">
        <div 
          v-for="subscription in filteredSubscriptions" 
          :key="subscription.id" 
          class="subscription-card"
          :class="{ 
            'dark-mode': isDarkMode, 
            'expiring-soon': isExpiringSoon(subscription.next_billing_date),
            'status-active': subscription.status === 'active',
            'status-paused': subscription.status === 'paused',
            'status-cancelled': subscription.status === 'cancelled'
          }"
        >
          <!-- Card Image/Icon Section -->
          <div class="card-image-section" :class="getBillingCycleClass(subscription.billing_cycle)">
            <div class="card-icon-wrapper">
              <i :class="getSubscriptionIcon(subscription.name)"></i>
            </div>
            <div class="card-badge" :class="subscription.status">
            {{ getStatusTranslation(subscription.status) }}
          </div>
          </div>
          
          <!-- Card Content -->
          <div class="card-content">
            <div class="card-header">
              <h3 class="subscription-name">{{ subscription.name }}</h3>
              <div class="category-tag">
                <i :class="getCategoryIcon(subscription.category)"></i>
                <span>{{ translateCategory(subscription.category) || 'Uncategorized' }}</span>
              </div>
            </div>
            
            <div class="subscription-info">
              <div class="info-row">
              <i class="bi bi-calendar3"></i>
              <span>{{ getBillingCycleTranslation(subscription.billing_cycle) }}</span>
            </div>
              <div class="info-row">
                <i class="bi bi-clock-history"></i>
                <span>{{ t.nextLabel || 'Next' }}: {{ formatDate(subscription.next_billing_date) }}</span>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="price-section">
                <span class="price-amount">{{ formatSubscriptionAmount(subscription) }}</span>
                <span class="price-period">/ {{ getPeriodText(subscription.billing_cycle) }}</span>
                <div v-if="subscription.original_currency && subscription.original_currency !== selectedCurrency" class="original-price">
                  <small>({{ subscription.original_currency }} {{ subscription.original_amount }}/{{ getPeriodText(subscription.billing_cycle) }})</small>
                </div>
              </div>
              <div class="action-buttons">
                <button @click="editSubscription(subscription)" class="action-btn edit-btn" :title="t.edit || 'Edit'">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button @click="deleteSubscription(subscription.id)" class="action-btn delete-btn" :title="t.delete || 'Delete'">
                  <i class="bi bi-trash3-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add/Edit Subscription Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container horizontal-modal" :class="{ 'dark-mode': isDarkMode }">
        <div class="modal-header">
          <h3><i class="bi bi-arrow-repeat"></i> {{ isEditing ? (t.editSubscription || 'Edit Subscription') : (t.addSubscription || 'Add Subscription') }}</h3>
          <button @click="closeModal" class="modal-close-btn">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveSubscription" class="modal-form horizontal-form">
          <div class="form-row">
            <div class="form-group">
              <label><i class="bi bi-tag-fill"></i> {{ t.name || 'Name' }}</label>
              <input type="text" v-model="form.name" :placeholder="t.namePlaceholder || 'e.g., Netflix, Spotify'" required class="form-input" :class="{ 'dark-mode': isDarkMode }" />
            </div>

            <div class="form-group">
              <label><i class="bi bi-calculator-fill"></i> {{ t.amount || 'Amount' }} ({{ getModalCurrency() }})</label>
              <input 
                type="number" 
                v-model.number="form.amount" 
                placeholder="0.00" 
                required 
                class="form-input" 
                :class="{ 'dark-mode': isDarkMode }" 
                step="0.01"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label><i class="bi bi-grid-fill"></i> {{ t.categoryLabel || 'Category' }}</label>
              <div class="custom-select" :class="{ 'dark-mode': isDarkMode }">
                <div class="select-trigger" @click="toggleCategoryDropdown">
                  <div class="selected-value">
                    <i :class="getCategoryIcon(form.category)"></i>
                    <span>{{ form.category || t.selectCategory || 'Select Category' }}</span>
                  </div>
                  <i class="bi bi-chevron-down dropdown-icon"></i>
                </div>
                <div v-if="isCategoryDropdownOpen" class="select-dropdown" :class="{ 'dark-mode': isDarkMode }">
                  <div v-for="cat in categories" :key="cat.value" class="select-option" :class="{ active: form.category === cat.value }" @click="selectCategory(cat)">
                    <i :class="cat.icon"></i>
                    <span>{{ cat.label }}</span>
                    <i v-if="form.category === cat.value" class="bi bi-check-lg check-icon"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label><i class="bi bi-calendar3"></i> {{ t.billingCycle || 'Billing Cycle' }}</label>
              <select v-model="form.billingCycle" class="form-input" :class="{ 'dark-mode': isDarkMode }">
                <option value="Monthly">{{ t.monthly || 'Monthly' }}</option>
                <option value="Yearly">{{ t.yearly || 'Yearly' }}</option>
                <option value="Quarterly">{{ t.quarterly || 'Quarterly' }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label><i class="bi bi-calendar-date"></i> {{ t.nextBillingDate || 'Next Billing Date' }}</label>
              <input type="date" v-model="form.nextBillingDate" required class="form-input" :class="{ 'dark-mode': isDarkMode }" />
            </div>

            <div class="form-group">
              <label><i class="bi bi-wallet2"></i> {{ t.budgetLimit || 'Budget Limit' }} ({{ currencySymbol }})</label>
              <input 
                type="number" 
                v-model.number="form.budgetLimit" 
                :placeholder="t.budgetLimitPlaceholder || 'Optional - Set budget limit'" 
                class="form-input" 
                :class="{ 'dark-mode': isDarkMode }" 
                step="0.01"
              />
              <small class="budget-hint">{{ t.budgetLimitHint || 'Set a budget limit for this category (optional)' }}</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label><i class="bi bi-toggle-on"></i> {{ t.status || 'Status' }}</label>
              <select v-model="form.status" class="form-input" :class="{ 'dark-mode': isDarkMode }">
                <option value="active">{{ t.active || 'Active' }}</option>
                <option value="paused">{{ t.paused || 'Paused' }}</option>
                <option value="cancelled">{{ t.cancelled || 'Cancelled' }}</option>
              </select>
            </div>

            <div class="form-group">
              <!-- Empty for spacing-->
            </div>
          </div>

          <div class="form-row full-width">
            <div v-if="isEditing && form.originalCurrency && form.originalCurrency !== selectedCurrency" class="currency-note">
              <i class="bi bi-info-circle-fill"></i> {{ t.originalCurrencyNote || 'Original currency' }}: {{ form.originalCurrency }} (≈ {{ getConvertedAmountHint() }} in {{ selectedCurrency }})
            </div>
            <div v-else-if="isEditing && !form.originalCurrency && selectedCurrency !== 'USD'" class="currency-note">
              <i class="bi bi-info-circle-fill"></i> {{ t.subscriptionCreatedInUSD || 'Subscription created in USD. Editing in' }} {{ selectedCurrency }}.
            </div>
          </div>

          <div v-if="modalError" class="error-message full-width">
            <i class="bi bi-exclamation-triangle-fill"></i> {{ modalError }}
          </div>

          <div class="action-buttons">
            <button type="submit" :disabled="saving" class="submit-btn">
              <i class="bi bi-check-lg"></i> {{ saving ? (t.saving || 'Saving...') : (isEditing ? (t.update || 'Update') : (t.save || 'Save')) }}
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
import { supabase } from '../lib/supabase.js'
import { useUserStore } from '../stores/userStore'
import { useCurrencyStore } from '../stores/currencyStore'
import { useLanguageStore } from '../stores/languageStore'

const router = useRouter()
const userStore = useUserStore()
const currencyStore = useCurrencyStore()
const languageStore = useLanguageStore()

const t = languageStore.t
const translateCategory = languageStore.translateCategory
const selectedCurrency = computed(() => currencyStore.selectedCurrency)
const currencySymbol = computed(() => currencyStore.currencySymbol)
const userName = computed(() => userStore.userName || 'User')
const userAvatar = computed(() => userStore.userAvatarUrl)

// Category options with translated labels
const categories = [
  { value: 'Entertainment', icon: 'bi bi-film', label: translateCategory('Entertainment') },
  { value: 'Music', icon: 'bi bi-music-note-beamed', label: translateCategory('Music') },
  { value: 'Productivity', icon: 'bi bi-briefcase-fill', label: translateCategory('Productivity') },
  { value: 'Cloud Storage', icon: 'bi bi-cloud-upload-fill', label: translateCategory('Cloud Storage') },
  { value: 'Fitness', icon: 'bi bi-heart-pulse-fill', label: translateCategory('Fitness') },
  { value: 'News', icon: 'bi bi-newspaper', label: translateCategory('News') },
  { value: 'Bills', icon: 'bi bi-receipt', label: translateCategory('Bills') },       
  { value: 'Shopping', icon: 'bi bi-bag', label: translateCategory('Shopping') },      
  { value: 'Healthcare', icon: 'bi bi-heart-pulse', label: translateCategory('Healthcare') },
  { value: 'Education', icon: 'bi bi-book', label: translateCategory('Education') },     
  { value: 'Food', icon: 'bi bi-egg-fried', label: translateCategory('Food') },          
  { value: 'Transport', icon: 'bi bi-fuel-pump', label: translateCategory('Transport') }, 
  { value: 'Utilities', icon: 'bi bi-droplet', label: translateCategory('Utilities') },  
  { value: 'Other', icon: 'bi bi-box-seam-fill', label: translateCategory('Other') }
]

// State
const subscriptions = ref([])
const loading = ref(true)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const statusFilter = ref('all')

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const saving = ref(false)
const modalError = ref('')
const isCategoryDropdownOpen = ref(false)

const form = ref({
  name: '',
  amount: '',
  category: 'Entertainment',
  billingCycle: 'Monthly',
  nextBillingDate: new Date().toISOString().split('T')[0],
  status: 'active',
  originalCurrency: null,
  originalAmount: null,
  budgetLimit: null
})

// Computed values
const activeSubscriptions = computed(() => {
  return subscriptions.value.filter(s => s.status === 'active')
})

const activeCount = computed(() => activeSubscriptions.value.length)
const pausedCount = computed(() => subscriptions.value.filter(s => s.status === 'paused').length)
const cancelledCount = computed(() => subscriptions.value.filter(s => s.status === 'cancelled').length)

const filteredSubscriptions = computed(() => {
  if (statusFilter.value === 'all') return subscriptions.value
  return subscriptions.value.filter(s => s.status === statusFilter.value)
})

// Calculate totals in USD
const totalMonthlySpendingUSD = computed(() => {
  let totalUSD = 0
  activeSubscriptions.value.forEach(s => {
    const amountUSD = Number(s.amount_usd || s.amount)
    if (s.billing_cycle === 'Monthly') {
      totalUSD += amountUSD
    } else if (s.billing_cycle === 'Yearly') {
      totalUSD += amountUSD / 12
    } else if (s.billing_cycle === 'Quarterly') {
      totalUSD += amountUSD / 3
    }
  })
  return totalUSD
})

const totalYearlySpendingUSD = computed(() => {
  let totalUSD = 0
  activeSubscriptions.value.forEach(s => {
    const amountUSD = Number(s.amount_usd || s.amount)
    if (s.billing_cycle === 'Monthly') {
      totalUSD += amountUSD * 12
    } else if (s.billing_cycle === 'Yearly') {
      totalUSD += amountUSD
    } else if (s.billing_cycle === 'Quarterly') {
      totalUSD += amountUSD * 4
    }
  })
  return totalUSD
})

function roundToTwoDecimals(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

// Format subscription amount based on billing cycle and selected currency
function formatSubscriptionAmount(subscription) {
  if (subscription.original_currency === selectedCurrency.value && subscription.original_amount) {
    const symbols = { USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱' }
    const symbol = symbols[selectedCurrency.value] || '$'
    const roundedAmount = roundToTwoDecimals(subscription.original_amount)
    return `${symbol} ${roundedAmount.toFixed(2)}`
  }
  
  const amountUSD = Number(subscription.amount_usd || subscription.amount)
  const convertedAmount = currencyStore.convertFromUSD(amountUSD)
  const roundedAmount = roundToTwoDecimals(convertedAmount)
  const symbols = { USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱' }
  const symbol = symbols[selectedCurrency.value] || '$'
  return `${symbol} ${roundedAmount.toFixed(2)}`
}

function formatMonthlyTotal() {
  const symbols = { USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱' }
  const symbol = symbols[selectedCurrency.value] || '$'
  const convertedTotal = currencyStore.convertFromUSD(totalMonthlySpendingUSD.value)
  const roundedTotal = roundToTwoDecimals(convertedTotal)
  return `${symbol} ${roundedTotal.toFixed(2)}`
}

function formatYearlyTotal() {
  const symbols = { USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱' }
  const symbol = symbols[selectedCurrency.value] || '$'
  const convertedTotal = currencyStore.convertFromUSD(totalYearlySpendingUSD.value)
  const roundedTotal = roundToTwoDecimals(convertedTotal)
  return `${symbol} ${roundedTotal.toFixed(2)}`
}

function getModalCurrency() {
  if (isEditing.value && form.value.originalCurrency) {
    return form.value.originalCurrency
  }
  return currencySymbol.value
}

function getConvertedAmountHint() {
  if (editingId.value && form.value.amount) {
    const amountUSD = currencyStore.convertToUSD(form.value.amount, form.value.originalCurrency || selectedCurrency.value)
    const converted = currencyStore.convertFromUSD(amountUSD)
    const roundedConverted = roundToTwoDecimals(converted)
    const symbols = { USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱' }
    const symbol = symbols[selectedCurrency.value] || '$'
    return `${symbol} ${roundedConverted.toFixed(2)}`
  }
  return ''
}

function getSubscriptionIcon(name) {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('netflix')) return 'bi bi-film'
  if (nameLower.includes('spotify')) return 'bi bi-music-note-beamed'
  if (nameLower.includes('youtube')) return 'bi bi-youtube'
  if (nameLower.includes('gym') || nameLower.includes('fitness')) return 'bi bi-heart-pulse'
  if (nameLower.includes('dropbox') || nameLower.includes('google') || nameLower.includes('drive') || nameLower.includes('icloud')) return 'bi bi-cloud-upload'
  if (nameLower.includes('microsoft') || nameLower.includes('office')) return 'bi bi-windows'
  if (nameLower.includes('adobe')) return 'bi bi-brush'
  if (nameLower.includes('amazon') || nameLower.includes('prime')) return 'bi bi-amazon'
  if (nameLower.includes('disney')) return 'bi bi-tv'
  if (nameLower.includes('hbo')) return 'bi bi-camera-reels'
  if (nameLower.includes('apple')) return 'bi bi-apple'
  return 'bi bi-arrow-repeat'
}

function getCategoryIcon(category) {
  const found = categories.find(c => c.value === category)
  return found ? found.icon : 'bi bi-tag-fill'
}

function getBillingCycleClass(cycle) {
  if (cycle === 'Monthly') return 'monthly-bg'
  if (cycle === 'Yearly') return 'yearly-bg'
  return 'quarterly-bg'
}

function getPeriodText(cycle) {
  if (cycle === 'Monthly') return t.monthlyPeriod || 'month'
  if (cycle === 'Yearly') return t.yearlyPeriod || 'year'
  return t.quarterlyPeriod || 'quarter'
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isExpiringSoon(dateString) {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  const daysDiff = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
  return daysDiff <= 7 && daysDiff > 0
}

function toggleCategoryDropdown() {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value
}

function selectCategory(category) {
  form.value.category = category.value
  isCategoryDropdownOpen.value = false
}

function handleClickOutside(event) {
  const customSelect = document.querySelector('.custom-select')
  if (customSelect && !customSelect.contains(event.target)) {
    isCategoryDropdownOpen.value = false
  }
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  document.body.classList.toggle('dark-mode', isDarkMode.value)
}

function handleCurrencyChange(event) {
  currencyStore.setCurrency(event.target.value)
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  form.value = {
    name: '',
    amount: '',
    category: 'Entertainment',
    billingCycle: 'Monthly',
    nextBillingDate: new Date().toISOString().split('T')[0],
    status: 'active',
    originalCurrency: null,
    originalAmount: null,
    budgetLimit: null
  }
  modalError.value = ''
  showModal.value = true
}

function editSubscription(subscription) {
  isEditing.value = true
  editingId.value = subscription.id
  
  let editAmount = subscription.original_amount || subscription.amount
  let editCurrency = subscription.original_currency || subscription.currency || 'USD'
  
  editAmount = roundToTwoDecimals(editAmount)
  
  // Get existing budget for this category
  const existingBudget = userStore.userBudget[subscription.category]
  let budgetLimit = null
  if (existingBudget) {
    if (existingBudget.originalCurrency === selectedCurrency.value && existingBudget.originalAmount) {
      budgetLimit = existingBudget.originalAmount
    } else {
      budgetLimit = currencyStore.convertFromUSD(existingBudget.amountUSD || existingBudget)
    }
    budgetLimit = roundToTwoDecimals(budgetLimit)
  }
  
  form.value = {
    name: subscription.name,
    amount: editAmount,
    category: subscription.category || 'Entertainment',
    billingCycle: subscription.billing_cycle,
    nextBillingDate: subscription.next_billing_date,
    status: subscription.status,
    originalCurrency: editCurrency,
    originalAmount: subscription.original_amount || editAmount,
    budgetLimit: budgetLimit  
  }
  
  modalError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
  isCategoryDropdownOpen.value = false
}

async function loadSubscriptions() {
  loading.value = true
  try {
    const userId = userStore.currentUser?.supabaseId || userStore.currentUser?.id
    if (!userId) {
      subscriptions.value = []
      loading.value = false
      return
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('next_billing_date', { ascending: true })
    
    if (error) throw error
    
    if (data) {
      subscriptions.value = data.map(sub => ({
        ...sub,
        amount: Number(sub.amount),
        amount_usd: Number(sub.amount_usd || sub.amount),
        original_amount: Number(sub.original_amount || sub.amount)
      }))
    } else {
      subscriptions.value = []
    }
  } catch (err) {
    console.error('Load error:', err)
    subscriptions.value = []
  } finally {
    loading.value = false
  }
}

async function saveSubscription() {
  saving.value = true
  modalError.value = ''
  
  try {
    let amount = parseFloat(form.value.amount)
    if (isNaN(amount)) {
      modalError.value = 'Please enter a valid amount'
      saving.value = false
      return
    }
    
    amount = roundToTwoDecimals(amount)
    
    const userId = userStore.currentUser?.supabaseId || userStore.currentUser?.id
    if (!userId) {
      modalError.value = 'User not found'
      saving.value = false
      return
    }
    
    const editingCurrency = selectedCurrency.value
    
    let amountInUSD = amount
    if (editingCurrency !== 'USD') {
      amountInUSD = currencyStore.convertToUSD(amount, editingCurrency)
    }
    amountInUSD = roundToTwoDecimals(amountInUSD)
    
    let originalCurrency = editingCurrency
    let originalAmount = amount
    
    if (isEditing.value && editingId.value) {
      const existingSub = subscriptions.value.find(s => s.id === editingId.value)
      if (existingSub) {
        if (existingSub.original_currency) {
          originalCurrency = existingSub.original_currency
          originalAmount = existingSub.original_amount
        }
      }
    }
    
    const subscriptionData = {
      user_id: userId,
      name: form.value.name,
      amount: amount,
      amount_usd: amountInUSD,
      original_currency: originalCurrency,
      original_amount: originalAmount,
      category: form.value.category,
      billing_cycle: form.value.billingCycle,
      next_billing_date: form.value.nextBillingDate,
      status: form.value.status,
      currency: editingCurrency
    }
    
    // Handle Budget Limit
    if (form.value.budgetLimit && form.value.budgetLimit > 0) {
      const budgetAmount = roundToTwoDecimals(form.value.budgetLimit)
      const budgetInUSD = currencyStore.convertToUSD(budgetAmount, editingCurrency)
      const roundedBudgetUSD = roundToTwoDecimals(budgetInUSD)
      
      const existingBudget = userStore.userBudget[form.value.category]
      
      if (existingBudget) {
        const { error } = await supabase
          .from('budget')
          .update({ 
            amount: roundedBudgetUSD,
            original_amount: budgetAmount,
            original_currency: editingCurrency
          })
          .eq('user_id', userId)
          .eq('category', form.value.category)
        
        if (error) throw error
        
        userStore.userBudget[form.value.category] = {
          amountUSD: roundedBudgetUSD,
          originalAmount: budgetAmount,
          originalCurrency: editingCurrency
        }
      } else {
        const { error } = await supabase
          .from('budget')
          .insert([{
            user_id: userId,
            category: form.value.category,
            amount: roundedBudgetUSD,
            original_amount: budgetAmount,
            original_currency: editingCurrency
          }])
        
        if (error) throw error
        
        userStore.userBudget[form.value.category] = {
          amountUSD: roundedBudgetUSD,
          originalAmount: budgetAmount,
          originalCurrency: editingCurrency
        }
      }
    }
    
    if (isEditing.value && editingId.value) {
      const { error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', editingId.value)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
      if (error) throw error
    }
    
    closeModal()
    await loadSubscriptions()
    
  } catch (err) {
    console.error('Save error:', err)
    modalError.value = err.message
  } finally {
    saving.value = false
  }
}


function getStatusTranslation(status) {
  const statusMap = {
    'active': t.active || 'Active',
    'paused': t.paused || 'Paused',
    'cancelled': t.cancelled || 'Cancelled'
  }
  return statusMap[status] || status
}


function getBillingCycleTranslation(cycle) {
  const cycleMap = {
    'Monthly': t.monthly || 'Monthly',
    'Yearly': t.yearly || 'Yearly',
    'Quarterly': t.quarterly || 'Quarterly'
  }
  return cycleMap[cycle] || cycle
}

async function deleteSubscription(id) {
  if (!confirm(t.deleteConfirm || 'Are you sure you want to delete this subscription?')) return
  try {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
    if (error) throw error
    await loadSubscriptions()
  } catch (err) {
    console.error('Delete error:', err)
  }
}

function logout() {
  userStore.logout()
  router.push('/')
}

onMounted(async () => {
  await loadSubscriptions()
  currencyStore.loadCurrency()
  userStore.loadUserAvatar()
  if (isDarkMode.value) document.body.classList.add('dark-mode')
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

function getModalGradientClass() {
  if (isEditing.value) {
    return 'modal-edit-gradient'
  }
  return 'modal-add-gradient'
}
</script>

<style scoped>
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

.original-price {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
}

.currency-note {
  display: block;
  margin-top: 5px;
  font-size: 11px;
  color: #f59e0b;
}

/* Main layout */
.subscriptions-container {
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
  border: none;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.budget-hint {
  display: block;
  font-size: 10px;
  color: #94a3b8;
  margin-top: 4px;
}

.dark-mode .budget-hint {
  color: #64748b;
}

/* Horizontal Modal Styles */
.horizontal-modal {
  max-width: 700px !important;
  width: 90% !important;
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

.form-row.full-width {
  margin-bottom: 0;
}

.full-width {
  width: 100%;
}

.currency-note {
  background: rgba(139, 92, 246, 0.1);
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  color: #8b5cf6;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark-mode .currency-note {
  background: rgba(139, 92, 246, 0.2);
}

.error-message {
  margin-top: 0;
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 20px;
  }
  
  .horizontal-modal {
    max-width: 95% !important;
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.submit-btn {
  flex: 1;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.cancel-btn {
  flex: 1;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
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

.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-split-layout {
    flex-direction: column;
  }
  
  .modal-left {
    padding: 30px 20px;
  }
  
  .modal-left-title {
    font-size: 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .horizontal-modal {
    max-width: 95% !important;
  }
}

/* Summary Cards */
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

.monthly-icon {
  background: #d1fae5;
  color: #10b981;
}

.yearly-icon {
  background: #e0e7ff;
  color: #8b5cf6;
}

.active-icon {
  background: #d1fae5;
  color: #10b981;
}

.total-icon {
  background: #fef3c7;
  color: #f59e0b;
}

.dark-mode .monthly-icon {
  background: #064e3b;
}

.dark-mode .yearly-icon {
  background: #312e81;
}

.dark-mode .active-icon {
  background: #064e3b;
}

.dark-mode .total-icon {
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

/* Status Tabs */
.status-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.status-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  transition: all 0.2s;
}

.status-tab:hover {
  background: #f1f5f9;
}

.status-tab.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border-color: transparent;
}

.status-tab.dark-mode {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.status-tab.dark-mode.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
}

/* Modern Subscriptions Grid */
.subscriptions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.subscription-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.subscription-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.subscription-card.dark-mode {
  background: #1e293b;
}

/* Card Image Section */
.card-image-section {
  height: 140px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image-section.monthly-bg {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.card-image-section.yearly-bg {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
}

.card-image-section.quarterly-bg {
  background: linear-gradient(135deg, #c084fc 0%, #9333ea 100%);
}

.dark-mode .card-image-section.monthly-bg {
  background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
}

.dark-mode .card-image-section.yearly-bg {
  background: linear-gradient(135deg, #7e22ce 0%, #581c87 100%);
}

.dark-mode .card-image-section.quarterly-bg {
  background: linear-gradient(135deg, #9333ea 0%, #4c1d95 100%);
}

.card-icon-wrapper {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: white;
}

.card-badge.active {
  background: rgba(16, 185, 129, 0.9);
}

.card-badge.paused {
  background: rgba(245, 158, 11, 0.9);
}

.card-badge.cancelled {
  background: rgba(239, 68, 68, 0.9);
}

.card-content {
  padding: 20px;
}

.card-header {
  margin-bottom: 16px;
}

.subscription-name {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.dark-mode .subscription-name {
  color: #f1f5f9;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 12px;
  color: #64748b;
}

.dark-mode .category-tag {
  background: #334155;
  color: #94a3b8;
}

.category-tag i {
  font-size: 12px;
  color: #8b5cf6;
}

.subscription-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  color: #64748b;
}

.dark-mode .info-row {
  color: #94a3b8;
}

.info-row i {
  width: 20px;
  font-size: 14px;
  color: #8b5cf6;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.dark-mode .card-footer {
  border-top-color: #334155;
}

.price-section {
  flex: 1;
}

.price-amount {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  display: inline-block;
}

.dark-mode .price-amount {
  color: #f1f5f9;
}

.price-period {
  font-size: 13px;
  color: #64748b;
  margin-left: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.edit-btn {
  background: #f1f5f9;
  color: #64748b;
}

.edit-btn:hover {
  background: #e0e7ff;
  color: #8b5cf6;
  transform: scale(1.05);
}

.delete-btn {
  background: #f1f5f9;
  color: #64748b;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: scale(1.05);
}

.dark-mode .edit-btn,
.dark-mode .delete-btn {
  background: #334155;
  color: #94a3b8;
}

.dark-mode .edit-btn:hover {
  background: #312e81;
  color: #a78bfa;
}

.dark-mode .delete-btn:hover {
  background: #7f1d1d;
  color: #f87171;
}

/* Loading State */
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px;
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
}

.empty-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 28px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
}

.empty-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
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

/* Responsive */
@media (max-width: 1024px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .subscriptions-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
  .subscriptions-grid {
    grid-template-columns: 1fr;
  }
  .status-tabs {
    justify-content: center;
  }
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .currency-selector-wrapper {
    justify-content: center;
  }
  .modal-container {
    width: 95%;
    margin: 16px;
  }
}
</style>