const express = require('express');
const { admin, auth } = require('../config/admin');
const jwt = require('jsonwebtoken');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

const router = express.Router();

// SECRET_KEY cho JWT
const SECRET_KEY = 'hsuuniversity'; // Đảm bảo SECRET_KEY của bạn là bí mật và an toàn.

// Register with Email & Password
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Tạo tài khoản người dùng Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optional: Cập nhật thông tin tên người dùng
    await admin.auth().updateUser(user.uid, { displayName: name });

    // Tạo JWT token
    const token = jwt.sign({ uid: user.uid, email: user.email }, SECRET_KEY, { expiresIn: '2h' });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login with Email & Password
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Đăng nhập vào Firebase và lấy thông tin người dùng
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Tạo JWT token
    const token = jwt.sign({ uid: user.uid, email: user.email }, SECRET_KEY, { expiresIn: '2h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Google Login
router.post('/google-login', async (req, res) => {
  const { idToken } = req.body; // Token từ phía client (Google)

  try {
    // Xác thực ID token từ Google
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decodedToken.uid);

    // Tạo JWT token sau khi xác thực Google
    const token = jwt.sign({ uid: user.uid, email: user.email }, SECRET_KEY, { expiresIn: '2h' });

    res.status(200).json({ message: 'Google login successful', token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Logout (handled client-side)
router.post('/logout', async (req, res) => {
  try {
    await auth.signOut();
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Middleware để xác thực JWT trong các route bảo vệ
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded; // Lưu thông tin người dùng vào request
    next(); // Tiến hành xử lý tiếp theo
  });
};

// Ví dụ route bảo vệ
router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Profile data', user: req.user });
});

module.exports = router;