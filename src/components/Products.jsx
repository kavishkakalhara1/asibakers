import { useState, useEffect } from 'react';
import OrderModal from './OrderModal';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, toggleFavorite, addToCart } = useApp();
  const { addToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const filterProducts = (category) => {
    setActiveFilter(category);
  };

  // Centralized filtering logic that reacts to all filter state changes
  useEffect(() => {
    let filtered = products;
    
    if (activeFilter !== 'all') {
      filtered = filtered.filter(p => p.category === activeFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, products, activeFilter]);

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
    addToast(`${product.name} added to cart! 🎂`, 'success');
  };

  const handleToggleFavorite = (productId, e) => {
    e.stopPropagation();
    const isFavorite = favorites.includes(productId);
    toggleFavorite(productId);
    addToast(isFavorite ? 'Removed from favorites' : 'Added to favorites! ❤️', 'info');
  };

  const openOrderModal = (productName) => {
    setSelectedProduct(productName);
    setShowModal(true);
  };

  return (
    <>
      <section id="products" className="section products">
        <div className="container">
          <h2 className="section-title">Our Delicious Cakes</h2>
          <p className="section-subtitle">Handcrafted with love and premium ingredients</p>
          
          {/* Search Bar */}
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search for cakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          {/* Filter Buttons */}
          <div className="filters">
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} 
              onClick={() => filterProducts('all')}
            >
              <i className="fas fa-th"></i> All
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'Special Cakes' ? 'active' : ''}`} 
              onClick={() => filterProducts('Special Cakes')}
            >
              <i className="fas fa-crown"></i> Special
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'Fruit Cakes' ? 'active' : ''}`} 
              onClick={() => filterProducts('Fruit Cakes')}
            >
              <i className="fas fa-apple-alt"></i> Fruit
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'Chocolate Cakes' ? 'active' : ''}`} 
              onClick={() => filterProducts('Chocolate Cakes')}
            >
              <i className="fas fa-candy-cane"></i> Chocolate
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'Cupcakes' ? 'active' : ''}`} 
              onClick={() => filterProducts('Cupcakes')}
            >
              <i className="fas fa-cookie"></i> Cupcakes
            </button>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <div className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                <i className="fas fa-search" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '1rem', display: 'block' }}></i>
                <p style={{ fontSize: '1.2rem', color: '#999' }}>No cakes found matching your search.</p>
                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: '1rem' }}
                  onClick={() => { setSearchQuery(''); filterProducts('all'); }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredProducts.map(product => (
              <div key={product.id} className="product-card" data-category={product.category}>
                <div className="product-image">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500';
                    }}
                  />
                  {product.popular && (
                    <div className="product-badge">
                      <i className="fas fa-star"></i> Popular
                    </div>
                  )}
                  {product.offer && product.offer.discount > 0 && (
                    <div className="product-discount-badge">
                      <i className="fas fa-tag"></i> {product.offer.label || `${product.offer.discount}% OFF`}
                    </div>
                  )}
                  <button
                    className={`favorite-btn ${favorites.includes(product.id) ? 'active' : ''}`}
                    onClick={(e) => handleToggleFavorite(product.id, e)}
                  >
                    <i className={`fas fa-heart`}></i>
                  </button>
                </div>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-footer">
                    {product.offer && product.offer.discount > 0 ? (
                      <div className="product-price-wrapper">
                        <span className="product-price-original">Rs {product.price.toLocaleString()}</span>
                        <span className="product-price discounted">Rs {Math.round(product.price * (1 - product.offer.discount / 100)).toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="product-price">Rs {product.price.toLocaleString()}</span>
                    )}
                    <div className="product-actions">
                      <button className="add-to-cart-btn" onClick={(e) => handleAddToCart(product, e)}>
                        <i className="fas fa-cart-plus"></i>
                      </button>
                      <button className="order-btn" onClick={() => openOrderModal(product.name)}>
                        <i className="fas fa-shopping-cart"></i> Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </section>
      
      {showModal && (
        <OrderModal 
          productName={selectedProduct} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
};

export default Products;
