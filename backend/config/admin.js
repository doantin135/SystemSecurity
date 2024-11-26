const admin = require('firebase-admin');

const serviceAccount = require('../login-cde1c-firebase-adminsdk-ffils-c881020eb1.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://console.firebase.google.com/u/0/project/login-cde1c/firestore/databases/-default-/data/~2F1~2Fmep9Fabh4tbVM8uYQbMF?fb_gclid=Cj0KCQiAgJa6BhCOARIsAMiL7V-l0nEeqe8ZM4vdNBoM0CoidCEe3YvsIj2CTLzAV6D1VZQdng93eZMaAtOPEALw_wcB'
});

const db = admin.firestore();

module.exports = { db };