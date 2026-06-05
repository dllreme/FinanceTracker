<template>
  <div class="login-container">
    <!-- Full Screen Background Image -->
    <div class="background-image"></div>
    
    <!-- Main Content with Sliding Animation -->
    <div class="login-wrapper">
      <!-- Left Side - Welcome Section -->
      <div class="welcome-section" :class="{ 'slide-out': showLoginForm }">
        <div class="welcome-content">
          <!-- Equilibri Logo -->
          <div class="logo-container">
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
          
          <h1>Welcome Back</h1>
          <p>Track your finances with balance and peace</p>
          
          <!-- User Card - Emerald with Profile Image -->
          <div class="user-cards">
            <div class="user-card" @click="showUserLogin('studentA')">
              <div class="user-icon">
                <img 
                  v-if="profileImage" 
                  :src="profileImage" 
                  class="user-avatar-img"
                  @error="handleImageError"
                />
                <i v-else class="bi bi-gem-fill"></i>
              </div>
              <div class="user-info">
                <h3>Emerald</h3>
              </div>
              <i class="bi bi-arrow-right-circle-fill arrow-icon"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="login-section" :class="{ 'slide-in': showLoginForm }">
        <div class="login-content">
          <button v-if="showLoginForm" @click="goBack" class="back-btn">
            <i class="bi bi-arrow-left"></i> Back
          </button>
          
          <!-- Form Header with User Profile Image -->
          <div class="form-header">
            <div class="mini-logo">
              <img 
                v-if="profileImage" 
                :src="profileImage" 
                class="user-profile-img"
                @error="handleImageError"
              />
              <i v-else class="bi bi-person-circle user-profile-icon"></i>
            </div>
            <h2>{{ selectedUser }}</h2>
            <p>Enter your credentials to continue</p>
          </div>
          
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label><i class="bi bi-envelope-fill"></i> Email</label>
              <div class="input-icon">
                <i class="bi bi-envelope icon"></i>
                <input type="email" v-model="loginForm.email" class="readonly-input" readonly>
              </div>
            </div>
            
            <div class="form-group">
              <label><i class="bi bi-lock-fill"></i> Password</label>
              <div class="password-input">
                <div class="input-icon">
                  <i class="bi bi-lock icon"></i>
                  <input :type="showPassword ? 'text' : 'password'" v-model="loginForm.password" placeholder="Enter password">
                </div>
                <button type="button" @click="showPassword = !showPassword" class="toggle-pwd">
                  <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                </button>
              </div>
            </div>
            
            <div v-if="loginError" class="error-message">
              <i class="bi bi-exclamation-triangle-fill"></i> {{ loginError }}
            </div>
            
            <button type="submit" :disabled="loading" class="login-btn">
              <i v-if="loading" class="bi bi-hourglass-split"></i>
              <i v-else class="bi bi-box-arrow-in-right"></i>
              {{ loading ? 'Logging in...' : 'LOGIN' }}
            </button>
          </form>
          
          <div class="demo-hint">
            <i class="bi bi-info-circle-fill"></i>
            <small>Demo password: <code>password123</code></small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import { useUserStore } from '../stores/userStore.js'

const router = useRouter()
const userStore = useUserStore()

const showLoginForm = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const rememberMe = ref(false)
const selectedUser = ref('')
const selectedUserType = ref('')
const loginError = ref('')
const profileImage = ref(null)

const loginForm = ref({
  email: '',
  password: ''
})

// Load Emerald's profile image from database
async function loadProfileImage() {
  try {
    console.log('Loading profile image for Emerald...')
    const { data, error } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('email', 'emerald@finance.com')
      .single()
    
    if (!error && data?.avatar_url) {
      profileImage.value = data.avatar_url
      console.log('Profile image loaded successfully')
    } else {
      console.log('No profile image found, using fallback')
      profileImage.value = null
    }
  } catch (err) {
    console.error('Error loading profile image:', err)
    profileImage.value = null
  }
}

