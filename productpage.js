import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const db = window.db;
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

document.addEventListener("DOMContentLoaded", () => {
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  const addedText = document.getElementById("added-text");
  const selectSizeMsg = document.getElementById("select-size-msg");
  const quantityValue = document.getElementById("quantity-value");
  const increaseBtn = document.getElementById("increase-btn");
  const decreaseBtn = document.getElementById("decrease-btn");

  let selectedSize = null;
  let quantity = 1;

  addToCartBtn.disabled = true;
  addToCartBtn.style.opacity = 0.6;

  async function loadProduct() {
    if (!productId) return;

    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      document.querySelector(".product-page-details").innerHTML = "<p>Product not found.</p>";
      return;
    }

    const product = docSnap.data();

    // Render product
    document.getElementById("product-image").src = product.image;
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-breadcrumb").textContent = product.name;
    document.getElementById("product-price").textContent = `₦${Number(product.price).toLocaleString()}`;

    // Sizes
    const sizeOptions = document.getElementById("size-options");
    sizeOptions.innerHTML = "";
    (product.sizes || []).forEach(size => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" data-size="${size}">${size}</a>`;
      sizeOptions.appendChild(li);
    });

    setupSizeSelection(); // Attach listeners

    // ✅ Cart logic after product loaded
    addToCartBtn.addEventListener("click", () => {
      if (!selectedSize) {
        selectSizeMsg.style.display = "inline";
        addedText.style.display = "none";
        setTimeout(() => {
          selectSizeMsg.style.display = "none";
        }, 2000);
        return;
      }

      // Add to cart
      addToCart(productId, product.name, product.price, selectedSize, quantity, product.image);
      addedText.style.display = "inline";
      selectSizeMsg.style.display = "none";
      setTimeout(() => {
        addedText.style.display = "none";
      }, 2000);
    });
  }

  function setupSizeSelection() {
    const sizeLinks = document.querySelectorAll("#size-options a");
    sizeLinks.forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        sizeLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        selectedSize = link.dataset.size;
        addToCartBtn.disabled = false;
        addToCartBtn.style.opacity = 1;
        selectSizeMsg.style.display = "none";
      });
    });
  }

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

  function addToCart(id, name, price, size, quantity, image) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const index = cart.findIndex(item => item.id === id && item.size === size);
    if (index !== -1) {
      cart[index].quantity += quantity;
    } else {
      cart.push({ id, name, price, size, quantity, image });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof updateCartCount === "function") updateCartCount();
  }

  loadProduct();
});
