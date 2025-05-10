import { initializeApp } from 'firebase/app'
import { getAuth }          from 'firebase/auth'
import { getFirestore }     from 'firebase/firestore'

const firebaseConfig = {

    apiKey: "AIzaSyBmB_L3GPBzjSjeR87AnJyUs0iVYrF-KCo",
    authDomain: "mini-games-1350b.firebaseapp.com",
    projectId: "mini-games-1350b",
    storageBucket: "mini-games-1350b.firebasestorage.app",
    messagingSenderId: "592068717469",
    appId: "1:592068717469:web:df91f931503fb5b73ddd74",
    measurementId: "G-X5G4SW1H1Y"
};


const app  = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db   = getFirestore(app)

export { auth, db }
