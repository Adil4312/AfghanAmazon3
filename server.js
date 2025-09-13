const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const port = process.env.PORT || 3000;

// Initialize database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    location TEXT
  )
`);

// Insert sample data
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (productCount.count === 0) {
  const insert = db.prepare('INSERT INTO products (name, price, category, location) VALUES (?, ?, ?, ?)');
  insert.run('Afghan Rug', 49.99, 'Home', 'Kabul');
  insert.run('Green Tea', 5.99, 'Grocery', 'Jalalabad');
  insert.run('Traditional Hat', 12.99, 'Clothing', 'Kandahar');
}

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// API routes
app.get('/api/products', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM products');
    const products = stmt.all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const stmt = db.prepare('SELECT DISTINCT category FROM products WHERE category IS NOT NULL');
    const categories = stmt.all().map(row => row.category);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/pashto.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pashto.html'));
});

// Handle all other routes - serve index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;