// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database' // ✅ Add this if using Realtime DB

const firebaseConfig = {
    apiKey: "AIzaSyB43BHj0kWeKl6oRhKPXmzk2mownbe3eUM",
    authDomain: "tapandplay-7b964.firebaseapp.com",
    databaseURL: "https://tapandplay-7b964-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tapandplay-7b964",
    storageBucket: "tapandplay-7b964.firebasestorage.app",
    messagingSenderId: "201759992414",
    appId: "1:201759992414:web:59953bc311be19a60a22cf",
    measurementId: "G-W041KDRDGX"
};

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)
const rtdb = getDatabase(app)

export { auth, db, rtdb }
