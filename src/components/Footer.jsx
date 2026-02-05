const Footer = () => {
  const scrollToSection = (sectionId) => {
    const section = document.querySelector(sectionId);
    if (section) {
      const navbarHeight = 80;
      const targetPosition = section.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-about">
            <h3>
              <i className="fas fa-birthday-cake"></i>
              AsiBakers
            </h3>
            <p>Creating sweet memories, one cake at a time. Made with love and the finest ingredients.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}>Home</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('#about'); }}>About</a></li>
              <li><a href="#products" onClick={(e) => { e.preventDefault(); scrollToSection('#products'); }}>Menu</a></li>
              <li><a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('#gallery'); }}>Gallery</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}>Contact</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contact Info</h4>
            <p><i className="fas fa-phone"></i> +1 (555) 123-4567</p>
            <p><i className="fas fa-envelope"></i> hello@asibakers.com</p>
            <p><i className="fas fa-map-marker-alt"></i> 123 Sweet Street</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 AsiBakers. All rights reserved. Made with <i className="fas fa-heart"></i></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
