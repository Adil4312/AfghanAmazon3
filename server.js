const express = require('express');
const path = require('path');
const app = express();

// Mock data instead of database
const products = [
  { id: 1, name: 'Afghan Rug', price: 49.99, category: 'Home', location: 'Kabul' },
  { id: 2, name: 'Green Tea', price: 5.99, category: 'Grocery', location: 'Jalalabad' }
];

app.use(express.static('public'));

app.get('/api/products', (req, res) => res.json(products));
app.get('/api/categories', (req, res) => res.json(['Grocery', 'Home']));
app.get('/api/cities', (req, res) => res.json(['Jalalabad', 'Kabul']));
app.get('/api/branches', (req, res) => res.json([{ id: 1, name: 'Main Branch', city: 'Kabul' }]));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/pashto.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pashto.html')));
app.get('/styles.css', (req, res) => res.sendFile(path.join(__dirname, 'public', 'styles.css')));
app.get('/script.js', (req, res) => res.sendFile(path.join(__dirname, 'public', 'script.js')));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

module.exports = app;