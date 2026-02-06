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
    const reviewsCollection = db.collection('reviews');
    const popupCollection = db.collection('popup');

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

    // Delete order
    if (action === 'orders' && req.method === 'DELETE') {
      const { orderNumber } = req.body;
      const result = await ordersCollection.deleteOne({ orderNumber });
      
      if (result.deletedCount === 0) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Order deleted successfully' });
      return;
    }

    // Add note to order
    if (action === 'order-note' && req.method === 'POST') {
      const { orderNumber, note } = req.body;
      
      if (!orderNumber || !note) {
        res.status(400).json({ success: false, message: 'Order number and note are required' });
        return;
      }
      
      const result = await ordersCollection.findOneAndUpdate(
        { orderNumber },
        { 
          $push: { notes: { text: note, date: new Date().toISOString() } },
          $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      
      res.status(200).json({ success: true, order: result, message: 'Note added' });
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

    // Get all reviews (admin - includes hidden)
    if (action === 'reviews' && req.method === 'GET') {
      const reviews = await reviewsCollection.find({}).sort({ createdAt: -1 }).toArray();
      res.status(200).json({ success: true, reviews });
      return;
    }

    // Toggle review visibility
    if (action === 'reviews' && req.method === 'PUT') {
      const { id } = req.body;
      const { ObjectId } = await import('mongodb');
      const review = await reviewsCollection.findOne({ _id: new ObjectId(id) });
      
      if (!review) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }
      
      const updatedReview = await reviewsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { hidden: !review.hidden, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      
      res.status(200).json({ 
        success: true, 
        review: updatedReview, 
        message: `Review ${updatedReview.hidden ? 'hidden' : 'visible'}` 
      });
      return;
    }

    // Delete review
    if (action === 'reviews' && req.method === 'DELETE') {
      const { id } = req.body;
      const { ObjectId } = await import('mongodb');
      const result = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Review deleted successfully' });
      return;
    }

    // Get popup settings
    if (action === 'popup' && req.method === 'GET') {
      const popup = await popupCollection.findOne({});
      res.status(200).json({ success: true, popup: popup || null });
      return;
    }

    // Save/update popup
    if (action === 'popup' && req.method === 'POST') {
      const { type, content, active } = req.body;

      if (!type || !content) {
        res.status(400).json({ success: false, message: 'Type and content are required' });
        return;
      }

      // Remove existing popup and insert new one (only one popup at a time)
      await popupCollection.deleteMany({});
      const popupData = {
        type, // 'image' or 'html'
        content, // image URL or HTML string
        active: active !== undefined ? active : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await popupCollection.insertOne(popupData);

      res.status(200).json({ success: true, popup: popupData, message: 'Popup saved successfully' });
      return;
    }

    // Toggle popup active status
    if (action === 'popup' && req.method === 'PUT') {
      const popup = await popupCollection.findOne({});
      if (!popup) {
        res.status(404).json({ success: false, message: 'No popup configured' });
        return;
      }

      const updated = await popupCollection.findOneAndUpdate(
        { _id: popup._id },
        { $set: { active: !popup.active, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

      res.status(200).json({
        success: true,
        popup: updated,
        message: `Popup ${updated.active ? 'activated' : 'deactivated'}`
      });
      return;
    }

    // Delete popup
    if (action === 'popup' && req.method === 'DELETE') {
      await popupCollection.deleteMany({});
      res.status(200).json({ success: true, message: 'Popup deleted successfully' });
      return;
    }

    // Get transactions / financial data
    if (action === 'transactions' && req.method === 'GET') {
      const orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();
      const expensesCollection = db.collection('expenses');
      const expenses = await expensesCollection.find({}).sort({ date: -1 }).toArray();

      // Build transaction list from orders
      const transactions = orders.map(order => {
        const total = order.payment?.total || (order.items && Array.isArray(order.items)
          ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0);
        return {
          _id: order._id,
          type: 'income',
          category: 'Order',
          description: `Order #${order.orderNumber}`,
          amount: total,
          status: order.status || 'pending',
          date: order.createdAt || order.timestamp,
          orderNumber: order.orderNumber,
          customer: order.customer?.name || order.name || 'N/A',
          paymentMethod: order.payment?.method || 'cash',
          items: order.items || []
        };
      });

      // Add expenses to transactions
      const expenseTransactions = expenses.map(exp => ({
        _id: exp._id,
        type: 'expense',
        category: exp.category || 'General',
        description: exp.description,
        amount: exp.amount,
        status: 'completed',
        date: exp.date,
        paymentMethod: exp.paymentMethod || 'cash',
        note: exp.note || ''
      }));

      const allTransactions = [...transactions, ...expenseTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      res.status(200).json({ success: true, transactions: allTransactions, expenses });
      return;
    }

    // Add expense
    if (action === 'expenses' && req.method === 'POST') {
      const expensesCollection = db.collection('expenses');
      const { description, amount, category, date, paymentMethod, note } = req.body;

      if (!description || !amount) {
        res.status(400).json({ success: false, message: 'Description and amount are required' });
        return;
      }

      const expense = {
        description,
        amount: parseFloat(amount),
        category: category || 'General',
        date: date || new Date().toISOString(),
        paymentMethod: paymentMethod || 'cash',
        note: note || '',
        createdAt: new Date()
      };

      await expensesCollection.insertOne(expense);
      res.status(201).json({ success: true, expense, message: 'Expense added successfully' });
      return;
    }

    // Delete expense
    if (action === 'expenses' && req.method === 'DELETE') {
      const { id } = req.body;
      const { ObjectId } = await import('mongodb');
      const expensesCollection = db.collection('expenses');
      const result = await expensesCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Expense deleted successfully' });
      return;
    }

    // Get financial summary / budget data
    if (action === 'financial-summary' && req.method === 'GET') {
      const orders = await ordersCollection.find({}).toArray();
      const expensesCollection = db.collection('expenses');
      const expenses = await expensesCollection.find({}).toArray();
      const budgetCollection = db.collection('budget');
      const budget = await budgetCollection.findOne({});

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const getOrderTotal = (order) => {
        if (order.payment?.total) return order.payment.total;
        if (order.items && Array.isArray(order.items)) {
          return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        return 0;
      };

      const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered');

      // Revenue calculations
      const totalRevenue = completedOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
      const monthlyRevenue = completedOrders
        .filter(o => new Date(o.createdAt || o.timestamp) >= startOfMonth)
        .reduce((sum, o) => sum + getOrderTotal(o), 0);
      const lastMonthRevenue = completedOrders
        .filter(o => {
          const d = new Date(o.createdAt || o.timestamp);
          return d >= startOfLastMonth && d <= endOfLastMonth;
        })
        .reduce((sum, o) => sum + getOrderTotal(o), 0);
      const yearlyRevenue = completedOrders
        .filter(o => new Date(o.createdAt || o.timestamp) >= startOfYear)
        .reduce((sum, o) => sum + getOrderTotal(o), 0);

      // Expense calculations
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const monthlyExpenses = expenses
        .filter(e => new Date(e.date) >= startOfMonth)
        .reduce((sum, e) => sum + e.amount, 0);
      const lastMonthExpenses = expenses
        .filter(e => {
          const d = new Date(e.date);
          return d >= startOfLastMonth && d <= endOfLastMonth;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      const yearlyExpenses = expenses
        .filter(e => new Date(e.date) >= startOfYear)
        .reduce((sum, e) => sum + e.amount, 0);

      // Profit
      const totalProfit = totalRevenue - totalExpenses;
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      const yearlyProfit = yearlyRevenue - yearlyExpenses;

      // Revenue growth
      const revenueGrowth = lastMonthRevenue > 0
        ? (((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
        : 0;

      // Average order value
      const avgOrderValue = completedOrders.length > 0
        ? (totalRevenue / completedOrders.length).toFixed(0)
        : 0;

      // Monthly revenue breakdown (last 12 months)
      const monthlyBreakdown = [];
      for (let i = 11; i >= 0; i--) {
        const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const mRevenue = completedOrders
          .filter(o => {
            const d = new Date(o.createdAt || o.timestamp);
            return d >= mStart && d <= mEnd;
          })
          .reduce((sum, o) => sum + getOrderTotal(o), 0);
        const mExpense = expenses
          .filter(e => {
            const d = new Date(e.date);
            return d >= mStart && d <= mEnd;
          })
          .reduce((sum, e) => sum + e.amount, 0);
        const mOrders = completedOrders
          .filter(o => {
            const d = new Date(o.createdAt || o.timestamp);
            return d >= mStart && d <= mEnd;
          }).length;
        monthlyBreakdown.push({
          month: mStart.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
          revenue: mRevenue,
          expenses: mExpense,
          profit: mRevenue - mExpense,
          orders: mOrders
        });
      }

      // Category-wise revenue
      const categoryRevenue = {};
      completedOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const cat = item.category || 'Uncategorized';
            categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.price * item.quantity);
          });
        }
      });

      // Expense categories
      const expenseCategories = {};
      expenses.forEach(exp => {
        const cat = exp.category || 'General';
        expenseCategories[cat] = (expenseCategories[cat] || 0) + exp.amount;
      });

      // Payment method breakdown
      const paymentMethods = {};
      completedOrders.forEach(order => {
        const method = order.payment?.method || 'cash';
        paymentMethods[method] = (paymentMethods[method] || 0) + getOrderTotal(order);
      });

      // Daily revenue for current month
      const dailyRevenue = [];
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), d);
        const dayEnd = new Date(now.getFullYear(), now.getMonth(), d + 1);
        const dayRev = completedOrders
          .filter(o => {
            const od = new Date(o.createdAt || o.timestamp);
            return od >= dayStart && od < dayEnd;
          })
          .reduce((sum, o) => sum + getOrderTotal(o), 0);
        dailyRevenue.push({ day: d, revenue: dayRev });
      }

      // Top products
      const productSales = {};
      completedOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (!productSales[item.name]) {
              productSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
            }
            productSales[item.name].quantity += item.quantity;
            productSales[item.name].revenue += item.price * item.quantity;
          });
        }
      });
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      res.status(200).json({
        success: true,
        summary: {
          totalRevenue,
          monthlyRevenue,
          lastMonthRevenue,
          yearlyRevenue,
          totalExpenses,
          monthlyExpenses,
          lastMonthExpenses,
          yearlyExpenses,
          totalProfit,
          monthlyProfit,
          yearlyProfit,
          revenueGrowth,
          avgOrderValue: parseFloat(avgOrderValue),
          totalOrders: orders.length,
          completedOrders: completedOrders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          monthlyBreakdown,
          categoryRevenue,
          expenseCategories,
          paymentMethods,
          dailyRevenue,
          topProducts,
          budget: budget || null
        }
      });
      return;
    }

    // Save budget
    if (action === 'budget' && req.method === 'POST') {
      const budgetCollection = db.collection('budget');
      const { monthlyBudget, categories } = req.body;

      await budgetCollection.deleteMany({});
      const budgetData = {
        monthlyBudget: parseFloat(monthlyBudget) || 0,
        categories: categories || {},
        updatedAt: new Date()
      };
      await budgetCollection.insertOne(budgetData);

      res.status(200).json({ success: true, budget: budgetData, message: 'Budget saved successfully' });
      return;
    }

    // Get dashboard stats
    if (action === 'stats' && req.method === 'GET') {
      const products = await productsCollection.find({}).toArray();
      const orders = await ordersCollection.find({}).toArray();
      const contacts = await contactsCollection.find({}).toArray();
      const reviews = await reviewsCollection.find({}).toArray();
      
      const totalProducts = products.length;
      const specialProducts = products.filter(p => p.isSpecial).length;
      const productsWithOffers = products.filter(p => p.offer).length;
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
      const totalContacts = contacts.length;
      const unreadContacts = contacts.filter(c => c.status === 'unread').length;
      const totalReviews = reviews.length;
      const hiddenReviews = reviews.filter(r => r.hidden).length;
      
      // Calculate total revenue from completed orders
      const totalRevenue = orders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, order) => {
          if (order.items && Array.isArray(order.items)) {
            return sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
          }
          return sum;
        }, 0);

      // Calculate average rating
      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
        : 0;
      
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
          totalRevenue,
          totalReviews,
          hiddenReviews,
          avgRating
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
