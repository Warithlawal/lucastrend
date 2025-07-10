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
  const productImage = document.getElementById("product-image");
  const thumbnailGallery = document.getElementById("thumbnail-gallery");
  const pageLoader = document.getElementById("page-loader");

  let selectedSize = null;
  let quantity = 1;

  addToCartBtn.disabled = true;
  addToCartBtn.style.opacity = 0.6;

  async function loadProduct() {
    if (!productId) return;

    pageLoader.style.display = "flex"; // Show loader

    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      document.querySelector(".product-page-details").innerHTML = "<p>Product not found.</p>";
      pageLoader.style.display = "none";
      return;
    }

    const product = docSnap.data();

    // ✅ Preload main image and show loader until ready
    const tempImage = new Image();
    tempImage.src = product.image;

    tempImage.onload = () => {
      productImage.src = product.image;
      productImage.alt = product.name;
      pageLoader.style.display = "none";
    };

    // ✅ Thumbnail logic
    if (product.images && Array.isArray(product.images)) {
      thumbnailGallery.innerHTML = "";

      product.images.forEach((imgUrl, index) => {
        const thumb = document.createElement("img");
        thumb.src = imgUrl;
        thumb.alt = `Thumbnail ${index + 1}`;
        thumb.classList.add("thumbnail");
        if (index === 0) thumb.classList.add("active");

        thumb.addEventListener("click", () => {
          pageLoader.style.display = "flex";

          const newImage = new Image();
          newImage.src = imgUrl;

          newImage.onload = () => {
            productImage.src = imgUrl;
            pageLoader.style.display = "none";

            document.querySelectorAll(".thumbnail").forEach(img => img.classList.remove("active"));
            thumb.classList.add("active");
          };
        });

        thumbnailGallery.appendChild(thumb);
      });
    }

    // ✅ Product info
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-breadcrumb").textContent = product.name;
    document.getElementById("product-price").textContent = `₦${Number(product.price).toLocaleString()}`;

    // ✅ Sizes
    const sizeOptions = document.getElementById("size-options");
    sizeOptions.innerHTML = "";
    (product.sizes || []).forEach(size => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" data-size="${size}">${size}</a>`;
      sizeOptions.appendChild(li);
    });

    setupSizeSelection();

    // ✅ Add to Cart
    addToCartBtn.addEventListener("click", () => {
      if (!selectedSize) {
        selectSizeMsg.style.display = "inline";
        addedText.style.display = "none";
        setTimeout(() => {
          selectSizeMsg.style.display = "none";
        }, 2000);
        return;
      }

      addToCart(productId, product.name, product.price, selectedSize, quantity, productImage.src);
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
