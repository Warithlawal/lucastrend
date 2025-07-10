// Import the Firebase SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Your Firebase configuration (✅ yours is correct)
const firebaseConfig = {
  apiKey: "AIzaSyD3DTgFZWgT0J4gYhiyUon9v9qlVdxYHlM",
  authDomain: "lucastrend-f695b.firebaseapp.com",
  projectId: "lucastrend-f695b",
  storageBucket: "lucastrend-f695b.appspot.com", // 🔧 fix typo here
  messagingSenderId: "431451296314",
  appId: "1:431451296314:web:18f1bdd2624828b327db03",
  measurementId: "G-8CRRTDERQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Make Firestore globally available
window.db = db;
