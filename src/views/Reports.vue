<template>
  <div class="reports-page" :class="{ 'dark-mode': isDarkMode }">
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
          <router-link to="/reports" class="nav-item active">
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
          <h1><i class="bi bi-file-bar-graph-fill"></i> {{ t.reports }}</h1>
          <p class="subtitle">{{ t.advancedAnalytics }}</p>
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
          
          <button @click="exportReport" class="export-btn">
            <i class="bi bi-download"></i> {{ t.exportReport }}
          </button>
        </div>
      </header>

      <!-- Explanation Panel -->
      <div class="explanation-panel" :class="{ 'dark-mode': isDarkMode }">
        <div class="explanation-header" @click="showExplanation = !showExplanation">
          <i class="bi bi-info-circle-fill"></i>
          <span>{{ t.howToRead }}</span>
          <i :class="showExplanation ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
        </div>
        <div v-show="showExplanation" class="explanation-content">
          <div class="explanation-grid">
            <div class="explanation-item">
              
              <div>
                <strong>{{ t.budgetHealthTitle || 'Budget Health' }}</strong>
                <p>{{ t.budgetHealthDescription }}</p>
              </div>
            </div>
            <div class="explanation-item">
              
              <div>
                <strong>{{ t.subscriptionImpactTitle || 'Subscription Impact' }}</strong>
                <p>{{ t.subscriptionImpactDescription }}</p>
              </div>
            </div>
            <div class="explanation-item">
             
              <div>
                <strong>{{ t.savingsRateTitle || 'Savings Rate' }}</strong>
                <p>{{ t.savingsRateDescription }}</p>
              </div>
            </div>
            <div class="explanation-item">
              
              <div>
                <strong>{{ t.alertBannersTitle || 'Alert Banners' }}</strong>
                <p>{{ t.alertBannersDescription }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Spending Alerts Banner -->
      <div v-if="spendingAlerts.length > 0" class="alert-banner" :class="{ 'dark-mode': isDarkMode }">
        <div class="alert-icon">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>
        <div class="alert-content">
          <div class="alert-header">
            <div class="alert-title">
              <strong>{{ t.budgetAlerts }}</strong>
              <span class="alert-badge critical-count" v-if="spendingAlerts.filter(a => a.type === 'critical').length">
                {{ spendingAlerts.filter(a => a.type === 'critical').length }} {{ t.critical }}
              </span>
              <span class="alert-badge warning-count" v-if="spendingAlerts.filter(a => a.type === 'warning').length">
                {{ spendingAlerts.filter(a => a.type === 'warning').length }} {{ t.warning }}
              </span>
            </div>
            <span class="alert-count">{{ spendingAlerts.length }}</span>
          </div>
          <div class="alert-list">
            <div 
              v-for="alert in spendingAlerts" 
              :key="alert.category" 
              class="alert-item" 
              :class="alert.type"
            >
              <div class="alert-item-left">
                <i :class="getCategoryIcon(alert.category)"></i>
                <span class="alert-category">{{ translateCategory(alert.category) }}</span>
              </div>
              <div class="alert-item-right">
                <div class="alert-stats">
                  <span class="alert-percent" :class="alert.type">{{ alert.percentUsed }}%</span>
                  <div class="alert-mini-bar">
                    <div class="alert-mini-fill" :class="alert.type" :style="{ width: Math.min(alert.percentUsed, 100) + '%' }"></div>
                  </div>
                  <span class="alert-amount">{{ formatCurrency(alert.spent) }}</span>
                  <span class="alert-budget">/ {{ formatCurrency(alert.budget) }}</span>
                  <span v-if="alert.spent > alert.budget" class="alert-over">
                    +{{ formatCurrency(alert.spent - alert.budget) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Spending Alert -->
      <div v-if="dailyAlerts.length > 0" class="daily-alert-banner" :class="{ 'dark-mode': isDarkMode }">
        <i class="bi bi-calendar-day"></i>
        <div class="alert-content">
          <strong>{{ t.todaysSpendingAlerts }}:</strong>
          <div class="alert-list">
            <span v-for="alert in dailyAlerts" :key="alert.category" class="alert-item">
              {{ translateCategory(alert.category) }}: {{ t.spent }} {{ formatCurrency(alert.spentToday) }} 
              ({{ t.dailyLimit }}: {{ formatCurrency(alert.dailyLimit) }})
            </span>
          </div>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="filter-section">
        <div class="filter-header">
          <label><i class="bi bi-calendar-range"></i> {{ t.timePeriod }}</label>
          <span class="filter-tooltip" :title="t.selectTimeRange">ⓘ</span>
        </div>
        <div class="date-range-selector">
          <button 
            v-for="period in periods" 
            :key="period.value"
            @click="selectedPeriod = period.value"
            class="period-btn"
            :class="{ active: selectedPeriod === period.value, 'dark-mode': isDarkMode }"
          >
            <i :class="period.icon"></i>
            {{ period.label }}
          </button>
        </div>
      </div>

      <!-- Budget Health Summary Card -->
      <div class="budget-summary" :class="{ 'dark-mode': isDarkMode, 'over-budget': isOverBudget }">
        <div class="summary-header">
          <h3><i class="bi bi-pie-chart-fill"></i> {{ t.budgetOverview }}</h3>
          <p class="summary-description">{{ t.yourTotalBudgetVsActual }} {{ getPeriodLabel() }}</p>
        </div>
        <div class="summary-content">
          <div class="summary-stat">
            <span class="stat-label">{{ t.totalBudget }}</span>
            <span class="stat-value">{{ formatCurrency(totalBudgetAmount) }}</span>
            <span class="stat-hint">{{ t.yourPlannedSpendingLimit }}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">{{ t.totalSpent }}</span>
            <span class="stat-value" :class="{ 'text-danger': isOverBudget }">{{ formatCurrency(totalSpentAmount) }}</span>
            <span class="stat-hint">{{ t.whatYouveActuallySpent }}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">{{ t.remaining }}</span>
            <span class="stat-value" :class="{ 'text-warning': remainingPercent < 20, 'text-danger': remainingPercent < 0 }">
              {{ formatCurrency(totalRemaining) }}
            </span>
            <span class="stat-hint">{{ t.leftInYourBudget }}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">{{ t.budgetUsed }}</span>
            <span class="stat-value" :class="{ 'text-danger': budgetHealthPercent > 90 }">
              {{ budgetHealthPercent }}%
            </span>
            <span class="stat-hint">{{ t.percentageOfBudgetUsed }}</span>
          </div>
        </div>
      </div>

      <!-- Gauge/Speed Meter Section -->
      <div class="gauges-section">
        <div class="gauge-card" :class="{ 'dark-mode': isDarkMode, 'warning': budgetHealthPercent > 90 }">
          <div class="gauge-header">
            <i class="bi bi-pie-chart-fill"></i>
            <div>
              <h3>{{ t.budgetHealth }}</h3>
              <p class="gauge-description">{{ t.howCloseYouAre }}</p>
            </div>
            <span v-if="budgetHealthPercent > 100" class="badge-danger">{{ t.overBudget }}</span>
            <span v-else-if="budgetHealthPercent > 90" class="badge-warning">{{ t.nearLimit }}</span>
          </div>
          <div class="gauge-stats-top">
            <div class="gauge-stat-top">
              <span class="stat-label">{{ t.remaining }}</span>
              <span class="stat-value">{{ formatCurrency(totalRemaining) }}</span>
            </div>
            <div class="gauge-stat-top">
              <span class="stat-label">{{ t.totalBudget }}</span>
              <span class="stat-value">{{ formatCurrency(totalBudgetAmount) }}</span>
            </div>
          </div>
          <div class="gauge-container">
            <canvas ref="budgetGaugeChart" width="200" height="120"></canvas>
            <div class="gauge-center">
              <span class="gauge-value" :class="{ 'text-danger': budgetHealthPercent > 100 }">{{ budgetHealthPercent }}%</span>
              <span class="gauge-label">{{ t.used }}</span>
            </div>
          </div>
          <div class="gauge-footer">
            <span class="gauge-status" :class="getBudgetHealthClass()">
              <i :class="getBudgetHealthIcon()"></i> {{ getBudgetHealthMessage() }}
            </span>
          </div>
        </div>

        <div class="gauge-card" :class="{ 'dark-mode': isDarkMode }">
          <div class="gauge-header">
            <i class="bi bi-arrow-repeat"></i>
            <div>
              <h3>{{ t.subscriptionImpact }}</h3>
              <p class="gauge-description">{{ t.subscriptionImpactDesc }}</p>
            </div>
          </div>
          <div class="gauge-stats-top">
            <div class="gauge-stat-top">
              <span class="stat-label">{{ t.monthlySubscriptions }}</span>
              <span class="stat-value">{{ formatCurrency(monthlySubscriptionsTotal) }}</span>
            </div>
            <div class="gauge-stat-top">
              <span class="stat-label">{{ t.totalExpenses }}</span>
              <span class="stat-value">{{ formatCurrency(totalExpensesAmount) }}</span>
            </div>
          </div>
          <div class="gauge-container">
            <canvas ref="subscriptionGaugeChart" width="200" height="120"></canvas>
            <div class="gauge-center">
              <span class="gauge-value">{{ subscriptionPercent }}%</span>
              <span class="gauge-label">{{ t.ofExpenses }}</span>
            </div>
          </div>
          <div class="gauge-footer">
            <span class="gauge-status" :class="getSubscriptionImpactClass()">
              <i :class="getSubscriptionImpactIcon()"></i> {{ getSubscriptionImpactMessage() }}
            </span>
          </div>
        </div>

        <div class="gauge-card" :class="{ 'dark-mode': isDarkMode }">
          <div class="gauge-header">
            <i class="bi bi-graph-up"></i>
            <div>
              <h3>{{ t.savingsRate }}</h3>
              <p class="gauge-description">{{ t.percentageOfIncomeSaving }}</p>
            </div>
          </div>
          <div class="gauge-stats-top">
            <div class="gauge-stat-top">
              <span class="stat-label">{{ t.saved }}</span>
              <span class="stat-value" :class="{ 'text-success': totalSavings > 0, 'text-danger': totalSavings < 0 }">
                {{ formatCurrency(totalSavings) }}
              </span>
            </div>
            <div class="gauge-stat-top">
              <span class="stat-label">{{ t.totalIncome }}</span>
              <span class="stat-value">{{ formatCurrency(totalIncomeAmount) }}</span>
            </div>
          </div>
          <div class="gauge-container">
            <canvas ref="savingsGaugeChart" width="200" height="120"></canvas>
            <div class="gauge-center">
              <span class="gauge-value" :class="getSavingsRateClass()">
                {{ savingsRate }}%
              </span>
              <span class="gauge-label">{{ t.savedLabel }}</span>
            </div>
          </div>
          <div class="gauge-footer">
            <span class="gauge-status" :class="getSavingsRateClass()">
              <i :class="getSavingsRateIcon()"></i> {{ getSavingsRateMessage() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Charts Row -->
      <div class="charts-row">
        <div class="chart-card" :class="{ 'dark-mode': isDarkMode }">
          <div class="chart-header">
            <div>
              <h3><i class="bi bi-pie-chart-fill"></i> {{ t.spendingByCategory }}</h3>
              <p class="chart-description">{{ t.whereYourMoneyGoes }}</p>
            </div>
            <button @click="showCategoryDetails = !showCategoryDetails" class="expand-btn">
              <i :class="showCategoryDetails ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              {{ showCategoryDetails ? t.hide : t.showDetails }}
            </button>
          </div>
          <div class="chart-wrapper" v-show="categoryChartReady">
            <canvas ref="categoryChartCanvas" width="400" height="300"></canvas>
          </div>
          <div class="chart-placeholder" v-show="!categoryChartReady">
            <i class="bi bi-pie-chart"></i>
            <span>{{ t.loadingChart }}</span>
          </div>
          <div v-show="showCategoryDetails" class="chart-details">
            <div class="details-grid">
              <div v-for="(amount, category) in categorySpending" :key="category" class="detail-row">
                <span><i :class="getCategoryIcon(category)"></i> {{ translateCategory(category) }}</span>
                <span>{{ formatCurrency(amount) }}</span>
                <span class="detail-percent">{{ getCategoryPercentage(amount, topCategoriesTotal) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card" :class="{ 'dark-mode': isDarkMode }">
          <div class="chart-header">
            <div>
              <h3><i class="bi bi-bar-chart-steps"></i> {{ t.monthlyTrend }}</h3>
              <p class="chart-description">{{ t.yourSpendingPatterns }}</p>
            </div>
            <div class="chart-controls">
              <div class="chart-type-buttons">
                <button @click="trendChartType = 'bar'" class="chart-type-btn" :class="{ active: trendChartType === 'bar' }" :title="t.barChart">
                  <i class="bi bi-bar-chart-steps"></i>
                </button>
                <button @click="trendChartType = 'line'" class="chart-type-btn" :class="{ active: trendChartType === 'line' }" :title="t.lineChart">
                  <i class="bi bi-graph-up"></i>
                </button>
                <button @click="trendChartType = 'area'" class="chart-type-btn" :class="{ active: trendChartType === 'area' }" :title="t.areaChart">
                  <i class="bi bi-grid-3x3-gap-fill"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="chart-wrapper" v-show="trendChartReady">
            <canvas ref="trendChartCanvas" width="400" height="300"></canvas>
          </div>
          <div class="chart-placeholder" v-show="!trendChartReady">
            <i class="bi bi-bar-chart-steps"></i>
            <span>{{ t.loadingChart }}</span>
          </div>
          <div class="chart-insight" v-if="getTrendInsight()">
            <i class="bi bi-lightbulb"></i>
            <span>{{ getTrendInsight() }}</span>
          </div>
        </div>
      </div>

      <!-- Subscription vs Regular Spending -->
      <div class="comparison-card" :class="{ 'dark-mode': isDarkMode }">
        <div class="card-header" @click="showComparison = !showComparison">
          <div>
            <h3><i class="bi bi-arrow-left-right"></i> {{ t.regularVsSubscription }}</h3>
            <p class="card-description">{{ t.seeSubscriptionImpact }}</p>
          </div>
          <i :class="showComparison ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
        </div>
        <div v-show="showComparison" class="comparison-bars">
          <div 
            v-for="category in spendingComparison" 
            :key="category.name" 
            class="comparison-item"
          >
            <div class="comparison-label">
              <i :class="getCategoryIcon(category.name)"></i>
              <span>{{ translateCategory(category.name) }}</span>
              <span v-if="category.percentUsed > 100" class="over-budget-icon" :title="t.overBudget">⚠️</span>
            </div>
            <div class="comparison-bar-container">
              <div class="comparison-bar">
                <div 
                  class="regular-bar" 
                  :style="{ width: Math.min(category.regularPercent, 100) + '%' }"
                  :title="'Regular: ' + formatCurrency(category.regular)"
                ></div>
                <div 
                  class="subscription-bar" 
                  :style="{ width: Math.min(category.subscriptionPercent, 100) + '%' }"
                  :title="'Subscription: ' + formatCurrency(category.subscription)"
                ></div>
              </div>
              <div class="comparison-totals">
                <span class="total-amount" :class="{ 'text-danger': category.total > category.budget && category.budget > 0 }">
                  {{ formatCurrency(category.total) }}
                </span>
                <span class="budget-info" v-if="category.budget">
                  / {{ formatCurrency(category.budget) }}
                </span>
                <span v-if="category.total > category.budget && category.budget > 0" class="over-budget-amount">
                  ({{ formatCurrency(category.total - category.budget) }} {{ t.over }})
                </span>
              </div>
            </div>
          </div>
          <div v-if="spendingComparison.length === 0" class="no-data-message">
            {{ t.noSpendingData }}
          </div>
        </div>
      </div>

      <!-- Top Categories List -->
      <div class="categories-card" :class="{ 'dark-mode': isDarkMode }">
        <div class="card-header" @click="showTopCategories = !showTopCategories">
          <div>
            <h3><i class="bi bi-trophy-fill"></i> {{ t.topSpendingCategories }}</h3>
            <p class="card-description">{{ t.yourBiggestExpenseCategories }}</p>
          </div>
          <i :class="showTopCategories ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
        </div>
        <div v-show="showTopCategories" class="category-items">
          <div v-for="(amount, category) in topCategories" :key="category" class="category-item">
            <div class="category-info">
              <i :class="getCategoryIcon(category)"></i>
              <span class="category-name">{{ translateCategory(category) }}</span>
            </div>
            <div class="category-bar">
              <div class="category-progress" :style="{ width: getCategoryPercentage(amount, topCategoriesTotal) + '%' }"></div>
            </div>
            <div class="category-amount">{{ formatCurrency(amount) }}</div>
            <div class="category-percent">{{ getCategoryPercentage(amount, topCategoriesTotal) }}%</div>
          </div>
          <div v-if="Object.keys(topCategories).length === 0" class="no-data-message">
            {{ t.noSpendingData }}
          </div>
        </div>
      </div>

      <!-- Actionable Tips Section -->
      <div class="tips-card" :class="{ 'dark-mode': isDarkMode }">
        <div class="card-header">
          <h3><i class="bi bi-lightbulb-fill"></i> {{ t.actionableTips }}</h3>
          <p class="card-description">{{ t.simpleSuggestions }}</p>
        </div>
        <div class="tips-grid">
          <div class="tip-item" v-if="subscriptionPercent > 30">
            <i class="bi bi-arrow-repeat"></i>
            <div>
              <strong>{{ t.highSubscriptionSpending }}</strong>
              <p>{{ t.highSubscriptionMessage }} {{ subscriptionPercent }}% {{ t.ofExpensesOnSubscriptions }}</p>
            </div>
          </div>
          <div class="tip-item" v-if="savingsRate < 10 && savingsRate > 0">
            <i class="bi bi-piggy-bank"></i>
            <div>
              <strong>{{ t.lowSavingsRate }}</strong>
              <p>{{ t.lowSavingsMessage }}</p>
            </div>
          </div>
          <div class="tip-item" v-if="savingsRate <= 0">
            <i class="bi bi-exclamation-triangle"></i>
            <div>
              <strong>{{ t.negativeSavings }}</strong>
              <p>{{ t.negativeSavingsMessage }}</p>
            </div>
          </div>
          <div class="tip-item" v-if="budgetHealthPercent > 90">
            <i class="bi bi-pie-chart"></i>
            <div>
              <strong>{{ t.budgetAlmostExceeded }}</strong>
              <p>{{ t.budgetAlmostExceededMessage }} {{ budgetHealthPercent }}% {{ t.ofYourBudget }}</p>
            </div>
          </div>
          <div class="tip-item" v-if="savingsRate >= 20">
            <i class="bi bi-star-fill"></i>
            <div>
              <strong>{{ t.excellentSavingsRate }}</strong>
              <p>{{ t.excellentSavingsMessage }} {{ savingsRate }}% {{ t.ofYourIncome }}</p>
            </div>
          </div>
          <div class="tip-item" v-if="spendingComparison.length > 0 && spendingComparison[0]?.regular > spendingComparison[0]?.subscription * 2">
            <i class="bi bi-cart"></i>
            <div>
              <strong>{{ t.highOneTimeSpending }}</strong>
              <p>{{ t.highOneTimeMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useCurrencyStore } from '../stores/currencyStore'
import { useLanguageStore } from '../stores/languageStore'
import Chart from 'chart.js/auto'

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
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

// Handle currency change with proper refresh
function handleCurrencyChange(event) {
  const newCurrency = event.target.value
  if (newCurrency === selectedCurrency.value) return
  
  console.log('Changing currency from', selectedCurrency.value, 'to', newCurrency)
  currencyStore.setCurrency(newCurrency)
  
  clearCaches()
  cachedFilteredTransactions = null
  lastSelectedPeriod = null
  lastTransactionsHash = null
  
  const currentPeriod = selectedPeriod.value
  selectedPeriod.value = 'temp'
  setTimeout(() => {
    selectedPeriod.value = currentPeriod
  }, 50)
}

// Chart references
const categoryChartCanvas = ref(null)
const trendChartCanvas = ref(null)
const budgetGaugeChart = ref(null)
const subscriptionGaugeChart = ref(null)
const savingsGaugeChart = ref(null)

let categoryChart = null
let trendChart = null
let budgetGauge = null
let subscriptionGauge = null
let savingsGauge = null

// Chart ready states
const categoryChartReady = ref(false)
const trendChartReady = ref(false)

// State
const selectedPeriod = ref('6months')
const trendChartType = ref('bar')
let chartUpdateTimeout = null
let isMounted = false

// UI State for expandable sections
const showExplanation = ref(false)
const showCategoryDetails = ref(false)
const showComparison = ref(true)
const showTopCategories = ref(true)

const periods = [
  { value: 'month', label: 'This Month', icon: 'bi bi-calendar-check' },
  { value: '3months', label: '3 Months', icon: 'bi bi-calendar-range' },
  { value: '6months', label: '6 Months', icon: 'bi bi-calendar-week' },
  { value: 'year', label: 'This Year', icon: 'bi bi-calendar-year' },
  { value: 'all', label: 'All Time', icon: 'bi bi-infinity' }
]

function getBudgetAmount(budgetItem) {
  if (!budgetItem) return 0
  
  if (typeof budgetItem === 'object') {
    if (budgetItem.originalAmount !== undefined && budgetItem.originalCurrency === selectedCurrency.value) {
      return budgetItem.originalAmount
    }
    if (budgetItem.amountUSD !== undefined) {
      return currencyStore.convertFromUSD(budgetItem.amountUSD)
    }
    if (budgetItem.originalAmount !== undefined && budgetItem.originalCurrency) {
      const amountUSD = currencyStore.convertToUSD(budgetItem.originalAmount, budgetItem.originalCurrency)
      return currencyStore.convertFromUSD(amountUSD)
    }
    if (budgetItem.amount !== undefined) {
      return budgetItem.amount
    }
  }
  
  if (typeof budgetItem === 'number') {
    return budgetItem
  }
  
  return 0
}

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

// Subscription amount helper
const subscriptionCache = new Map()
function getSubscriptionMonthlyAmount(subscription) {
  const cacheKey = `${subscription.id}_${selectedCurrency.value}`
  if (subscriptionCache.has(cacheKey)) return subscriptionCache.get(cacheKey)
  
  let monthlyAmount = subscription.amount || 0
  if (typeof monthlyAmount === 'string') monthlyAmount = parseFloat(monthlyAmount)
  
  if (subscription.billing_cycle === 'Yearly') {
    monthlyAmount = monthlyAmount / 12
  } else if (subscription.billing_cycle === 'Quarterly') {
    monthlyAmount = monthlyAmount / 3
  }
  
  monthlyAmount = roundToTwoDecimals(monthlyAmount)
  
  subscriptionCache.set(cacheKey, monthlyAmount)
  return monthlyAmount
}

// Transaction amount helper
const transactionCache = new Map()
function getTransactionAmount(transaction) {
  const cacheKey = `${transaction.id}_${selectedCurrency.value}`
  if (transactionCache.has(cacheKey)) return transactionCache.get(cacheKey)
  
  let amount = Math.abs(transaction.amount)
  if (typeof amount === 'string') amount = parseFloat(amount)
  amount = roundToTwoDecimals(amount)
  
  if (transaction.currency && transaction.currency !== selectedCurrency.value) {
    const amountUSD = currencyStore.convertToUSD(amount, transaction.currency)
    amount = currencyStore.convertFromUSD(amountUSD)
    amount = roundToTwoDecimals(amount)
  }
  
  transactionCache.set(cacheKey, amount)
  return amount
}

// Filter transactions by date range
let cachedFilteredTransactions = null
let lastSelectedPeriod = null
let lastTransactionsHash = null

function getFilteredTransactions() {
  const now = new Date()
  let startDate = new Date()
  
  switch(selectedPeriod.value) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case '3months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      break
    case '6months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case 'all':
      startDate = new Date(2000, 0, 1)
      break
  }
  
  const hash = `${selectedPeriod.value}_${userStore.userTransactions.length}`
  if (cachedFilteredTransactions && lastSelectedPeriod === selectedPeriod.value && lastTransactionsHash === hash) {
    return cachedFilteredTransactions
  }
  
  cachedFilteredTransactions = userStore.userTransactions.filter(t => new Date(t.date) >= startDate)
  lastSelectedPeriod = selectedPeriod.value
  lastTransactionsHash = hash
  return cachedFilteredTransactions
}

// ========== COMPUTED PROPERTIES ==========

const totalIncomeAmount = computed(() => {
  let total = 0
  const transactions = getFilteredTransactions()
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i]
    if (t.amount > 0) {
      total += getTransactionAmount(t)
    }
  }
  return roundToTwoDecimals(total)
})

const totalExpensesAmount = computed(() => {
  let total = 0
  const transactions = getFilteredTransactions()
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i]
    if (t.amount < 0 && !t.is_subscription_billing) {
      total += getTransactionAmount(t)
    }
  }
  
  const subscriptions = userStore.userSubscriptions
  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i]
    if (sub.status === 'active') {
      total += getSubscriptionMonthlyAmount(sub)
    }
  }
  
  return roundToTwoDecimals(total)
})

const totalSavings = computed(() => roundToTwoDecimals(totalIncomeAmount.value - totalExpensesAmount.value))

const savingsRate = computed(() => {
  if (totalIncomeAmount.value === 0) return 0
  return Math.round((totalSavings.value / totalIncomeAmount.value) * 100)
})

const totalBudgetAmount = computed(() => {
  let total = 0
  const budgets = userStore.userBudget
  for (const key in budgets) {
    const amount = getBudgetAmount(budgets[key])
    total += roundToTwoDecimals(amount)
  }
  return roundToTwoDecimals(total)
})

const totalSpentAmount = computed(() => {
  let totalSpent = 0
  const transactions = getFilteredTransactions()
  
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i]
    if (t.amount < 0 && !t.is_subscription_billing) {
      totalSpent += getTransactionAmount(t)
    }
  }
  
  const subscriptions = userStore.userSubscriptions
  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i]
    if (sub.status === 'active') {
      totalSpent += getSubscriptionMonthlyAmount(sub)
    }
  }
  
  return roundToTwoDecimals(totalSpent)
})

