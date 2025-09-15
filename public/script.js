// Global variables
let currentUser = null;
let cart = [];
let currentCity = '';
let currentBranch = '';
let currentCategory = '';

// DOM ready event
document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggle-content');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleContent);
  }
  loadAllDropdowns();
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUI();
  }
  loadProducts();
});

// Load all dropdown data
async function loadAllDropdowns() {
  await loadCities();
  await loadBranches();
  await loadCategories();
  updateCartCount();
}

// Load cities
async function loadCities() {
  try {
    const response = await fetch('/api/cities');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    const cities = await response.json();
    populateCityDropdowns(cities);
  } catch (error) {
    console.error('Error loading cities:', error);
    const defaultCities = ['Jalalabad', 'Kabul', 'Kandahar', 'Herat', 'Balkh'];
    populateCityDropdowns(defaultCities);
  }
}

function populateCityDropdowns(cities) {
  const cityDropdowns = document.querySelectorAll('.city-dropdown');
  cityDropdowns.forEach(dropdown => {
    dropdown.innerHTML = '<option value="all">All Cities</option>';
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      dropdown.appendChild(option);
    });
  });
  const cityFilter = document.getElementById('city-filter');
  if (cityFilter) cityFilter.value = currentCity || 'all';
}

// Load branches
async function loadBranches(city = '') {
  try {
    let url = '/api/branches';
    if (city && city !== 'all') url += `?city=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    const branches = await response.json();
    populateBranchDropdowns(branches);
  } catch (error) {
    console.error('Error loading branches:', error);
  }
}

function populateBranchDropdowns(branches) {
  const branchDropdowns = document.querySelectorAll('.branch-dropdown');
  branchDropdowns.forEach(dropdown => {
    dropdown.innerHTML = '<option value="all">All Branches</option>';
    branches.forEach(branch => {
      const option = document.createElement('option');
      option.value = branch.id;
      option.textContent = branch.name;
      dropdown.appendChild(option);
    });
  });
  const branchFilter = document.getElementById('branch-filter');
  if (branchFilter) branchFilter.value = currentBranch || 'all';
}

// Load categories
// Load categories with error handling
async function loadCategories() {
  try {
    const response = await fetch('/api/categories');
    if (response.ok) {
      const categories = await response.json();
      populateCategoryDropdown(categories);
    } else {
      throw new Error('Failed to load categories');
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    const fallbackCategories = ['Grocery', 'Clothing', 'Accessories', 'Home', 'Electronics'];
    populateCategoryDropdown(fallbackCategories);
  }
}

// Load cities with error handling
async function loadCities() {
  try {
    const response = await fetch('/api/cities');
    if (response.ok) {
      const cities = await response.json();
      populateCityDropdowns(cities);
    } else {
      throw new Error('Failed to load cities');
    }
  } catch (error) {
    console.error('Error loading cities:', error);
    const defaultCities = ['Kabul', 'Jalalabad', 'Kandahar', 'Herat', 'Balkh'];
    populateCityDropdowns(defaultCities);
  }
}

// Load products with error handling
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (response.ok) {
      const products = await response.json();
      displayProducts(products);
    } else {
      throw new Error('Failed to load products');
    }
  } catch (error) {
    console.error('Error loading products:', error);
    displayProducts(getMockProducts());
  }
}
function populateCategoryDropdown(categories) {
  const categoryDropdown = document.getElementById('category-filter');
  if (categoryDropdown) {
    categoryDropdown.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryDropdown.appendChild(option);
    });
    categoryDropdown.value = currentCategory || 'all';
  }
}

// City selection
function selectCity(city) {
  currentCity = city;
  document.getElementById('selected-city').textContent = city || 'Select a city';
  const cityDropdown = document.getElementById('city-filter');
  if (cityDropdown) cityDropdown.value = city;
  loadBranches(city);
  filterProducts();
  showBranchesMap(city);
}

// Branch selection
function selectBranch(branchId) {
  currentBranch = branchId;
  const branchDropdown = document.getElementById('branch-filter');
  if (branchDropdown) branchDropdown.value = branchId;
  filterProducts();
}

// Category selection
function selectCategory(category) {
  currentCategory = category;
  const categoryDropdown = document.getElementById('category-filter');
  if (categoryDropdown) categoryDropdown.value = category;
  filterProducts();
}

// Filter products
async function filterProducts() {
  const params = new URLSearchParams();
  if (currentCity && currentCity !== 'all') params.append('city', currentCity);
  if (currentBranch && currentBranch !== 'all') params.append('branch', currentBranch);
  if (currentCategory && currentCategory !== 'all') params.append('category', currentCategory);
  try {
    const response = await fetch(`/api/products/filter?${params}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error filtering products:', error);
    loadProducts();
  }
}

