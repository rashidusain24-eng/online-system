const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ Error:', err));

// -------------------
// Schemas & Models
// -------------------
// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Data Schema (linked to user)
const dataSchema = new mongoose.Schema({
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
const Data = mongoose.model('Data', dataSchema);

// -------------------
// Middleware to Verify Login
// -------------------
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token, login required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// -------------------
// Auth Routes
// -------------------
// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.json({ success: false, message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.json({ success: true, message: 'Registration successful' });
  } catch (err) {
    res.json({ success: false, message: 'Error: ' + err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.json({ success: false, message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: 'Wrong password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, username: user.username });
  } catch (err) {
    res.json({ success: false, message: 'Error: ' + err.message });
  }
});

// -------------------
// Data Routes (Protected)
// -------------------
// Save data
app.post('/api/save', authenticate, async (req, res) => {
  try {
    const newData = new Data({ content: req.body.content, userId: req.userId });
    await newData.save();
    res.json({ success: true, message: 'Saved!' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Get user's data only
app.get('/api/data', authenticate, async (req, res) => {
  try {
    const allData = await Data.find({ userId: req.userId }).sort({ _id: -1 });
    res.json(allData);
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 System running at http://localhost:${port}`);
});