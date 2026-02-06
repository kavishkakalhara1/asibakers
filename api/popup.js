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

  try {
    const { db } = await connectToDatabase();
    const popupCollection = db.collection('popup');

    // Get active popup (public)
    if (req.method === 'GET') {
      const popup = await popupCollection.findOne({ active: true });

      if (!popup) {
        res.status(200).json({ success: true, popup: null });
        return;
      }

      res.status(200).json({ success: true, popup });
      return;
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Popup API error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
