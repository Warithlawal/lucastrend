function formatCurrency(n) {
  return `₦${Number(n).toLocaleString()}`;
}

function renderCheckoutSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("checkout-summary");
  container.innerHTML = "<h2>Your Items</h2>";

  let subtotal = 0;

  cart.forEach(item => {
    const total = item.price * item.quantity;
    subtotal += total;

    const itemDiv = document.createElement("div");
    itemDiv.className = "checkout-item";

    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <p><strong>${item.name}</strong></p>
        <p>Qty: ${item.quantity}</p>
        <p>Size: ${item.size}</p>
        <p>${formatCurrency(total)}</p>
      </div>
    `;

    container.appendChild(itemDiv);
  });

  container.setAttribute("data-subtotal", subtotal);
}

function updateFinalTotal() {
  const state = document.getElementById("user-state").value;
  const subtotal = Number(document.getElementById("checkout-summary").dataset.subtotal) || 0;
  let shipping = 0;

  if (state === "Lagos") shipping = 2000;
  else if (state === "Abuja") shipping = 2500;
  else if (state === "Others") shipping = 3000;

  const final = subtotal + shipping;
  document.getElementById("final-total").textContent = `Total: ${formatCurrency(final)}`;
  return final;
}

document.getElementById("user-state").addEventListener("change", updateFinalTotal);

document.getElementById("checkout-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("user-name").value;
  const email = document.getElementById("user-email").value;
  const phone = document.getElementById("user-phone").value;
  const address = document.getElementById("user-address").value;
  const state = document.getElementById("user-state").value;

  if (!name || !email || !phone || !address || !state) {
    alert("Please fill in all fields.");
    return;
  }

  const amount = updateFinalTotal();

  const handler = PaystackPop.setup({
    key: 'your-public-key-here',
    email,
    amount: amount * 100,
    currency: "NGN",
    metadata: {
      custom_fields: [
        { display_name: "Name", value: name },
        { display_name: "Phone", value: phone },
        { display_name: "Address", value: address },
        { display_name: "State", value: state }
      ]
    },
    callback: function(response) {
      alert("Payment successful! Ref: " + response.reference);
      localStorage.removeItem("cart");
      window.location.href = "success.html";
    },
    onClose: function() {
      alert("Transaction cancelled.");
    }
  });

  handler.openIframe();
});

document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutSummary();
});
