const Hero = () => {
  const scrollToSection = (sectionId) => {
    const section = document.querySelector(sectionId);
    if (!section) return;
    const navbarHeight = 80;
    const targetPosition = section.offsetTop - navbarHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  };

  return (
    <section id="home" className="hero">
      {/* Animated Cake Line */}
      <div className="cake-line-animation">
        <div className="cake-icon-wrapper cake-1">
          <i className="fas fa-birthday-cake"></i>
        </div>
        <div className="cake-icon-wrapper cake-2">
          <i className="fas fa-cupcake"></i>
        </div>
        <div className="cake-icon-wrapper cake-3">
          <i className="fas fa-cookie"></i>
        </div>
        <div className="cake-icon-wrapper cake-4">
          <i className="fas fa-ice-cream"></i>
        </div>
        <div className="cake-icon-wrapper cake-5">
          <i className="fas fa-birthday-cake"></i>
        </div>
        <div className="cake-icon-wrapper cake-6">
          <i className="fas fa-cupcake"></i>
        </div>
      </div>
      
      <div className="hero-content">
        <div className="hero-text">
          {/* Animated Logo with Cake */}
          <div className="hero-logo-animation">
            <div className="animated-cake">
              <div className="cake-topper">
                <div className="candle">
                  <div className="flame"></div>
                </div>
                <div className="candle">
                  <div className="flame"></div>
                </div>
                <div className="candle">
                  <div className="flame"></div>
                </div>
              </div>
              <div className="cake-top"></div>
              <div className="cake-middle"></div>
              <div className="cake-bottom"></div>
              <div className="cake-plate"></div>
              <div className="cake-sprinkles">
                <span></span><span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
          </div>
          
          <h1 className="hero-title">
            <span className="subtitle">Welcome to</span>
            <span className="logo-text">
              <i className="fas fa-birthday-cake logo-icon"></i>
              AsiBakers
              <i className="fas fa-birthday-cake logo-icon"></i>
            </span>
          </h1>
          <p className="hero-description">
            Where Every Slice is a Piece of Heaven
            <i className="fas fa-heart"></i>
          </p>
          <p className="hero-tagline">
            Handcrafted cakes made with love, passion, and the finest ingredients
          </p>
          <div className="hero-buttons">
            <a href="#products" className="btn btn-primary" onClick={(e) => { e.preventDefault(); scrollToSection('#products'); }}>
              <i className="fas fa-cake-candles"></i> View Menu
            </a>
            <a href="#contact" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}>
              <i className="fas fa-phone"></i> Order Now
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card card-1">
            <i className="fas fa-cupcake"></i>
            <span>Fresh Daily</span>
          </div>
          <div className="floating-card card-2">
            <i className="fas fa-heart"></i>
            <span>Made with Love</span>
          </div>
          <div className="floating-card card-3">
            <i className="fas fa-star"></i>
            <span>Premium Quality</span>
          </div>
        </div>
      </div>
      <div className="hero-decoration">
        <i className="fas fa-cookie-bite"></i>
        <i className="fas fa-ice-cream"></i>
        <i className="fas fa-candy-cane"></i>
      </div>
    </section>
  );
};

export default Hero;
