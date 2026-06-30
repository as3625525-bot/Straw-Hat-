/**
 * Progress Pro - Premium Progress Tracking App
 * Modern, animated, and feature-rich
 */

// ============================================
// DOM Elements
// ============================================
const elements = {
  // Auth
  authSection: document.getElementById('authSection'),
  userSection: document.getElementById('userSection'),
  usernameInput: document.getElementById('username'),
  loginBtn: document.getElementById('loginBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  userAvatar: document.getElementById('userAvatar'),
  displayName: document.getElementById('displayName'),
  
  // Dashboard
  dashboard: document.getElementById('dashboard'),
  categoriesDiv: document.getElementById('categories'),
  entriesList: document.getElementById('entriesList'),
  entryText: document.getElementById('entryText'),
  saveEntryBtn: document.getElementById('saveEntryBtn'),
  selectedCategoryTitle: document.getElementById('selectedCategoryTitle'),
  
  // Stats
  totalEntries: document.getElementById('totalEntries'),
  todayEntries: document.getElementById('todayEntries'),
  categoryCount: document.getElementById('categoryCount'),
  weekEntries: document.getElementById('weekEntries'),
  streakCount: document.getElementById('streakCount'),
  
  // Dialog
  addCategoryBtn: document.getElementById('addCategoryBtn'),
  categoryDialog: document.getElementById('categoryDialog'),
  newCategoryName: document.getElementById('newCategoryName'),
  createCategoryBtn: document.getElementById('createCategoryBtn'),
  cancelDialogBtn: document.getElementById('cancelDialogBtn'),
  
  // Toast
  toastContainer: document.getElementById('toastContainer')
};

// ============================================
// Category Configuration with Emojis
// ============================================
const categoryEmojis = {
  'To Do List': '📋',
  'Missions': '🎯',
  'English Spoken': '🗣️',
  'Stock Market': '📈',
  'Trading': '💹',
  'Learning Python': '🐍',
  'Learning SQL': '🗄️',
  'Learning ML': '🤖',
  'Learning GIT': '🔀',
  'Exercise': '💪',
  'Reading': '📚',
  'Meditation': '🧘',
  'Writing': '✍️',
  'Coding': '💻',
  'Health': '❤️',
  'Finance': '💰',
  'default': '📌'
};

const defaultCategories = [
  'To Do List',
  'Missions',
  'English Spoken',
  'Stock Market',
  'Trading',
  'Learning Python',
  'Learning SQL',
  'Learning ML',
  'Learning GIT',
  'Exercise'
];

// ============================================
// State Management
// ============================================
const state = {
  currentUser: localStorage.getItem('currentUser') || '',
  currentCategory: '',
  categories: JSON.parse(localStorage.getItem('categories')) || [...defaultCategories],
  entries: JSON.parse(localStorage.getItem('entries')) || [],
  streak: parseInt(localStorage.getItem('streak')) || 0,
  lastEntryDate: localStorage.getItem('lastEntryDate') || ''
};

// ============================================
// Utility Functions
// ============================================

/**
 * Save all state to localStorage
 */
function saveAll() {
  localStorage.setItem('categories', JSON.stringify(state.categories));
  localStorage.setItem('entries', JSON.stringify(state.entries));
  localStorage.setItem('streak', state.streak.toString());
  localStorage.setItem('lastEntryDate', state.lastEntryDate);
  if (state.currentUser) {
    localStorage.setItem('currentUser', state.currentUser);
  }
}

/**
 * Get emoji for a category
 */
function getCategoryEmoji(category) {
  return categoryEmojis[category] || categoryEmojis.default;
}

/**
 * Get initials from name
 */
function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format date nicely
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

/**
 * Check if date is today
 */
function isToday(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if date is within this week
 */
function isThisWeek(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo;
}

/**
 * Calculate streak
 */
function calculateStreak() {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (state.lastEntryDate === today) {
    return; // Already counted today
  }
  
  if (state.lastEntryDate === yesterday) {
    state.streak++;
  } else if (state.lastEntryDate !== today) {
    state.streak = 1;
  }
  
  state.lastEntryDate = today;
  saveAll();
}

// ============================================
// Toast Notifications
// ============================================

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;
  
  elements.toastContainer.appendChild(toast);
  
  // Close button handler
  toast.querySelector('.toast-close').onclick = () => removeToast(toast);
  
  // Auto remove after 4 seconds
  setTimeout(() => removeToast(toast), 4000);
}

/**
 * Remove toast with animation
 */
function removeToast(toast) {
  if (!toast.parentNode) return;
  toast.classList.add('hiding');
  setTimeout(() => toast.remove(), 300);
}

// ============================================
// Stats Update
// ============================================

/**
 * Update all statistics
 */
function updateStats() {
  const userEntries = state.entries.filter(e => e.user === state.currentUser);
  
  // Total entries
  elements.totalEntries.textContent = userEntries.length;
  
  // Today's entries
  const todayCount = userEntries.filter(e => isToday(e.date)).length;
  elements.todayEntries.textContent = todayCount;
  
  // This week's entries
  const weekCount = userEntries.filter(e => isThisWeek(e.date)).length;
  elements.weekEntries.textContent = weekCount;
  
  // Category count
  elements.categoryCount.textContent = state.categories.length;
  
  // Streak
  elements.streakCount.textContent = state.streak;
  
  // Animate numbers
  animateValue(elements.totalEntries, userEntries.length);
}

/**
 * Animate number value
 */
function animateValue(element, value) {
  element.style.transform = 'scale(1.2)';
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 200);
}

