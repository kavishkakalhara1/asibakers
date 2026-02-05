import { useEffect } from 'react';
import '../styles/NotFound.css';

function NotFound() {
  useEffect(() => {
    document.title = '404 - Page Not Found | Asi Bakers';
  }, []);

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        {/* Decorative elements */}
        <div className="cake-decoration cake-1">🎂</div>
        <div className="cake-decoration cake-2">🧁</div>
        <div className="cake-decoration cake-3">🍰</div>
        <div className="cake-decoration cake-4">🎀</div>
        
        {/* Main content */}
        <div className="not-found-content">
          <div className="error-code">
            <span className="digit">4</span>
            <span className="digit cake-emoji">🎂</span>
            <span className="digit">4</span>
          </div>
          
          <h1 className="not-found-title">Oops! Page Not Found</h1>
          
          <p className="not-found-message">
            Looks like this cake got lost in the oven! 
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="not-found-actions">
            <button className="home-button" onClick={goHome}>
              <span className="button-icon">🏠</span>
              Back to Home
            </button>
            
            <a href="/#products" className="browse-button">
              <span className="button-icon">🛒</span>
              Browse Cakes
            </a>
          </div>
          
          <div className="helpful-links">
            <p>Or check out these pages:</p>
            <div className="links-row">
              <a href="/#about">About Us</a>
              <a href="/#gallery">Gallery</a>
              <a href="/#contact">Contact</a>
            </div>
          </div>
        </div>
        
        {/* Floating hearts animation */}
        <div className="floating-hearts">
          <span className="heart">💕</span>
          <span className="heart">💖</span>
          <span className="heart">💗</span>
          <span className="heart">💕</span>
          <span className="heart">💖</span>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
