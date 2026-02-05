import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import CartModal from './CartModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const { cartCount } = useApp();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);

      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 150) {
          setActiveSection(section.getAttribute('id'));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const section = document.querySelector(sectionId);
    const navbarHeight = 80;
    const targetPosition = section.offsetTop - navbarHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar" style={{ boxShadow: scrolled ? '0 4px 30px rgba(255, 105, 180, 0.3)' : '0 4px 20px rgba(255, 105, 180, 0.2)' }}>
      <div className="container">
        <div className="logo">
          <i className="fas fa-birthday-cake"></i>
          <span>AsiBakers</span>
        </div>
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`} id="navLinks">
          <li><a href="#home" className={activeSection === 'home' ? 'active' : ''} onClick={(e) => scrollToSection(e, '#home')}>Home</a></li>
          <li><a href="#about" className={activeSection === 'about' ? 'active' : ''} onClick={(e) => scrollToSection(e, '#about')}>About</a></li>
          <li><a href="#products" className={activeSection === 'products' ? 'active' : ''} onClick={(e) => scrollToSection(e, '#products')}>Menu</a></li>
          <li><a href="#gallery" className={activeSection === 'gallery' ? 'active' : ''} onClick={(e) => scrollToSection(e, '#gallery')}>Gallery</a></li>
          <li><a href="#contact" className={activeSection === 'contact' ? 'active' : ''} onClick={(e) => scrollToSection(e, '#contact')}>Contact</a></li>
        </ul>
        <div className="nav-actions">
          <button className="cart-btn" onClick={() => setShowCart(true)}>
            <i className="fas fa-shopping-cart"></i>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
      {showCart && <CartModal onClose={() => setShowCart(false)} />}
    </nav>
  );
};

export default Navbar;