const totalRemaining = computed(() => roundToTwoDecimals(Math.max(totalBudgetAmount.value - totalSpentAmount.value, 0)))

const budgetHealthPercent = computed(() => {
  if (totalBudgetAmount.value === 0) return 0
  const percent = (totalSpentAmount.value / totalBudgetAmount.value) * 100
  return Math.round(percent)
})

const isOverBudget = computed(() => totalSpentAmount.value > totalBudgetAmount.value)
const remainingPercent = computed(() => (totalRemaining.value / totalBudgetAmount.value) * 100)

// Spending Alerts
const spendingAlerts = computed(() => {
  const alerts = []
  const budgets = userStore.userBudget
  const transactions = getFilteredTransactions()
  const subscriptions = userStore.userSubscriptions
  
  for (const category in budgets) {
    const budget = getBudgetAmount(budgets[category])
    if (budget === 0) continue
    
    let regularSpent = 0
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i]
      if (t.amount < 0 && !t.is_subscription_billing && t.category === category) {
        regularSpent += getTransactionAmount(t)
      }
    }
    
    let subscriptionSpent = 0
    for (let i = 0; i < subscriptions.length; i++) {
      const sub = subscriptions[i]
      if (sub.status === 'active' && sub.category === category) {
        subscriptionSpent += getSubscriptionMonthlyAmount(sub)
      }
    }
    
    const totalSpent = roundToTwoDecimals(regularSpent + subscriptionSpent)
    const percentUsed = (totalSpent / budget) * 100
    
    if (percentUsed > 100) {
      alerts.push({
        category,
        budget: roundToTwoDecimals(budget),
        spent: totalSpent,
        percentUsed: Math.round(percentUsed),
        type: 'critical'
      })
    } else if (percentUsed > 80) {
      alerts.push({
        category,
        budget: roundToTwoDecimals(budget),
        spent: totalSpent,
        percentUsed: Math.round(percentUsed),
        type: 'warning'
      })
    }
  }
  
  return alerts.sort((a, b) => b.percentUsed - a.percentUsed)
})

