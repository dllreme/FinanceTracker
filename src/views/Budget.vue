<template>
  <div class="budget-page" :class="{ 'dark-mode': isDarkMode }">
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
          <router-link to="/budget" class="nav-item active">
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
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1><i class="bi bi-wallet2"></i> {{ t.budgeting }}</h1>
          <p class="subtitle">{{ t.budgetingDescription || 'Set and manage your spending limits by category' }}</p>
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
          <button @click="openAddCategoryModal" class="add-btn">
            <i class="bi bi-plus-lg"></i> {{ t.addCategory || 'Add Category' }}
          </button>
        </div>
      </div>

      <!-- View Filter Tabs -->
      <div class="view-tabs">
        <button 
          @click="viewMode = 'all'" 
          class="view-tab" 
          :class="{ active: viewMode === 'all', 'dark-mode': isDarkMode }"
        >
          <i class="bi bi-bar-chart-steps"></i> {{ t.allSpending || 'All Spending' }}
        </button>
        <button 
          @click="viewMode = 'regular'" 
          class="view-tab" 
          :class="{ active: viewMode === 'regular', 'dark-mode': isDarkMode }"
        >
          <i class="bi bi-receipt"></i> {{ t.regularSpending || 'Regular Spending' }}
        </button>
        <button 
          @click="viewMode = 'subscriptions'" 
          class="view-tab" 
          :class="{ active: viewMode === 'subscriptions', 'dark-mode': isDarkMode }"
        >
          <i class="bi bi-arrow-repeat"></i> {{ t.subscriptions }}
        </button>
      </div>

      <!-- Budget Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon total-budget-icon">
            <i class="bi bi-calculator-fill"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ t.totalBudget || 'Total Budget' }}</span>
            <span class="card-value">{{ formatTotalBudget() }}</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon spent-icon">
            <i class="bi bi-arrow-up-circle-fill"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ getSpentLabel() }}</span>
            <span class="card-value expense">{{ formatBudgetAmount(currentTotalSpentUSD) }}</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon remaining-icon">
            <i class="bi bi-wallet2"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ getRemainingLabel() }}</span>
            <span class="card-value" :class="{ warning: currentTotalRemainingUSD < 0 }">{{ formatBudgetAmount(currentTotalRemainingUSD) }}</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon usage-icon">
            <i class="bi bi-pie-chart-fill"></i>
          </div>
          <div class="card-info">
            <span class="card-label">{{ t.budgetUsage || 'Budget Usage' }}</span>
            <span class="card-value">{{ currentBudgetUsage.toFixed(1) }}%</span>
          </div>
        </div>
      </div>

      <!-- Budget List -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t.loadingBudgetData || 'Loading budget data...' }}</p>
      </div>

      <div v-else-if="filteredBudgetCategories.length === 0" class="empty-state" :class="{ 'dark-mode': isDarkMode }">
        <div class="empty-icon-wrapper">
          <i class="bi bi-wallet2"></i>
        </div>
        <h3 v-if="viewMode === 'subscriptions'">{{ t.noSubscriptionsFound || 'No Subscriptions Found' }}</h3>
        <h3 v-else>{{ t.noBudgetCategoriesYet || 'No Budget Categories Yet' }}</h3>
        <p v-if="viewMode === 'subscriptions'">{{ t.noActiveSubscriptionsYet || 'You don\'t have any active subscriptions yet.' }}</p>
        <p v-else>{{ t.addFirstBudgetCategory || 'Add your first budget category to start tracking your spending limits' }}</p>
        <button v-if="viewMode !== 'subscriptions'" @click="openAddCategoryModal" class="empty-add-btn">
          <i class="bi bi-plus-lg"></i> {{ t.addCategory || 'Add Category' }}
        </button>
        <router-link v-else to="/subscriptions" class="empty-add-btn">
          <i class="bi bi-plus-lg"></i> {{ t.addSubscription || 'Add Subscription' }}
        </router-link>
      </div>

      <div v-else class="budget-list">
        <!-- For Subscriptions View -->
        <div v-if="viewMode === 'subscriptions'" class="subscriptions-grid">
          <div 
            v-for="subscription in filteredSubscriptions" 
            :key="subscription.id" 
            class="subscription-card"
            :class="{ 
              'dark-mode': isDarkMode, 
              'status-active': subscription.status === 'active',
              'status-paused': subscription.status === 'paused',
              'status-cancelled': subscription.status === 'cancelled'
            }"
          >
            <div class="card-image-section" :class="getBillingCycleClass(subscription.billing_cycle)">
              <div class="card-icon-wrapper">
                <i :class="getSubscriptionIcon(subscription.name)"></i>
              </div>
              <div class="card-badge" :class="subscription.status">
                {{ subscription.status }}
              </div>
            </div>
            
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
                  <span>{{ subscription.billing_cycle }}</span>
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

        <!-- For All and Regular Views -->
        <div v-else class="budget-categories-list">
          <div v-for="(budgetItem, category) in sortedBudgetCategories" :key="category" class="budget-card" :class="{ 
            'dark-mode': isDarkMode, 
            'has-subscription': hasSubscriptionInCategory(category)
          }">
            <div class="budget-header">
              <div class="budget-title">
                <i :class="getCategoryIcon(category)" class="category-icon"></i>
                <h3>{{ translateCategory(category) }}</h3>
                <span v-if="hasSubscriptionInCategory(category)" class="subscription-badge">
                  <i class="bi bi-arrow-repeat"></i> {{ t.hasSubscription || 'Has Subscription' }}
                </span>
              </div>
              <div class="budget-actions">
                <button @click="editBudget(category, budgetItem)" class="edit-budget-btn" :title="t.edit || 'Edit'">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button @click="confirmDeleteCategory(category)" class="delete-budget-btn" :title="t.delete || 'Delete'">
                  <i class="bi bi-trash3-fill"></i>
                </button>
              </div>
            </div>
            
            <div class="budget-numbers">
              <div class="budget-item">
                <span class="label">{{ t.budget || 'Budget' }}:</span>
                <span class="value">{{ getBudgetDisplayAmount(category) }}</span>
              </div>
              
              <div class="budget-item" v-if="viewMode === 'all'">
                <span class="label">{{ t.regularSpending || 'Regular Spending' }}:</span>
                <span class="value spent">{{ formatSpentAmount(category) }}</span>
              </div>
              <div class="budget-item" v-if="viewMode === 'all' && getSubscriptionSpendingUSD(category) > 0">
                <span class="label">{{ t.subscriptions }}:</span>
                <span class="value subscription-amount">{{ formatBudgetAmount(getSubscriptionSpendingUSD(category)) }}</span>
              </div>
              <div class="budget-item" v-if="viewMode === 'regular'">
                <span class="label">{{ t.spent || 'Spent' }}:</span>
                <span class="value spent">{{ formatSpentAmount(category) }}</span>
              </div>
              
              <div class="budget-item">
                <span class="label">{{ t.remaining || 'Remaining' }}:</span>
                <span class="value" :class="{ warning: (getBudgetAmountForCalculations(category) - getRegularSpendingUSD(category) - (viewMode === 'all' ? getSubscriptionSpendingUSD(category) : 0)) < 0 }">
                  {{ formatBudgetAmount(getBudgetAmountForCalculations(category) - getRegularSpendingUSD(category) - (viewMode === 'all' ? getSubscriptionSpendingUSD(category) : 0)) }}
                </span>
              </div>
            </div>
            
            <div class="progress-section">
              <div class="progress-bar">
                <div 
                  v-if="getBudgetAmountForCalculations(category) > 0"
                  class="progress regular-progress" 
                  :style="{ width: getRegularPercent(category) + '%' }"
                  :class="getProgressClass(getRegularPercent(category))"
                ></div>
              </div>
              <p class="progress-text">
                <span v-if="getBudgetAmountForCalculations(category) > 0">
                  {{ getRegularPercent(category) }}% {{ t.usedFromRegular || 'used from regular spending' }}
                </span>
                <span v-else>{{ t.noBudgetSet || 'No budget set' }}</span>
              </p>
            </div>
            
            <!-- Show regular spending transactions -->
            <div v-if="viewMode === 'regular' && getRegularTransactionsForCategory(category).length > 0" class="category-transactions-details" :class="{ 'dark-mode': isDarkMode }">
              <div class="transaction-subsection">
                <div class="sub-section-header">
                  <i class="bi bi-receipt"></i> {{ t.regularSpendingInCategory || 'Regular Spending in this category' }}:
                </div>
                <div class="sub-section-list">
                  <div v-for="transaction in getRegularTransactionsForCategory(category)" :key="transaction.id" class="transaction-item">
                    <div class="transaction-icon small-icon expense-icon-small">
                      <i :class="getCategoryIcon(transaction.category)"></i>
                    </div>
                    <div class="transaction-info">
                      <span class="transaction-name">{{ transaction.description }}</span>
                      <span class="transaction-date-small">{{ formatDate(transaction.date) }}</span>
                    </div>
                    <div class="transaction-amount-small expense">
                      {{ transaction.formatted_amount }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="viewMode === 'all' && (getSubscriptionsForCategory(category).length > 0 || getRegularTransactionsForCategory(category).length > 0)" class="category-transactions-details" :class="{ 'dark-mode': isDarkMode }">
              <!-- Subscriptions Section -->
              <div v-if="getSubscriptionsForCategory(category).length > 0" class="transaction-subsection">
                <div class="sub-section-header">
                  <i class="bi bi-arrow-repeat"></i> {{ t.subscriptionsInCategory || 'Subscriptions in this category' }}:
                </div>
                <div class="sub-section-list">
                  <div v-for="sub in getSubscriptionsForCategory(category)" :key="sub.id" class="transaction-item">
                    <div class="transaction-icon small-icon subscription-icon">
                      <i :class="getSubscriptionIcon(sub.name)"></i>
                    </div>
                    <div class="transaction-info">
                      <span class="transaction-name">{{ sub.name }}</span>
                      <span class="transaction-cycle">{{ sub.billing_cycle }}</span>
                    </div>
                    <div class="transaction-amount-small">
                      {{ formatSubscriptionAmount(sub) }}
                      <span class="transaction-period">/{{ getPeriodText(sub.billing_cycle) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Regular Spending Section -->
              <div v-if="getRegularTransactionsForCategory(category).length > 0" class="transaction-subsection">
                <div class="sub-section-header">
                  <i class="bi bi-receipt"></i> {{ t.regularSpendingInCategory || 'Regular Spending in this category' }}:
                </div>
                <div class="sub-section-list">
                  <div v-for="transaction in getRegularTransactionsForCategory(category)" :key="transaction.id" class="transaction-item">
                    <div class="transaction-icon small-icon expense-icon-small">
                      <i :class="getCategoryIcon(transaction.category)"></i>
                    </div>
                    <div class="transaction-info">
                      <span class="transaction-name">{{ transaction.description }}</span>
                      <span class="transaction-date-small">{{ formatDate(transaction.date) }}</span>
                    </div>
                    <div class="transaction-amount-small expense">
                      {{ transaction.formatted_amount }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Edit Budget Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
        <div class="modal-header">
          <h3><i class="bi bi-pencil-fill"></i> {{ t.editBudget || 'Edit Budget' }}: {{ editCategory }}</h3>
          <button @click="closeEditModal" class="modal-close-btn">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveBudgetEdit" class="modal-form">
          <div class="form-group">
            <label><i class="bi bi-calculator-fill"></i> {{ t.budgetLimit || 'Budget Limit' }} ({{ editCurrencySymbol }})</label>
            <input 
              v-model.number="editAmount" 
              type="number" 
              :placeholder="t.enterBudgetLimit || 'Enter budget limit'" 
              class="form-input" 
              :class="{ 'dark-mode': isDarkMode }" 
              step="0.01"
              @input="handleEditAmountInput"
            />
          </div>
          
          <div class="action-buttons">
            <button type="submit" class="submit-btn">
              <i class="bi bi-check-lg"></i> {{ t.save || 'Save' }}
            </button>
            <button type="button" @click="closeEditModal" class="cancel-btn">
              <i class="bi bi-x-lg"></i> {{ t.cancel || 'Cancel' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Add Category Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
        <div class="modal-header">
          <h3><i class="bi bi-plus-circle-fill"></i> {{ t.addNewBudgetCategory || 'Add New Budget Category' }}</h3>
          <button @click="closeAddModal" class="modal-close-btn">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveNewCategory" class="modal-form">
          <div class="form-group">
            <label><i class="bi bi-tag-fill"></i> {{ t.categoryName || 'Category Name' }}</label>
            <input v-model="newCategory.name" :placeholder="t.categoryPlaceholder || 'e.g., Shopping, Healthcare'" required class="form-input" :class="{ 'dark-mode': isDarkMode }" />
          </div>
          
          <div class="form-group">
            <label><i class="bi bi-calculator-fill"></i> {{ t.budgetLimit || 'Budget Limit' }} ({{ currencySymbol }})</label>
            <input 
              v-model.number="newCategory.limit" 
              type="number" 
              :placeholder="t.enterBudgetLimit || 'Enter budget limit'" 
              required 
              class="form-input" 
              :class="{ 'dark-mode': isDarkMode }" 
              step="0.01"
              @input="handleNewCategoryInput"
            />
          </div>
          
          <div v-if="errorMessage" class="error-message">
            <i class="bi bi-exclamation-triangle-fill"></i> {{ errorMessage }}
          </div>
          
          <div class="action-buttons">
            <button type="submit" class="submit-btn">
              <i class="bi bi-check-lg"></i> {{ t.addCategory || 'Add Category' }}
            </button>
            <button type="button" @click="closeAddModal" class="cancel-btn">
              <i class="bi bi-x-lg"></i> {{ t.cancel || 'Cancel' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-container" :class="{ 'dark-mode': isDarkMode }">
        <div class="modal-header">
          <h3><i class="bi bi-exclamation-triangle-fill"></i> {{ t.deleteCategory || 'Delete Category' }}</h3>
          <button @click="closeDeleteModal" class="modal-close-btn">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div class="modal-form">
          <p>{{ t.deleteCategoryConfirm || 'Are you sure you want to delete the budget category' }} <strong>"{{ categoryToDelete }}"</strong>?</p>
          <p class="warning-text">{{ t.deleteCategoryWarning || 'This will not delete your past transactions, only the budget limit for this category.' }}</p>
          
          <div class="action-buttons">
            <button @click="handleDeleteCategory" class="submit-btn delete-btn">
              <i class="bi bi-trash3-fill"></i> {{ t.delete || 'Delete' }}
            </button>
            <button @click="closeDeleteModal" class="cancel-btn">
              <i class="bi bi-x-lg"></i> {{ t.cancel || 'Cancel' }}
            </button>
          </div>
        </div>
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
import { useNotificationStore } from '../stores/notificationStore'

const router = useRouter()
const userStore = useUserStore()
const currencyStore = useCurrencyStore()
const languageStore = useLanguageStore()
const notificationStore = useNotificationStore()

const t = languageStore.t
const translateCategory = languageStore.translateCategory
const selectedCurrency = computed(() => currencyStore.selectedCurrency)
const currencySymbol = computed(() => currencyStore.currencySymbol)
const userName = computed(() => userStore.userName || 'User')
const userAvatar = computed(() => userStore.userAvatarUrl)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

const viewMode = ref('all')
const isInitialLoad = ref(true)

const showEditModal = ref(false)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const editCategory = ref('')
const editAmount = ref(0)
const editCurrencySymbol = ref('')
const categoryToDelete = ref('')
const newCategory = ref({ name: '', limit: 0 })
const errorMessage = ref('')
const loading = ref(false)

const previousSpentAmounts = ref({})

// Helper functions for dynamic labels
function getSpentLabel() {
  if (viewMode.value === 'subscriptions') {
    return t.subscriptionSpending || 'Subscription Spending'
  } else if (viewMode.value === 'regular') {
    return t.regularSpending || 'Regular Spending'
  }
  return t.totalSpent || 'Total Spent'
}

function getRemainingLabel() {
  if (viewMode.value === 'subscriptions') {
    return t.budgetLeft || 'Budget Left'
  }
  return t.remaining || 'Remaining'
}

function roundToTwoDecimals(value) {
  if (isNaN(value) || value === null || value === undefined) return 0
  return Math.round((value + Number.EPSILON) * 100) / 100
}

// Get budget amount for calculations (always returns USD)
function getBudgetAmountForCalculations(category) {
  const budgetItem = userStore.userBudget[category]
  if (!budgetItem) return 0
  
  if (budgetItem.originalCurrency === selectedCurrency.value && budgetItem.originalAmount) {
    return currencyStore.convertToUSD(budgetItem.originalAmount, budgetItem.originalCurrency)
  }
  
  const amount = budgetItem.amountUSD || budgetItem || 0
  return typeof amount === 'number' ? amount : 0
}

// Get the display amount for a budget category
function getBudgetDisplayAmount(category) {
  const budgetItem = userStore.userBudget[category]
  if (!budgetItem) return formatBudgetAmount(0)
  
  if (budgetItem.originalCurrency === selectedCurrency.value && budgetItem.originalAmount) {
    const roundedAmount = roundToTwoDecimals(budgetItem.originalAmount)
    const symbols = { USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱' }
    const symbol = symbols[selectedCurrency.value] || '$'
    return `${symbol} ${roundedAmount.toFixed(2)}`
  }
  
  const amountUSD = budgetItem.amountUSD || budgetItem || 0
  const numericAmount = typeof amountUSD === 'number' ? amountUSD : 0
  return formatBudgetAmount(numericAmount)
}

function formatTotalBudget() {
  let totalUSD = 0
  Object.values(userStore.userBudget).forEach(budgetItem => {
    const amount = budgetItem.amountUSD || budgetItem || 0
    totalUSD += typeof amount === 'number' ? amount : 0
  })
  return formatBudgetAmount(totalUSD)
}

function formatSpentAmount(category) {
  const spentUSD = getRegularSpendingUSD(category)
  const convertedAmount = currencyStore.convertFromUSD(spentUSD)
  const symbols = { USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱' }
  const symbol = symbols[selectedCurrency.value] || '$'
  return `${symbol} ${convertedAmount.toFixed(2)}`
}

function formatSubscriptionAmount(subscription) {
  if (subscription.original_currency === selectedCurrency.value && subscription.original_amount) {
    const roundedAmount = roundToTwoDecimals(subscription.original_amount)
    const symbols = { USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱' }
    const symbol = symbols[selectedCurrency.value] || '$'
    return `${symbol} ${roundedAmount.toFixed(2)}`
  }
  
  let amountUSD = Number(subscription.amount_usd || subscription.amount)
  if (isNaN(amountUSD)) amountUSD = 0
  const convertedAmount = currencyStore.convertFromUSD(amountUSD)
  const roundedAmount = roundToTwoDecimals(convertedAmount)
  const symbols = { USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱' }
  const symbol = symbols[selectedCurrency.value] || '$'
  return `${symbol} ${roundedAmount.toFixed(2)}`
}

function formatBudgetAmount(amountUSD) {
  const numericAmount = typeof amountUSD === 'number' && !isNaN(amountUSD) ? amountUSD : 0
  const convertedAmount = currencyStore.convertFromUSD(numericAmount)
  const roundedAmount = roundToTwoDecimals(convertedAmount)
  const symbols = { USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱' }
  const symbol = symbols[selectedCurrency.value] || '$'
  return `${symbol} ${roundedAmount.toFixed(2)}`
}

function getSubscriptionIcon(name) {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('netflix')) return 'bi bi-film'
  if (nameLower.includes('spotify')) return 'bi bi-music-note-beamed'
  if (nameLower.includes('youtube')) return 'bi bi-youtube'
  if (nameLower.includes('gym') || nameLower.includes('fitness')) return 'bi bi-heart-pulse'
  if (nameLower.includes('dropbox') || nameLower.includes('google') || nameLower.includes('drive')) return 'bi bi-cloud-upload'
  if (nameLower.includes('microsoft') || nameLower.includes('office')) return 'bi bi-windows'
  if (nameLower.includes('adobe')) return 'bi bi-brush'
  if (nameLower.includes('amazon') || nameLower.includes('prime')) return 'bi bi-amazon'
  if (nameLower.includes('disney')) return 'bi bi-tv'
  if (nameLower.includes('apple')) return 'bi bi-apple'
  return 'bi bi-arrow-repeat'
}

function getBillingCycleClass(cycle) {
  if (cycle === 'Monthly') return 'monthly-bg'
  if (cycle === 'Yearly') return 'yearly-bg'
  return 'quarterly-bg'
}

function getPeriodText(cycle) {
  if (cycle === 'Monthly') return 'month'
  if (cycle === 'Yearly') return 'year'
  return 'quarter'
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

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
    'Maintenance': 'bi bi-tools',
    'Income': 'bi bi-cash-stack',
    'Productivity': 'bi bi-briefcase-fill',
    'Cloud Storage': 'bi bi-cloud-upload-fill',
    'Music': 'bi bi-music-note-beamed',
    'Fitness': 'bi bi-heart-pulse-fill',
    'News': 'bi bi-newspaper',
    'Rent': 'bi bi-house-heart'
  }
  return icons[category] || 'bi bi-tag-fill'
}

const filteredBudgetCategories = computed(() => {
  if (viewMode.value === 'subscriptions') {
    return {}
  }
  return userStore.userBudget
})

const sortedBudgetCategories = computed(() => {
  const categories = Object.entries(filteredBudgetCategories.value)
  
  const withSubscriptions = []
  const withoutSubscriptions = []
  
  for (const [category, budgetItem] of categories) {
    if (hasSubscriptionInCategory(category)) {
      withSubscriptions.push([category, budgetItem])
    } else {
      withoutSubscriptions.push([category, budgetItem])
    }
  }
  
  withSubscriptions.sort((a, b) => a[0].localeCompare(b[0]))
  withoutSubscriptions.sort((a, b) => a[0].localeCompare(b[0]))
  
  return Object.fromEntries([...withSubscriptions, ...withoutSubscriptions])
})

const filteredSubscriptions = computed(() => {
  if (viewMode.value === 'subscriptions') {
    return userStore.userSubscriptions.filter(sub => sub.status === 'active')
  }
  return []
})

const subscriptionSpendingByCategoryUSD = computed(() => {
  const spending = {}
  userStore.userSubscriptions.forEach(sub => {
    if (sub.status === 'active') {
      let monthlyAmountUSD = 0
      
      if (sub.original_currency === selectedCurrency.value && sub.original_amount) {
        let monthlyAmountOriginal = sub.original_amount
        if (sub.billing_cycle === 'Yearly') {
          monthlyAmountOriginal = monthlyAmountOriginal / 12
        } else if (sub.billing_cycle === 'Quarterly') {
          monthlyAmountOriginal = monthlyAmountOriginal / 3
        }
        monthlyAmountUSD = currencyStore.convertToUSD(monthlyAmountOriginal, sub.original_currency)
      } else {
        monthlyAmountUSD = sub.amount_usd || sub.amount
        if (isNaN(monthlyAmountUSD)) monthlyAmountUSD = 0
        if (sub.billing_cycle === 'Yearly') {
          monthlyAmountUSD = monthlyAmountUSD / 12
        } else if (sub.billing_cycle === 'Quarterly') {
          monthlyAmountUSD = monthlyAmountUSD / 3
        }
      }
      
      const category = sub.category || 'Other'
      spending[category] = (spending[category] || 0) + monthlyAmountUSD
    }
  })
  return spending
})

const regularSpendingByCategoryUSD = computed(() => {
  const spending = {}
  
  userStore.userTransactions.forEach(t => {
    if (!t.is_subscription_billing) {
      let amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
      
      if (amount < 0) {
        const category = t.category || 'Other'
        const positiveAmount = Math.abs(amount)
        
        let amountUSD = positiveAmount
        if (t.currency && t.currency !== 'USD') {
          amountUSD = currencyStore.convertToUSD(positiveAmount, t.currency)
        }
        
        spending[category] = (spending[category] || 0) + amountUSD
      }
    }
  })
  
  return spending
})

function getRegularSpendingUSD(category) {
  return regularSpendingByCategoryUSD.value[category] || 0
}

function getSubscriptionSpendingUSD(category) {
  return subscriptionSpendingByCategoryUSD.value[category] || 0
}

function getRegularPercent(category) {
  const budgetUSD = getBudgetAmountForCalculations(category)
  const spentUSD = getRegularSpendingUSD(category)
  if (!budgetUSD || budgetUSD === 0) return 0
  const percent = (spentUSD / budgetUSD) * 100
  return Math.min(Math.round(percent), 100)
}

function getProgressClass(percent) {
  if (percent >= 90) return 'danger'
  if (percent >= 75) return 'warning'
  return 'normal'
}

function hasSubscriptionInCategory(category) {
  return (subscriptionSpendingByCategoryUSD.value[category] || 0) > 0
}

function getSubscriptionsForCategory(category) {
  return userStore.userSubscriptions.filter(sub => {
    if (sub.status !== 'active') return false
    const subCategory = sub.category || 'Other'
    return subCategory === category
  })
}

const totalBudgetUSD = computed(() => {
  let total = 0
  Object.values(userStore.userBudget).forEach(budgetItem => {
    const amount = budgetItem.amountUSD || budgetItem || 0
    total += typeof amount === 'number' ? amount : 0
  })
  return total
})

const currentTotalSpentUSD = computed(() => {
  if (viewMode.value === 'subscriptions') {
    let totalUSD = 0
    userStore.userSubscriptions.forEach(sub => {
      if (sub.status === 'active') {
        let amountUSD = sub.amount_usd || sub.amount
        if (isNaN(amountUSD)) amountUSD = 0
        if (sub.billing_cycle === 'Monthly') {
          totalUSD += amountUSD
        } else if (sub.billing_cycle === 'Yearly') {
          totalUSD += amountUSD / 12
        } else if (sub.billing_cycle === 'Quarterly') {
          totalUSD += amountUSD / 3
        }
      }
    })
    return totalUSD
  } else {
    let totalUSD = 0
    Object.keys(userStore.userBudget).forEach(category => {
      totalUSD += getRegularSpendingUSD(category)
    })
    return totalUSD
  }
})

const currentTotalRemainingUSD = computed(() => {
  return totalBudgetUSD.value - currentTotalSpentUSD.value
})

const currentBudgetUsage = computed(() => {
  if (totalBudgetUSD.value === 0) return 0
  const usage = (currentTotalSpentUSD.value / totalBudgetUSD.value) * 100
  return isNaN(usage) ? 0 : usage
})

function handleCurrencyChange(event) {
  currencyStore.setCurrency(event.target.value)
}

function handleEditAmountInput(event) {
  editAmount.value = roundToTwoDecimals(parseFloat(event.target.value) || 0)
}

function handleNewCategoryInput(event) {
  newCategory.value.limit = roundToTwoDecimals(parseFloat(event.target.value) || 0)
}

function editBudget(category, budgetItem) {
  editCategory.value = category
  
  let amountToEdit = 0
  
  if (budgetItem && budgetItem.originalAmount && budgetItem.originalCurrency === selectedCurrency.value) {
    amountToEdit = budgetItem.originalAmount
  } else if (budgetItem && budgetItem.amountUSD) {
    amountToEdit = currencyStore.convertFromUSD(budgetItem.amountUSD)
  } else if (typeof budgetItem === 'number') {
    amountToEdit = currencyStore.convertFromUSD(budgetItem)
  }
  
  editAmount.value = roundToTwoDecimals(amountToEdit)
  editCurrencySymbol.value = currencySymbol.value
  showEditModal.value = true
}

async function saveBudgetEdit() {
  const userId = userStore.currentUser?.supabaseId || userStore.currentUser?.id
  
  const roundedAmount = roundToTwoDecimals(editAmount.value)
  let amountInUSD = currencyStore.convertToUSD(roundedAmount, selectedCurrency.value)
  amountInUSD = roundToTwoDecimals(amountInUSD)
  
  try {
    const { error } = await supabase
      .from('budget')
      .update({ 
        amount: amountInUSD,
        original_amount: roundedAmount,
        original_currency: selectedCurrency.value
      })
      .eq('user_id', userId)
      .eq('category', editCategory.value)
    
    if (error) throw error
    
    userStore.userBudget[editCategory.value] = {
      amountUSD: amountInUSD,
      originalAmount: roundedAmount,
      originalCurrency: selectedCurrency.value
    }
    
    if (userStore.currentUser) {
      userStore.currentUser.budget[editCategory.value] = {
        amountUSD: amountInUSD,
        originalAmount: roundedAmount,
        originalCurrency: selectedCurrency.value
      }
    }
    
    notificationStore.addNotification({
      title: t.budgetUpdated || 'Budget Updated',
      message: `${editCategory.value}: ${getBudgetDisplayAmount(editCategory.value)}`,
      type: 'info'
    })
    
    await userStore.loadUserData(userId)
    closeEditModal()
  } catch (err) {
    console.error('Error updating budget:', err)
    alert('Failed to update budget: ' + err.message)
  }
}

function getRegularTransactionsForCategory(category) {
  return userStore.userTransactions
    .filter(t => {
      if (t.amount >= 0) return false
      if (t.is_subscription_billing) return false
      const matchesCategory = (t.category || 'Other') === category
      return matchesCategory
    })
    .map(t => {
      let amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
      const positiveAmount = Math.abs(amount)
      
      let displayAmount = positiveAmount
      if (t.currency && t.currency !== selectedCurrency.value) {
        const amountUSD = currencyStore.convertToUSD(positiveAmount, t.currency)
        displayAmount = currencyStore.convertFromUSD(amountUSD)
      }
      
      const symbols = { USD: '$', EUR: '€', GBP: '£', MYR: 'RM', PHP: '₱' }
      const symbol = symbols[selectedCurrency.value] || '$'
      
      return {
        ...t,
        display_amount: displayAmount,
        formatted_amount: `${symbol} ${displayAmount.toFixed(2)}`
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
}

function confirmDeleteCategory(category) {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

async function handleDeleteCategory() {
  const userId = userStore.currentUser?.supabaseId || userStore.currentUser?.id
  const catToDelete = categoryToDelete.value
  
  try {
    const { error } = await supabase
      .from('budget')
      .delete()
      .eq('user_id', userId)
      .eq('category', catToDelete)
    
    if (error) throw error
    
    delete userStore.userBudget[catToDelete]
    
    notificationStore.addNotification({
      title: t.budgetCategoryDeleted || 'Budget Category Deleted',
      message: `Removed budget for "${catToDelete}"`,
      type: 'info'
    })
    
    closeDeleteModal()
  } catch (err) {
    console.error('Error deleting category:', err)
    alert('Failed to delete category: ' + err.message)
  }
}

function openAddCategoryModal() {
  newCategory.value = { name: '', limit: 0 }
  errorMessage.value = ''
  showAddModal.value = true
}

async function saveNewCategory() {
  if (!newCategory.value.name || !newCategory.value.limit) {
    errorMessage.value = 'Please fill in all fields'
    return
  }
  
  const userId = userStore.currentUser?.supabaseId || userStore.currentUser?.id
  
  if (userStore.userBudget[newCategory.value.name]) {
    errorMessage.value = 'Category already exists!'
    return
  }
  
  const roundedLimit = roundToTwoDecimals(newCategory.value.limit)
  
  let limitInUSD = currencyStore.convertToUSD(roundedLimit, selectedCurrency.value)
  limitInUSD = roundToTwoDecimals(limitInUSD)
  
  try {
    const { error } = await supabase
      .from('budget')
      .insert([{
        user_id: userId,
        category: newCategory.value.name,
        amount: limitInUSD,
        original_amount: roundedLimit,
        original_currency: selectedCurrency.value
      }])
    
    if (error) throw error
    
    userStore.userBudget[newCategory.value.name] = {
      amountUSD: limitInUSD,
      originalAmount: roundedLimit,
      originalCurrency: selectedCurrency.value
    }
    
    notificationStore.addNotification({
      title: t.newBudgetCategory || 'New Budget Category',
      message: `Added "${newCategory.value.name}" with ${getBudgetDisplayAmount(newCategory.value.name)} limit`,
      type: 'success'
    })
    
    await userStore.loadUserData(userId)
    closeAddModal()
  } catch (err) {
    console.error('Error adding category:', err)
    errorMessage.value = 'Failed to add category: ' + err.message
  }
}

async function deleteSubscription(id) {
  if (!confirm('Are you sure you want to delete this subscription?')) return
  try {
    const userId = userStore.currentUser?.supabaseId || userStore.currentUser?.id
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    await userStore.loadSubscriptions()
    location.reload()
  } catch (err) {
    console.error('Delete error:', err)
    alert('Failed to delete subscription')
  }
}

function editSubscription(subscription) {
  router.push({ 
    path: '/subscriptions',
    query: { edit: subscription.id }
  })
}

function closeEditModal() {
  showEditModal.value = false
  editCategory.value = ''
  editAmount.value = 0
}

function closeAddModal() {
  showAddModal.value = false
  newCategory.value = { name: '', limit: 0 }
  errorMessage.value = ''
}

function closeDeleteModal() {
  showDeleteModal.value = false
  categoryToDelete.value = ''
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

watch(() => userStore.userTransactions.length, (newLength, oldLength) => {
  if (!isInitialLoad.value && oldLength !== undefined && newLength !== oldLength) {
    setTimeout(() => location.reload(), 100)
  }
})

watch(() => userStore.userSubscriptions.length, (newLength, oldLength) => {
  if (!isInitialLoad.value && oldLength !== undefined && newLength !== oldLength) {
    setTimeout(() => location.reload(), 100)
  }
})

watch(() => userStore.userBudget, (newBudget, oldBudget) => {
  if (!isInitialLoad.value && oldBudget && JSON.stringify(newBudget) !== JSON.stringify(oldBudget)) {
    if (Object.keys(oldBudget).length > 0) {
      setTimeout(() => location.reload(), 100)
    }
  }
}, { deep: true })

watch(selectedCurrency, () => {
  console.log('Currency changed to:', selectedCurrency.value)
})

onMounted(async () => {
  console.log('Budget page mounted')
  console.log('Budget data:', userStore.userBudget)
  
  Object.keys(userStore.userBudget).forEach(category => {
    const percent = getRegularPercent(category)
    previousSpentAmounts.value[category] = percent
  })
  
  currencyStore.loadCurrency()
  if (isDarkMode.value) document.body.classList.add('dark-mode')
  
  userStore.loadUserAvatar()
  
  setTimeout(() => {
    isInitialLoad.value = false
  }, 500)
})
</script>

<style scoped>
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

/* View Tabs */
.view-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.view-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  transition: all 0.2s;
}

.view-tab:hover {
  background: #f1f5f9;
}

.view-tab.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border-color: transparent;
}

.view-tab.dark-mode {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.view-tab.dark-mode.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
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

.total-budget-icon {
  background: #d1fae5;
  color: #10b981;
}

.spent-icon {
  background: #fee2e2;
  color: #ef4444;
}

.remaining-icon {
  background: #e0e7ff;
  color: #8b5cf6;
}

.usage-icon {
  background: #fef3c7;
  color: #f59e0b;
}

.dark-mode .total-budget-icon {
  background: #064e3b;
}

.dark-mode .spent-icon {
  background: #7f1d1d;
}

.dark-mode .remaining-icon {
  background: #312e81;
}

.dark-mode .usage-icon {
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

.card-value.expense {
  color: #ef4444;
}

.card-value.warning {
  color: #ef4444;
}

.dark-mode .card-value {
  color: #f1f5f9;
}

/* Budget Categories List */
.budget-categories-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.budget-card {
  background: white;
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.budget-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.budget-card.dark-mode {
  background: #1e293b;
}

.budget-card.has-subscription {
  border-left: 4px solid #8b5cf6;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.budget-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.category-icon {
  font-size: 24px;
  color: #8b5cf6;
}

.budget-title h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.dark-mode .budget-title h3 {
  color: #f1f5f9;
}

.subscription-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f3e8ff;
  color: #8b5cf6;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.dark-mode .subscription-badge {
  background: #2d1b4e;
  color: #a78bfa;
}

.budget-actions {
  display: flex;
  gap: 8px;
}

.edit-budget-btn, .delete-budget-btn {
  background: none;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #94a3b8;
}

.edit-budget-btn:hover {
  background: #e0e7ff;
  color: #8b5cf6;
}

.delete-budget-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.dark-mode .edit-budget-btn:hover {
  background: #312e81;
}

.dark-mode .delete-budget-btn:hover {
  background: #7f1d1d;
}

.budget-numbers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .budget-item {
  border-bottom-color: #334155;
}

.budget-item .label {
  font-size: 13px;
  color: #64748b;
}

.dark-mode .budget-item .label {
  color: #94a3b8;
}

.budget-item .value {
  font-weight: 600;
  color: #1e293b;
}

.dark-mode .budget-item .value {
  color: #f1f5f9;
}

.budget-item .value.spent {
  color: #ef4444;
}

.budget-item .value.subscription-amount {
  color: #8b5cf6;
}

.budget-item .value.warning {
  color: #ef4444;
}

.progress-section {
  margin-top: 16px;
}

.progress-bar {
  background: #e2e8f0;
  border-radius: 8px;
  height: 10px;
  overflow: hidden;
  position: relative;
}

.dark-mode .progress-bar {
  background: #334155;
}

.progress {
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s ease;
}

.regular-progress {
  background: #10b981;
}

.progress-text {
  font-size: 12px;
  color: #64748b;
  margin-top: 6px;
  text-align: right;
}

.dark-mode .progress-text {
  color: #94a3b8;
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

/* Category Transactions Details */
.category-transactions-details {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.dark-mode .category-transactions-details {
  border-top-color: #334155;
}

.transaction-subsection {
  margin-bottom: 16px;
}

.transaction-subsection:last-child {
  margin-bottom: 0;
}

.sub-section-header {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dark-mode .sub-section-header {
  color: #94a3b8;
}

.sub-section-header i {
  font-size: 12px;
  color: #8b5cf6;
}

.sub-section-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s;
}

.transaction-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.dark-mode .transaction-item {
  background: #334155;
}

.dark-mode .transaction-item:hover {
  background: #3f4a60;
}

.transaction-icon.small-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.transaction-icon.subscription-icon {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.transaction-icon.expense-icon-small {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.dark-mode .transaction-icon.subscription-icon {
  background: rgba(139, 92, 246, 0.25);
}

.dark-mode .transaction-icon.expense-icon-small {
  background: rgba(239, 68, 68, 0.2);
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.transaction-name {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.dark-mode .transaction-name {
  color: #f1f5f9;
}

.transaction-cycle, .transaction-date-small {
  font-size: 10px;
  color: #94a3b8;
}

.transaction-amount-small {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.transaction-amount-small.expense {
  color: #ef4444;
}

.dark-mode .transaction-amount-small {
  color: #f1f5f9;
}

.transaction-period {
  font-size: 10px;
  font-weight: normal;
  color: #94a3b8;
}

/* Subscription Card Styles */
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
}

.subscription-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.subscription-card.dark-mode {
  background: #1e293b;
}

.card-image-section {
  height: 140px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.subscription-name {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
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

.original-price {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
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
  max-width: 450px;
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
  display: block;
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
  margin-right: 6px;
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

.submit-btn:hover:not(:disabled) {
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

.delete-btn {
  background: #f1f5f9;
  color: #64748b;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.dark-mode .delete-btn {
  background: #334155;
  color: #94a3b8;
}

.dark-mode .delete-btn:hover {
  background: #7f1d1d;
  color: #f87171;
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

.warning-text {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 8px;
}

/* Main Layout */
.budget-page {
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

/* Responsive */
@media (max-width: 1024px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .subscriptions-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  .budget-numbers {
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
  .summary-cards {
    grid-template-columns: 1fr;
  }
  .subscriptions-grid {
    grid-template-columns: 1fr;
  }
  .view-tabs {
    justify-content: center;
  }
  .budget-header {
    flex-direction: column;
    align-items: flex-start;
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