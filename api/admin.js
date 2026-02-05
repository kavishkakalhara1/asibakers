// Admin credentials (in production, use environment variables and proper hashing)
const ADMIN_EMAIL = 'asinirathnayake@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';

// In-memory storage (in production, use a database)
let products = [
  {
    id: 1,
    name: 'Strawberry Dream Cake',
    category: 'Fruit Cakes',
    price: 4500,
    description: 'Light and fluffy strawberry cake with fresh cream',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500',
    popular: true,
    isSpecial: false,
    offer: null
  },
  {
    id: 2,
    name: 'Rose Velvet Delight',
    category: 'Special Cakes',
    price: 5500,
    description: 'Elegant rose-flavored velvet cake with buttercream',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    popular: true,
    isSpecial: true,
    offer: null
  },
  {
    id: 3,
    name: 'Lavender Bliss',
    category: 'Special Cakes',
    price: 5000,
    description: 'Delicate lavender-infused cake with vanilla frosting',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e5b2e7c6?w=500',
    popular: false,
    isSpecial: false,
    offer: null
  },
  {
    id: 4,
    name: 'Pink Champagne',
    category: 'Special Cakes',
    price: 6000,
    description: 'Luxurious champagne cake with pink buttercream roses',
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500',
    popular: true,
    isSpecial: true,
    offer: { discount: 10, label: '10% OFF' }
  },
  {
    id: 5,
    name: 'Vanilla Cupcakes',
    category: 'Cupcakes',
    price: 2500,
    description: 'Set of 12 vanilla cupcakes with pastel frosting',
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500',
    popular: false,
    isSpecial: false,
    offer: null
  },
  {
    id: 6,
    name: 'Chocolate Truffle',
    category: 'Chocolate Cakes',
    price: 4800,
    description: 'Rich chocolate cake with truffle ganache',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    popular: false,
    isSpecial: false,
    offer: null
  },
  {
    id: 7,
    name: 'Lemon Blossom',
    category: 'Fruit Cakes',
    price: 4200,
    description: 'Zesty lemon cake with cream cheese frosting',
    image: 'https://images.unsplash.com/photo-1519915212116-715fb8c3d267?w=500',
    popular: false,
    isSpecial: false,
    offer: null
  },
  {
    id: 8,
    name: 'Unicorn Magic',
    category: 'Special Cakes',
    price: 6500,
    description: 'Colorful rainbow cake with magical unicorn decorations',
    image: 'https://images.unsplash.com/photo-1562440499-64c9a5d2d069?w=500',
    popular: true,
    isSpecial: true,
    offer: { discount: 15, label: '15% OFF' }
  }
];

let orders = [];

// Simple token generation (in production, use JWT)
const generateToken = () => {
  return 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2);
};

let activeTokens = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  // Login endpoint
  if (action === 'login' && req.method === 'POST') {
    const { email, password } = req.body;
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = generateToken();
      activeTokens.push(token);
      res.status(200).json({ 
        success: true, 
        token,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials'
      });
    }
    return;
  }

  // Verify token for protected routes
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token || !activeTokens.includes(token)) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  // Logout
  if (action === 'logout' && req.method === 'POST') {
    activeTokens = activeTokens.filter(t => t !== token);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
    return;
  }

  // Get all products
  if (action === 'products' && req.method === 'GET') {
    res.status(200).json({ success: true, products });
    return;
  }

  // Add product
  if (action === 'products' && req.method === 'POST') {
    const productData = req.body;
    const newProduct = {
      id: Date.now(),
      ...productData,
      popular: productData.popular || false,
      isSpecial: productData.isSpecial || false,
      offer: productData.offer || null
    };
    products.push(newProduct);
    res.status(201).json({ success: true, product: newProduct, message: 'Product added successfully' });
    return;
  }

  // Update product
  if (action === 'products' && req.method === 'PUT') {
    const { id, ...updateData } = req.body;
    const index = products.findIndex(p => p.id === parseInt(id));
    
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    
    products[index] = { ...products[index], ...updateData };
    res.status(200).json({ success: true, product: products[index], message: 'Product updated successfully' });
    return;
  }

  // Delete product
  if (action === 'products' && req.method === 'DELETE') {
    const { id } = req.body;
    const index = products.findIndex(p => p.id === parseInt(id));
    
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    
    products.splice(index, 1);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
    return;
  }

  // Toggle special product
  if (action === 'toggle-special' && req.method === 'POST') {
    const { id } = req.body;
    const product = products.find(p => p.id === parseInt(id));
    
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    
    product.isSpecial = !product.isSpecial;
    res.status(200).json({ success: true, product, message: `Product ${product.isSpecial ? 'marked as' : 'removed from'} special` });
    return;
  }

  // Add/Update offer
  if (action === 'offer' && req.method === 'POST') {
    const { id, discount, label } = req.body;
    const product = products.find(p => p.id === parseInt(id));
    
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    
    product.offer = discount > 0 ? { discount, label: label || `${discount}% OFF` } : null;
    res.status(200).json({ success: true, product, message: 'Offer updated successfully' });
    return;
  }

  // Remove offer
  if (action === 'offer' && req.method === 'DELETE') {
    const { id } = req.body;
    const product = products.find(p => p.id === parseInt(id));
    
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    
    product.offer = null;
    res.status(200).json({ success: true, product, message: 'Offer removed successfully' });
    return;
  }

  // Get orders
  if (action === 'orders' && req.method === 'GET') {
    res.status(200).json({ success: true, orders });
    return;
  }

  // Add order (called from order endpoint)
  if (action === 'add-order' && req.method === 'POST') {
    const orderData = req.body;
    orders.unshift(orderData);
    res.status(201).json({ success: true, order: orderData });
    return;
  }

  // Update order status
  if (action === 'orders' && req.method === 'PUT') {
    const { orderNumber, status } = req.body;
    const order = orders.find(o => o.orderNumber === orderNumber);
    
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    
    order.status = status;
    res.status(200).json({ success: true, order, message: 'Order status updated' });
    return;
  }

  // Get dashboard stats
  if (action === 'stats' && req.method === 'GET') {
    const totalProducts = products.length;
    const specialProducts = products.filter(p => p.isSpecial).length;
    const productsWithOffers = products.filter(p => p.offer).length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    res.status(200).json({ 
      success: true, 
      stats: {
        totalProducts,
        specialProducts,
        productsWithOffers,
        totalOrders,
        pendingOrders,
        completedOrders
      }
    });
    return;
  }

  res.status(400).json({ success: false, message: 'Invalid action' });
}
