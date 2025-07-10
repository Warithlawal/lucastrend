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
    updateCartCount(); // 🔄 Ensure badge resets to 0
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
      updateCartCount(); // 🔥 Added here
      loadCart();
    });
  });

  document.querySelectorAll(".decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount(); // 🔥 Added here
        loadCart();
      }
    });
  });

  document.querySelectorAll(".fa-trash").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount(); // 🔥 Added here
      loadCart();
    });
  });
}

document.getElementById("whatsapp-checkout").addEventListener("click", (e) => {
  e.preventDefault();

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  let message = "*New Order*\n\n";

  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.quantity * item.price;
    total += itemTotal;

    message += `${index + 1}. *${item.name}*\n`;
    message += `   Size: ${item.size}\n`;
    message += `   Qty: ${item.quantity}\n`;
    message += `   Price: ₦${item.price.toLocaleString()}\n`;
    message += `   Subtotal: ₦${itemTotal.toLocaleString()}\n\n`;
  });

  message += `*Total: ₦${total.toLocaleString()}*`;

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);

  // Replace with your business WhatsApp number (with country code, no + or spaces)
  const phoneNumber = "2347018527982";

  // Build the WhatsApp URL
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  // Open WhatsApp
  window.open(whatsappUrl, "_blank");
});


document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  if (typeof updateCartCount === "function") updateCartCount(); // from shared.js
});
