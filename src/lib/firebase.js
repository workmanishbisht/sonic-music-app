import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBUSubozua7pu5MtMiZoQlvi7KPDine0XI",
    authDomain: "sonic-7cb72.firebaseapp.com",
    databaseURL: "https://sonic-7cb72-default-rtdb.firebaseio.com",
    projectId: "sonic-7cb72",
    storageBucket: "sonic-7cb72.firebasestorage.app",
    messagingSenderId: "210663855450",
    appId: "1:210663855450:web:1bda7b92f075e4db0f63",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;