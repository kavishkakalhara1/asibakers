import { useState, useEffect } from 'react';

const AdminDashboard = ({ token, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [popupData, setPopupData] = useState(null);
  const [showPopupModal, setShowPopupModal] = useState(false);
  const [popupForm, setPopupForm] = useState({
    type: 'image',
    content: '',
    active: true
  });
  const [popupPreview, setPopupPreview] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Special Cakes',
    price: '',
    description: '',
    image: '',
    popular: false,
    isSpecial: false
  });

  const [offerForm, setOfferForm] = useState({
    discount: '',
    label: ''
  });

  const categories = ['Special Cakes', 'Fruit Cakes', 'Chocolate Cakes', 'Cupcakes', 'Wedding Cakes'];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, ordersRes, statsRes, reviewsRes, popupRes] = await Promise.all([
        fetch('/api/admin?action=products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin?action=orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin?action=stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin?action=reviews', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin?action=popup', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();
      const reviewsData = await reviewsRes.json();
      const popupDataRes = await popupRes.json();

      if (productsData.success) setProducts(productsData.products);
      if (ordersData.success) setOrders(ordersData.orders);
      if (statsData.success) setStats(statsData.stats);
      if (reviewsData.success) setReviews(reviewsData.reviews);
      if (popupDataRes.success) {
        setPopupData(popupDataRes.popup);
        if (popupDataRes.popup) {
          setPopupForm({
            type: popupDataRes.popup.type || 'image',
            content: popupDataRes.popup.content || '',
            active: popupDataRes.popup.active !== undefined ? popupDataRes.popup.active : true
          });
        }
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin?action=logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('adminToken');
    onLogout();
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin?action=products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price)
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Product added successfully!');
        setShowProductModal(false);
        resetProductForm();
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to add product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin?action=products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedProduct.id,
          ...productForm,
          price: parseFloat(productForm.price)
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Product updated successfully!');
        setShowProductModal(false);
        resetProductForm();
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch('/api/admin?action=products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Product deleted successfully!');
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to delete product');
    }
  };

  const handleToggleSpecial = async (id) => {
    try {
      const response = await fetch('/api/admin?action=toggle-special', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', data.message);
        fetchData();
      }
    } catch (error) {
      showMessage('error', 'Failed to toggle special status');
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin?action=offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedProduct.id,
          discount: parseFloat(offerForm.discount),
          label: offerForm.label
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Offer added successfully!');
        setShowOfferModal(false);
        setOfferForm({ discount: '', label: '' });
        fetchData();
      }
    } catch (error) {
      showMessage('error', 'Failed to add offer');
    }
  };

  const handleRemoveOffer = async (id) => {
    try {
      const response = await fetch('/api/admin?action=offer', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Offer removed!');
        fetchData();
      }
    } catch (error) {
      showMessage('error', 'Failed to remove offer');
    }
  };

  const handleUpdateOrderStatus = async (orderNumber, status) => {
    try {
      const response = await fetch('/api/admin?action=orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderNumber, status })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Order status updated!');
        fetchData();
      }
    } catch (error) {
      showMessage('error', 'Failed to update order status');
    }
  };

  const handleToggleReview = async (id) => {
    try {
      const response = await fetch('/api/admin?action=reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', data.message);
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to update review');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch('/api/admin?action=reviews', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Review deleted successfully!');
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to delete review');
    }
  };

  const handleSavePopup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin?action=popup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(popupForm)
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Popup saved successfully!');
        setShowPopupModal(false);
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to save popup');
    }
  };

  const handleTogglePopup = async () => {
    try {
      const response = await fetch('/api/admin?action=popup', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', data.message);
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to toggle popup');
    }
  };

  const handleDeletePopup = async () => {
    if (!confirm('Are you sure you want to delete the popup?')) return;

    try {
      const response = await fetch('/api/admin?action=popup', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Popup deleted!');
        setPopupData(null);
        setPopupForm({ type: 'image', content: '', active: true });
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to delete popup');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: 'Special Cakes',
      price: '',
      description: '',
      image: '',
      popular: false,
      isSpecial: false
    });
    setSelectedProduct(null);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description,
      image: product.image,
      popular: product.popular,
      isSpecial: product.isSpecial
    });
    setShowProductModal(true);
  };

  const openOfferModal = (product) => {
    setSelectedProduct(product);
    setOfferForm({
      discount: product.offer?.discount?.toString() || '',
      label: product.offer?.label || ''
    });
    setShowOfferModal(true);
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <i className="fas fa-birthday-cake"></i>
          <span>AsiBakers</span>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-chart-pie"></i>
            Dashboard
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <i className="fas fa-birthday-cake"></i>
            Products
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="fas fa-shopping-bag"></i>
            Orders
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="badge">{orders.filter(o => o.status === 'pending').length}</span>
            )}
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <i className="fas fa-star"></i>
            Reviews
            {reviews.filter(r => !r.hidden).length > 0 && (
              <span className="badge" style={{ background: '#ffd700', color: '#8b6914' }}>{reviews.length}</span>
            )}
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <i className="fas fa-tags"></i>
            Offers
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'popup' ? 'active' : ''}`}
            onClick={() => setActiveTab('popup')}
          >
            <i className="fas fa-window-restore"></i>
            Popup
            {popupData?.active && (
              <span className="badge" style={{ background: '#28a745', color: '#fff' }}>ON</span>
            )}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" className="admin-nav-item">
            <i className="fas fa-external-link-alt"></i>
            View Website
          </a>
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <h1>
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'products' && 'Manage Products'}
            {activeTab === 'orders' && 'Order Management'}
            {activeTab === 'reviews' && 'Customer Reviews'}
            {activeTab === 'offers' && 'Special Offers'}
            {activeTab === 'popup' && 'Popup Manager'}
          </h1>
          <div className="admin-user">
            <i className="fas fa-user-circle"></i>
            <span>Admin</span>
          </div>
        </header>

        {/* Message Toast */}
        {message.text && (
          <div className={`admin-message ${message.type}`}>
            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {message.text}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="stat-icon products">
                <i className="fas fa-birthday-cake"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalProducts}</h3>
                <p>Total Products</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon special">
                <i className="fas fa-star"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.specialProducts}</h3>
                <p>Special Products</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon offers">
                <i className="fas fa-tags"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.productsWithOffers}</h3>
                <p>Active Offers</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon orders">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon pending">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.pendingOrders}</h3>
                <p>Pending Orders</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon completed">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.completedOrders}</h3>
                <p>Completed Orders</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon reviews">
                <i className="fas fa-star"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalReviews || 0}</h3>
                <p>Reviews ({stats.avgRating || 0} ★)</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="admin-products">
            <div className="admin-toolbar">
              <button className="admin-btn primary" onClick={() => { resetProductForm(); setShowProductModal(true); }}>
                <i className="fas fa-plus"></i>
                Add New Product
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Special</th>
                    <th>Offer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <img src={product.image} alt={product.name} className="product-thumbnail" />
                      </td>
                      <td>
                        <strong>{product.name}</strong>
                        {product.popular && <span className="label popular">Popular</span>}
                      </td>
                      <td>{product.category}</td>
                      <td>Rs {product.price.toLocaleString()}</td>
                      <td>
                        <button
                          className={`toggle-btn ${product.isSpecial ? 'active' : ''}`}
                          onClick={() => handleToggleSpecial(product.id)}
                        >
                          <i className={`fas ${product.isSpecial ? 'fa-star' : 'fa-star'}`}></i>
                        </button>
                      </td>
                      <td>
                        {product.offer ? (
                          <span className="offer-badge">{product.offer.label}</span>
                        ) : (
                          <span className="no-offer">-</span>
                        )}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="admin-btn-icon edit" onClick={() => openEditModal(product)} title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="admin-btn-icon offer" onClick={() => openOfferModal(product)} title="Manage Offer">
                            <i className="fas fa-percent"></i>
                          </button>
                          <button className="admin-btn-icon delete" onClick={() => handleDeleteProduct(product.id)} title="Delete">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="admin-orders">
            {orders.length === 0 ? (
              <div className="admin-empty">
                <i className="fas fa-inbox"></i>
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.orderNumber}>
                        <td><strong>{order.orderNumber}</strong></td>
                        <td>
                          <div>{order.customer?.name}</div>
                          <small>{order.customer?.email}</small>
                        </td>
                        <td>{order.items?.length || 1} items</td>
                        <td>Rs {(order.payment?.total ?? order.total)?.toLocaleString() || 'N/A'}</td>
                        <td>{order.delivery?.date || order.date}</td>
                        <td>
                          <span className={`status-badge ${order.status || 'pending'}`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => handleUpdateOrderStatus(order.orderNumber, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="admin-reviews">
            {reviews.length === 0 ? (
              <div className="admin-empty">
                <i className="fas fa-star"></i>
                <p>No reviews yet</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Rating</th>
                      <th>Review</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map(review => (
                      <tr key={review._id} className={review.hidden ? 'row-hidden' : ''}>
                        <td>
                          <div><strong>{review.name}</strong></div>
                          {review.email && <small>{review.email}</small>}
                        </td>
                        <td>
                          <div className="review-stars">
                            {Array.from({ length: 5 }, (_, i) => (
                              <i key={i} className={`fas fa-star ${i < (review.rating || 5) ? 'filled' : 'empty'}`}></i>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="review-text-cell">{review.text}</div>
                        </td>
                        <td>
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          <span className={`status-badge ${review.hidden ? 'cancelled' : 'completed'}`}>
                            {review.hidden ? 'Hidden' : 'Visible'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button
                              className={`admin-btn-icon ${review.hidden ? 'edit' : 'offer'}`}
                              onClick={() => handleToggleReview(review._id)}
                              title={review.hidden ? 'Show Review' : 'Hide Review'}
                            >
                              <i className={`fas ${review.hidden ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                            </button>
                            <button
                              className="admin-btn-icon delete"
                              onClick={() => handleDeleteReview(review._id)}
                              title="Delete Review"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="admin-offers">
            <h3>Products with Active Offers</h3>
            <div className="offers-grid">
              {products.filter(p => p.offer).map(product => (
                <div key={product.id} className="offer-card">
                  <img src={product.image} alt={product.name} />
                  <div className="offer-card-content">
                    <h4>{product.name}</h4>
                    <p>Original: Rs {product.price.toLocaleString()}</p>
                    <p className="discounted">
                      Discounted: Rs {(product.price * (1 - product.offer.discount / 100)).toLocaleString()}
                    </p>
                    <span className="offer-label">{product.offer.label}</span>
                    <button className="admin-btn danger small" onClick={() => handleRemoveOffer(product.id)}>
                      <i className="fas fa-times"></i> Remove Offer
                    </button>
                  </div>
                </div>
              ))}
              {products.filter(p => p.offer).length === 0 && (
                <div className="admin-empty">
                  <i className="fas fa-tags"></i>
                  <p>No active offers. Add offers from the Products tab.</p>
                </div>
              )}
            </div>

            <h3>Special Products</h3>
            <div className="offers-grid">
              {products.filter(p => p.isSpecial).map(product => (
                <div key={product.id} className="offer-card special">
                  <img src={product.image} alt={product.name} />
                  <div className="offer-card-content">
                    <h4>{product.name}</h4>
                    <p>Rs {product.price.toLocaleString()}</p>
                    <span className="special-label"><i className="fas fa-star"></i> Special</span>
                  </div>
                </div>
              ))}
              {products.filter(p => p.isSpecial).length === 0 && (
                <div className="admin-empty">
                  <i className="fas fa-star"></i>
                  <p>No special products. Mark products as special from the Products tab.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Popup Tab */}
        {activeTab === 'popup' && (
          <div className="admin-popup-manager">
            <div className="admin-toolbar">
              <button className="admin-btn primary" onClick={() => { setShowPopupModal(true); setPopupPreview(false); }}>
                <i className={`fas ${popupData ? 'fa-edit' : 'fa-plus'}`}></i>
                {popupData ? 'Edit Popup' : 'Create Popup'}
              </button>
              {popupData && (
                <>
                  <button className={`admin-btn ${popupData.active ? 'danger' : 'primary'}`} onClick={handleTogglePopup}>
                    <i className={`fas ${popupData.active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    {popupData.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="admin-btn danger" onClick={handleDeletePopup}>
                    <i className="fas fa-trash"></i>
                    Delete Popup
                  </button>
                </>
              )}
            </div>

            {popupData ? (
              <div className="popup-preview-section">
                <div className="popup-info-cards">
                  <div className="popup-info-card">
                    <i className="fas fa-info-circle"></i>
                    <div>
                      <strong>Type:</strong> {popupData.type === 'image' ? 'Image' : 'HTML Content'}
                    </div>
                  </div>
                  <div className="popup-info-card">
                    <i className={`fas ${popupData.active ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    <div>
                      <strong>Status:</strong>
                      <span className={`status-badge ${popupData.active ? 'completed' : 'cancelled'}`} style={{ marginLeft: '8px' }}>
                        {popupData.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <h3 style={{ padding: '0 2rem', marginBottom: '1rem' }}>Preview</h3>
                <div className="popup-live-preview">
                  <div className="popup-preview-square">
                    {popupData.type === 'image' ? (
                      <img src={popupData.content} alt="Popup Preview" />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: popupData.content }} />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-empty">
                <i className="fas fa-window-restore"></i>
                <p>No popup configured. Create one to show announcements to visitors.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#999' }}>
                  The popup will appear 2 seconds after visitors open your site.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <div className="admin-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{selectedProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={() => setShowProductModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={selectedProduct ? handleUpdateProduct : handleAddProduct}>
              <div className="admin-form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Price (Rs)</label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="admin-form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.popular}
                    onChange={(e) => setProductForm({ ...productForm, popular: e.target.checked })}
                  />
                  Popular Product
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={productForm.isSpecial}
                    onChange={(e) => setProductForm({ ...productForm, isSpecial: e.target.checked })}
                  />
                  Special Product
                </label>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  {selectedProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && selectedProduct && (
        <div className="admin-modal-overlay" onClick={() => setShowOfferModal(false)}>
          <div className="admin-modal small" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Manage Offer</h2>
              <button className="close-btn" onClick={() => setShowOfferModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className="modal-subtitle">{selectedProduct.name}</p>
            <form onSubmit={handleAddOffer}>
              <div className="admin-form-group">
                <label>Discount Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={offerForm.discount}
                  onChange={(e) => setOfferForm({ ...offerForm, discount: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Offer Label (optional)</label>
                <input
                  type="text"
                  value={offerForm.label}
                  onChange={(e) => setOfferForm({ ...offerForm, label: e.target.value })}
                  placeholder="e.g., 20% OFF, Holiday Special"
                />
              </div>
              {selectedProduct.offer && (
                <button
                  type="button"
                  className="admin-btn danger full-width"
                  onClick={() => { handleRemoveOffer(selectedProduct.id); setShowOfferModal(false); }}
                >
                  <i className="fas fa-times"></i> Remove Current Offer
                </button>
              )}
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowOfferModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  {selectedProduct.offer ? 'Update Offer' : 'Add Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Modal */}
      {showPopupModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPopupModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{popupData ? 'Edit Popup' : 'Create Popup'}</h2>
              <button className="close-btn" onClick={() => setShowPopupModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSavePopup}>
              <div className="admin-form-group">
                <label>Content Type</label>
                <select
                  value={popupForm.type}
                  onChange={(e) => setPopupForm({ ...popupForm, type: e.target.value })}
                >
                  <option value="image">Image (URL)</option>
                  <option value="html">HTML Code</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>{popupForm.type === 'image' ? 'Image URL' : 'HTML Content'}</label>
                {popupForm.type === 'image' ? (
                  <input
                    type="url"
                    value={popupForm.content}
                    onChange={(e) => setPopupForm({ ...popupForm, content: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                ) : (
                  <textarea
                    value={popupForm.content}
                    onChange={(e) => setPopupForm({ ...popupForm, content: e.target.value })}
                    placeholder='<div style="padding: 2rem; text-align: center;">&#10;  <h2>Special Offer!</h2>&#10;  <p>Get 20% off on all cakes</p>&#10;</div>'
                    rows="8"
                    required
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                )}
              </div>

              <div className="admin-form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={popupForm.active}
                    onChange={(e) => setPopupForm({ ...popupForm, active: e.target.checked })}
                  />
                  Active (shown to visitors)
                </label>
              </div>

              {popupForm.content && (
                <div className="admin-form-group" style={{ marginTop: '1rem' }}>
                  <label>
                    <button
                      type="button"
                      className="admin-btn secondary small"
                      onClick={() => setPopupPreview(!popupPreview)}
                    >
                      <i className={`fas ${popupPreview ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      {popupPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </label>
                  {popupPreview && (
                    <div className="popup-modal-preview">
                      <div className="popup-preview-square">
                        {popupForm.type === 'image' ? (
                          <img src={popupForm.content} alt="Preview" />
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: popupForm.content }} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowPopupModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  <i className="fas fa-save"></i>
                  {popupData ? 'Update Popup' : 'Save Popup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