// Toggle content
function toggleContent() {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.style.display = section.style.display === 'block' ? 'none' : 'block';
  });
}

// Show branches map
function showBranchesMap(city) {
  const mapSection = document.getElementById('branches-map');
  if (mapSection && city) {
    mapSection.innerHTML = `
      <h3>${city} Branches Map</h3>
      <div class="map-placeholder">
        <p>📍 Map showing 10 branches across ${city}</p>
        <p>Each branch serves different districts of the city</p>
        <div class="branches-list">
          ${Array.from({length: 10}, (_, i) => `
            <div class="branch-item">
              <strong>${city} Branch ${i+1}</strong>
              <p>Main Street ${i+1}, ${city}</p>
              <p>Hours: 8:00 AM - 10:00 PM</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// User registration
function register() {
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;
  if (!username || !password) {
    alert('Please enter both username and password');
    return;
  }
  const user = { username, password, role };
  localStorage.setItem('user_' + username, JSON.stringify(user));
  alert('Registration successful! Please login.');
  document.getElementById('reg-username').value = '';
  document.getElementById('reg-password').value = '';
}

// User login
function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  if (!username || !password) {
    alert('Please enter both username and password');
    return;
  }
  const userData = localStorage.getItem('user_' + username);
  if (!userData) {
    alert('User not found');
    return;
  }
  const user = JSON.parse(userData);
  if (user.password !== password) {
    alert('Incorrect password');
    return;
  }
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  alert('Login successful!');
  updateUI();
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
}

// Update UI
function updateUI() {
  const authSection = document.getElementById('auth');
  const sellerPanel = document.getElementById('seller-panel');
  const cartSection = document.getElementById('cart');
  const customerSection = document.getElementById('customer-form');
  if (authSection) authSection.style.display = 'none';
  if (currentUser) {
    if (currentUser.role === 'seller' && sellerPanel) sellerPanel.style.display = 'block';
    if (cartSection) cartSection.style.display = 'block';
    if (customerSection) customerSection.style.display = 'block';
  }
}

// Load products
function loadProducts() {
  fetch('/api/products')
    .then(response => response.json())
    .then(products => displayProducts(products))
    .catch(error => {
      console.error('Error loading products:', error);
      displayProducts(getMockProducts());
    });
}

// Display products
function displayProducts(products) {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  if (products.length === 0) {
    productList.innerHTML = '<li class="no-products">No products found for your selection.</li>';
    return;
  }
  productList.innerHTML = products.map(product => `
    <li class="product-item">
      <div class="product-info">
        <strong>${product.name}</strong> - $${product.price}
        <div class="product-details">
          Category: ${product.category || 'N/A'}, Location: ${product.location || 'N/A'}
        </div>
      </div>
      <button class="add-to-cart-btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
    </li>
  `).join('');
}

// Mock products
function getMockProducts() {
  return [
    { id: 1, name: 'Afghan Rug', price: 49.99, category: 'Home', location: 'Kabul' },
    { id: 2, name: 'Green Tea', price: 5.99, category: 'Grocery', location: 'Jalalabad' },
    { id: 3, name: 'Traditional Hat', price: 12.99, category: 'Clothing', location: 'Kandahar' }
  ];
}

// Add to cart
function addToCart(id, name, price) {
  cart.push({ id, name, price, quantity: 1 });
  updateCart();
  updateCartCount();
  showNotification(`Added ${name} to cart!`);
}

// Update cart
function updateCart() {
  const cartList = document.getElementById('cart-list');
  if (!cartList) return;
  if (cart.length === 0) {
    cartList.innerHTML = '<li class="cart-empty">Your cart is empty</li>';
    return;
  }
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartList.innerHTML = cart.map(item => `
    <li class="cart-item">
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">$${item.price} x ${item.quantity}</span>
      </div>
      <div class="cart-item-actions">
        <button onclick="changeQuantity(${item.id}, ${item.quantity - 1})" class="quantity-btn">-</button>
        <span class="cart-item-quantity">${item.quantity}</span>
        <button onclick="changeQuantity(${item.id}, ${item.quantity + 1})" class="quantity-btn">+</button>
        <button onclick="removeFromCart(${item.id})" class="remove-btn">Remove</button>
      </div>
    </li>
  `).join('') + `<li class="cart-total"><strong>Total: $${total.toFixed(2)}</strong></li>`;
}

// Change quantity
function changeQuantity(id, newQuantity) {
  const item = cart.find(item => item.id === id);
  if (item) {
    if (newQuantity <= 0) removeFromCart(id);
    else {
      item.quantity = newQuantity;
      updateCart();
      updateCartCount();
    }
  }
}

// Remove from cart
function removeFromCart(id) {
  const index = cart.findIndex(item => item.id === id);
  if (index !== -1) {
    const removedItem = cart.splice(index, 1)[0];
    updateCart();
    updateCartCount();
    showNotification(`Removed ${removedItem.name} from cart`);
  }
}

// Update cart count
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
  }
}