// Handle image load error
function handleImageError(event) {
  console.log('Image failed to load, using fallback')
  event.target.style.display = 'none'
  // Show the fallback icon by removing the img and showing the i element
  const parent = event.target.parentElement
  const icon = document.createElement('i')
  icon.className = 'bi bi-gem-fill'
  parent.appendChild(icon)
  event.target.remove()
}

// Watch for when form opens to reload image
watch(showLoginForm, (newValue) => {
  if (newValue) {
    loadProfileImage()
  }
})

function showUserLogin(userType) {
  selectedUserType.value = userType
  
  if (userType === 'studentA') {
    selectedUser.value = 'Emerald'
    loginForm.value.email = 'emerald@finance.com'
  }
  
  loginForm.value.password = ''
  loginError.value = ''
  showLoginForm.value = true
}

function goBack() {
  showLoginForm.value = false
  selectedUser.value = ''
  selectedUserType.value = ''
  loginForm.value = { email: '', password: '' }
  loginError.value = ''
}

async function handleLogin() {
  loading.value = true
  loginError.value = ''
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', loginForm.value.email)
      .eq('password', loginForm.value.password)
    
    if (error) {
      console.error('Supabase error:', error)
      loginError.value = 'Database error'
      loading.value = false
      return
    }
    
    if (data && data.length > 0) {
      const user = data[0]
      console.log('Login successful:', user)
      
      await userStore.setUser(user.user_type, {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url
      })
      
      if (user.avatar_url) {
        userStore.updateUserAvatar(user.avatar_url)
      }
      
      router.push('/dashboard')
    } else {
      loginError.value = 'Wrong password. Try: password123'
    }
    
  } catch (err) {
    console.error('Login error:', err)
    loginError.value = 'Login failed'
  } finally {
    loading.value = false
  }
}

function checkMobileAndAutoLogin() {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // Auto-select Emerald user without needing to click the card
    selectedUserType.value = 'studentA';
    selectedUser.value = 'Emerald';
    loginForm.value.email = 'emerald@finance.com';
    loginForm.value.password = '';
    loginError.value = '';
    showLoginForm.value = true; // This shows the login form
  }
}

// Updated onMounted to include mobile auto-login
onMounted(() => {
  loadProfileImage();
  checkMobileAndAutoLogin(); // Add this line
});

// Handle window resize (in case user rotates their phone)
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768 && !showLoginForm.value && !selectedUser.value) {
    checkMobileAndAutoLogin();
  }
});


</script>
<style scoped>
/* Your existing styles remain exactly the same */
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Full Screen Background Image */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/login_bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Main Wrapper - Glass Card */
.login-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  width: 950px;
  max-width: 90%;
  min-height: 600px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 30px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.2);
}

/* Welcome Section - Left Side */
.welcome-section {
  flex: 1;
  background: rgba(76, 29, 149, 0.6);
  backdrop-filter: blur(8px);
  padding: 40px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s ease;
}

.welcome-section.slide-out {
  transform: translateX(-100%);
}

.welcome-content {
  text-align: center;
  color: white;
  width: 100%;
}

/* Equilibri Logo Styles */
.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
}

.logo-icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  padding: 0;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  padding: 0;
  margin: 0;
}

.logo-text-container {
  text-align: center;
}

.logo-text {
  font-family: 'The Seasons', 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 2px;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.logo-slogan {
  font-family: 'Cinzel', serif;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 3px;
  color: #c084fc;
  text-transform: uppercase;
}

.welcome-section h1 {
  font-size: 28px;
  margin-bottom: 8px;
  color: white;
}

.welcome-section p {
  font-size: 14px;
  opacity: 0.85;
  margin-bottom: 35px;
  color: #e9d5ff;
}

/* User Card */
.user-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 0;
}

