const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY,
    channel_id TEXT UNIQUE NOT NULL,
    channel_name TEXT NOT NULL,
    category_id INTEGER,
    user_email TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Add category
app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  db.run('INSERT INTO categories (name) VALUES (?)', [name], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.json({ id: this.lastID, name });
  });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY created_at', (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows || []);
  });
});

// Add channel to category
app.post('/api/channels', (req, res) => {
  const { channel_id, channel_name, category_id, user_email } = req.body;
  db.run(
    'INSERT INTO channels (channel_id, channel_name, category_id, user_email) VALUES (?, ?, ?, ?)',
    [channel_id, channel_name, category_id, user_email],
    function(err) {
      if (err) return res.status(400).json({ error: 'Channel already exists' });
      res.json({ id: this.lastID, channel_id, channel_name, category_id });
    }
  );
});

// Get channels by category
app.get('/api/channels/:category_id', (req, res) => {
  const { category_id } = req.params;
  db.all(
    'SELECT * FROM channels WHERE category_id = ? ORDER BY added_at DESC',
    [category_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows || []);
    }
  );
});

// Get all channels
app.get('/api/all-channels', (req, res) => {
  db.all(
    `SELECT c.*, cat.name as category_name FROM channels c
     LEFT JOIN categories cat ON c.category_id = cat.id
     ORDER BY c.added_at DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows || []);
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
