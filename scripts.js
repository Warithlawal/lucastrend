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

function renderProducts(products) {
  const container = document.getElementById("products-container");
  if (!container) return;

  container.innerHTML = "";

  const imageLoadPromises = [];

  products.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("products-card");

    const img = new Image();
    img.src = product.image;
    img.alt = product.name;

    // Loader promise
    const imgPromise = new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });
    imageLoadPromises.push(imgPromise);

    const link = document.createElement("a");
    link.href = `product-page.html?id=${product.id}`;
    link.appendChild(img);

    const addCartContainer = document.createElement("div");
    addCartContainer.classList.add("add-cart-container");

    const name = document.createElement("p");
    name.classList.add("product-name");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.classList.add("product-price");
    price.textContent = formatCurrency(product.price);

    const btn = document.createElement("button");
    btn.classList.add("add-to-cart-btn");
    btn.dataset.id = product.id;
    btn.setAttribute("aria-label", "Add to cart");
    btn.innerHTML = `<i class="fa-light fa-plus"></i>`;

    const div = document.createElement("div");
    div.appendChild(name);
    div.appendChild(price);

    addCartContainer.appendChild(div);
    addCartContainer.appendChild(btn);

    card.appendChild(link);
    card.appendChild(addCartContainer);

    container.appendChild(card);
  });

  return Promise.all(imageLoadPromises); // return promise to wait
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

  await renderProducts(allProducts);

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
        renderProducts(allProducts);
      } else {
        const filtered = allProducts.filter(p => p.category?.toLowerCase() === selectedCategory);
        renderProducts(filtered);
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
        <a href="products.html?category=${category.slug || category.name.toLowerCase()}">Shop now</a>
      </div>
    `;

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  setupCategoryFilter();
  loadCart();
  updateCartCount();
  loadCategories();
});
