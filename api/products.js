// Sample products data
const products = [
  {
    id: 1,
    name: 'Strawberry Dream Cake',
    category: 'Fruit Cakes',
    price: 45,
    description: 'Light and fluffy strawberry cake with fresh cream',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500',
    popular: true
  },
  {
    id: 2,
    name: 'Rose Velvet Delight',
    category: 'Special Cakes',
    price: 55,
    description: 'Elegant rose-flavored velvet cake with buttercream',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    popular: true
  },
  {
    id: 3,
    name: 'Lavender Bliss',
    category: 'Special Cakes',
    price: 50,
    description: 'Delicate lavender-infused cake with vanilla frosting',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e5b2e7c6?w=500',
    popular: false
  },
  {
    id: 4,
    name: 'Pink Champagne',
    category: 'Special Cakes',
    price: 60,
    description: 'Luxurious champagne cake with pink buttercream roses',
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500',
    popular: true
  },
  {
    id: 5,
    name: 'Vanilla Cupcakes',
    category: 'Cupcakes',
    price: 25,
    description: 'Set of 12 vanilla cupcakes with pastel frosting',
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500',
    popular: false
  },
  {
    id: 6,
    name: 'Chocolate Truffle',
    category: 'Chocolate Cakes',
    price: 48,
    description: 'Rich chocolate cake with truffle ganache',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    popular: false
  },
  {
    id: 7,
    name: 'Lemon Blossom',
    category: 'Fruit Cakes',
    price: 42,
    description: 'Zesty lemon cake with cream cheese frosting',
    image: 'https://images.unsplash.com/photo-1519915212116-715fb8c3d267?w=500',
    popular: false
  },
  {
    id: 8,
    name: 'Unicorn Magic',
    category: 'Special Cakes',
    price: 65,
    description: 'Colorful rainbow cake with magical unicorn decorations',
    image: 'https://images.unsplash.com/photo-1562440499-64c9a5d2d069?w=500',
    popular: true
  }
];

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

  if (req.method === 'GET') {
    const { id } = req.query;
    
    if (id) {
      const product = products.find(p => p.id === parseInt(id));
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } else {
      res.status(200).json(products);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
