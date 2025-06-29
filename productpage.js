import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const db = window.db;
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// Select shared elements
const addToCartBtn = document.getElementById("add-to-cart-btn");
const addedText = document.getElementById("added-text");
const quantityValue = document.getElementById("quantity-value");
const increaseBtn = document.getElementById("increase-btn");
const decreaseBtn = document.getElementById("decrease-btn");

let selectedSize = null;
let quantity = 1;

// Disable button initially
addToCartBtn.disabled = true;
addToCartBtn.style.opacity = 0.6;

async function loadProduct() {
  if (!productId) return;

  const docRef = doc(db, "products", productId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const product = docSnap.data();

    // Inject product data into page
    document.getElementById("product-image").src = product.image;
    document.getElementById("product-image").alt = product.name;
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-breadcrumb").textContent = product.name;
    document.getElementById("product-price").textContent = `₦${Number(product.price).toLocaleString()}`;

    // ✅ Inject size options from Firebase
    if (product.sizes && Array.isArray(product.sizes)) {
      const sizeOptions = document.getElementById("size-options");
      sizeOptions.innerHTML = ""; // Clear old content

      product.sizes.forEach(size => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" data-size="${size}">${size}</a>`;
        sizeOptions.appendChild(li);
      });

      // Attach click listeners to new size buttons
      setupSizeSelection();
    }

    // ✅ Handle Add to Cart button
    addToCartBtn.addEventListener("click", () => {
      if (!selectedSize) return;

     addToCart(productId, product.name, product.price, selectedSize, quantity, product.image);
    });

  } else {
    document.querySelector(".product-page-details").innerHTML = "<p>Product not found.</p>";
  }
}

// ✅ Handle size selection
function setupSizeSelection() {
  const sizeLinks = document.querySelectorAll("#size-options a");

  sizeLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      sizeLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      selectedSize = link.dataset.size;

      addToCartBtn.disabled = false;
      addToCartBtn.style.opacity = 1;
    });
  });
}

// ✅ Handle quantity selection
increaseBtn.addEventListener("click", () => {
  quantity++;
  quantityValue.textContent = quantity;
});

decreaseBtn.addEventListener("click", () => {
  if (quantity > 1) {
    quantity--;
    quantityValue.textContent = quantity;
  }
});

// ✅ Save product to cart
function addToCart(id, name, price, size, quantity, image) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingIndex = cart.findIndex(item => item.id === id && item.size === size);

  if (existingIndex !== -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ id, name, price, size, quantity, image });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  document.getElementById("added-text").style.display = "inline";
}

loadProduct();