// Daily spending alerts
const dailyAlerts = computed(() => {
  const alerts = []
  const today = new Date().toISOString().split('T')[0]
  const budgets = userStore.userBudget
  const transactions = userStore.userTransactions
  
  for (const category in budgets) {
    const budget = getBudgetAmount(budgets[category])
    if (budget === 0) continue
    
    const dailyLimit = roundToTwoDecimals(budget / 30)
    
    let spentToday = 0
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i]
      if (t.amount < 0 && t.category === category && t.date === today) {
        spentToday += getTransactionAmount(t)
      }
    }
    
    if (spentToday > dailyLimit) {
      alerts.push({
        category,
        spentToday: roundToTwoDecimals(spentToday),
        dailyLimit
      })
    }
  }
  
  return alerts
})

// Subscription totals
const monthlySubscriptionsTotal = computed(() => {
  let total = 0
  const subscriptions = userStore.userSubscriptions
  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i]
    if (sub.status === 'active') {
      total += getSubscriptionMonthlyAmount(sub)
    }
  }
  return roundToTwoDecimals(total)
})

const subscriptionPercent = computed(() => {
  if (totalExpensesAmount.value === 0) return 0
  const percent = (monthlySubscriptionsTotal.value / totalExpensesAmount.value) * 100
  return Math.min(Math.round(percent), 100)
})

