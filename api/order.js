export default function handler(req, res) {
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
    const orderData = req.body;
    
    // Generate order number
    const orderNumber = 'ASI' + Date.now().toString().slice(-6);
    
    // Check if it's a cart-based order (has items array) or single product order
    if (orderData.items && Array.isArray(orderData.items)) {
      // Cart-based order
      const { customer, delivery, items, payment, additional } = orderData;
      
      console.log('Cart Order received:', {
        orderNumber,
        customer,
        delivery,
        items,
        payment,
        additional,
        timestamp: new Date().toISOString()
      });

      // In a real application, you would:
      // 1. Validate the data
      // 2. Process payment if card
      // 3. Save to database
      // 4. Send confirmation email
      // 5. Notify the bakery

      res.status(200).json({ 
        success: true, 
        orderNumber,
        message: `Your order #${orderNumber} has been placed! We will contact you shortly to confirm.`,
        estimatedDelivery: delivery.date
      });
    } else {
      // Single product order (legacy support)
      const { name, email, phone, product, message, date } = orderData;
      
      console.log('Single Product Order received:', { 
        orderNumber,
        name, 
        email, 
        phone, 
        product, 
        message, 
        date,
        timestamp: new Date().toISOString()
      });
      
      res.status(200).json({ 
        success: true, 
        orderNumber,
        message: `Your order #${orderNumber} for ${product} has been received! We will contact you shortly.`
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
