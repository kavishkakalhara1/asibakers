import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const settingsCollection = db.collection('settings');
      const settings = await settingsCollection.findOne({ key: 'general' });
      
      res.status(200).json({ 
        ordersEnabled: settings?.ordersEnabled !== undefined ? settings.ordersEnabled : true
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(200).json({ ordersEnabled: true });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