// Category spending
const categorySpending = computed(() => {
  const categories = {}
  const transactions = getFilteredTransactions()
  const subscriptions = userStore.userSubscriptions
  
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i]
    if (t.amount < 0 && !t.is_subscription_billing && t.category) {
      const amount = getTransactionAmount(t)
      categories[t.category] = roundToTwoDecimals((categories[t.category] || 0) + amount)
    }
  }
  
  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i]
    if (sub.status === 'active' && sub.category) {
      const monthlyAmount = getSubscriptionMonthlyAmount(sub)
      categories[sub.category] = roundToTwoDecimals((categories[sub.category] || 0) + monthlyAmount)
    }
  }
  
  const result = {}
  for (const key in categories) {
    if (key && key !== 'null' && key !== 'undefined' && key !== '') {
      result[key] = categories[key]
    }
  }
  
  const sortedEntries = Object.entries(result).sort((a, b) => b[1] - a[1])
  return Object.fromEntries(sortedEntries)
})

const topCategoriesTotal = computed(() => {
  let sum = 0
  const values = Object.values(categorySpending.value)
  for (let i = 0; i < values.length; i++) {
    sum = roundToTwoDecimals(sum + values[i])
  }
  return sum
})

// Spending Comparison
const spendingComparison = computed(() => {
  const result = []
  const categories = categorySpending.value
  const transactions = getFilteredTransactions()
  const subscriptions = userStore.userSubscriptions
  const budgets = userStore.userBudget
  
  for (const name in categories) {
    const total = categories[name]
    let regularAmount = 0
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i]
      if (t.amount < 0 && !t.is_subscription_billing && t.category === name) {
        regularAmount += getTransactionAmount(t)
      }
    }
    
    let subscriptionAmount = 0
    for (let i = 0; i < subscriptions.length; i++) {
      const sub = subscriptions[i]
      if (sub.status === 'active' && sub.category === name) {
        subscriptionAmount += getSubscriptionMonthlyAmount(sub)
      }
    }
    
    const budget = getBudgetAmount(budgets[name])
    const percentUsed = budget > 0 ? (total / budget) * 100 : 0
    
    result.push({
      name,
      regular: roundToTwoDecimals(regularAmount),
      subscription: roundToTwoDecimals(subscriptionAmount),
      total: roundToTwoDecimals(total),
      budget: roundToTwoDecimals(budget),
      regularPercent: budget ? (regularAmount / budget) * 100 : 0,
      subscriptionPercent: budget ? (subscriptionAmount / budget) * 100 : 0,
      percentUsed: Math.round(percentUsed),
      isOverBudget: percentUsed > 100
    })
  }
  
  return result.sort((a, b) => b.total - a.total).slice(0, 10)
})

const topCategories = computed(() => {
  const spending = categorySpending.value
  const entries = Object.entries(spending)
  const sorted = entries.sort((a, b) => b[1] - a[1]).slice(0, 5)
  return Object.fromEntries(sorted)
})

