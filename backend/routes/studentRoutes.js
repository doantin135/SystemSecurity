const express = require('express');
const { db } = require('../config/admin');

const router = express.Router();

router.get('/show', async (req, res) => {
  const cRef = db.collection('student');
  try {
    cRef.get().then((snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("get thanh cong");
      console.log(items);
      res.status(201).json(items);
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.put('/update/:id', async (req, res) => {
  const itemId = req.params.id;
  const { name } = req.body;
  try {
    const itemRef = db.collection('student').doc(itemId);
    const doc = await itemRef.get();
    if (!doc.exists) {
      return res.status(404).json({ status: 'error', message: 'Item not found' });
    }
    await itemRef.update({ name: name });
    const updatedDoc = await itemRef.get();
    const updatedItem = updatedDoc.data();
    res.status(200).send({
      status: 'success',
      message: 'Name updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/add', async (req, res) => {
  const { name, phone, major } = req.body;
  try {
    const c = db.collection('student').doc();
    const item = {
      id: c.id,
      name: name,
      phone: phone,
      major: major
    };
    console.log('add done', item);
    c.set(item);
    res.status(200).send({
      status: 'success',
      message: 'Item added successfully',
      data: item,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const response = await db.collection("student").doc(req.params.id).delete();
    res.send(response);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;