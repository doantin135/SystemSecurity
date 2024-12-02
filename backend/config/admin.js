const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://console.firebase.google.com/u/0/project/login-cde1c/firestore/databases/-default-/data/~2F1~2Fmep9Fabh4tbVM8uYQbMF?fb_gclid=Cj0KCQiAgJa6BhCOARIsAMiL7V-l0nEeqe8ZM4vdNBoM0CoidCEe3YvsIj2CTLzAV6D1VZQdng93eZMaAtOPEALw_wcB'
});

// Firebase Client Config
const firebaseConfig = {
  apiKey: "AIzaSyB9Q3NFiFvwfkYxdFQgGn7krpae2Usrk-A",
  authDomain: "login-cde1c.firebaseapp.com",
  projectId: "login-cde1c",
  storageBucket: "login-cde1c.firebasestorage.app",
  messagingSenderId: "217566408039",
  appId: "1:217566408039:web:8db9c9eccf27afa82b93c2"
};

// Initialize Firebase Client App and Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = admin.firestore();

module.exports = { admin, auth, db };
