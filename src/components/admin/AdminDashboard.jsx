import { useState, useEffect, useCallback } from 'react';

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

  // Order management state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderDateFilter, setOrderDateFilter] = useState('all');

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

  // --- Order Management Functions ---
  const handleDeleteOrder = async (orderNumber) => {
    if (!confirm(`Are you sure you want to delete order #${orderNumber}?`)) return;
    try {
      const response = await fetch('/api/admin?action=orders', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderNumber })
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Order deleted successfully!');
        if (showOrderModal && selectedOrder?.orderNumber === orderNumber) {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }
        fetchData();
      } else {
        showMessage('error', data.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to delete order');
    }
  };

  const handleAddOrderNote = async (orderNumber, note) => {
    try {
      const response = await fetch('/api/admin?action=order-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderNumber, note })
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Note added!');
        fetchData();
        // Update selected order
        setSelectedOrder(prev => prev ? { ...prev, notes: [...(prev.notes || []), { text: note, date: new Date().toISOString() }] } : null);
      }
    } catch (error) {
      showMessage('error', 'Failed to add note');
    }
  };

  const getFilteredOrders = useCallback(() => {
    let filtered = [...orders];

    // Status filter
    if (orderStatusFilter !== 'all') {
      filtered = filtered.filter(o => (o.status || 'pending') === orderStatusFilter);
    }

    // Date filter
    if (orderDateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.createdAt || o.timestamp);
        switch (orderDateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          }
          default:
            return true;
        }
      });
    }

    // Search
    if (orderSearch.trim()) {
      const s = orderSearch.toLowerCase().trim();
      filtered = filtered.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(s) ||
        (o.customer?.name || o.name || '').toLowerCase().includes(s) ||
        (o.customer?.email || o.email || '').toLowerCase().includes(s) ||
        (o.customer?.phone || o.phone || '').toLowerCase().includes(s)
      );
    }

    return filtered;
  }, [orders, orderStatusFilter, orderDateFilter, orderSearch]);

  const getOrderTotal = (order) => {
    if (order.payment?.total) return order.payment.total;
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    return 0;
  };

  const formatCurrency = (amount) => {
    return `Rs ${(amount || 0).toLocaleString()}`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getOrderStats = useCallback(() => {
    const total = orders.length;
    const pending = orders.filter(o => (o.status || 'pending') === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const ready = orders.filter(o => o.status === 'ready').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const revenue = orders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((sum, o) => sum + getOrderTotal(o), 0);
    return { total, pending, confirmed, preparing, ready, delivered, completed, cancelled, revenue };
  }, [orders]);

  const generateInvoice = (order) => {
    const orderTotal = getOrderTotal(order);
    const items = order.items || [];
    const customer = order.customer || { name: order.name, email: order.email, phone: order.phone };
    const delivery = order.delivery || {};
    const payment = order.payment || {};
    const additional = order.additional || {};

    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background: #f5f5f5; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; }
    .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #ff69b4; }
    .brand h1 { font-size: 28px; color: #ff69b4; margin-bottom: 5px; }
    .brand p { color: #666; font-size: 13px; line-height: 1.6; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 32px; color: #333; letter-spacing: 2px; }
    .invoice-title .invoice-number { color: #ff69b4; font-weight: 600; font-size: 16px; margin-top: 5px; }
    .invoice-title .invoice-date { color: #666; font-size: 13px; margin-top: 5px; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
    .info-box { flex: 1; background: #fdf2f8; padding: 20px; border-radius: 10px; }
    .info-box h3 { color: #ff69b4; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .info-box p { font-size: 13px; line-height: 1.8; color: #444; }
    .info-box p strong { color: #333; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead th { background: #ff69b4; color: white; padding: 12px 16px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    thead th:first-child { border-radius: 8px 0 0 0; }
    thead th:last-child { border-radius: 0 8px 0 0; text-align: right; }
    tbody td { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    tbody td:last-child { text-align: right; font-weight: 600; }
    tbody tr:hover { background: #fdf2f8; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
    .totals-box { width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #555; }
    .totals-row.total { border-top: 2px solid #ff69b4; padding-top: 12px; margin-top: 8px; font-size: 18px; font-weight: 700; color: #333; }
    .notes-section { background: #fdf2f8; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
    .notes-section h3 { color: #ff69b4; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .notes-section p { font-size: 13px; color: #555; line-height: 1.6; }
    .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; line-height: 1.8; }
    .footer strong { color: #ff69b4; }
    .status-pill { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-confirmed { background: #cce5ff; color: #004085; }
    .status-preparing { background: #d4edda; color: #155724; }
    .status-ready { background: #d1ecf1; color: #0c5460; }
    .status-delivered, .status-completed { background: #d4edda; color: #155724; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
    @media print {
      body { background: white; }
      .invoice { padding: 20px; box-shadow: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="no-print" style="text-align:center;margin-bottom:20px;">
      <button onclick="window.print()" style="background:#ff69b4;color:white;border:none;padding:12px 30px;border-radius:8px;font-size:14px;cursor:pointer;font-weight:600;">
        🖨️ Print / Save as PDF
      </button>
    </div>
    <div class="invoice-header">
      <div class="brand">
        <h1>🎂 Asi Bakers</h1>
        <p>Premium Cakes & Confectionery<br>Freshly Baked with Love</p>
      </div>
      <div class="invoice-title">
        <h2>INVOICE</h2>
        <div class="invoice-number">#${order.orderNumber}</div>
        <div class="invoice-date">${formatDateTime(order.createdAt || order.timestamp)}</div>
        <div style="margin-top:8px;"><span class="status-pill status-${order.status || 'pending'}">${order.status || 'pending'}</span></div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-box">
        <h3>Customer Details</h3>
        <p><strong>${customer.name || 'N/A'}</strong></p>
        <p>${customer.email || 'N/A'}</p>
        <p>${customer.phone || 'N/A'}</p>
      </div>
      <div class="info-box">
        <h3>Delivery Details</h3>
        <p><strong>Type:</strong> ${delivery.type === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</p>
        ${delivery.address ? `<p><strong>Address:</strong> ${delivery.address.street || ''}, ${delivery.address.city || ''} ${delivery.address.zipCode || ''}</p>` : ''}
        <p><strong>Date:</strong> ${delivery.date || order.date || 'N/A'}</p>
        ${delivery.timeSlot ? `<p><strong>Time:</strong> ${delivery.timeSlot}</p>` : ''}
      </div>
      <div class="info-box">
        <h3>Payment Info</h3>
        <p><strong>Method:</strong> ${(payment.method || 'Cash').charAt(0).toUpperCase() + (payment.method || 'cash').slice(1)}</p>
        <p><strong>Status:</strong> ${order.status === 'completed' || order.status === 'delivered' ? 'Paid' : 'Pending'}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.length > 0 ? items.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>Rs ${item.price.toLocaleString()}</td>
          <td>Rs ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`).join('') : `
        <tr>
          <td>1</td>
          <td>${order.product || 'Custom Order'}</td>
          <td>1</td>
          <td>Rs ${orderTotal.toLocaleString()}</td>
          <td>Rs ${orderTotal.toLocaleString()}</td>
        </tr>`}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal</span><span>Rs ${(payment.subtotal || orderTotal).toLocaleString()}</span></div>
        <div class="totals-row"><span>Delivery Fee</span><span>Rs ${(payment.deliveryFee || 0).toLocaleString()}</span></div>
        <div class="totals-row total"><span>Total</span><span>Rs ${orderTotal.toLocaleString()}</span></div>
      </div>
    </div>

    ${additional.specialInstructions || additional.giftMessage || order.message ? `
    <div class="notes-section">
      <h3>Additional Notes</h3>
      ${additional.specialInstructions ? `<p><strong>Instructions:</strong> ${additional.specialInstructions}</p>` : ''}
      ${additional.isGift ? `<p><strong>🎁 Gift Order</strong>${additional.giftMessage ? ` - "${additional.giftMessage}"` : ''}</p>` : ''}
      ${order.message ? `<p><strong>Message:</strong> ${order.message}</p>` : ''}
    </div>` : ''}

    <div class="footer">
      <p><strong>Thank you for choosing Asi Bakers!</strong></p>
      <p>For any questions about this order, please contact us.</p>
      <p style="margin-top:8px;">This is a computer-generated invoice.</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${order.orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showMessage('success', `Invoice downloaded for #${order.orderNumber}`);
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
            {/* Order Stats Bar */}
            {(() => {
              const os = getOrderStats();
              return (
                <div className="order-stats-bar">
                  <div className="order-stat-pill total" onClick={() => setOrderStatusFilter('all')}>
                    <i className="fas fa-shopping-bag"></i>
                    <span>{os.total}</span>
                    <small>Total</small>
                  </div>
                  <div className="order-stat-pill pending" onClick={() => setOrderStatusFilter('pending')}>
                    <i className="fas fa-clock"></i>
                    <span>{os.pending}</span>
                    <small>Pending</small>
                  </div>
                  <div className="order-stat-pill confirmed" onClick={() => setOrderStatusFilter('confirmed')}>
                    <i className="fas fa-check"></i>
                    <span>{os.confirmed}</span>
                    <small>Confirmed</small>
                  </div>
                  <div className="order-stat-pill preparing" onClick={() => setOrderStatusFilter('preparing')}>
                    <i className="fas fa-blender"></i>
                    <span>{os.preparing}</span>
                    <small>Preparing</small>
                  </div>
                  <div className="order-stat-pill ready" onClick={() => setOrderStatusFilter('ready')}>
                    <i className="fas fa-box"></i>
                    <span>{os.ready}</span>
                    <small>Ready</small>
                  </div>
                  <div className="order-stat-pill delivered" onClick={() => setOrderStatusFilter('delivered')}>
                    <i className="fas fa-truck"></i>
                    <span>{os.delivered}</span>
                    <small>Delivered</small>
                  </div>
                  <div className="order-stat-pill completed" onClick={() => setOrderStatusFilter('completed')}>
                    <i className="fas fa-check-circle"></i>
                    <span>{os.completed}</span>
                    <small>Completed</small>
                  </div>
                  <div className="order-stat-pill cancelled" onClick={() => setOrderStatusFilter('cancelled')}>
                    <i className="fas fa-times-circle"></i>
                    <span>{os.cancelled}</span>
                    <small>Cancelled</small>
                  </div>
                  <div className="order-stat-pill revenue">
                    <i className="fas fa-coins"></i>
                    <span>{formatCurrency(os.revenue)}</span>
                    <small>Revenue</small>
                  </div>
                </div>
              );
            })()}

            {/* Order Filters */}
            <div className="order-filters">
              <div className="order-search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by order #, name, email, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
                {orderSearch && (
                  <button className="search-clear" onClick={() => setOrderSearch('')}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="order-filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={orderDateFilter}
                onChange={(e) => setOrderDateFilter(e.target.value)}
                className="order-filter-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            {/* Order Results Count */}
            <div className="order-results-info">
              <span>Showing {getFilteredOrders().length} of {orders.length} orders</span>
              {(orderSearch || orderStatusFilter !== 'all' || orderDateFilter !== 'all') && (
                <button className="clear-filters-btn" onClick={() => { setOrderSearch(''); setOrderStatusFilter('all'); setOrderDateFilter('all'); }}>
                  <i className="fas fa-times"></i> Clear Filters
                </button>
              )}
            </div>

            {getFilteredOrders().length === 0 ? (
              <div className="admin-empty">
                <i className="fas fa-inbox"></i>
                <p>{orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}</p>
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
                      <th>Delivery</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredOrders().map(order => (
                      <tr key={order.orderNumber} className={`order-row ${order.status || 'pending'}`}>
                        <td>
                          <strong className="order-number-link" onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}>
                            {order.orderNumber}
                          </strong>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <div className="customer-name">{order.customer?.name || order.name || 'N/A'}</div>
                            <small>{order.customer?.phone || order.phone || ''}</small>
                          </div>
                        </td>
                        <td>
                          <div className="items-cell">
                            {order.items?.length || 1} item{(order.items?.length || 1) > 1 ? 's' : ''}
                            {order.items?.length > 0 && (
                              <small className="items-preview">{order.items.map(i => i.name).join(', ')}</small>
                            )}
                          </div>
                        </td>
                        <td><strong>{formatCurrency(getOrderTotal(order))}</strong></td>
                        <td>
                          <div className="delivery-cell">
                            <i className={`fas ${order.delivery?.type === 'pickup' ? 'fa-store' : 'fa-truck'}`}></i>
                            <span>{order.delivery?.type === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <div>{order.delivery?.date || order.date || 'N/A'}</div>
                            <small>{order.delivery?.timeSlot || ''}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${order.status || 'pending'}`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns order-actions">
                            <button
                              className="admin-btn-icon edit"
                              onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="admin-btn-icon offer"
                              onClick={() => generateInvoice(order)}
                              title="Download Invoice"
                            >
                              <i className="fas fa-file-invoice"></i>
                            </button>
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => handleUpdateOrderStatus(order.orderNumber, e.target.value)}
                              className="status-select-mini"
                              title="Update Status"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                              className="admin-btn-icon delete"
                              onClick={() => handleDeleteOrder(order.orderNumber)}
                              title="Delete Order"
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

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="admin-modal order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2>Order #{selectedOrder.orderNumber}</h2>
                <span className={`status-badge ${selectedOrder.status || 'pending'}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                  {selectedOrder.status || 'Pending'}
                </span>
              </div>
              <button className="close-btn" onClick={() => setShowOrderModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="order-detail-content">
              {/* Order Timestamps */}
              <div className="order-detail-meta">
                <div><i className="fas fa-calendar-alt"></i> Placed: {formatDateTime(selectedOrder.createdAt || selectedOrder.timestamp)}</div>
                {selectedOrder.updatedAt && <div><i className="fas fa-sync-alt"></i> Updated: {formatDateTime(selectedOrder.updatedAt)}</div>}
              </div>

              {/* Customer Info */}
              <div className="order-detail-section">
                <h3><i className="fas fa-user"></i> Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <span>{selectedOrder.customer?.name || selectedOrder.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{selectedOrder.customer?.email || selectedOrder.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <span>{selectedOrder.customer?.phone || selectedOrder.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="order-detail-section">
                <h3><i className="fas fa-truck"></i> Delivery Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Type</label>
                    <span>
                      <i className={`fas ${selectedOrder.delivery?.type === 'pickup' ? 'fa-store' : 'fa-truck'}`} style={{ marginRight: '6px' }}></i>
                      {selectedOrder.delivery?.type === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                    </span>
                  </div>
                  {selectedOrder.delivery?.address && (
                    <div className="detail-item full-width">
                      <label>Address</label>
                      <span>{selectedOrder.delivery.address.street}, {selectedOrder.delivery.address.city} {selectedOrder.delivery.address.zipCode}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Delivery Date</label>
                    <span>{selectedOrder.delivery?.date || selectedOrder.date || 'N/A'}</span>
                  </div>
                  {selectedOrder.delivery?.timeSlot && (
                    <div className="detail-item">
                      <label>Time Slot</label>
                      <span>{selectedOrder.delivery.timeSlot}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="order-detail-section">
                <h3><i className="fas fa-list"></i> Order Items</h3>
                <div className="order-items-list">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div className="order-item-row" key={idx}>
                        <div className="order-item-info">
                          <strong>{item.name}</strong>
                          <span className="item-qty">× {item.quantity}</span>
                        </div>
                        <div className="order-item-price">
                          <span>{formatCurrency(item.price)} each</span>
                          <strong>{formatCurrency(item.price * item.quantity)}</strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="order-item-row">
                      <div className="order-item-info">
                        <strong>{selectedOrder.product || 'Custom Order'}</strong>
                      </div>
                      <div className="order-item-price">
                        <strong>{formatCurrency(getOrderTotal(selectedOrder))}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="order-detail-section">
                <h3><i className="fas fa-credit-card"></i> Payment Summary</h3>
                <div className="payment-summary">
                  <div className="payment-row">
                    <span>Payment Method</span>
                    <span style={{ textTransform: 'capitalize' }}>{selectedOrder.payment?.method || 'Cash'}</span>
                  </div>
                  <div className="payment-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.payment?.subtotal || getOrderTotal(selectedOrder))}</span>
                  </div>
                  <div className="payment-row">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(selectedOrder.payment?.deliveryFee || 0)}</span>
                  </div>
                  <div className="payment-row total">
                    <span>Total</span>
                    <span>{formatCurrency(getOrderTotal(selectedOrder))}</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(selectedOrder.additional?.specialInstructions || selectedOrder.additional?.isGift || selectedOrder.message) && (
                <div className="order-detail-section">
                  <h3><i className="fas fa-sticky-note"></i> Additional Information</h3>
                  <div className="detail-grid">
                    {selectedOrder.additional?.specialInstructions && (
                      <div className="detail-item full-width">
                        <label>Special Instructions</label>
                        <span>{selectedOrder.additional.specialInstructions}</span>
                      </div>
                    )}
                    {selectedOrder.additional?.isGift && (
                      <div className="detail-item full-width">
                        <label>🎁 Gift Order</label>
                        <span>{selectedOrder.additional.giftMessage || 'No gift message'}</span>
                      </div>
                    )}
                    {selectedOrder.message && (
                      <div className="detail-item full-width">
                        <label>Customer Message</label>
                        <span>{selectedOrder.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="order-detail-section">
                <h3><i className="fas fa-clipboard"></i> Admin Notes</h3>
                {selectedOrder.notes && selectedOrder.notes.length > 0 ? (
                  <div className="admin-notes-list">
                    {selectedOrder.notes.map((note, idx) => (
                      <div className="admin-note" key={idx}>
                        <small>{formatDateTime(note.date)}</small>
                        <p>{note.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#999', fontSize: '0.9rem', padding: '0.5rem 0' }}>No notes yet</p>
                )}
                <div className="add-note-form">
                  <input
                    type="text"
                    placeholder="Add a note..."
                    id="orderNoteInput"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        handleAddOrderNote(selectedOrder.orderNumber, e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn primary small"
                    onClick={() => {
                      const input = document.getElementById('orderNoteInput');
                      if (input.value.trim()) {
                        handleAddOrderNote(selectedOrder.orderNumber, input.value.trim());
                        input.value = '';
                      }
                    }}
                  >
                    <i className="fas fa-plus"></i> Add
                  </button>
                </div>
              </div>

              {/* Update Status */}
              <div className="order-detail-section">
                <h3><i className="fas fa-exchange-alt"></i> Update Status</h3>
                <div className="status-update-row">
                  <select
                    value={selectedOrder.status || 'pending'}
                    onChange={(e) => {
                      handleUpdateOrderStatus(selectedOrder.orderNumber, e.target.value);
                      setSelectedOrder({ ...selectedOrder, status: e.target.value });
                    }}
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
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem' }}>
              <button className="admin-btn danger" onClick={() => handleDeleteOrder(selectedOrder.orderNumber)}>
                <i className="fas fa-trash"></i> Delete Order
              </button>
              <button className="admin-btn primary" onClick={() => generateInvoice(selectedOrder)}>
                <i className="fas fa-file-invoice"></i> Download Invoice
              </button>
              <button className="admin-btn secondary" onClick={() => setShowOrderModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
