const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('database.db', { verbose: console.log });

// Create tables with sample data
db.exec(`
  CREATE TABLE IF NOT EXISTS cities (
    name TEXT PRIMARY KEY
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT,
    FOREIGN KEY (city) REFERENCES cities(name)
  )
`);
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
const cityCount = db.prepare('SELECT COUNT(*) as count FROM cities').get().count;
if (cityCount === 0) {
  const insertCity = db.prepare('INSERT INTO cities (name) VALUES (?)');
  ['Jalalabad', 'Kabul', 'Kandahar', 'Herat', 'Balkh'].forEach(city => insertCity.run(city));
}
const branchCount = db.prepare('SELECT COUNT(*) as count FROM branches').get().count;
if (branchCount === 0) {
  const insertBranch = db.prepare('INSERT INTO branches (name, city) VALUES (?, ?)');
  insertBranch.run('Main Branch', 'Kabul');
  insertBranch.run('Central Branch', 'Jalalabad');
}
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
if (productCount === 0) {
  const insertProduct = db.prepare('INSERT INTO products (name, price, category, location) VALUES (?, ?, ?, ?)');
  insertProduct.run('Afghan Rug', 49.99, 'Home', 'Kabul');
  insertProduct.run('Green Tea', 5.99, 'Grocery', 'Jalalabad');
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/cities', (req, res) => {
  try {
    const stmt = db.prepare('SELECT name FROM cities');
    const cities = stmt.all().map(row => row.name);
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/branches', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM branches');
    const branches = stmt.all();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// Serve CSS and JS files explicitly (redundant with static serving, but kept for clarity)
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'styles.css'));
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;