// Monthly data for trend chart
const monthlyData = computed(() => {
  const months = {}
  const now = new Date()
  let monthsToShow = 6
  
  if (selectedPeriod.value === 'month') monthsToShow = 6
  if (selectedPeriod.value === '3months') monthsToShow = 3
  if (selectedPeriod.value === '6months') monthsToShow = 6
  if (selectedPeriod.value === 'year') monthsToShow = 12
  
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleString('default', { month: 'short' })
    months[monthName] = { regular: 0, subscription: 0 }
  }
  
  const transactions = getFilteredTransactions()
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i]
    if (t.amount < 0 && !t.is_subscription_billing) {
      const date = new Date(t.date)
      const monthName = date.toLocaleString('default', { month: 'short' })
      if (months[monthName]) {
        months[monthName].regular += getTransactionAmount(t)
      }
    }
  }
  
  const subscriptions = userStore.userSubscriptions
  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i]
    if (sub.status === 'active') {
      const monthlyAmount = getSubscriptionMonthlyAmount(sub)
      for (const month in months) {
        months[month].subscription += monthlyAmount
      }
    }
  }
  
  return {
    labels: Object.keys(months),
    regular: Object.values(months).map(m => roundToTwoDecimals(m.regular)),
    subscription: Object.values(months).map(m => roundToTwoDecimals(m.subscription))
  }
})

function getPeriodLabel() {
  const now = new Date()
  switch(selectedPeriod.value) {
    case 'month': return `this month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`
    case '3months': return `last 3 months`
    case '6months': return `last 6 months`
    case 'year': return `this year (${now.getFullYear()})`
    case 'all': return `all time`
    default: return `selected period`
  }
}

function getTrendInsight() {
  const data = monthlyData.value
  if (data.regular.length < 2) return null
  
  const lastMonth = data.regular[data.regular.length - 1]
  const previousMonth = data.regular[data.regular.length - 2]
  
  if (lastMonth > previousMonth) {
    return `Your spending increased by ${formatCurrency(lastMonth - previousMonth)} compared to last month`
  } else if (lastMonth < previousMonth) {
    return `Your spending decreased by ${formatCurrency(previousMonth - lastMonth)} compared to last month`
  }
  return null
}

function getBudgetHealthClass() {
  if (budgetHealthPercent.value >= 100) return 'status-critical'
  if (budgetHealthPercent.value >= 90) return 'status-warning'
  if (budgetHealthPercent.value >= 75) return 'status-caution'
  return 'status-good'
}

function getBudgetHealthIcon() {
  if (budgetHealthPercent.value >= 100) return 'bi bi-emoji-frown'
  if (budgetHealthPercent.value >= 90) return 'bi bi-emoji-neutral'
  if (budgetHealthPercent.value >= 75) return 'bi bi-emoji-smile'
  return 'bi bi-emoji-laughing'
}

function getBudgetHealthMessage() {
  if (budgetHealthPercent.value >= 100) return 'Over budget! Time to review spending'
  if (budgetHealthPercent.value >= 90) return 'Close to budget limit'
  if (budgetHealthPercent.value >= 75) return 'On track, but be careful'
  return 'Budget is healthy'
}

function getSubscriptionImpactClass() {
  if (subscriptionPercent.value > 40) return 'status-critical'
  if (subscriptionPercent.value > 25) return 'status-warning'
  return 'status-good'
}

function getSubscriptionImpactIcon() {
  if (subscriptionPercent.value > 40) return 'bi bi-exclamation-triangle'
  if (subscriptionPercent.value > 25) return 'bi bi-arrow-repeat'
  return 'bi bi-check-circle'
}

function getSubscriptionImpactMessage() {
  if (subscriptionPercent.value > 40) return 'High subscription spending'
  if (subscriptionPercent.value > 25) return 'Moderate subscription impact'
  return 'Healthy subscription ratio'
}

function getSavingsRateClass() {
  if (savingsRate.value <= 0) return 'text-danger'
  if (savingsRate.value < 10) return 'text-warning'
  if (savingsRate.value < 20) return 'text-info'
  return 'text-success'
}

function getSavingsRateIcon() {
  if (savingsRate.value <= 0) return 'bi bi-emoji-frown'
  if (savingsRate.value < 10) return 'bi bi-emoji-neutral'
  if (savingsRate.value < 20) return 'bi bi-emoji-smile'
  return 'bi bi-emoji-laughing'
}

function getSavingsRateMessage() {
  if (savingsRate.value <= 0) return 'Spending more than earning'
  if (savingsRate.value < 10) return 'Low savings rate'
  if (savingsRate.value < 20) return 'Good savings rate'
  return 'Excellent savings rate!'
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
    'Clothing': 'bi bi-shirt',
    'Gifts': 'bi bi-gift-fill',
    'Travel': 'bi bi-airplane',
    'Rent': 'bi bi-building',
    'Income': 'bi bi-cash-stack',
    'Other': 'bi bi-tag-fill',
    'Productivity': 'bi bi-briefcase-fill',
    'Cloud Storage': 'bi bi-cloud-upload-fill',
    'Music': 'bi bi-music-note-beamed',
    'Fitness': 'bi bi-heart-pulse-fill'
  }
  return icons[category] || 'bi bi-tag-fill'
}

function getCategoryPercentage(amount, total) {
  if (total === 0) return 0
  return Math.round((amount / total) * 100)
}

// Chart functions
function destroyAllCharts() {
  if (categoryChart) { categoryChart.destroy(); categoryChart = null }
  if (trendChart) { trendChart.destroy(); trendChart = null }
  if (budgetGauge) { budgetGauge.destroy(); budgetGauge = null }
  if (subscriptionGauge) { subscriptionGauge.destroy(); subscriptionGauge = null }
  if (savingsGauge) { savingsGauge.destroy(); savingsGauge = null }
}

function createGaugeChart(canvas, value, colors) {
  if (!canvas) return null
  const ctx = canvas.getContext('2d')
  const displayValue = Math.min(value, 100)
  
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [displayValue, 100 - displayValue],
        backgroundColor: [colors.main, colors.bg],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: '70%',
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { tooltip: { enabled: false }, legend: { display: false } }
    }
  })
}

async function updateCategoryChart() {
  if (!categoryChartCanvas.value) return
  
  const spending = categorySpending.value
  const entries = Object.entries(spending)
  
  if (entries.length === 0) {
    categoryChartReady.value = false
    return
  }
  
  entries.sort((a, b) => b[1] - a[1])
  
  const topN = 7
  const topEntries = entries.slice(0, topN)
  const otherEntries = entries.slice(topN)
  
  let labels = topEntries.map(e => e[0])
  let data = topEntries.map(e => e[1])
  
  if (otherEntries.length > 0) {
    const otherTotal = otherEntries.reduce((sum, e) => sum + e[1], 0)
    labels.push('Others')
    data.push(otherTotal)
  }
  
  if (categoryChart) {
    categoryChart.destroy()
    categoryChart = null
  }
  
  const isDark = isDarkMode.value
  const textColor = isDark ? '#94a3b8' : '#64748b'
  const colors = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16', '#a855f7', '#14b8a6', '#f97316', '#eab308']
  
  const ctx = categoryChartCanvas.value.getContext('2d')
  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: { 
      labels: labels,
      datasets: [{ 
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0,
        borderRadius: 8,
        cutout: '55%',
      }] 
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.4,
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10
        }
      },
      plugins: {
        legend: { 
          position: 'right', 
          labels: { 
            color: textColor, 
            font: { size: 10 },
            boxWidth: 10,
            padding: 6
          } 
        },
        tooltip: { 
          callbacks: { 
            label: (ctx) => {
              if (ctx.label === 'Others') {
                return `Others (${otherEntries.length} categories): ${formatCurrency(ctx.raw)}`
              }
              return `${ctx.label}: ${formatCurrency(ctx.raw)}`
            }
          } 
        }
      }
    }
  })
  
  categoryChartReady.value = true
}

