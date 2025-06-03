// src/firebase.js

// Firebase App (the core Firebase SDK)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔧 BURAYA kendi config bilgilerini koy
const firebaseConfig = {
  apiKey: "AIzaSyCqOLW3AkFEWIZ_brE3iFhcnDPKWtO9E6c",
  authDomain: "mesai-takip-lego.firebaseapp.com",
  projectId: "mesai-takip-lego",
  storageBucket: "mesai-takip-lego.firebasestorage.app",
  messagingSenderId: "908749487983",
  appId: "1:908749487983:web:2b711f26deabdfc88cf29a",
  measurementId: "G-DE25RR33JB"
};

// Uygulamayı başlat
const app = initializeApp(firebaseConfig);

// Firestore bağlantısını al
const db = getFirestore(app);

// db'yi export et
export { db };
