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
      const contactsCollection = db.collection('contacts');
      
      const { name, email, message } = req.body;
      
      const contact = {
        name,
        email,
        message,
        status: 'unread',
        createdAt: new Date()
      };
      
      await contactsCollection.insertOne(contact);
      
      console.log('Contact form saved to MongoDB:', email);
      
      res.status(200).json({ 
        success: true, 
        message: 'Thank you for contacting us! We will get back to you soon.' 
      });
    } catch (error) {
      console.error('Error saving contact:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send message. Please try again.'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