async function updateTrendChart() {
  if (!trendChartCanvas.value) return
  
  const monthly = monthlyData.value
  if (monthly.labels.length === 0) {
    trendChartReady.value = false
    return
  }
  
  if (trendChart) {
    trendChart.destroy()
    trendChart = null
  }
  
  const isDark = isDarkMode.value
  const textColor = isDark ? '#94a3b8' : '#64748b'
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
  
  const chartData = {
    labels: monthly.labels,
    datasets: [
      { label: 'Regular Spending', data: monthly.regular, backgroundColor: '#10b981', borderColor: '#10b981', borderRadius: 8, barPercentage: 0.7, borderWidth: 2, fill: false, tension: 0.4, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: '#10b981' },
      { label: 'Subscriptions', data: monthly.subscription, backgroundColor: '#8b5cf6', borderColor: '#8b5cf6', borderRadius: 8, barPercentage: 0.7, borderWidth: 2, fill: false, tension: 0.4, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: '#8b5cf6' }
    ]
  }
  
  const isBar = trendChartType.value === 'bar'
  
  if (isBar) {
    trendChart = new Chart(trendChartCanvas.value, {
      type: 'bar', data: chartData,
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { position: 'top', labels: { color: textColor, usePointStyle: true, boxWidth: 10 } }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } } },
        scales: { y: { grid: { color: gridColor }, ticks: { color: textColor, callback: (v) => formatCurrency(v) } }, x: { grid: { display: false }, ticks: { color: textColor } } }
      }
    })
  } else {
    if (trendChartType.value === 'area') {
      chartData.datasets[0].fill = true
      chartData.datasets[0].backgroundColor = 'rgba(16, 185, 129, 0.1)'
      chartData.datasets[1].fill = true
      chartData.datasets[1].backgroundColor = 'rgba(139, 92, 246, 0.1)'
    }
    trendChart = new Chart(trendChartCanvas.value, {
      type: 'line', data: chartData,
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { position: 'top', labels: { color: textColor, usePointStyle: true, boxWidth: 10 } }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } } },
        scales: { y: { grid: { color: gridColor }, ticks: { color: textColor, callback: (v) => formatCurrency(v) } }, x: { grid: { display: false }, ticks: { color: textColor } } }
      }
    })
  }
  
  trendChartReady.value = true
}

function updateGaugeCharts() {
  const isDark = isDarkMode.value
  const bgColor = isDark ? '#334155' : '#e2e8f0'
  
  if (budgetGaugeChart.value) {
    if (budgetGauge) budgetGauge.destroy()
    budgetGauge = createGaugeChart(budgetGaugeChart.value, budgetHealthPercent.value, { main: '#f59e0b', bg: bgColor })
  }
  if (subscriptionGaugeChart.value) {
    if (subscriptionGauge) subscriptionGauge.destroy()
    subscriptionGauge = createGaugeChart(subscriptionGaugeChart.value, subscriptionPercent.value, { main: '#8b5cf6', bg: bgColor })
  }
  if (savingsGaugeChart.value) {
    if (savingsGauge) savingsGauge.destroy()
    savingsGauge = createGaugeChart(savingsGaugeChart.value, savingsRate.value, { main: '#10b981', bg: bgColor })
  }
}

function clearCaches() {
  subscriptionCache.clear()
  transactionCache.clear()
  cachedFilteredTransactions = null
  lastSelectedPeriod = null
  lastTransactionsHash = null
}

function debouncedUpdate() {
  if (!isMounted) return
  
  if (chartUpdateTimeout) {
    clearTimeout(chartUpdateTimeout)
  }
  
  chartUpdateTimeout = setTimeout(() => {
    if (isMounted) {
      requestAnimationFrame(() => {
        updateCategoryChart()
        updateTrendChart()
        updateGaugeCharts()
      })
    }
  }, 150)
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  document.body.classList.toggle('dark-mode', isDarkMode.value)
  debouncedUpdate()
}

function logout() {
  userStore.logout()
  router.push('/')
}

function exportReport() {
  const transactions = getFilteredTransactions()
  const categories = categorySpending.value
  const alerts = spendingAlerts.value
  
  if (transactions.length === 0 && Object.keys(categories).length === 0) {
    alert('No data available to export')
    return
  }
  
  const reportData = []
  
  reportData.push(['=== Uwang Financial Report ==='])
  reportData.push([`Generated: ${new Date().toLocaleString()}`])
  reportData.push([`Period: ${getPeriodLabel()}`])
  reportData.push([`Currency: ${selectedCurrency.value} (${currencySymbol.value})`])
  reportData.push([])
  
  reportData.push(['=== SUMMARY ==='])
  reportData.push(['Metric', 'Amount'])
  reportData.push(['Total Income', formatCurrency(totalIncomeAmount.value)])
  reportData.push(['Total Expenses', formatCurrency(totalExpensesAmount.value)])
  reportData.push(['Total Savings', formatCurrency(totalSavings.value)])
  reportData.push(['Savings Rate', `${savingsRate.value}%`])
  reportData.push(['Total Budget', formatCurrency(totalBudgetAmount.value)])
  reportData.push(['Total Spent', formatCurrency(totalSpentAmount.value)])
  reportData.push(['Budget Remaining', formatCurrency(totalRemaining.value)])
  reportData.push(['Budget Usage', `${budgetHealthPercent.value}%`])
  reportData.push(['Monthly Subscriptions', formatCurrency(monthlySubscriptionsTotal.value)])
  reportData.push(['Subscription Impact', `${subscriptionPercent.value}%`])
  reportData.push([])
  
  if (alerts.length > 0) {
    reportData.push(['=== BUDGET ALERTS ==='])
    reportData.push(['Category', 'Budget', 'Spent', 'Used %', 'Status'])
    alerts.forEach(alert => {
      reportData.push([
        alert.category,
        formatCurrency(alert.budget),
        formatCurrency(alert.spent),
        `${alert.percentUsed}%`,
        alert.type === 'critical' ? 'CRITICAL (Over budget)' : 'WARNING (Near limit)'
      ])
    })
    reportData.push([])
  }
  
  reportData.push(['=== SPENDING BY CATEGORY ==='])
  reportData.push(['Category', 'Amount', 'Percentage'])
  
  const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1])
  
  let totalSpending = 0
  sortedCategories.forEach(([cat, amount]) => {
    if (cat !== 'Income') {
      totalSpending += amount
    }
  })
  
  sortedCategories.forEach(([category, amount]) => {
    const percentage = totalSpending > 0 ? ((amount / totalSpending) * 100).toFixed(1) : '0'
    reportData.push([category, formatCurrency(amount), `${percentage}%`])
  })
  reportData.push([])
  
  reportData.push(['=== TRANSACTIONS ==='])
  reportData.push(['Date', 'Description', 'Category', 'Amount', 'Type'])
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
  
  sortedTransactions.forEach(t => {
    reportData.push([
      t.date,
      t.description,
      t.category || 'Uncategorized',
      formatCurrency(Math.abs(t.amount)),
      t.amount > 0 ? 'Income' : 'Expense'
    ])
  })
  reportData.push([])
  
  if (userStore.userSubscriptions.length > 0) {
    reportData.push(['=== SUBSCRIPTIONS ==='])
    reportData.push(['Name', 'Amount', 'Category', 'Billing Cycle', 'Next Billing', 'Status'])
    
    userStore.userSubscriptions.forEach(sub => {
      let amountDisplay = formatCurrency(sub.amount)
      if (sub.original_currency === selectedCurrency.value && sub.original_amount) {
        amountDisplay = formatCurrency(sub.original_amount)
      }
      reportData.push([
        sub.name,
        amountDisplay,
        sub.category || 'Uncategorized',
        sub.billing_cycle,
        formatDate(sub.next_billing_date),
        sub.status
      ])
    })
    reportData.push([])
  }
  
  if (userStore.userGoals.length > 0) {
    reportData.push(['=== SAVINGS GOALS ==='])
    reportData.push(['Goal Name', 'Saved', 'Target', 'Progress %', 'Remaining'])
    
    userStore.userGoals.forEach(goal => {
      const progress = (goal.saved / goal.target) * 100
      reportData.push([
        goal.name,
        formatCurrency(goal.saved),
        formatCurrency(goal.target),
        `${Math.round(progress)}%`,
        formatCurrency(goal.target - goal.saved)
      ])
    })
    reportData.push([])
  }
  
  reportData.push(['=== END OF REPORT ==='])
  reportData.push([`Exported from Uwang - Personal Finance Manager`])
  
  const csvContent = reportData.map(row => 
    row.map(cell => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    }).join(',')
  ).join('\n')
  
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  link.download = `uwang_report_${timestamp}.csv`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
  
  alert(`Report exported successfully!\nFile: uwang_report_${timestamp}.csv`)
}