// ============================================
// Render Functions
// ============================================

/**
 * Render categories grid
 */
function renderCategories() {
  elements.categoriesDiv.innerHTML = '';
  
  state.categories.forEach((cat, index) => {
    const card = document.createElement('div');
    card.className = 'category-card' + (cat === state.currentCategory ? ' active' : '');
    card.setAttribute('role', 'option');
    card.setAttribute('aria-selected', cat === state.currentCategory);
    card.setAttribute('tabindex', '0');
    
    // Count entries for this category
    const entryCount = state.entries.filter(
      e => e.user === state.currentUser && e.category === cat
    ).length;
    
    card.innerHTML = `
      <span class="emoji">${getCategoryEmoji(cat)}</span>
      <span class="name">${cat}</span>
      <span class="entry-count">${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}</span>
    `;
    
    // Staggered animation
    card.style.animationDelay = `${index * 0.05}s`;
    
    // Click handler
    card.onclick = () => selectCategory(cat);
    
    // Keyboard handler
    card.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCategory(cat);
      }
    };
    
    elements.categoriesDiv.appendChild(card);
  });
}

/**
 * Select a category
 */
function selectCategory(cat) {
  state.currentCategory = cat;
  elements.selectedCategoryTitle.textContent = cat;
  renderCategories();
  renderEntries();
  
  // Focus on textarea
  elements.entryText.focus();
}

/**
 * Render entries list
 */
