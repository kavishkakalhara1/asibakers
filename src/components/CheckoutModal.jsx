import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

const CheckoutModal = ({ onClose, onSuccess }) => {
  const { cart, cartTotal, clearCart } = useApp();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [formData, setFormData] = useState({
    // Customer Info
    name: '',
    email: '',
    phone: '',
    // Delivery Info
    deliveryType: 'delivery',
    address: '',
    city: '',
    zipCode: '',
    // Schedule
    deliveryDate: '',
    timeSlot: '',
    // Payment
    paymentMethod: 'cash',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    // Additional
    specialInstructions: '',
    giftMessage: '',
    isGift: false
  });

  const today = new Date();
  const minDate = new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0];

  const timeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '5:00 PM - 7:00 PM'
  ];

  const deliveryFee = formData.deliveryType === 'delivery' ? 5.99 : 0;
  const totalAmount = cartTotal + deliveryFee;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = (stepNum) => {
    switch (stepNum) {
      case 1:
        return formData.name && formData.email && formData.phone;
      case 2:
        if (formData.deliveryType === 'pickup') return true;
        return formData.address && formData.city && formData.zipCode;
      case 3:
        return formData.deliveryDate && formData.timeSlot;
      case 4:
        if (formData.paymentMethod === 'cash') return true;
        return formData.cardNumber && formData.cardExpiry && formData.cardCvv;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    } else {
      addToast('Please fill in all required fields', 'error');
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const orderData = {
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      },
      delivery: {
        type: formData.deliveryType,
        address: formData.deliveryType === 'delivery' ? {
          street: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        } : null,
        date: formData.deliveryDate,
        timeSlot: formData.timeSlot
      },
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      payment: {
        method: formData.paymentMethod,
        subtotal: cartTotal,
        deliveryFee: deliveryFee,
        total: totalAmount
      },
      additional: {
        specialInstructions: formData.specialInstructions,
        isGift: formData.isGift,
        giftMessage: formData.giftMessage
      }
    };

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrderNumber(data.orderNumber || 'ASI' + Date.now().toString().slice(-6));
        setOrderComplete(true);
        clearCart();
        addToast('Order placed successfully! 🎉', 'success');
      } else {
        addToast('Failed to place order. Please try again.', 'error');
      }
    } catch (error) {
      addToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="checkout-steps">
      {[1, 2, 3, 4, 5].map(num => (
        <div 
          key={num} 
          className={`step-indicator ${step === num ? 'active' : ''} ${step > num ? 'completed' : ''}`}
        >
          <div className="step-number">
            {step > num ? <i className="fas fa-check"></i> : num}
          </div>
          <span className="step-label">
            {num === 1 && 'Details'}
            {num === 2 && 'Address'}
            {num === 3 && 'Schedule'}
            {num === 4 && 'Payment'}
            {num === 5 && 'Review'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="checkout-step">
      <h3><i className="fas fa-user"></i> Your Details</h3>
      <div className="checkout-form-grid">
        <div className="form-group">
          <input
            type="text"
            id="checkoutName"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder=" "
            required
          />
          <label htmlFor="checkoutName">Full Name *</label>
          <i className="fas fa-user"></i>
        </div>
        <div className="form-group">
          <input
            type="email"
            id="checkoutEmail"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder=" "
            required
          />
          <label htmlFor="checkoutEmail">Email Address *</label>
          <i className="fas fa-envelope"></i>
        </div>
        <div className="form-group full-width">
          <input
            type="tel"
            id="checkoutPhone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder=" "
            required
          />
          <label htmlFor="checkoutPhone">Phone Number *</label>
          <i className="fas fa-phone"></i>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="checkout-step">
      <h3><i className="fas fa-map-marker-alt"></i> Delivery Method</h3>
      
      <div className="delivery-options">
        <label className={`delivery-option ${formData.deliveryType === 'delivery' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="deliveryType"
            value="delivery"
            checked={formData.deliveryType === 'delivery'}
            onChange={handleChange}
          />
          <div className="option-content">
            <i className="fas fa-truck"></i>
            <span className="option-title">Home Delivery</span>
            <span className="option-price">+$5.99</span>
          </div>
        </label>
        <label className={`delivery-option ${formData.deliveryType === 'pickup' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="deliveryType"
            value="pickup"
            checked={formData.deliveryType === 'pickup'}
            onChange={handleChange}
          />
          <div className="option-content">
            <i className="fas fa-store"></i>
            <span className="option-title">Store Pickup</span>
            <span className="option-price">Free</span>
          </div>
        </label>
      </div>

      {formData.deliveryType === 'delivery' && (
        <div className="checkout-form-grid address-fields">
          <div className="form-group full-width">
            <input
              type="text"
              id="checkoutAddress"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="checkoutAddress">Street Address *</label>
            <i className="fas fa-home"></i>
          </div>
          <div className="form-group">
            <input
              type="text"
              id="checkoutCity"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="checkoutCity">City *</label>
            <i className="fas fa-city"></i>
          </div>
          <div className="form-group">
            <input
              type="text"
              id="checkoutZip"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="checkoutZip">ZIP Code *</label>
            <i className="fas fa-mail-bulk"></i>
          </div>
        </div>
      )}

      {formData.deliveryType === 'pickup' && (
        <div className="pickup-info">
          <i className="fas fa-info-circle"></i>
          <div>
            <strong>Pickup Location:</strong>
            <p>AsiBakers Main Store<br />123 Bakery Street, Sweet Town<br />Open: 9 AM - 8 PM</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="checkout-step">
      <h3><i className="fas fa-calendar-alt"></i> Schedule {formData.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}</h3>
      
      <div className="checkout-form-grid">
        <div className="form-group full-width">
          <input
            type="date"
            id="checkoutDate"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
            min={minDate}
            placeholder=" "
            required
          />
          <label htmlFor="checkoutDate">{formData.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'} Date *</label>
          <i className="fas fa-calendar"></i>
        </div>
      </div>

      <div className="time-slots">
        <p className="time-slots-label">Select Time Slot *</p>
        <div className="time-slot-grid">
          {timeSlots.map(slot => (
            <label 
              key={slot}
              className={`time-slot ${formData.timeSlot === slot ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="timeSlot"
                value={slot}
                checked={formData.timeSlot === slot}
                onChange={handleChange}
              />
              <i className="fas fa-clock"></i>
              <span>{slot}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="checkout-step">
      <h3><i className="fas fa-credit-card"></i> Payment Method</h3>
      
      <div className="payment-options">
        <label className={`payment-option ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="cash"
            checked={formData.paymentMethod === 'cash'}
            onChange={handleChange}
          />
          <div className="option-content">
            <i className="fas fa-money-bill-wave"></i>
            <span>Cash on {formData.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}</span>
          </div>
        </label>
        <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={formData.paymentMethod === 'card'}
            onChange={handleChange}
          />
          <div className="option-content">
            <i className="fas fa-credit-card"></i>
            <span>Credit/Debit Card</span>
          </div>
        </label>
      </div>

      {formData.paymentMethod === 'card' && (
        <div className="card-details">
          <div className="form-group full-width">
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder=" "
              maxLength="19"
              required
            />
            <label htmlFor="cardNumber">Card Number *</label>
            <i className="fas fa-credit-card"></i>
          </div>
          <div className="checkout-form-grid">
            <div className="form-group">
              <input
                type="text"
                id="cardExpiry"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={handleChange}
                placeholder=" "
                maxLength="5"
                required
              />
              <label htmlFor="cardExpiry">MM/YY *</label>
              <i className="fas fa-calendar"></i>
            </div>
            <div className="form-group">
              <input
                type="text"
                id="cardCvv"
                name="cardCvv"
                value={formData.cardCvv}
                onChange={handleChange}
                placeholder=" "
                maxLength="4"
                required
              />
              <label htmlFor="cardCvv">CVV *</label>
              <i className="fas fa-lock"></i>
            </div>
          </div>
          <div className="secure-badge">
            <i className="fas fa-shield-alt"></i>
            Your payment information is secure and encrypted
          </div>
        </div>
      )}

      <div className="gift-option">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="isGift"
            checked={formData.isGift}
            onChange={handleChange}
          />
          <span className="checkbox-custom"></span>
          <i className="fas fa-gift"></i>
          This is a gift
        </label>
        
        {formData.isGift && (
          <div className="form-group full-width">
            <textarea
              id="giftMessage"
              name="giftMessage"
              value={formData.giftMessage}
              onChange={handleChange}
              placeholder=" "
              rows="3"
            />
            <label htmlFor="giftMessage">Gift Message</label>
            <i className="fas fa-envelope-open-text"></i>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="checkout-step review-step">
      <h3><i className="fas fa-clipboard-check"></i> Review Your Order</h3>
      
      <div className="order-review">
        <div className="review-section">
          <h4><i className="fas fa-shopping-bag"></i> Order Items</h4>
          <div className="review-items">
            {cart.map(item => (
              <div key={item.id} className="review-item">
                <img src={item.image} alt={item.name} />
                <div className="review-item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="review-section">
          <h4><i className="fas fa-user"></i> Customer Details</h4>
          <p>{formData.name}</p>
          <p>{formData.email}</p>
          <p>{formData.phone}</p>
        </div>

        <div className="review-section">
          <h4><i className="fas fa-map-marker-alt"></i> {formData.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'} Details</h4>
          {formData.deliveryType === 'delivery' ? (
            <p>{formData.address}, {formData.city} {formData.zipCode}</p>
          ) : (
            <p>Store Pickup - AsiBakers Main Store</p>
          )}
          <p><i className="fas fa-calendar"></i> {new Date(formData.deliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><i className="fas fa-clock"></i> {formData.timeSlot}</p>
        </div>

        <div className="review-section">
          <h4><i className="fas fa-credit-card"></i> Payment</h4>
          <p>{formData.paymentMethod === 'cash' ? `Cash on ${formData.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}` : 'Credit/Debit Card'}</p>
        </div>

        {formData.isGift && (
          <div className="review-section gift-section">
            <h4><i className="fas fa-gift"></i> Gift</h4>
            <p>{formData.giftMessage || 'No message'}</p>
          </div>
        )}

        <div className="form-group full-width">
          <textarea
            id="specialInstructions"
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleChange}
            placeholder=" "
            rows="2"
          />
          <label htmlFor="specialInstructions">Special Instructions (optional)</label>
          <i className="fas fa-comment"></i>
        </div>

        <div className="order-total-summary">
          <div className="total-row">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>{formData.deliveryType === 'delivery' ? 'Delivery Fee' : 'Pickup'}</span>
            <span>{deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'Free'}</span>
          </div>
          <div className="total-row grand-total">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderComplete = () => (
    <div className="order-complete">
      <div className="success-animation">
        <div className="success-checkmark">
          <i className="fas fa-check"></i>
        </div>
        <div className="confetti">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="confetti-piece"></div>
          ))}
        </div>
      </div>
      <h2>Order Placed Successfully!</h2>
      <p className="order-number">Order Number: <strong>{orderNumber}</strong></p>
      <p className="order-message">
        Thank you for your order! We've sent a confirmation email to <strong>{formData.email}</strong>.
      </p>
      <div className="order-summary-brief">
        <p><i className="fas fa-calendar"></i> {formData.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}: {new Date(formData.deliveryDate).toLocaleDateString()}</p>
        <p><i className="fas fa-clock"></i> {formData.timeSlot}</p>
        <p><i className="fas fa-dollar-sign"></i> Total: ${totalAmount.toFixed(2)}</p>
      </div>
      <button className="btn btn-primary" onClick={onClose}>
        <i className="fas fa-home"></i> Continue Shopping
      </button>
    </div>
  );

  return createPortal(
    <div className="modal checkout-modal" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content checkout-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        {!orderComplete ? (
          <>
            <div className="checkout-header">
              <h2><i className="fas fa-shopping-bag"></i> Checkout</h2>
              <p>{cart.length} item{cart.length !== 1 ? 's' : ''} in your order</p>
            </div>
            
            {renderStepIndicator()}
            
            <div className="checkout-body">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
            </div>
            
            <div className="checkout-footer">
              {step > 1 && (
                <button className="btn btn-secondary" onClick={prevStep}>
                  <i className="fas fa-arrow-left"></i> Back
                </button>
              )}
              {step < 5 ? (
                <button className="btn btn-primary" onClick={nextStep}>
                  Continue <i className="fas fa-arrow-right"></i>
                </button>
              ) : (
                <button 
                  className="btn btn-primary place-order-btn" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Place Order - ${totalAmount.toFixed(2)}
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        ) : (
          renderOrderComplete()
        )}
      </div>
    </div>,
    document.body
  );
};

export default CheckoutModal;