function formatSubscriptionAmount(subscription) {
  if (subscription.original_currency === selectedCurrency.value && subscription.original_amount) {
    return formatCurrency(subscription.original_amount)
  }
  let amountUSD = Number(subscription.amount_usd || subscription.amount)
  if (isNaN(amountUSD)) amountUSD = 0
  const convertedAmount = currencyStore.convertFromUSD(amountUSD)
  return formatCurrency(convertedAmount)
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Watchers
watch([selectedPeriod, trendChartType], () => {
  clearCaches()
  debouncedUpdate()
})

watch(isDarkMode, () => {
  debouncedUpdate()
})

watch(() => userStore.userSubscriptions, () => {
  clearCaches()
  debouncedUpdate()
}, { deep: true })

watch(() => userStore.userBudget, () => {
  clearCaches()
  debouncedUpdate()
}, { deep: true })

watch(() => userStore.userTransactions, () => {
  clearCaches()
  debouncedUpdate()
}, { deep: true })

watch(currencySymbol, () => {
  clearCaches()
  debouncedUpdate()
})

watch(selectedCurrency, async (newVal, oldVal) => {
  if (oldVal && newVal !== oldVal) {
    console.log('Currency changed from', oldVal, 'to', newVal)
    
    clearCaches()
    cachedFilteredTransactions = null
    lastSelectedPeriod = null
    lastTransactionsHash = null
    
    const currentPeriod = selectedPeriod.value
    selectedPeriod.value = 'temp'
    await nextTick()
    selectedPeriod.value = currentPeriod
    
    if (isMounted) {
      setTimeout(() => {
        updateCategoryChart()
        updateTrendChart()
        updateGaugeCharts()
      }, 100)
    }
  }
})

let resizeObserver = null

onMounted(async () => {
  isMounted = true
  currencyStore.loadCurrency()
  if (isDarkMode.value) document.body.classList.add('dark-mode')

  userStore.loadUserAvatar()
  
  if (userStore.currentUser?.supabaseId) {
    await userStore.loadUserData(userStore.currentUser.supabaseId)
  } else {
    await userStore.loadUserFromStorage()
  }
  
  setTimeout(() => {
    if (isMounted) {
      updateCategoryChart()
      updateTrendChart()
      updateGaugeCharts()
    }
  }, 100)
  
  if (typeof window !== 'undefined' && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      debouncedUpdate()
    })
    
    const containers = [
      categoryChartCanvas.value?.parentElement,
      trendChartCanvas.value?.parentElement
    ]
    containers.forEach(container => {
      if (container) resizeObserver.observe(container)
    })
  }
})

onUnmounted(() => {
  isMounted = false
  if (chartUpdateTimeout) clearTimeout(chartUpdateTimeout)
  if (resizeObserver) resizeObserver.disconnect()
  destroyAllCharts()
  clearCaches()
})
</script>

<style scoped>
/* NEW Top Bar Styles */
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

/* Export Button - Purple Theme */
.export-btn {
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

.export-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

/* Hide old page-header */
.page-header {
  display: none !important;
}

/* Responsive */
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
  .export-btn {
    justify-content: center;
  }
}

/* All existing styles below remain unchanged */
.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #94a3b8;
  gap: 12px;
}

.chart-placeholder i {
  font-size: 48px;
  opacity: 0.5;
}

.chart-placeholder span {
  font-size: 14px;
}

.dark-mode .chart-placeholder {
  color: #64748b;
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  will-change: transform;
}

.chart-wrapper {
  min-height: 300px;
  position: relative;
}

