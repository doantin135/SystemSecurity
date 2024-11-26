var express = require('express');
var app = express();
var cors = require('cors');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());
app.listen(8888, function(){
  console.log("Server is running on port ${PORT}...");
});

//Firebase
const { db } = require('./config/admin');
//show het cac student
app.get("/shown", async (req, res) => {
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


  //update name base on id
  app.put('/update/:id', async (req, res) => {
  const itemId = req.params.id;
  const { name } = req.body;
  try {
    // Get the document reference for the provided ID
    const itemRef = db.collection('student').doc(itemId);
    // Check if the document exists
    const doc = await itemRef.get();
    if (!doc.exists) {
      return res.status(404).json({ status: 'error', message: 'Item not found' });
    }
    // Perform the update
    await itemRef.update({ name: name });
    // Fetch the updated item to include in the response
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


//add more student with default field 
app.post('/add', async (req, res) => {
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
      message: 'item added successfully',
      data: item,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//delete
app.delete('/delete/:id', async (req, res) => {
  try {
      const response = await db.collection("student").doc(req.params.id).delete();
      res.send(response);
  } catch(error) {
      res.send(error);
  }
})