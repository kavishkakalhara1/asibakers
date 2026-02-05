const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Sample products data
const products = [
  {
    id: 1,
    name: 'Strawberry Dream Cake',
    category: 'Fruit Cakes',
    price: 45,
    description: 'Light and fluffy strawberry cake with fresh cream',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500',
    popular: true
  },
  {
    id: 2,
    name: 'Rose Velvet Delight',
    category: 'Special Cakes',
    price: 55,
    description: 'Elegant rose-flavored velvet cake with buttercream',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    popular: true
  },
  {
    id: 3,
    name: 'Lavender Bliss',
    category: 'Special Cakes',
    price: 50,
    description: 'Delicate lavender-infused cake with vanilla frosting',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e5b2e7c6?w=500',
    popular: false
  },
  {
    id: 4,
    name: 'Pink Champagne',
    category: 'Special Cakes',
    price: 60,
    description: 'Luxurious champagne cake with pink buttercream roses',
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500',
    popular: true
  },
  {
    id: 5,
    name: 'Vanilla Cupcakes',
    category: 'Cupcakes',
    price: 25,
    description: 'Set of 12 vanilla cupcakes with pastel frosting',
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500',
    popular: false
  },
  {
    id: 6,
    name: 'Chocolate Truffle',
    category: 'Chocolate Cakes',
    price: 48,
    description: 'Rich chocolate cake with truffle ganache',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    popular: false
  },
  {
    id: 7,
    name: 'Lemon Blossom',
    category: 'Fruit Cakes',
    price: 42,
    description: 'Zesty lemon cake with cream cheese frosting',
    image: 'https://images.unsplash.com/photo-1519915212116-715fb8c3d267?w=500',
    popular: false
  },
  {
    id: 8,
    name: 'Unicorn Magic',
    category: 'Special Cakes',
    price: 65,
    description: 'Colorful rainbow cake with magical unicorn decorations',
    image: 'https://images.unsplash.com/photo-1562440499-64c9a5d2d069?w=500',
    popular: true
  }
];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Endpoints
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('Contact form submission:', { name, email, message });
  // In a real application, you would send an email or save to database
  res.json({ success: true, message: 'Thank you for contacting us! We will get back to you soon.' });
});

app.post('/api/order', (req, res) => {
  const { name, email, phone, product, message, date } = req.body;
  console.log('Order received:', { name, email, phone, product, message, date });
  // In a real application, you would save this to a database
  res.json({ success: true, message: 'Your order has been received! We will contact you shortly.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎂 AsiBakers server running on http://localhost:${PORT}`);
});