function renderEntries() {
  elements.entriesList.innerHTML = '';
  
  const filtered = state.entries
    .filter(e => e.user === state.currentUser && e.category === state.currentCategory)
    .reverse();
  
  if (!filtered.length) {
    elements.entriesList.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <p>No entries yet. Start tracking your progress!</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach((entry, index) => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.setAttribute('role', 'listitem');
    div.style.animationDelay = `${index * 0.05}s`;
    
    div.innerHTML = `
      <div class="entry-content">${escapeHtml(entry.text)}</div>
      <div class="entry-footer">
        <div class="entry-meta">
          <span class="date">📅 ${formatDate(entry.date)}</span>
        </div>
        <button class="btn-danger" data-id="${entry.id}" aria-label="Delete entry">
          🗑️ Delete
        </button>
      </div>
    `;
    
    // Delete handler
    div.querySelector('button').onclick = () => deleteEntry(entry.id);
    
    elements.entriesList.appendChild(div);
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Delete an entry
 */
function deleteEntry(id) {
  state.entries = state.entries.filter(item => item.id !== id);
  saveAll();
  renderEntries();
  renderCategories();
  updateStats();
  showToast('Entry deleted successfully');
}

// ============================================
// Auth Functions
// ============================================

/**
 * Login user
 */
function login() {
  const name = elements.usernameInput.value.trim();
  
  if (!name) {
    showToast('Please enter your name', 'error');
    elements.usernameInput.focus();
    return;
  }
  
  state.currentUser = name;
  localStorage.setItem('currentUser', state.currentUser);
  
  // Update UI
  elements.authSection.classList.add('hidden');
  elements.userSection.classList.remove('hidden');
  elements.dashboard.classList.remove('hidden');
  
  // Set user info
  elements.userAvatar.textContent = getInitials(name);
  elements.displayName.textContent = name;
  
  // Set default category
  if (!state.currentCategory && state.categories.length) {
    state.currentCategory = state.categories[0];
    elements.selectedCategoryTitle.textContent = state.currentCategory;
  }
  
  renderCategories();
  renderEntries();
  updateStats();
  
  showToast(`Welcome back, ${name}! 🎉`);
}

/**
 * Logout user
 */
function logout() {
  state.currentUser = '';
  state.currentCategory = '';
  localStorage.removeItem('currentUser');
  
  // Update UI
  elements.authSection.classList.remove('hidden');
  elements.userSection.classList.add('hidden');
  elements.dashboard.classList.add('hidden');
  elements.usernameInput.value = '';
  
  showToast('Logged out successfully. See you soon! 👋');
}

// ============================================
// Entry Functions
// ============================================

/**
 * Save new entry
 */
function saveEntry() {
  if (!state.currentUser) {
    showToast('Please login first', 'error');
    return;
  }
  
  if (!state.currentCategory) {
    showToast('Please select a category first', 'error');
    return;
  }
  
  const text = elements.entryText.value.trim();
  
  if (!text) {
    showToast('Please write something first', 'error');
    elements.entryText.focus();
    return;
  }
  
  // Create entry
  const entry = {
    id: Date.now().toString(),
    user: state.currentUser,
    category: state.currentCategory,
    text,
    date: new Date().toISOString()
  };
  
  state.entries.push(entry);
  
  // Update streak
  calculateStreak();
  
  // Clear input
  elements.entryText.value = '';
  
  // Save and render
  saveAll();
  renderEntries();
  renderCategories();
  updateStats();
  
  showToast('Entry saved successfully! 🎉');
  
  // Add button animation
  elements.saveEntryBtn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    elements.saveEntryBtn.style.transform = 'scale(1)';
  }, 150);
}

// ============================================
// Category Functions
// ============================================

/**
 * Open add category dialog
 */
function openCategoryDialog() {
  elements.categoryDialog.showModal();
  elements.newCategoryName.value = '';
  elements.newCategoryName.focus();
}

/**
 * Close category dialog
 */
function closeCategoryDialog() {
  elements.categoryDialog.close();
}

/**
 * Create new category
 */
function createCategory(e) {
  e.preventDefault();
  
  const name = elements.newCategoryName.value.trim();
  
  if (!name) {
    showToast('Please enter a category name', 'error');
    return;
  }
  
  if (state.categories.includes(name)) {
    showToast('Category already exists', 'error');
    return;
  }
  
  state.categories.push(name);
  saveAll();
  renderCategories();
  updateStats();
  closeCategoryDialog();
  
  showToast(`Category "${name}" created! ✨`);
}

// ============================================
// Event Listeners
// ============================================

// Auth
elements.loginBtn.onclick = login;
elements.logoutBtn.onclick = logout;

// Enter key for login
elements.usernameInput.onkeydown = (e) => {
  if (e.key === 'Enter') login();
};

// Entry
elements.saveEntryBtn.onclick = saveEntry;

// Ctrl+Enter to save entry
elements.entryText.onkeydown = (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    saveEntry();
  }
};

// Category dialog
elements.addCategoryBtn.onclick = openCategoryDialog;
elements.createCategoryBtn.onclick = createCategory;
elements.cancelDialogBtn.onclick = closeCategoryDialog;

// Close dialog on backdrop click
elements.categoryDialog.onclick = (e) => {
  if (e.target === elements.categoryDialog) {
    closeCategoryDialog();
  }
};

// Close dialog on Escape
elements.categoryDialog.onkeydown = (e) => {
  if (e.key === 'Escape') {
    closeCategoryDialog();
  }
};

// ============================================
// Initialize App
// ============================================

function init() {
  // Check if user is already logged in
  if (state.currentUser) {
    elements.authSection.classList.add('hidden');
    elements.userSection.classList.remove('hidden');
    elements.dashboard.classList.remove('hidden');
    
    elements.userAvatar.textContent = getInitials(state.currentUser);
    elements.displayName.textContent = state.currentUser;
    
    if (state.categories.length) {
      state.currentCategory = state.categories[0];
      elements.selectedCategoryTitle.textContent = state.currentCategory;
    }
    
    renderCategories();
    renderEntries();
    updateStats();
  }
  
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  }
}

// Start the app
init();
