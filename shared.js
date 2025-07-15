function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartNumber = document.querySelector(".cart-number");
  if (cartNumber) {
    if (totalItems > 0) {
      cartNumber.textContent = totalItems;
      cartNumber.style.display = "block";
    } else {
      cartNumber.textContent = "0";
      cartNumber.style.display = "none";
    }
  }
}

// Run automatically on all pages where this script is loaded
document.addEventListener("DOMContentLoaded", updateCartCount);