.user-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.user-card:hover {
  background: rgba(139, 92, 246, 0.4);
  transform: translateX(8px);
  border-color: #c084fc;
}

.user-icon {
  width: 48px;
  height: 48px;
  background: rgba(139, 92, 246, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-icon i {
  font-size: 28px;
  color: #c084fc;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  text-align: left;
}

.user-info h3 {
  font-size: 18px;
  margin: 0;
  color: white;
  font-weight: 600;
}

.arrow-icon {
  font-size: 24px;
  color: #c084fc;
  transition: transform 0.2s;
}

.user-card:hover .arrow-icon {
  transform: translateX(5px);
}

/* Login Section */
.login-section {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 30px;
  transform: translateX(100%);
  transition: transform 0.5s ease;
}

.login-section.slide-in {
  transform: translateX(0);
}

.login-content {
  width: 100%;
  max-width: 340px;
}

.back-btn {
  background: none;
  border: none;
  color: #c084fc;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.back-btn:hover {
  transform: translateX(-5px);
  color: white;
}

/* Form Header - User Profile Image */
.form-header {
  text-align: center;
  margin-bottom: 25px;
}

.mini-logo {
  width: 70px;
  height: 70px;
  margin: 0 auto 12px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.user-profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-profile-icon {
  font-size: 45px;
  color: #c084fc;
}

.form-header h2 {
  font-size: 22px;
  color: white;
  margin-bottom: 6px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  font-weight: 600;
}

.form-header p {
  color: #e9d5ff;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  letter-spacing: 0.3px;
}

/* Form Groups */
.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #f0e6ff;
  font-size: 13px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.form-group label i {
  color: #c084fc;
  margin-right: 6px;
}

.input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon .icon {
  position: absolute;
  left: 14px;
  font-size: 16px;
  color: #7c3aed;
}

.input-icon input {
  width: 100%;
  padding: 12px 12px 12px 42px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.9);
}

.input-icon input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.input-icon input::placeholder {
  color: #999;
  opacity: 0.7;
}

.readonly-input {
  background: rgba(255, 255, 255, 0.7);
  cursor: not-allowed;
  color: #4c1d95;
  font-weight: 500;
}

/* Password Input */
.password-input {
  display: flex;
  gap: 10px;
}

.password-input .input-icon {
  flex: 1;
}

.toggle-pwd {
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  color: #7c3aed;
  font-size: 16px;
  transition: all 0.2s;
}

.toggle-pwd:hover {
  background: white;
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 12px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e9d5ff;
  cursor: pointer;
}

.checkbox i {
  color: #c084fc;
  font-size: 14px;
}

.checkbox input {
  display: none;
}

.forgot-password {
  color: #e9d5ff;
  text-decoration: none;
  font-size: 12px;
}

.forgot-password:hover {
  text-decoration: underline;
  color: white;
}

/* Login Button */
.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
  transition: all 0.2s;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Error & Demo Messages */
.error-message {
  background: rgba(248, 215, 218, 0.95);
  color: #721c24;
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 15px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-hint {
  margin-top: 20px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  text-align: center;
  color: #f0e6ff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  backdrop-filter: blur(4px);
}

.demo-hint i {
  color: #c084fc;
  font-size: 14px;
}

.demo-hint small {
  color: #f0e6ff;
  font-weight: 500;
}

.demo-hint code {
  background: rgba(76, 29, 149, 0.8);
  padding: 3px 8px;
  border-radius: 6px;
  font-family: monospace;
  color: #e9d5ff;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .welcome-section {
    display: none;
  }
  
  .login-section {
    transform: translateX(0);
    flex: 1;
  }
  
  .login-section.slide-in {
    transform: translateX(0);
  }
  
  .logo-icon-wrapper {
    width: 65px;
    height: 65px;
  }
  
  .logo-text {
    font-size: 24px;
  }
  
  .logo-slogan {
    font-size: 8px;
  }
}
</style>