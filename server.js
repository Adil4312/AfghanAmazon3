const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Simple in-memory data storage
let products = [
  { id: 1, name: 'Afghan Rug', price: 49.99, category: 'Home', location: 'Kabul' },
  { id: 2, name: 'Green Tea', price: 5.99, category: 'Grocery', location: 'Jalalabad' },
  { id: 3, name: 'Traditional Hat', price: 12.99, category: 'Clothing', location: 'Kandahar' },
  { id: 4, name: 'Handcrafted Jewelry', price: 24.99, category: 'Accessories', location: 'Herat' },
  { id: 5, name: 'Dried Fruits', price: 8.99, category: 'Grocery', location: 'Balkh' }
];

let branches = [
  { id: 1, name: 'Kabul Central', city: 'Kabul', address: 'Street 1, District 1' },
  { id: 2, name: 'Kabul North', city: 'Kabul', address: 'Street 2, District 2' },
  { id: 3, name: 'Jalalabad Branch 1', city: 'Jalalabad', address: 'Main Street 1' },
  { id: 4, name: 'Kandahar Branch 1', city: 'Kandahar', address: 'Main Street 1' },
  { id: 5, name: 'Herat Branch 1', city: 'Herat', address: 'Main Street 1' },
  { id: 6, name: 'Balkh Branch 1', city: 'Balkh', address: 'Main Street 1' }
];

// API Routes
app.get('/api/products', (req, res) => {
  try {
    const { city, category } = req.query;
    let filteredProducts = products;
    
    if (city && city !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.location === city);
    }
    
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    res.json(filteredProducts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const categories = [...new Set(products.map(p => p.category))];
    res.json(categories.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/cities', (req, res) => {
  try {
    const cities = [...new Set(branches.map(b => b.city))];
    res.json(cities.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/branches', (req, res) => {
  try {
    const { city } = req.query;
    let filteredBranches = branches;
    
    if (city && city !== 'all') {
      filteredBranches = filteredBranches.filter(b => b.city === city);
    }
    
    res.json(filteredBranches);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
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

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the app
module.exports = app;