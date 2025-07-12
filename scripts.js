import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const db = window.db;
let allProducts = [];

function formatCurrency(n) {
  return `₦${Number(n).toLocaleString()}`;
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.querySelector(".cart-number");
  if (badge) badge.textContent = count;
}

function renderProducts(products, page = 1, productsPerPage = 10) {
  const container = document.getElementById("products-container");
  const pagination = document.getElementById("pagination");
  if (!container || !pagination) return;

  container.innerHTML = "";
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const currentProducts = products.slice(start, end);

  currentProducts.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("products-card");

    const img = new Image();
    img.src = product.image;
    img.alt = product.name;

    const link = document.createElement("a");
    link.href = `product-page.html?id=${product.id}`;
    link.appendChild(img);

    const productInfoContainer = document.createElement("div");
    productInfoContainer.classList.add("add-cart-container");

    const name = document.createElement("p");
    name.classList.add("product-name");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.classList.add("product-price");
    price.textContent = formatCurrency(product.price);

    const textContainer = document.createElement("div");
    textContainer.appendChild(name);
    textContainer.appendChild(price);

    productInfoContainer.appendChild(textContainer);
    card.appendChild(link);
    card.appendChild(productInfoContainer);

    container.appendChild(card);
  });

  renderPagination(products.length, page, productsPerPage);
}

function renderPagination(totalItems, currentPage, itemsPerPage) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      renderProducts(allProducts, i);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    pagination.appendChild(btn);
  }
}

async function loadProducts() {
  const loader = document.getElementById("page-loader");
  if (loader) loader.style.display = "flex";

  const snapshot = await getDocs(collection(db, "products"));
  allProducts = [];
  snapshot.forEach(doc => {
    const product = doc.data();
    product.id = doc.id;
    allProducts.push(product);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const categoryFilter = urlParams.get("category");

  if (categoryFilter) {
    const filtered = allProducts.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase());
    renderProducts(filtered, 1);
  } else {
    renderProducts(allProducts, 1);
  }

  if (loader) loader.style.display = "none";
}

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

function setupCategoryFilter() {
  const links = document.querySelectorAll(".category-link");

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const selectedCategory = link.dataset.category.toLowerCase();

      if (selectedCategory === "all") {
        renderProducts(allProducts, 1);
      } else {
        const filtered = allProducts.filter(p => p.category?.toLowerCase() === selectedCategory);
        renderProducts(filtered, 1);
      }
    });
  });
}

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
      <a href="products.html?category=${encodeURIComponent(category.slug || category.name.toLowerCase())}">Shop now</a>
    </div>
  `;

    container.appendChild(card);
  });
}

async function loadHotDeals() {
  const container = document.querySelector(".hot-deals-container");
  if (!container) return;

  const snapshot = await getDocs(collection(db, "products"));
  container.innerHTML = "";

  snapshot.forEach(doc => {
    const product = doc.data();
    if (product.hotdeal === true) {
      const card = document.createElement("div");
      card.classList.add("hot-deals-card");

      card.innerHTML = `
        <a href="product-page.html?id=${doc.id}">
          <img src="${product.image}" alt="${product.name}">
        </a>
        <p class="deals-product-name">${product.name}</p>
        <p class="deals-product-price">${formatCurrency(product.price)}</p>
      `;

      container.appendChild(card);
    }
  });
}

async function loadHeroBanner() {
  const snapshot = await getDocs(collection(db, "banners"));
  if (snapshot.empty) return;

  const bannerData = snapshot.docs[0].data();

  const hero = document.getElementById("hero-banner");
  const title = document.getElementById("hero-title");
  const link = document.getElementById("hero-link");

  if (hero && bannerData.image) {
    hero.style.backgroundImage = `url('${bannerData.image}')`;
  }
  if (title && bannerData.title) {
    title.textContent = bannerData.title;
  }
  if (link) {
    link.textContent = bannerData.ctaText || "Shop now";
    link.href = bannerData.ctaLink || "products.html";
  }
}

// ✅ Main init function
document.addEventListener("DOMContentLoaded", () => {
  loadHeroBanner();
  loadProducts();
  setupCategoryFilter();
  loadCart();
  updateCartCount();
  loadCategories();
  loadHotDeals();

  const toggleArrow = document.querySelector(".toggle-arrow");
  const categoryList = document.getElementById("category-filter");

  toggleArrow?.addEventListener("click", () => {
    categoryList.classList.toggle("show");
    toggleArrow.classList.toggle("rotate");
  });
});