.reports-page {
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

.explanation-panel {
  background: white;
  border-radius: 16px;
  margin-bottom: 24px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.explanation-panel.dark-mode {
  background: #1e293b;
  border-color: #334155;
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  background: #f8fafc;
  transition: background 0.2s;
}

.explanation-panel.dark-mode .explanation-header {
  background: #0f172a;
}

.explanation-header:hover {
  background: #f1f5f9;
}

.explanation-header i:first-child {
  color: #8b5cf6;
  font-size: 20px;
}

.explanation-header span {
  flex: 1;
  font-weight: 600;
  color: #1e293b;
}

.explanation-panel.dark-mode .explanation-header span {
  color: #f1f5f9;
}

.explanation-content {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.explanation-panel.dark-mode .explanation-content {
  border-top-color: #334155;
}

.explanation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.explanation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.explanation-item i {
  font-size: 24px;
  color: #8b5cf6;
}

.explanation-item div strong {
  display: block;
  color: #1e293b;
  margin-bottom: 4px;
}

.explanation-panel.dark-mode .explanation-item div strong {
  color: #f1f5f9;
}

.explanation-item div p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.explanation-panel.dark-mode .explanation-item div p {
  color: #94a3b8;
}

.alert-banner {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  border-left: 4px solid #8b5cf6;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.alert-banner.dark-mode {
  background: linear-gradient(135deg, #2d1b4e 0%, #1a0b2e 100%);
  border-left-color: #a78bfa;
}

.alert-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  font-size: 20px;
  color: white;
}

.dark-mode .alert-icon {
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
}

.alert-content {
  flex: 1;
  padding: 12px 16px;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.alert-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.alert-title strong {
  font-size: 14px;
  color: #6d28d9;
  font-weight: 600;
}

.dark-mode .alert-title strong {
  color: #c4b5fd;
}

.alert-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.alert-badge.critical-count {
  background: #fee2e2;
  color: #dc2626;
}

.alert-badge.warning-count {
  background: #fed7aa;
  color: #ea580c;
}

.dark-mode .alert-badge.critical-count {
  background: #7f1d1d;
  color: #fca5a5;
}

.dark-mode .alert-badge.warning-count {
  background: #78350f;
  color: #fdba74;
}

.alert-count {
  background: #8b5cf6;
  color: white;
  padding: 2px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 10px;
  transition: all 0.2s;
  flex-wrap: wrap;
}

.alert-item.critical {
  background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
  border-left: 2px solid #dc2626;
}

.alert-item.warning {
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
  border-left: 2px solid #f59e0b;
}

.dark-mode .alert-item {
  background: #1e293b;
}

.dark-mode .alert-item.critical {
  background: linear-gradient(135deg, #1e293b 0%, #7f1d1d 100%);
}

.dark-mode .alert-item.warning {
  background: linear-gradient(135deg, #1e293b 0%, #78350f 100%);
}

.alert-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.alert-item-left i {
  font-size: 14px;
  color: #8b5cf6;
}

.alert-category {
  font-weight: 500;
  color: #1e293b;
  font-size: 13px;
}

.dark-mode .alert-category {
  color: #f1f5f9;
}

.alert-item-right {
  flex: 1;
}

.alert-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.alert-percent {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 12px;
  min-width: 45px;
  text-align: center;
}

.alert-percent.critical {
  background: #fee2e2;
  color: #dc2626;
}

.alert-percent.warning {
  background: #fed7aa;
  color: #ea580c;
}

.dark-mode .alert-percent.critical {
  background: #7f1d1d;
  color: #fca5a5;
}

.dark-mode .alert-percent.warning {
  background: #78350f;
  color: #fdba74;
}

.alert-mini-bar {
  width: 80px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.dark-mode .alert-mini-bar {
  background: #334155;
}

.alert-mini-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.alert-mini-fill.critical {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.alert-mini-fill.warning {
  background: linear-gradient(90deg, #f59e0b, #ea580c);
}

.alert-amount {
  font-size: 12px;
  font-weight: 500;
  color: #dc2626;
}

.alert-budget {
  font-size: 11px;
  color: #64748b;
}

.alert-over {
  font-size: 11px;
  font-weight: 600;
  color: #dc2626;
  background: #fee2e2;
  padding: 2px 6px;
  border-radius: 10px;
}

.dark-mode .alert-budget {
  color: #94a3b8;
}

.dark-mode .alert-over {
  background: #7f1d1d;
  color: #fca5a5;
}

.daily-alert-banner {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.daily-alert-banner.dark-mode {
  background: #1e3a8a;
  color: #bfdbfe;
}

.daily-alert-banner i {
  color: #3b82f6;
  font-size: 24px;
  margin-top: 2px;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-header label {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.dark-mode .filter-header label {
  color: #f1f5f9;
}

.filter-tooltip {
  cursor: help;
  color: #94a3b8;
  font-size: 12px;
}

.date-range-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.period-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  cursor: pointer;
  font-size: 13px;
  color: #64748b;
  transition: all 0.2s;
}

.period-btn:hover {
  background: #f1f5f9;
}

.period-btn.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border-color: transparent;
}

.period-btn.dark-mode {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.period-btn.dark-mode.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
}

.budget-summary {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.budget-summary.dark-mode {
  background: #1e293b;
  border-color: #334155;
}

.budget-summary.over-budget {
  background: #fef2f2;
  border-color: #fecaca;
}

.dark-mode.budget-summary.over-budget {
  background: #7f1d1d;
  border-color: #991b1b;
}

.summary-header {
  margin-bottom: 20px;
}

.summary-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark-mode .summary-header h3 {
  color: #f1f5f9;
}

.summary-description {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.dark-mode .summary-description {
  color: #94a3b8;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.summary-stat {
  text-align: center;
}

.summary-stat .stat-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.dark-mode .summary-stat .stat-label {
  color: #94a3b8;
}

.summary-stat .stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .summary-stat .stat-value {
  color: #f1f5f9;
}

.stat-hint {
  display: block;
  font-size: 10px;
  color: #94a3b8;
  margin-top: 4px;
}

.text-danger {
  color: #dc2626 !important;
}

.text-warning {
  color: #f59e0b !important;
}

.text-success {
  color: #10b981 !important;
}

.text-info {
  color: #3b82f6 !important;
}

.gauges-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.gauge-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.gauge-card:hover {
  transform: translateY(-2px);
}

.gauge-card.dark-mode {
  background: #1e293b;
}

.gauge-card.warning {
  border: 2px solid #f59e0b;
}

.gauge-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.gauge-header i {
  font-size: 20px;
  color: #8b5cf6;
}

.gauge-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.dark-mode .gauge-header h3 {
  color: #f1f5f9;
}

.gauge-description {
  font-size: 10px;
  color: #64748b;
  margin: 2px 0 0 0;
}

.dark-mode .gauge-description {
  color: #94a3b8;
}

.gauge-stats-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.gauge-stat-top {
  flex: 1;
  text-align: center;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  padding: 10px 8px;
}

.dark-mode .gauge-stat-top {
  background: rgba(139, 92, 246, 0.15);
}

.gauge-stat-top .stat-label {
  display: block;
  font-size: 10px;
  color: #64748b;
  margin-bottom: 4px;
}

.dark-mode .gauge-stat-top .stat-label {
  color: #94a3b8;
}

.gauge-stat-top .stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.dark-mode .gauge-stat-top .stat-value {
  color: #f1f5f9;
}

.gauge-container {
  position: relative;
  width: 100%;
  max-width: 180px;
  margin: 0 auto;
}

.gauge-container canvas {
  width: 100% !important;
  height: auto !important;
}

.gauge-center {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
  pointer-events: none;
}

.gauge-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  display: block;
  line-height: 1;
}

.dark-mode .gauge-value {
  color: #f1f5f9;
}

.gauge-label {
  font-size: 10px;
  color: #64748b;
}

.dark-mode .gauge-label {
  color: #94a3b8;
}

.gauge-footer {
  margin-top: 16px;
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.dark-mode .gauge-footer {
  border-top-color: #334155;
}

.gauge-status {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
}

.gauge-status.status-good {
  background: #d1fae5;
  color: #10b981;
}

.gauge-status.status-warning {
  background: #fef3c7;
  color: #f59e0b;
}

.gauge-status.status-critical {
  background: #fee2e2;
  color: #dc2626;
}

.dark-mode .gauge-status.status-good {
  background: #064e3b;
}

.dark-mode .gauge-status.status-warning {
  background: #78350f;
}

.dark-mode .gauge-status.status-critical {
  background: #7f1d1d;
}

.badge-danger {
  background: #dc2626;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 8px;
}

.badge-warning {
  background: #f59e0b;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 8px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.chart-card.dark-mode {
  background: #1e293b;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark-mode .chart-header h3 {
  color: #f1f5f9;
}

.chart-description {
  font-size: 11px;
  color: #64748b;
  margin: 4px 0 0 0;
}

.dark-mode .chart-description {
  color: #94a3b8;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-type-buttons {
  display: flex;
  gap: 8px;
}

.chart-type-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.chart-type-btn:hover {
  background: #f1f5f9;
  color: #8b5cf6;
}

.chart-type-btn.active {
  background: #f3e8ff;
  color: #8b5cf6;
}

.dark-mode .chart-type-btn:hover {
  background: #334155;
}

.dark-mode .chart-type-btn.active {
  background: #2d1b4e;
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f1f5f9;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: #e2e8f0;
  color: #8b5cf6;
}

.dark-mode .expand-btn {
  background: #334155;
  color: #94a3b8;
}

.dark-mode .expand-btn:hover {
  background: #475569;
  color: #a78bfa;
}

.chart-details {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.dark-mode .chart-details {
  border-top-color: #334155;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 13px;
}

.dark-mode .detail-row {
  background: #334155;
}

.detail-row span:first-child {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
}

.dark-mode .detail-row span:first-child {
  color: #f1f5f9;
}

.detail-percent {
  color: #8b5cf6;
  font-size: 11px;
}

.chart-insight {
  margin-top: 16px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #166534;
}

.dark-mode .chart-insight {
  background: #064e3b;
  color: #86efac;
}

.chart-insight i {
  font-size: 18px;
}

.comparison-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.comparison-card.dark-mode {
  background: #1e293b;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
  padding: 4px;
  margin: -4px;
  border-radius: 12px;
}

.card-header:hover {
  background: rgba(139, 92, 246, 0.05);
}

.dark-mode .card-header:hover {
  background: rgba(139, 92, 246, 0.1);
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark-mode .card-header h3 {
  color: #f1f5f9;
}

.card-description {
  font-size: 12px;
  color: #64748b;
  margin: 4px 0 0 0;
}

.dark-mode .card-description {
  color: #94a3b8;
}

.comparison-bars {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comparison-item {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.comparison-label {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 140px;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.dark-mode .comparison-label {
  color: #f1f5f9;
}

.comparison-label i {
  color: #8b5cf6;
}

.over-budget-icon {
  color: #dc2626;
  font-size: 12px;
  margin-left: 4px;
}

.comparison-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.comparison-bar {
  flex: 1;
  height: 10px;
  background: #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
}

.dark-mode .comparison-bar {
  background: #334155;
}

.regular-bar {
  height: 100%;
  background: #10b981;
  border-radius: 5px 0 0 5px;
}

.subscription-bar {
  height: 100%;
  background: #8b5cf6;
}

.comparison-totals {
  font-size: 13px;
  font-weight: 500;
  min-width: 140px;
  text-align: right;
}

.total-amount {
  color: #1e293b;
}

.dark-mode .total-amount {
  color: #f1f5f9;
}

.budget-info {
  color: #64748b;
  font-size: 11px;
}

.over-budget-amount {
  color: #dc2626;
  font-size: 11px;
  margin-left: 4px;
}

.categories-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.categories-card.dark-mode {
  background: #1e293b;
}

.category-items {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 140px;
}

.category-info i {
  color: #8b5cf6;
}

.category-name {
  font-weight: 500;
  color: #1e293b;
}

.dark-mode .category-name {
  color: #f1f5f9;
}

.category-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.dark-mode .category-bar {
  background: #334155;
}

.category-progress {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s;
}

.category-amount {
  font-weight: 600;
  color: #ef4444;
  min-width: 100px;
  text-align: right;
}

.category-percent {
  font-size: 11px;
  color: #64748b;
  min-width: 45px;
  text-align: right;
}

.tips-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-top: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.tips-card.dark-mode {
  background: #1e293b;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.dark-mode .tip-item {
  background: #334155;
}

.tip-item i {
  font-size: 20px;
  color: #8b5cf6;
}

.tip-item div strong {
  display: block;
  color: #1e293b;
  margin-bottom: 4px;
  font-size: 13px;
}

.dark-mode .tip-item div strong {
  color: #f1f5f9;
}

.tip-item div p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.dark-mode .tip-item div p {
  color: #94a3b8;
}

.no-data-message {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

@media (max-width: 1024px) {
  .gauges-section {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
  .summary-content {
    grid-template-columns: repeat(2, 1fr);
  }
  .explanation-grid {
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
  .gauges-section {
    grid-template-columns: 1fr;
  }
  .gauge-stats-top {
    flex-direction: column;
  }
  .comparison-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .comparison-label {
    width: 100%;
  }
  .comparison-bar-container {
    width: 100%;
  }
  .category-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .category-info {
    width: 100%;
  }
  .category-amount {
    width: 100%;
    text-align: left;
  }
  .date-range-selector {
    justify-content: center;
  }
  .chart-wrapper {
    min-height: 250px;
  }
  .summary-content {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .alert-list {
    flex-direction: column;
  }
  .explanation-grid {
    grid-template-columns: 1fr;
  }
  .tips-grid {
    grid-template-columns: 1fr;
  }
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>