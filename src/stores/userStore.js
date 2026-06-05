import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'
import { useNotificationStore } from './notificationStore.js'
import { useCurrencyStore } from './currencyStore.js'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref(null)
  const loading = ref(false)
  const lastBillingCheck = ref(null) // Track last billing check date
  const userAvatar = ref(null) // Store profile image
  
  // Helper function to format currency with symbol
  function formatCurrencyWithSymbol(amount, currency) {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      MYR: 'RM'
    }
    const symbol = symbols[currency] || '$'
    const absAmount = Math.abs(amount).toFixed(2)
    const sign = amount < 0 ? '-' : ''
    
    if (currency === 'MYR') {
      return `${symbol} ${sign}${absAmount}`
    }
    return `${symbol}${sign}${absAmount}`
  }
  
  // Helper to get Bootstrap icon for mood
  function getMoodIcon(mood) {
    const moodIcons = {
      'Happy': 'bi bi-emoji-smile',
      'Sad': 'bi bi-emoji-frown',
      'Neutral': 'bi bi-emoji-neutral',
      'Excited': 'bi bi-emoji-laughing',
      'Stressed': 'bi bi-emoji-dizzy'
    }
    return moodIcons[mood] || 'bi bi-journal-bookmark-fill'
  }
  
  // Precise rounding helper
  function roundToTwoDecimals(value) {
    if (isNaN(value) || value === null || value === undefined) return 0
    return Math.round((value + Number.EPSILON) * 100) / 100
  }
  
  // ============================================
  // PROCESS SUBSCRIPTION BILLING
  // ============================================
  
  async function processSubscriptionBilling() {
    if (!currentUser.value) return false
    
    const todayStr = new Date().toISOString().split('T')[0]
    if (lastBillingCheck.value === todayStr) {
      console.log('⏭️ Already checked subscriptions today, skipping')
      return true
    }
    
    try {
      const today = new Date()
      const userId = currentUser.value.supabaseId
      
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
      
      if (error) throw error
      if (!subscriptions || subscriptions.length === 0) {
        lastBillingCheck.value = todayStr
        return true
      }
      
      let anyBilled = false
      
      for (const sub of subscriptions) {
        let shouldBill = false
        let lastBillDate = null
        
        if (sub.last_billed) {
          lastBillDate = new Date(sub.last_billed)
        } else if (sub.next_billing_date) {
          const nextDate = new Date(sub.next_billing_date)
          if (sub.billing_cycle === 'Monthly') {
            lastBillDate = new Date(nextDate)
            lastBillDate.setMonth(nextDate.getMonth() - 1)
          } else if (sub.billing_cycle === 'Yearly') {
            lastBillDate = new Date(nextDate)
            lastBillDate.setFullYear(nextDate.getFullYear() - 1)
          } else if (sub.billing_cycle === 'Quarterly') {
            lastBillDate = new Date(nextDate)
            lastBillDate.setMonth(nextDate.getMonth() - 3)
          }
        }
        
        if (lastBillDate) {
          const daysSinceLastBill = Math.floor((today - lastBillDate) / (1000 * 60 * 60 * 24))
          
          if (sub.billing_cycle === 'Monthly' && daysSinceLastBill >= 30) shouldBill = true
          else if (sub.billing_cycle === 'Yearly' && daysSinceLastBill >= 365) shouldBill = true
          else if (sub.billing_cycle === 'Quarterly' && daysSinceLastBill >= 90) shouldBill = true
        }
        
        if (shouldBill) {
          // Check if already billed today - MORE IMPORTANT: check if transaction exists
          const { data: existingToday } = await supabase
            .from('transactions')
            .select('id')
            .eq('user_id', userId)
            .eq('description', `${sub.name} Subscription`)
            .eq('date', todayStr)
            .maybeSingle()
          
          if (!existingToday) {
            // Create expense transaction ONLY for actual billing events
            const { error: transactionError } = await supabase
              .from('transactions')
              .insert([{
                user_id: userId,
                description: `${sub.name} Subscription`,
                amount: -Math.abs(sub.amount),
                currency: sub.currency,
                category: sub.category,
                date: todayStr,
                is_subscription_billing: true  // Mark as subscription billing
              }])
            
            if (!transactionError) {
              anyBilled = true
              console.log(`✅ Billed ${sub.name}: ${sub.amount} ${sub.currency}`)
              
              let nextBillDate = new Date(today)
              if (sub.billing_cycle === 'Monthly') nextBillDate.setMonth(today.getMonth() + 1)
              else if (sub.billing_cycle === 'Yearly') nextBillDate.setFullYear(today.getFullYear() + 1)
              else if (sub.billing_cycle === 'Quarterly') nextBillDate.setMonth(today.getMonth() + 3)
              
              await supabase
                .from('subscriptions')
                .update({ 
                  next_billing_date: nextBillDate.toISOString().split('T')[0],
                  last_billed: todayStr
                })
                .eq('id', sub.id)
              
              const notificationStore = useNotificationStore()
              const formattedAmount = formatCurrencyWithSymbol(sub.amount, sub.currency)
              notificationStore.addNotification({
                title: 'Subscription Billed',
                message: `${sub.name}: ${formattedAmount} has been charged`,
                type: 'warning'
              })
            }
          }
        }
      }
      
      lastBillingCheck.value = todayStr
      if (anyBilled) await loadUserData(userId)
      return true
      
    } catch (err) {
      console.error('Error processing subscriptions:', err)
      return false
    }
  }

  // ============================================
  // LOAD ALL DATA FROM SUPABASE
  // ============================================
  
  async function loadUserData(userId) {
    if (!userId) return
    
    loading.value = true
    
    try {
      // Load user profile including avatar
      const { data: userData } = await supabase
        .from('users')
        .select('avatar_url, name, email')
        .eq('id', userId)
        .single()
      
      if (userData?.avatar_url) {
        userAvatar.value = userData.avatar_url
        // Also save to both localStorage keys
        localStorage.setItem('userAvatar', userData.avatar_url)
        localStorage.setItem('profileImage', userData.avatar_url)
      }
      
      // Load transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
      
      if (transactions) {
        currentUser.value.transactions = transactions
      }
      
      // Load goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
      
      if (goals) {
        currentUser.value.goals = goals
      }
      
      // Load journal entries
      const { data: journals } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
      
      if (journals) {
        currentUser.value.journals = journals
      }
      
      // Load budget with original currency info
      const { data: budgetData } = await supabase
        .from('budget')
        .select('*')
        .eq('user_id', userId)
      
      if (budgetData && budgetData.length > 0) {
        const budgetObj = {}
        budgetData.forEach(item => {
          budgetObj[item.category] = {
            amountUSD: item.amount,
            originalAmount: item.original_amount || item.amount,
            originalCurrency: item.original_currency || 'USD'
          }
        })
        currentUser.value.budget = budgetObj
      } else {
        currentUser.value.budget = {}
      }
      
      // Load subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('next_billing_date', { ascending: true })
      
      if (subscriptions) {
        // Process subscriptions to ensure numeric values
        currentUser.value.subscriptions = subscriptions.map(sub => ({
          ...sub,
          amount: Number(sub.amount),
          amount_usd: Number(sub.amount_usd || sub.amount),
          original_amount: Number(sub.original_amount || sub.amount)
        }))
      } else {
        currentUser.value.subscriptions = []
      }
      
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      loading.value = false
    }
  }
  
  // ============================================
  // UPDATE USER AVATAR
  // ============================================
  
  function updateUserAvatar(avatarUrl) {
    userAvatar.value = avatarUrl
    if (currentUser.value) {
      currentUser.value.avatar = avatarUrl
    }
    // Save to both localStorage keys for consistency
    localStorage.setItem('userAvatar', avatarUrl)
    localStorage.setItem('profileImage', avatarUrl)
  }
  
  function loadUserAvatar() {
    // Try to load from userAvatar first
    const savedAvatar = localStorage.getItem('userAvatar')
    if (savedAvatar) {
      userAvatar.value = savedAvatar
    } else {
      // Also check for profileImage (from Profile page)
      const profileImage = localStorage.getItem('profileImage')
      if (profileImage) {
        userAvatar.value = profileImage
        localStorage.setItem('userAvatar', profileImage)
      }
    }
  }
  
  // ============================================
  // SET USER (Login)
  // ============================================
  
  async function setUser(userType, supabaseUser = null) {
    const userId = supabaseUser?.id || (userType === 'studentA' ? '1' : '2')
    const userEmail = supabaseUser?.email || (userType === 'studentA' ? 'studentA@finance.com' : 'studentB@finance.com')
    const userName = supabaseUser?.name || (userType === 'studentA' ? 'Student A (Hostel)' : 'Student B (Commuter)')
    const userRole = userType === 'studentA' ? 'hostel' : 'commuter'
    
    console.log('Setting user:', { userType, userId, userName, userEmail })
    
    currentUser.value = {
      type: userType,
      name: userName,
      role: userRole,
      email: userEmail,
      supabaseId: userId,
      transactions: [],
      goals: [],
      journals: [],
      budget: {},
      subscriptions: []
    }
    
    localStorage.setItem('user', JSON.stringify({
      type: userType,
      name: userName,
      email: userEmail,
      supabaseId: userId
    }))
    
    await loadUserData(userId)
  }
  
  // ============================================
  // UPDATE USER NAME
  // ============================================
  
  async function updateUserName(newName) {
    if (!currentUser.value) return false
    
    try {
      const userId = currentUser.value.supabaseId
      
      const { error } = await supabase
        .from('users')
        .update({ name: newName })
        .eq('id', userId)
      
      if (error) throw error
      
      currentUser.value.name = newName
      
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        userData.name = newName
        localStorage.setItem('user', JSON.stringify(userData))
      }
      
      console.log('Name updated to:', newName)
      return true
      
    } catch (err) {
      console.error('Error updating name:', err)
      return false
    }
  }
  
  // ============================================
  // LOGOUT
  // ============================================
  
  function logout() {
    currentUser.value = null
    userAvatar.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('userAvatar')
    localStorage.removeItem('profileImage') // Also remove profileImage
  }
  
  // ============================================
  // LOAD FROM STORAGE (Page Refresh)
  // ============================================
  
  async function loadUserFromStorage() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      
      currentUser.value = {
        type: userData.type,
        name: userData.name,
        role: userData.type === 'studentA' ? 'hostel' : 'commuter',
        email: userData.email,
        supabaseId: userData.supabaseId,
        transactions: [],
        goals: [],
        journals: [],
        budget: {},
        subscriptions: []
      }
      
      await loadUserData(userData.supabaseId)
    }
  }
  
  // ============================================
  // BUDGET CRUD with original currency
  // ============================================
  
  async function addBudget(category, amountInSelectedCurrency, selectedCurrency) {
    if (!currentUser.value) return false
    
    try {
      const currencyStore = useCurrencyStore()
      
      // Convert to USD for storage
      let amountInUSD = currencyStore.convertToUSD(amountInSelectedCurrency, selectedCurrency)
      amountInUSD = roundToTwoDecimals(amountInUSD)
      
      const { error } = await supabase
        .from('budget')
        .insert([{
          user_id: currentUser.value.supabaseId,
          category: category,
          amount: amountInUSD,
          original_amount: amountInSelectedCurrency,
          original_currency: selectedCurrency
        }])
      
      if (error) throw error
      
      // Update local state
      currentUser.value.budget[category] = {
        amountUSD: amountInUSD,
        originalAmount: amountInSelectedCurrency,
        originalCurrency: selectedCurrency
      }
      
      return true
    } catch (err) {
      console.error('Error adding budget:', err)
      return false
    }
  }
  
  async function updateBudget(category, amountInSelectedCurrency, selectedCurrency) {
    if (!currentUser.value) return false
    
    try {
      const currencyStore = useCurrencyStore()
      
      // Convert to USD for storage
      let amountInUSD = currencyStore.convertToUSD(amountInSelectedCurrency, selectedCurrency)
      amountInUSD = roundToTwoDecimals(amountInUSD)
      
      const { error } = await supabase
        .from('budget')
        .update({ 
          amount: amountInUSD,
          original_amount: amountInSelectedCurrency,
          original_currency: selectedCurrency
        })
        .eq('user_id', currentUser.value.supabaseId)
        .eq('category', category)
      
      if (error) throw error
      
      // Update local state
      currentUser.value.budget[category] = {
        amountUSD: amountInUSD,
        originalAmount: amountInSelectedCurrency,
        originalCurrency: selectedCurrency
      }
      
      return true
    } catch (err) {
      console.error('Error updating budget:', err)
      return false
    }
  }
  
  async function deleteBudgetCategory(category) {
    if (!currentUser.value) return false
    
    try {
      const { error } = await supabase
        .from('budget')
        .delete()
        .eq('user_id', currentUser.value.supabaseId)
        .eq('category', category)
      
      if (error) throw error
      
      delete currentUser.value.budget[category]
      
      return true
    } catch (err) {
      console.error('Error deleting budget:', err)
      return false
    }
  }
  
  // ============================================
  // TRANSACTIONS CRUD
  // ============================================
  
  async function addTransaction(transaction) {
    if (!currentUser.value) return false
    
    try {
      const currencyStore = useCurrencyStore()
      const currentCurrency = currencyStore.selectedCurrency
      const transactionCurrency = transaction.amount_currency || currentCurrency
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: currentUser.value.supabaseId,
          description: transaction.description,
          amount: transaction.amount,
          currency: transactionCurrency,
          category: transaction.category,
          date: transaction.date
        }])
        .select()
      
      if (error) throw error
      
      await loadUserData(currentUser.value.supabaseId)
      
      const formattedAmount = formatCurrencyWithSymbol(transaction.amount, transactionCurrency)
      const absFormattedAmount = formatCurrencyWithSymbol(Math.abs(transaction.amount), transactionCurrency)
      const notificationStore = useNotificationStore()
      
      if (transaction.amount < 0 && Math.abs(transaction.amount) > 100) {
        notificationStore.addNotification({
          title: 'Large Expense',
          message: `You spent ${absFormattedAmount} on ${transaction.category}`,
          type: 'warning'
        })
      } else if (transaction.amount < 0) {
        notificationStore.addNotification({
          title: 'Expense Recorded',
          message: `${transaction.description}: ${absFormattedAmount}`,
          type: 'info'
        })
      } else if (transaction.amount > 0 && transaction.amount > 500) {
        notificationStore.addNotification({
          title: 'Large Income',
          message: `You received ${formattedAmount}! Great job!`,
          type: 'success'
        })
      } else if (transaction.amount > 0) {
        notificationStore.addNotification({
          title: 'Income Added',
          message: `${transaction.description}: ${formattedAmount}`,
          type: 'success'
        })
      }
      
      return true
      
    } catch (err) {
      console.error('Error adding transaction:', err)
      return false
    }
  }
  
  async function deleteTransaction(id) {
    if (!currentUser.value) return false
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await loadUserData(currentUser.value.supabaseId)
      
      const notificationStore = useNotificationStore()
      notificationStore.addNotification({
        title: 'Transaction Deleted',
        message: 'A transaction has been removed',
        type: 'info'
      })
      
      return true
      
    } catch (err) {
      console.error('Error deleting transaction:', err)
      return false
    }
  }
  
  // ============================================
  // GOALS CRUD
  // ============================================
  
  async function addGoal(goal) {
    if (!currentUser.value) return false
    
    try {
      const currencyStore = useCurrencyStore()
      const currentCurrency = currencyStore.selectedCurrency
      
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          user_id: currentUser.value.supabaseId,
          name: goal.name,
          target: goal.target,
          target_currency: goal.target_currency || currentCurrency,
          saved: goal.saved || 0,
          saved_currency: currentCurrency
        }])
        .select()
      
      if (error) throw error
      
      await loadUserData(currentUser.value.supabaseId)
      
      const notificationStore = useNotificationStore()
      const formattedTarget = formatCurrencyWithSymbol(goal.target, currentCurrency)
      
      notificationStore.addNotification({
        title: 'New Goal Created',
        message: `You started saving for "${goal.name}" (${formattedTarget})`,
        type: 'info'
      })
      
      return true
      
    } catch (err) {
      console.error('Error adding goal:', err)
      return false
    }
  }
  
  async function updateGoal(id, savedAmount) {
    if (!currentUser.value) return false
    
    try {
      const { error } = await supabase
        .from('goals')
        .update({ saved: savedAmount })
        .eq('id', id)
      
      if (error) throw error
      
      await loadUserData(currentUser.value.supabaseId)
      
      const goal = currentUser.value.goals.find(g => g.id === id)
      const notificationStore = useNotificationStore()
      const percentComplete = (savedAmount / goal.target) * 100
      const goalCurrency = goal.target_currency || 'MYR'
      const formattedSaved = formatCurrencyWithSymbol(savedAmount, goalCurrency)
      const formattedTarget = formatCurrencyWithSymbol(goal.target, goalCurrency)
      
      notificationStore.addNotification({
        title: 'Goal Progress',
        message: `Added to "${goal.name}" - ${formattedSaved} / ${formattedTarget} (${Math.round(percentComplete)}%)`,
        type: 'success'
      })
      
      if (percentComplete >= 100) {
        notificationStore.addNotification({
          title: 'Goal Achieved',
          message: `Congratulations! You reached your goal: ${goal.name}`,
          type: 'success'
        })
      }
      
      return true
      
    } catch (err) {
      console.error('Error updating goal:', err)
      return false
    }
  }
  
  async function deleteGoal(id) {
    if (!currentUser.value) return false
    
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await loadUserData(currentUser.value.supabaseId)
      
      const notificationStore = useNotificationStore()
      notificationStore.addNotification({
        title: 'Goal Deleted',
        message: 'A savings goal has been removed',
        type: 'info'
      })
      
      return true
      
    } catch (err) {
      console.error('Error deleting goal:', err)
      return false
    }
  }
  
  // ============================================
  // SUBSCRIPTIONS CRUD
  // ============================================
  
  async function loadSubscriptions() {
    if (!currentUser.value) return []
    
    try {
      const userId = currentUser.value.supabaseId
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('next_billing_date', { ascending: true })
      
      if (error) throw error
      
      currentUser.value.subscriptions = data || []
      return data || []
    } catch (err) {
      console.error('Error loading subscriptions:', err)
      return []
    }
  }
  
  async function addSubscription(subscription) {
    if (!currentUser.value) return false
    
    try {
      const currencyStore = useCurrencyStore()
      const currentCurrency = currencyStore.selectedCurrency
      const today = new Date().toISOString().split('T')[0]
      
      // Round the amount to 2 decimal places
      const roundedAmount = roundToTwoDecimals(subscription.amount)
      
      // Convert to USD for storage
      let amountInUSD = roundedAmount
      if (currentCurrency !== 'USD') {
        amountInUSD = currencyStore.convertToUSD(roundedAmount, currentCurrency)
        amountInUSD = roundToTwoDecimals(amountInUSD)
      }
      
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: currentUser.value.supabaseId,
          name: subscription.name,
          amount: roundedAmount,
          amount_usd: amountInUSD,
          original_currency: currentCurrency,
          original_amount: roundedAmount,
          category: subscription.category,
          billing_cycle: subscription.billing_cycle,
          next_billing_date: subscription.next_billing_date || today,
          status: subscription.status,
          currency: currentCurrency,
          last_billed: null,
          created_at: new Date().toISOString()
        }])
        .select()
      
      if (error) throw error
      
      await loadSubscriptions()
      
      const notificationStore = useNotificationStore()
      const formattedAmount = formatCurrencyWithSymbol(roundedAmount, currentCurrency)
      
      notificationStore.addNotification({
        title: 'Subscription Added',
        message: `Added ${subscription.name} (${formattedAmount}/${subscription.billing_cycle.toLowerCase()})`,
        type: 'success'
      })
      
      return true
      
    } catch (err) {
      console.error('Error adding subscription:', err)
      return false
    }
  }
  
  async function updateSubscription(id, subscription) {
    if (!currentUser.value) return false
    
    try {
      const currencyStore = useCurrencyStore()
      const currentCurrency = currencyStore.selectedCurrency
      
      // Round the amount to 2 decimal places
      const roundedAmount = roundToTwoDecimals(subscription.amount)
      
      // Convert to USD for storage
      let amountInUSD = roundedAmount
      if (currentCurrency !== 'USD') {
        amountInUSD = currencyStore.convertToUSD(roundedAmount, currentCurrency)
        amountInUSD = roundToTwoDecimals(amountInUSD)
      }
      
      const { error } = await supabase
        .from('subscriptions')
        .update({
          name: subscription.name,
          amount: roundedAmount,
          amount_usd: amountInUSD,
          category: subscription.category,
          billing_cycle: subscription.billing_cycle,
          next_billing_date: subscription.next_billing_date,
          status: subscription.status,
          currency: currentCurrency
        })
        .eq('id', id)
      
      if (error) throw error
      
      await loadSubscriptions()
      
      const notificationStore = useNotificationStore()
      notificationStore.addNotification({
        title: 'Subscription Updated',
        message: `${subscription.name} has been updated`,
        type: 'info'
      })
      
      return true
      
    } catch (err) {
      console.error('Error updating subscription:', err)
      return false
    }
  }
  
  async function deleteSubscription(id) {
    if (!currentUser.value) return false
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await loadSubscriptions()
      
      const notificationStore = useNotificationStore()
      notificationStore.addNotification({
        title: 'Subscription Deleted',
        message: 'A subscription has been removed',
        type: 'info'
      })
      
      return true
      
    } catch (err) {
      console.error('Error deleting subscription:', err)
      return false
    }
  }
  
  // ============================================
  // JOURNAL CRUD
  // ============================================
  
  async function addJournalEntry(journal) {
    if (!currentUser.value) return false
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{
          user_id: currentUser.value.supabaseId,
          content: journal.content,
          mood: journal.mood,
          date: journal.date
        }])
        .select()
      
      if (error) throw error
      
      await loadUserData(currentUser.value.supabaseId)
      
      const notificationStore = useNotificationStore()
      notificationStore.addNotification({
        title: 'Journal Updated',
        message: `You added a new journal entry (${journal.mood})`,
        type: 'info'
      })
      
      return true
      
    } catch (err) {
      console.error('Error adding journal:', err)
      return false
    }
  }
  
  async function deleteJournalEntry(id) {
    if (!currentUser.value) return false
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await loadUserData(currentUser.value.supabaseId)
      
      const notificationStore = useNotificationStore()
      notificationStore.addNotification({
        title: 'Journal Entry Deleted',
        message: 'A journal entry has been removed',
        type: 'info'
      })
      
      return true
      
    } catch (err) {
      console.error('Error deleting journal:', err)
      return false
    }
  }
  
  // ============================================
  // GETTERS (Computed Properties)
  // ============================================
  
  const isLoggedIn = computed(() => currentUser.value !== null)
  const userName = computed(() => currentUser.value?.name || '')
  const userRole = computed(() => currentUser.value?.role || '')
  const userTransactions = computed(() => currentUser.value?.transactions || [])
  const userGoals = computed(() => currentUser.value?.goals || [])
  const userBudget = computed(() => currentUser.value?.budget || {})
  const userJournals = computed(() => currentUser.value?.journals || [])
  const userSubscriptions = computed(() => currentUser.value?.subscriptions || [])
  const userAvatarUrl = computed(() => userAvatar.value || currentUser.value?.avatar || null)
  
  const totalBalance = computed(() => {
    if (!userTransactions.value.length) return 0
    return userTransactions.value.reduce((sum, t) => sum + t.amount, 0)
  })
  
  const monthlySpending = computed(() => {
    if (!userTransactions.value.length) return 0
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return userTransactions.value
      .filter(t => {
        const transDate = new Date(t.date)
        return transDate.getMonth() === currentMonth && 
               transDate.getFullYear() === currentYear &&
               t.amount < 0
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  })
  
  const monthlyIncome = computed(() => {
    if (!userTransactions.value.length) return 0
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return userTransactions.value
      .filter(t => {
        const transDate = new Date(t.date)
        return transDate.getMonth() === currentMonth && 
               transDate.getFullYear() === currentYear &&
               t.amount > 0
      })
      .reduce((sum, t) => sum + t.amount, 0)
  })
  
  const monthlySubscriptionsTotal = computed(() => {
    let total = 0
    userSubscriptions.value.forEach(sub => {
      if (sub.status === 'active') {
        if (sub.billing_cycle === 'Monthly') {
          total += sub.amount
        } else if (sub.billing_cycle === 'Yearly') {
          total += sub.amount / 12
        } else if (sub.billing_cycle === 'Quarterly') {
          total += sub.amount / 3
        }
      }
    })
    return total
  })
  
  const upcomingSubscriptions = computed(() => {
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)
    
    return userSubscriptions.value
      .filter(sub => {
        if (sub.status !== 'active') return false
        const nextDate = new Date(sub.next_billing_date)
        return nextDate >= today && nextDate <= nextWeek
      })
      .sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date))
  })
  
  const spendingByCategory = computed(() => {
    const categories = {}
    userTransactions.value.forEach(t => {
      if (t.amount < 0) {
        categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount)
      }
    })
    return categories
  })
  
  const totalGoalsProgress = computed(() => {
    return userGoals.value.reduce((sum, goal) => sum + goal.saved, 0)
  })
  
  const recentTransactions = computed(() => {
    return [...userTransactions.value].slice(0, 5)
  })
  
  const recentIncome = computed(() => {
    return [...userTransactions.value]
      .filter(t => t.amount > 0)
      .slice(0, 3)
  })
  
  const recentExpenses = computed(() => {
    return [...userTransactions.value]
      .filter(t => t.amount < 0)
      .slice(0, 3)
  })
  
  // ============================================
  // RETURN
  // ============================================
  
  return {
    // State
    currentUser,
    loading,
    // Avatar
    userAvatarUrl,
    updateUserAvatar,
    loadUserAvatar,
    // Actions
    setUser,
    logout,
    loadUserFromStorage,
    loadUserData,
    updateUserName,
    processSubscriptionBilling,
    addTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    addJournalEntry,
    deleteJournalEntry,
    // Subscription actions
    loadSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    // Budget actions
    addBudget,
    updateBudget,
    deleteBudgetCategory,
    // Getters
    isLoggedIn,
    userName,
    userRole,
    userTransactions,
    userGoals,
    userBudget,
    userJournals,
    userSubscriptions,
    totalBalance,
    monthlySpending,
    monthlyIncome,
    monthlySubscriptionsTotal,
    upcomingSubscriptions,
    spendingByCategory,
    totalGoalsProgress,
    recentTransactions,
    recentIncome,
    recentExpenses
  }
})