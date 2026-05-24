// --- APP STATE MANAGEMENT ---
let state = {
    isLoggedIn: false,
    cart: []
};

// Bootstrap Modal & Toast Instances
let loginModal, signupModal, appToast;

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Bootstrap Interface Handlers
    loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
    appToast = new bootstrap.Toast(document.getElementById('appToast'));

    // Handle Forms Interception
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });

    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification("Account", "Account created successfully! Please log in.");
        signupModal.hide();
        loginModal.show();
    });

    updateUI();
});

// --- UI SYNC ACTION CONTROLLERS ---
function updateUI() {
    const loggedOutLinks = document.getElementById('loggedOutLinks');
    const loggedInLinks = document.getElementById('loggedInLinks');
    
    if (state.isLoggedIn) {
        loggedOutLinks.classList.remove('d-flex');
        loggedOutLinks.classList.add('d-none');
        loggedInLinks.classList.remove('d-none');
        loggedInLinks.classList.add('d-flex');
    } else {
        loggedOutLinks.classList.remove('d-none');
        loggedOutLinks.classList.add('d-flex');
        loggedInLinks.classList.remove('d-flex');
        loggedInLinks.classList.add('d-none');
    }

    renderCart();
}

// --- AUTHENTICATION FLOWS ---
function login() {
    state.isLoggedIn = true;
    loginModal.hide();
    updateUI();
    showNotification("Auth Status", "Welcome back! Access granted to your profile.");
}

function logout() {
    state.isLoggedIn = false;
    state.cart = []; // Empty cart data on clean logout tracking
    updateUI();
    showNotification("Auth Status", "Successfully logged out.");
}

// --- CART LOGIC CONTROLLER ---
function addToCart(productName, price) {
    if (!state.isLoggedIn) {
        showNotification("Access Denied", "Please log in to add items to your cart.");
        loginModal.show();
        return;
    }

    // Check if entry exists
    const existingItem = state.cart.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({ name: productName, price: price, quantity: 1 });
    }

    updateUI();
    showNotification("Cart Updated", `${productName} added to cart successfully!`);
}

function updateQuantity(productName, delta) {
    const item = state.cart.find(item => item.name === productName);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            state.cart = state.cart.filter(i => i.name !== productName);
        }
    }
    updateUI();
}

function renderCart() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartCountBadge = document.getElementById('cartCountBadge');
    const cartSubtotal = document.getElementById('cartSubtotal');

    // Total Items count
    const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.innerText = totalCount;

    if (state.cart.length === 0) {
        cartItemsList.innerHTML = `<p class="text-secondary text-center my-5">Your cart is empty.</p>`;
        cartSubtotal.innerText = "$0.00";
        return;
    }

    let itemsHTML = '';
    let subtotal = 0;

    state.cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        itemsHTML += `
            <div class="d-flex align-items-center justify-content-between bg-black border border-secondary p-2 mb-2">
                <div>
                    <h6 class="mb-0 fw-bold text-truncate style-title" style="max-width: 130px;">${item.name}</h6>
                    <small class="text-secondary">$${item.price.toFixed(2)} each</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary py-0 px-2 text-white" onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span class="small fw-bold">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary py-0 px-2 text-white" onclick="updateQuantity('${item.name}', 1)">+</button>
                </div>
                <span class="small fw-bold">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });

    cartItemsList.innerHTML = itemsHTML;
    cartSubtotal.innerText = `$${subtotal.toFixed(2)}`;
}

// --- UTILITY TOAST NOTIFIER ---
function showNotification(title, message) {
    document.getElementById('toastTitle').innerText = title;
    document.getElementById('toastMessage').innerText = message;
    appToast.show();
}