import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Admin credentials
const ADMIN_EMAIL = 'asinirathnayake@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';

// Mock products data for development
let products = [
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

let orders = [];
let activeTokens = [];

const generateToken = () => 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2);

// Custom plugin to mock API routes during development
function apiMockPlugin() {
  return {
    name: 'api-mock',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Parse body helper
        const parseBody = () => new Promise((resolve) => {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              resolve({});
            }
          });
        });

        // Handle /api/products
        if (req.url === '/api/products') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(products));
          return;
        }
        
        // Handle /api/order
        if (req.url === '/api/order' && req.method === 'POST') {
          parseBody().then(orderData => {
            const orderNumber = 'ASI' + Date.now().toString().slice(-6);
            const order = {
              ...orderData,
              orderNumber,
              status: 'pending',
              timestamp: new Date().toISOString()
            };
            orders.unshift(order);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: true, 
              orderNumber,
              message: `Your order #${orderNumber} has been placed!`
            }));
          });
          return;
        }
        
        // Handle /api/contact
        if (req.url === '/api/contact' && req.method === 'POST') {
          parseBody().then(() => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Thank you for your message! We will get back to you soon.'
            }));
          });
          return;
        }

        // Handle Admin API
        if (req.url?.startsWith('/api/admin')) {
          const urlParams = new URL(req.url, 'http://localhost');
          const action = urlParams.searchParams.get('action');
          const authHeader = req.headers.authorization;
          const token = authHeader?.replace('Bearer ', '');

          // Login
          if (action === 'login' && req.method === 'POST') {
            parseBody().then(({ email, password }) => {
              res.setHeader('Content-Type', 'application/json');
              if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                const newToken = generateToken();
                activeTokens.push(newToken);
                res.end(JSON.stringify({ success: true, token: newToken, message: 'Login successful' }));
              } else {
                res.statusCode = 401;
                res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
              }
            });
            return;
          }

          // Check auth for protected routes
          if (!token || !activeTokens.includes(token)) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 401;
            res.end(JSON.stringify({ success: false, message: 'Unauthorized' }));
            return;
          }

          // Logout
          if (action === 'logout' && req.method === 'POST') {
            activeTokens = activeTokens.filter(t => t !== token);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Logged out' }));
            return;
          }

          // Get products
          if (action === 'products' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, products }));
            return;
          }

          // Add product
          if (action === 'products' && req.method === 'POST') {
            parseBody().then(productData => {
              const newProduct = { id: Date.now(), ...productData, popular: productData.popular || false, isSpecial: productData.isSpecial || false, offer: productData.offer || null };
              products.push(newProduct);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, product: newProduct, message: 'Product added' }));
            });
            return;
          }

          // Update product
          if (action === 'products' && req.method === 'PUT') {
            parseBody().then(({ id, ...updateData }) => {
              const index = products.findIndex(p => p.id === parseInt(id));
              if (index !== -1) {
                products[index] = { ...products[index], ...updateData };
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, product: products[index], message: 'Product updated' }));
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Product not found' }));
              }
            });
            return;
          }

          // Delete product
          if (action === 'products' && req.method === 'DELETE') {
            parseBody().then(({ id }) => {
              const index = products.findIndex(p => p.id === parseInt(id));
              if (index !== -1) {
                products.splice(index, 1);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: 'Product deleted' }));
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Product not found' }));
              }
            });
            return;
          }

          // Toggle special
          if (action === 'toggle-special' && req.method === 'POST') {
            parseBody().then(({ id }) => {
              const product = products.find(p => p.id === parseInt(id));
              if (product) {
                product.isSpecial = !product.isSpecial;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, product, message: `Product ${product.isSpecial ? 'marked as' : 'removed from'} special` }));
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Product not found' }));
              }
            });
            return;
          }

          // Add offer
          if (action === 'offer' && req.method === 'POST') {
            parseBody().then(({ id, discount, label }) => {
              const product = products.find(p => p.id === parseInt(id));
              if (product) {
                product.offer = discount > 0 ? { discount, label: label || `${discount}% OFF` } : null;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, product, message: 'Offer updated' }));
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Product not found' }));
              }
            });
            return;
          }

          // Remove offer
          if (action === 'offer' && req.method === 'DELETE') {
            parseBody().then(({ id }) => {
              const product = products.find(p => p.id === parseInt(id));
              if (product) {
                product.offer = null;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, product, message: 'Offer removed' }));
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Product not found' }));
              }
            });
            return;
          }

          // Get orders
          if (action === 'orders' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, orders }));
            return;
          }

          // Update order status
          if (action === 'orders' && req.method === 'PUT') {
            parseBody().then(({ orderNumber, status }) => {
              const order = orders.find(o => o.orderNumber === orderNumber);
              if (order) {
                order.status = status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, order, message: 'Order status updated' }));
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Order not found' }));
              }
            });
            return;
          }

          // Get stats
          if (action === 'stats' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              stats: {
                totalProducts: products.length,
                specialProducts: products.filter(p => p.isSpecial).length,
                productsWithOffers: products.filter(p => p.offer).length,
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => o.status === 'pending').length,
                completedOrders: orders.filter(o => o.status === 'completed').length
              }
            }));
            return;
          }

          // Default admin response
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, message: 'Invalid action' }));
          return;
        }
        
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiMockPlugin()],
  server: {
    port: 3000,
  },
})
