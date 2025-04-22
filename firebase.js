// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZ_ffT5PXmyVNG8rWEstKy64oY2YG1_ec",
  authDomain: "tfgs-60078.firebaseapp.com",
  projectId: "tfgs-60078",
  storageBucket: "tfgs-60078.firebasestorage.app",
  messagingSenderId: "807659600665",
  appId: "1:807659600665:web:a01f452b60e411fa0aa388",
  measurementId: "G-JE2TRHCE19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
