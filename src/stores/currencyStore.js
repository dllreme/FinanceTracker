import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCurrencyStore = defineStore('currency', () => {
  // State
  const selectedCurrency = ref('USD')
  const exchangeRates = ref({
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    AUD: 1.52,
    CAD: 1.36,
    MYR: 4.70,
    PHP: 56.50
  })
  const loading = ref(false)
  const lastUpdated = ref(null)
  const error = ref(null)
  
  // Add a refresh trigger to force component updates
  const refreshTrigger = ref(0)

  const API_URL = 'https://open.er-api.com/v6/latest/USD'

  // Precise rounding function
  function roundToTwoDecimals(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100
  }

  function roundToFourDecimals(value) {
    return Math.round((value + Number.EPSILON) * 10000) / 10000
  }

  function loadCurrency() {
    const saved = localStorage.getItem('currency')
    if (saved && saved !== selectedCurrency.value) {
      selectedCurrency.value = saved
    }
  }

  function setCurrency(currency) {
    if (selectedCurrency.value === currency) return
    
    console.log(`🔄 Changing currency from ${selectedCurrency.value} to ${currency}`)
    
    selectedCurrency.value = currency
    localStorage.setItem('currency', currency)
    
    // Increment refresh trigger to force reactive updates
    refreshTrigger.value++
    
    // Dispatch custom event for all components to listen to
    window.dispatchEvent(new CustomEvent('currency-changed', {
      detail: {
        currency: currency,
        symbol: currencySymbol.value,
        rate: currentRate.value,
        timestamp: Date.now()
      }
    }))
    
    console.log(`✅ Currency changed to: ${currency}, Symbol: ${currencySymbol.value}`)
  }

  async function fetchExchangeRates() {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(API_URL)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      exchangeRates.value = {
        USD: 1,
        EUR: data.rates.EUR || 0.92,
        GBP: data.rates.GBP || 0.79,
        JPY: data.rates.JPY || 149.50,
        AUD: data.rates.AUD || 1.52,
        CAD: data.rates.CAD || 1.36,
        MYR: data.rates.MYR || 4.70,
        PHP: data.rates.PHP || 56.50
      }
      
      // Round all exchange rates to 4 decimal places
      Object.keys(exchangeRates.value).forEach(key => {
        exchangeRates.value[key] = roundToFourDecimals(exchangeRates.value[key])
      })
      
      lastUpdated.value = new Date().toLocaleString()
      
      localStorage.setItem('exchangeRates', JSON.stringify({
        rates: exchangeRates.value,
        timestamp: Date.now()
      }))
      
      console.log('✅ Exchange rates updated:', exchangeRates.value)
      
      // Notify components that rates were updated
      window.dispatchEvent(new CustomEvent('exchange-rates-updated', {
        detail: {
          rates: exchangeRates.value,
          timestamp: lastUpdated.value
        }
      }))
      
    } catch (err) {
      console.error('Failed to fetch exchange rates:', err)
      error.value = err.message
      
      const cached = localStorage.getItem('exchangeRates')
      if (cached) {
        const cachedData = JSON.parse(cached)
        exchangeRates.value = cachedData.rates
        lastUpdated.value = `Cached: ${new Date(cachedData.timestamp).toLocaleString()}`
      }
    } finally {
      loading.value = false
    }
  }

  // Convert from any currency to USD
  function convertToUSD(amount, fromCurrency) {
    if (fromCurrency === 'USD') return roundToTwoDecimals(amount)
    const rate = exchangeRates.value[fromCurrency]
    if (!rate) return roundToTwoDecimals(amount)
    const result = amount / rate
    return roundToFourDecimals(result)
  }

  // Convert from USD to selected currency
  function convertFromUSD(amountUSD) {
    const rate = exchangeRates.value[selectedCurrency.value] || 1
    const result = amountUSD * rate
    return roundToTwoDecimals(result)
  }

  // Format currency with proper conversion
  function formatCurrency(amountUSD) {
    const converted = convertFromUSD(amountUSD)
    const roundedAmount = roundToTwoDecimals(converted)
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      MYR: 'RM',
      PHP: '₱'
    }
    const symbol = symbols[selectedCurrency.value] || '$'
    
    if (selectedCurrency.value === 'MYR') {
      return `${symbol} ${roundedAmount.toFixed(2)}`
    }
    return `${symbol}${roundedAmount.toFixed(2)}`
  }

  const currencySymbol = computed(() => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      MYR: 'RM',
      PHP: '₱'
    }
    return symbols[selectedCurrency.value] || '$'
  })

  const currentRate = computed(() => {
    return exchangeRates.value[selectedCurrency.value] || 1
  })

  return {
    selectedCurrency,
    exchangeRates,
    loading,
    lastUpdated,
    error,
    refreshTrigger, // Export this for reactive updates
    loadCurrency,
    setCurrency,
    fetchExchangeRates,
    convertToUSD,
    convertFromUSD,
    formatCurrency,
    currencySymbol,
    currentRate,
    roundToTwoDecimals,
    roundToFourDecimals
  }
})