// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-S2FT3LKvChkKe6Yvqcm24P2pDGwWQX4",
  authDomain: "sf25-tenmon.firebaseapp.com",
  projectId: "sf25-tenmon",
  storageBucket: "sf25-tenmon.firebasestorage.app",
  messagingSenderId: "849951922230",
  appId: "1:849951922230:web:1d30292956eebecb102097",
  databaseURL: "https://sf25-tenmon-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
