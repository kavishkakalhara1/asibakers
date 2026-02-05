import { connectToDatabase, initializeProducts } from './db.js';

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'asinirathnayake@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

// Simple token generation (in production, use JWT)
const generateToken = () => {
  return 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2);
};

// Token functions using MongoDB
async function saveToken(db, token) {
  const tokensCollection = db.collection('admin_tokens');
  // Clean up expired tokens
  await tokensCollection.deleteMany({ expiresAt: { $lt: new Date() } });
  // Save new token (valid for 24 hours)
  await tokensCollection.insertOne({
    token,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
}

async function validateToken(db, token) {
  const tokensCollection = db.collection('admin_tokens');
  const tokenDoc = await tokensCollection.findOne({
    token,
    expiresAt: { $gt: new Date() }
  });
  return !!tokenDoc;
}

async function removeToken(db, token) {
  const tokensCollection = db.collection('admin_tokens');
  await tokensCollection.deleteOne({ token });
}

export default async function handler(req, res) {
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

  try {
    const { db } = await connectToDatabase();

    // Login endpoint (no auth required)
    if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body;
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = generateToken();
        await saveToken(db, token);
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
    
    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }
    
    const isValidToken = await validateToken(db, token);
    if (!isValidToken) {
      res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
      return;
    }

    await initializeProducts(db);
    
    const productsCollection = db.collection('products');
    const ordersCollection = db.collection('orders');
    const contactsCollection = db.collection('contacts');

    // Logout
    if (action === 'logout' && req.method === 'POST') {
      await removeToken(db, token);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
      return;
    }

    // Get all products
    if (action === 'products' && req.method === 'GET') {
      const products = await productsCollection.find({}).toArray();
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
        offer: productData.offer || null,
        createdAt: new Date()
      };
      await productsCollection.insertOne(newProduct);
      res.status(201).json({ success: true, product: newProduct, message: 'Product added successfully' });
      return;
    }

    // Update product
    if (action === 'products' && req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      const result = await productsCollection.findOneAndUpdate(
        { id: parseInt(id) },
        { $set: { ...updateData, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      res.status(200).json({ success: true, product: result, message: 'Product updated successfully' });
      return;
    }

    // Delete product
    if (action === 'products' && req.method === 'DELETE') {
      const { id } = req.body;
      const result = await productsCollection.deleteOne({ id: parseInt(id) });
      
      if (result.deletedCount === 0) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
      return;
    }

    // Toggle special product
    if (action === 'toggle-special' && req.method === 'POST') {
      const { id } = req.body;
      const product = await productsCollection.findOne({ id: parseInt(id) });
      
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      const updatedProduct = await productsCollection.findOneAndUpdate(
        { id: parseInt(id) },
        { $set: { isSpecial: !product.isSpecial, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      
      res.status(200).json({ 
        success: true, 
        product: updatedProduct, 
        message: `Product ${updatedProduct.isSpecial ? 'marked as' : 'removed from'} special` 
      });
      return;
    }

    // Add/Update offer
    if (action === 'offer' && req.method === 'POST') {
      const { id, discount, label } = req.body;
      const product = await productsCollection.findOne({ id: parseInt(id) });
      
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      const offerData = discount > 0 ? { discount, label: label || `${discount}% OFF` } : null;
      const updatedProduct = await productsCollection.findOneAndUpdate(
        { id: parseInt(id) },
        { $set: { offer: offerData, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      
      res.status(200).json({ success: true, product: updatedProduct, message: 'Offer updated successfully' });
      return;
    }

    // Remove offer
    if (action === 'offer' && req.method === 'DELETE') {
      const { id } = req.body;
      const product = await productsCollection.findOne({ id: parseInt(id) });
      
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      const updatedProduct = await productsCollection.findOneAndUpdate(
        { id: parseInt(id) },
        { $set: { offer: null, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      
      res.status(200).json({ success: true, product: updatedProduct, message: 'Offer removed successfully' });
      return;
    }

    // Get orders
    if (action === 'orders' && req.method === 'GET') {
      const orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();
      res.status(200).json({ success: true, orders });
      return;
    }

    // Update order status
    if (action === 'orders' && req.method === 'PUT') {
      const { orderNumber, status } = req.body;
      const result = await ordersCollection.findOneAndUpdate(
        { orderNumber },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      
      res.status(200).json({ success: true, order: result, message: 'Order status updated' });
      return;
    }

    // Get contacts
    if (action === 'contacts' && req.method === 'GET') {
      const contacts = await contactsCollection.find({}).sort({ createdAt: -1 }).toArray();
      res.status(200).json({ success: true, contacts });
      return;
    }

    // Mark contact as read
    if (action === 'contacts' && req.method === 'PUT') {
      const { id, status } = req.body;
      const { ObjectId } = await import('mongodb');
      const result = await contactsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        res.status(404).json({ success: false, message: 'Contact not found' });
        return;
      }
      
      res.status(200).json({ success: true, contact: result, message: 'Contact updated' });
      return;
    }

    // Get dashboard stats
    if (action === 'stats' && req.method === 'GET') {
      const products = await productsCollection.find({}).toArray();
      const orders = await ordersCollection.find({}).toArray();
      const contacts = await contactsCollection.find({}).toArray();
      
      const totalProducts = products.length;
      const specialProducts = products.filter(p => p.isSpecial).length;
      const productsWithOffers = products.filter(p => p.offer).length;
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
      const totalContacts = contacts.length;
      const unreadContacts = contacts.filter(c => c.status === 'unread').length;
      
      // Calculate total revenue from completed orders
      const totalRevenue = orders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, order) => {
          if (order.items && Array.isArray(order.items)) {
            return sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
          }
          return sum;
        }, 0);
      
      res.status(200).json({ 
        success: true, 
        stats: {
          totalProducts,
          specialProducts,
          productsWithOffers,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalContacts,
          unreadContacts,
          totalRevenue
        }
      });
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid action' });
    
  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
