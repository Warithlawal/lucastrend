// Import Firebase Firestore
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const db = window.db;
let allProducts = [];

// ✅ Currency Formatter
function formatCurrency(n) {
  return `₦${Number(n).toLocaleString()}`;
}

// ✅ Update cart icon badge
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.querySelector(".cart-number");
  if (badge) badge.textContent = count;
}

// ✅ Render Products to Page
function renderProducts(products) {
  const container = document.getElementById("products-container");
  if (!container) return;

  container.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("products-card");

    card.innerHTML = `
      <a href="product-page.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}">
      </a>
      <div class="add-cart-container">
        <div>
          <p class="product-name">${product.name}</p>
          <p class="product-price">${formatCurrency(product.price)}</p>
        </div>
        <button class="add-to-cart-btn" data-id="${product.id}" aria-label="Add to cart">
          <i class="fa-light fa-plus"></i>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// ✅ Load Products from Firestore
async function loadProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  allProducts = [];
  snapshot.forEach(doc => {
    const product = doc.data();
    product.id = doc.id;
    allProducts.push(product);
  });
  renderProducts(allProducts);
}

// ✅ Load Cart for Cart Page
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cart-container");
  const subtotalElement = document.querySelector(".subtotal-price");

  if (!cartContainer || !subtotalElement) return;

  cartContainer.innerHTML = "";
  let subtotal = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    subtotalElement.textContent = "₦0";
    updateCartCount();
    return;
  }

  cart.forEach((item, index) => {
    const total = item.quantity * item.price;
    subtotal += total;

    const cartGroup = document.createElement("div");
    cartGroup.classList.add("cart-group");

    cartGroup.innerHTML = `
      <div class="container-2">
        <div class="productandquantity">
          <div class="cart-item">
            <div class="cart-img">
              <img src="${item.image || 'images/shirt.png'}" alt="${item.name}">
            </div>
            <div class="cart-details">
              <p class="cart-item-title">${item.name}</p>
              <p>${formatCurrency(item.price)}</p>
              <p>Size: ${item.size}</p>
            </div>
          </div>

          <div class="quantity-btn">
            <div class="quantity">
              <div class="quantity-flex">
                <span class="decrease" data-index="${index}">-</span>
                <span class="middle">${item.quantity}</span>
                <span class="increase" data-index="${index}">+</span>
              </div>
            </div>
            <i class="fa-light fa-trash" data-index="${index}"></i>
          </div>
        </div>

        <div class="cart-total align-right">
          <p>${formatCurrency(total)}</p>
        </div>
      </div>
      <hr>
    `;

    cartContainer.appendChild(cartGroup);
  });

  subtotalElement.textContent = formatCurrency(subtotal);
  attachCartEvents();
  updateCartCount();
}

// ✅ Cart Interaction Buttons
function attachCartEvents() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  document.querySelectorAll(".increase").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      cart[index].quantity++;
      localStorage.setItem("cart", JSON.stringify(cart));
      loadCart();
    });
  });

  document.querySelectorAll(".decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
      }
    });
  });

  document.querySelectorAll(".fa-trash").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      loadCart();
    });
  });
}

// ✅ Setup Category Filters
function setupCategoryFilter() {
  const links = document.querySelectorAll(".category-link");

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const selectedCategory = link.dataset.category.toLowerCase();

      if (selectedCategory === "all") {
        renderProducts(allProducts);
      } else {
        const filtered = allProducts.filter(p => p.category?.toLowerCase() === selectedCategory);
        renderProducts(filtered);
      }
    });
  });
}

// ✅ Load Homepage Categories from Firestore
async function loadCategories() {
  const container = document.getElementById("category-container");
  if (!container) return;

  const snapshot = await getDocs(collection(db, "categories"));
  container.innerHTML = "";

  snapshot.forEach(doc => {
    const category = doc.data();

    const card = document.createElement("div");
    card.classList.add("category-card");

    card.innerHTML = `
      <img src="${category.image}" alt="${category.name}">
      <div class="layer">
        <p>${category.name}</p>
        <a href="products.html?category=${category.slug || category.name.toLowerCase()}">Shop now</a>
      </div>
    `;

    container.appendChild(card);
  });
}

// ✅ Initialize All on Page Load
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  setupCategoryFilter();
  loadCart();
  updateCartCount();
  loadCategories();
});
