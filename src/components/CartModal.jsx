import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import CheckoutModal from './CheckoutModal';

const CartModal = ({ onClose }) => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal, clearCart } = useApp();
  const { addToast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleCheckout = () => {
    if (cart.length === 0) {
      addToast('Your cart is empty!', 'error');
      return;
    }
    setShowCheckout(true);
  };

  const handleClearCart = () => {
    clearCart();
    addToast('Cart cleared', 'info');
  };

  if (showCheckout) {
    return <CheckoutModal onClose={onClose} onSuccess={() => onClose()} />;
  }

  return createPortal(
    <div className="modal" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content cart-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <h2>
          <i className="fas fa-shopping-cart"></i>
          Your Cart
        </h2>
        
        {cart.length === 0 ? (
          <div className="empty-cart">
            <i className="fas fa-shopping-basket"></i>
            <p>Your cart is empty</p>
            <button className="btn btn-primary" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p className="cart-item-price">Rs {item.price}</p>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => {
                      removeFromCart(item.id);
                      addToast('Removed from cart', 'info');
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <span className="total-amount">Rs {cartTotal.toFixed(2)}</span>
              </div>
              <div className="cart-actions">
                <button className="btn btn-secondary" onClick={handleClearCart}>
                  Clear Cart
                </button>
                <button className="btn btn-primary" onClick={handleCheckout}>
                  <i className="fas fa-credit-card"></i> Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CartModal;
