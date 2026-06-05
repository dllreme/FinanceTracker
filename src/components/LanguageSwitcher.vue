<template>
  <div class="language-switcher">
    <button @click="toggleDropdown" class="lang-btn">
      <i class="bi bi-globe2"></i>
      <span>{{ currentLang === 'en' ? 'EN' : 'BM' }}</span>
      <i class="bi bi-chevron-down"></i>
    </button>
    
    <div v-if="isOpen" class="lang-dropdown" @click.stop>
      <button @click="selectLanguage('en')" class="lang-option" :class="{ active: currentLang === 'en' }">
        <span>🇬🇧</span>
        <span>English</span>
        <i v-if="currentLang === 'en'" class="bi bi-check-lg"></i>
      </button>
      <button @click="selectLanguage('ms')" class="lang-option" :class="{ active: currentLang === 'ms' }">
        <span>🇲🇾</span>
        <span>Bahasa Melayu</span>
        <i v-if="currentLang === 'ms'" class="bi bi-check-lg"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLanguageStore } from '../stores/languageStore'

const languageStore = useLanguageStore()
const isOpen = ref(false)

const currentLang = computed(() => languageStore.currentLanguage)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectLanguage(lang) {
  languageStore.setLanguage(lang)
  isOpen.value = false
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
  if (!e.target.closest('.language-switcher')) {
    isOpen.value = false
  }
})
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 30px;
  cursor: pointer;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s;
}

.lang-btn:hover {
  background: #f1f5f9;
  color: #8b5cf6;
}

.dark-mode .lang-btn {
  color: #94a3b8;
}

.dark-mode .lang-btn:hover {
  background: #334155;
  color: #a78bfa;
}

.lang-dropdown {
  position: absolute;
  top: 45px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  overflow: hidden;
  z-index: 1000;
  min-width: 160px;
}

.dark-mode .lang-dropdown {
  background: #1e293b;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 15px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: #334155;
  transition: all 0.2s;
}

.lang-option:hover {
  background: #f1f5f9;
}

.lang-option.active {
  background: #8b5cf6;
  color: white;
}

.dark-mode .lang-option {
  color: #cbd5e1;
}

.dark-mode .lang-option:hover {
  background: #334155;
}

.dark-mode .lang-option.active {
  background: #8b5cf6;
  color: white;
}

.lang-option span:first-child {
  font-size: 18px;
}

.lang-option i {
  margin-left: auto;
}
</style>