// Show notification
function showNotification(message) {
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) existingNotification.remove();
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Add product
function addProduct() {
  const name = document.getElementById('product-name').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const category = document.getElementById('product-category').value;
  const location = document.getElementById('product-location').value;
  const branch_id = parseInt(document.getElementById('product-branch').value);
  if (!name || isNaN(price) || !category || !location || isNaN(branch_id)) {
    alert('Please fill all fields with valid values');
    return;
  }
  fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, category, location, branch_id })
  })
  .then(response => response.json())
  .then(product => {
    showNotification(`Product "${product.name}" added successfully!`);
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    loadProducts();
  })
  .catch(error => {
    console.error('Error adding product:', error);
    showNotification('Error adding product. Please try again.');
  });
}

// Register customer
function registerCustomer() {
  const name = document.getElementById('customer-name').value;
  const email = document.getElementById('customer-email').value;
  const phone = document.getElementById('customer-phone').value;
  const address = document.getElementById('customer-address').value;
  const city = document.getElementById('customer-city').value;
  if (!name || !email) {
    alert('Please enter at least name and email');
    return;
  }
  fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password: 'temp123', phone, address, city })
  })
  .then(response => response.json())
  .then(customer => {
    showNotification(`Customer ${customer.name} registered successfully!`);
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-email').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-address').value = '';
    document.getElementById('customer-city').value = '';
  })
  .catch(error => {
    console.error('Error registering customer:', error);
    showNotification('Error registering customer. Please try again.');
  });
}

// Checkout
function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  const branch_id = document.getElementById('pickup-branch').value;
  const customer_email = document.getElementById('customer-email-checkout').value;
  if (!customer_email) {
    alert('Please enter your email address');
    return;
  }
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  alert(`Thank you for your order! Total: $${total.toFixed(2)}\nYou will receive confirmation at ${customer_email}.`);
  cart = [];
  updateCart();
  updateCartCount();
}

// Logout
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  alert('Logged out successfully');
  const authSection = document.getElementById('auth');
  const sellerPanel = document.getElementById('seller-panel');
  const cartSection = document.getElementById('cart');
  const customerSection = document.getElementById('customer-form');
  if (authSection) authSection.style.display = 'block';
  if (sellerPanel) sellerPanel.style.display = 'none';
  if (cartSection) cartSection.style.display = 'none';
  if (customerSection) customerSection.style.display = 'none';
}

// Reset filters (added for completeness)
function resetFilters() {
  currentCity = 'all';
  currentBranch = 'all';
  currentCategory = 'all';
  const cityDropdown = document.getElementById('city-filter');
  const branchDropdown = document.getElementById('branch-filter');
  const categoryDropdown = document.getElementById('category-filter');
  if (cityDropdown) cityDropdown.value = 'all';
  if (branchDropdown) branchDropdown.value = 'all';
  if (categoryDropdown) categoryDropdown.value = 'all';
  loadProducts();
}