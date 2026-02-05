import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../contexts/ToastContext';

const OrderModal = ({ productName, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    product: productName,
    date: '',
    message: ''
  });
  const { addToast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        addToast(data.message, 'success');
        setFormData({ name: '', email: '', phone: '', product: productName, date: '', message: '' });
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      addToast('Failed to place order. Please try again.', 'error');
    }
  };

  return createPortal(
    <div className="modal" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <h2>Order {productName}</h2>
        <p>Fill in your details to place an order</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              id="orderName" 
              name="name" 
              required 
              value={formData.name}
              onChange={handleChange}
              placeholder=" "
            />
            <label htmlFor="orderName">Your Name</label>
            <i className="fas fa-user"></i>
          </div>
          <div className="form-group">
            <input 
              type="email" 
              id="orderEmail" 
              name="email" 
              required 
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
            />
            <label htmlFor="orderEmail">Email Address</label>
            <i className="fas fa-envelope"></i>
          </div>
          <div className="form-group">
            <input 
              type="tel" 
              id="orderPhone" 
              name="phone" 
              required 
              value={formData.phone}
              onChange={handleChange}
              placeholder=" "
            />
            <label htmlFor="orderPhone">Phone Number</label>
            <i className="fas fa-phone"></i>
          </div>
          <div className="form-group">
            <input 
              type="text" 
              id="orderProduct" 
              name="product" 
              value={formData.product}
              onChange={handleChange}
              placeholder=" "
              readOnly
            />
            <label htmlFor="orderProduct">Product</label>
            <i className="fas fa-birthday-cake"></i>
          </div>
          <div className="form-group">
            <input 
              type="date" 
              id="orderDate" 
              name="date" 
              required 
              min={today}
              value={formData.date}
              onChange={handleChange}
              placeholder=" "
            />
            <label htmlFor="orderDate">Delivery Date</label>
            <i className="fas fa-calendar"></i>
          </div>
          <div className="form-group">
            <textarea 
              id="orderMessage" 
              name="message" 
              rows="3"
              value={formData.message}
              onChange={handleChange}
              placeholder=" "
            ></textarea>
            <label htmlFor="orderMessage">Special Instructions</label>
            <i className="fas fa-comment"></i>
          </div>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-check"></i> Place Order
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default OrderModal;
