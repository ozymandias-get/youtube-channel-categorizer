const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Session setup
app.use(session({
  secret: 'youtube-categorizer-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true for HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Database setup
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    access_token TEXT,
    refresh_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    channel_id TEXT NOT NULL,
    channel_title TEXT NOT NULL,
    channel_thumbnail TEXT,
    category_id INTEGER,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);
});

// Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    callbackURL: process.env.YOUTUBE_REDIRECT_URI
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = {
        google_id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        access_token: accessToken,
        refresh_token: refreshToken
      };

      db.run(
        `INSERT OR REPLACE INTO users (google_id, email, name, access_token, refresh_token) 
         VALUES (?, ?, ?, ?, ?)`,
        [user.google_id, user.email, user.name, user.access_token, user.refresh_token],
        function(err) {
          if (err) {
            console.error('Error saving user:', err);
            return done(err);
          }
          user.id = this.lastID;
          done(null, user);
        }
      );
    } catch (error) {
      done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.google_id);
});

passport.deserializeUser((google_id, done) => {
  db.get('SELECT * FROM users WHERE google_id = ?', [google_id], (err, user) => {
    done(err, user);
  });
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// OAuth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/?error=auth_failed' }),
  (req, res) => {
    res.redirect('/?authenticated=true');
  }
);

app.get('/api/user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

app.get('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Logged out' });
  });
});

// Get user's YouTube subscriptions
app.get('/api/youtube/subscriptions', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const subscriptions = [];
    let pageToken = '';

    // Fetch all subscriptions
    while (true) {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions', {
        params: {
          part: 'snippet',
          mine: true,
          maxResults: 50,
          pageToken: pageToken,
          access_token: req.user.access_token
        }
      });

      subscriptions.push(...response.data.items);

      if (!response.data.nextPageToken) break;
      pageToken = response.data.nextPageToken;
    }

    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Add subscription to category
app.post('/api/subscriptions/:channel_id/categorize', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { channel_id } = req.params;
  const { channel_title, channel_thumbnail, category_id } = req.body;

  db.run(
    `INSERT INTO subscriptions (user_id, channel_id, channel_title, channel_thumbnail, category_id)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, channel_id, channel_title, channel_thumbnail, category_id],
    function(err) {
      if (err) return res.status(400).json({ error: 'Subscription already categorized' });
      res.json({ id: this.lastID, channel_id, channel_title, category_id });
    }
  );
});

// Get categorized subscriptions
app.get('/api/subscriptions', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  db.all(
    `SELECT s.*, c.name as category_name FROM subscriptions s
     LEFT JOIN categories c ON s.category_id = c.id
     WHERE s.user_id = ?
     ORDER BY s.added_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows || []);
    }
  );
});

// Get subscriptions by category
app.get('/api/subscriptions/category/:category_id', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { category_id } = req.params;
  db.all(
    `SELECT * FROM subscriptions WHERE user_id = ? AND category_id = ?
     ORDER BY added_at DESC`,
    [req.user.id, category_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows || []);
    }
  );
});

// Categories management
app.post('/api/categories', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { name } = req.body;
  db.run(
    'INSERT INTO categories (user_id, name) VALUES (?, ?)',
    [req.user.id, name],
    function(err) {
      if (err) return res.status(400).json({ error: 'Category already exists' });
      res.json({ id: this.lastID, name });
    }
  );
});

app.get('/api/categories', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  db.all(
    'SELECT * FROM categories WHERE user_id = ? ORDER BY created_at',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows || []);
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`OAuth callback: ${process.env.YOUTUBE_REDIRECT_URI}`);
});

module.exports = app;
