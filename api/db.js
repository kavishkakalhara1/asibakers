import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!uri) {
    throw new Error('Please define MONGODB_URI environment variable');
  }

  const client = new MongoClient(uri);
  await client.connect();
  
  const db = client.db('asibakers');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

// Initialize default products if collection is empty
export async function initializeProducts(db) {
  const productsCollection = db.collection('products');
  const count = await productsCollection.countDocuments();
  
  if (count === 0) {
    const defaultProducts = [
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
    
    await productsCollection.insertMany(defaultProducts);
    console.log('Default products initialized in MongoDB');
  }
  
  return productsCollection;
}
