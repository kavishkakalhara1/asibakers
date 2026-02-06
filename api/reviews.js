import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
    const reviewsCollection = db.collection('reviews');

    // Get all visible reviews (public)
    if (req.method === 'GET') {
      const reviews = await reviewsCollection
        .find({ hidden: { $ne: true } })
        .sort({ createdAt: -1 })
        .toArray();

      res.status(200).json({ success: true, reviews });
      return;
    }

    // Submit a new review (public)
    if (req.method === 'POST') {
      const { name, email, rating, text } = req.body;

      // Validation
      if (!name || !rating || !text) {
        res.status(400).json({
          success: false,
          message: 'Name, rating, and review text are required'
        });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
        return;
      }

      if (text.length < 10) {
        res.status(400).json({
          success: false,
          message: 'Review must be at least 10 characters long'
        });
        return;
      }

      const newReview = {
        name: name.trim(),
        email: email ? email.trim() : '',
        rating: parseInt(rating),
        text: text.trim(),
        hidden: false,
        createdAt: new Date()
      };

      await reviewsCollection.insertOne(newReview);

      res.status(201).json({
        success: true,
        message: 'Thank you for your review!',
        review: newReview
      });
      return;
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Reviews API error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
