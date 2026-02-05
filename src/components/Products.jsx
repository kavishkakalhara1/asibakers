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
    let filtered = products;
    
    if (category !== 'all') {
      filtered = products.filter(p => p.category === category);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    filterProducts(activeFilter);
  }, [searchQuery, products]);

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
    addToast(`${product.name} added to cart! 🎂`, 'success');
  };

  const handleToggleFavorite = (productId, e) => {
    e.stopPropagation();
    toggleFavorite(productId);
    const isFavorite = favorites.includes(productId);
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
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card" data-category={product.category}>
                <div className="product-image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.popular && (
                    <div className="product-badge">
                      <i className="fas fa-star"></i> Popular
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
                    <span className="product-price">${product.price}</span>
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
            ))}
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
