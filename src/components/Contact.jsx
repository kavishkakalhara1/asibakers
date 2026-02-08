import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        addToast(data.message, 'success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      }
    } catch (error) {
      addToast('Failed to send message. Please try again.', 'error');
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Get In Touch</span>
          <h2 className="section-title">Contact Us</h2>
          <div className="title-decoration">
            <i className="fas fa-heart"></i>
          </div>
        </div>
        <div className="contact-content">
          <div className="contact-info">
            <h3>Let's Create Something Sweet Together!</h3>
            <p>Have a special occasion coming up? We'd love to make it memorable with our delicious cakes.</p>
            
            <div className="info-items">
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h4>Location</h4>
                  <p>Highway Rd, Godagama, Matara</p>
                </div>
              </div>
              <div className="info-item">
                <i className="fas fa-phone"></i>
                <div>
                  <h4>Phone</h4>
                  <p>0701429232</p>
                </div>
              </div>
              <div className="info-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h4>Email</h4>
                  <p>order@asibakers.shop</p>
                </div>
              </div>
              
            </div>

            <div className="social-links">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-pinterest-p"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
            </div>
          </div>
          
          <div className="contact-form-wrapper">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder=" "
                  required 
                />
                <label htmlFor="name">Your Name</label>
                <i className="fas fa-user"></i>
              </div>
              <div className="form-group">
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                  required 
                />
                <label htmlFor="email">Your Email</label>
                <i className="fas fa-envelope"></i>
              </div>
              <div className="form-group">
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="phone">Phone Number</label>
                <i className="fas fa-phone"></i>
              </div>
              <div className="form-group">
                <textarea 
                  id="message" 
                  name="message" 
                  rows="5" 
                  value={formData.message}
                  onChange={handleChange}
                  placeholder=" "
                  required
                ></textarea>
                <label htmlFor="message">Your Message</label>
                <i className="fas fa-comment-dots"></i>
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
