// cart.js

function formatCurrency(n) {
  return `₦${Number(n).toLocaleString()}`;
}

function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cart-container");
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    updateCartCount();
    return;
  }

  cart.forEach((item, index) => {
    const total = item.quantity * item.price;

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

  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  document.querySelector(".subtotal-price").textContent = formatCurrency(subtotal);
  attachCartEvents();
}

function attachCartEvents() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  document.querySelectorAll(".increase").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      cart[index].quantity++;
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      loadCart();
    });
  });

  document.querySelectorAll(".decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        loadCart();
      }
    });
  });

  document.querySelectorAll(".fa-trash").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      loadCart();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  if (typeof updateCartCount === "function") updateCartCount();
});


document.getElementById("checkout-link")?.addEventListener("click", function (e) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    e.preventDefault();
    showToast("Please select an item before proceeding to checkout.");
  }
});

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000); // Hide after 3 seconds
}

