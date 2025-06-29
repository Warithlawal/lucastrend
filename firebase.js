// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD-Dv-EJr4feMo7yt72EX5QhfcetZ48_2I",
  authDomain: "lucastrend-ffe94.firebaseapp.com",
  projectId: "lucastrend-ffe94",
  storageBucket: "lucastrend-ffe94.firebasestorage.app",
  messagingSenderId: "417635138056",
  appId: "1:417635138056:web:e6724374c61c6e2c756fbd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Make Firestore available globally
window.db = db;
