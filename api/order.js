import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();
      const ordersCollection = db.collection('orders');
      
      const orderData = req.body;
      
      // Generate order number
      const orderNumber = 'ASI' + Date.now().toString().slice(-6);
      
      // Check if it's a cart-based order (has items array) or single product order
      if (orderData.items && Array.isArray(orderData.items)) {
        // Cart-based order
        const { customer, delivery, items, payment, additional } = orderData;
        
        const order = {
          orderNumber,
          customer,
          delivery,
          items,
          payment,
          additional,
          status: 'pending',
          timestamp: new Date().toISOString(),
          createdAt: new Date()
        };

        await ordersCollection.insertOne(order);
        
        console.log('Cart Order saved to MongoDB:', orderNumber);

        res.status(200).json({ 
          success: true, 
          orderNumber,
          message: `Your order #${orderNumber} has been placed! We will contact you shortly to confirm.`,
          estimatedDelivery: delivery.date
        });
      } else {
        // Single product order (legacy support)
        const { name, email, phone, product, message, date } = orderData;
        
        const order = {
          orderNumber,
          name, 
          email, 
          phone, 
          product, 
          message, 
          date,
          status: 'pending',
          timestamp: new Date().toISOString(),
          createdAt: new Date()
        };

        await ordersCollection.insertOne(order);
        
        console.log('Single Product Order saved to MongoDB:', orderNumber);
        
        res.status(200).json({ 
          success: true, 
          orderNumber,
          message: `Your order #${orderNumber} for ${product} has been received! We will contact you shortly.`
        });
      }
    } catch (error) {
      console.error('Error saving order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to place order. Please try again.'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
