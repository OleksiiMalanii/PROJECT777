// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore' // <-- Add this

const firebaseConfig = {
    apiKey: "AIzaSyB43BHj0kWeKl6oRhKPXmzk2mownbe3eUM",
    authDomain: "tapandplay-7b964.firebaseapp.com",
    projectId: "tapandplay-7b964",
    storageBucket: "tapandplay-7b964.firebasestorage.app", // <- fix: `.app` -> `.appspot.com`
    messagingSenderId: "201759992414",
    appId: "1:201759992414:web:59953bc311be19a60a22cf",
    measurementId: "G-W041KDRDGX"
}

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app) // <-- Add this

export { auth, db } // <-- Export both
