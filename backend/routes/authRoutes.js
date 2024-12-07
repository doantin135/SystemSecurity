const express = require('express');
const { admin, auth, encryptPassword, publicKey, privateKey } = require('../config/admin');
const jwt = require('jsonwebtoken');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

const router = express.Router();

const SECRET_KEY = 'hsuuniversity';

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const encryptedPassword = encryptPassword(password);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await admin.auth().updateUser(user.uid, { displayName: name });
    await admin.firestore().collection('Users').doc(user.uid).set({
      email: email,
      name: name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      photo: '',
      encryptedPassword: encryptedPassword,
    });

    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        uid: user.uid,
        email: user.email,
        name: name
      }
    });

  } catch (error) {
    if (error.code && user) {
      await admin.auth().deleteUser(user.uid);
    }
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await admin.firestore().collection('Users').doc(user.uid).get();
    const encryptedPassword = userDoc.data().encryptedPassword;

    const token = jwt.sign({ uid: user.uid, email: user.email }, SECRET_KEY, { expiresIn: '2h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/google-login', async (req, res) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decodedToken.uid);

    const userDoc = await admin.firestore()
      .collection('Users')
      .doc(user.uid)
      .get();

    if (!userDoc.exists) {
      await admin.firestore().collection('Users').doc(user.uid).set({
        email: user.email,
        name: user.displayName || '',
        photo: user.photoURL || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        authProvider: 'google',
      });
    }

    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL
      }
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await auth.signOut();
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
};

router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Profile data', user: req.user });
});

module.exports = router;