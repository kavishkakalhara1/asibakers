const About = () => {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Our Story</span>
          <h2 className="section-title">About AsiBakers</h2>
          <div className="title-decoration">
            <i className="fas fa-heart"></i>
          </div>
        </div>
        <div className="about-content">
          <div className="about-image">
            <div className="image-wrapper">
              <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600" alt="Bakery" />
              <div className="image-overlay">
                <i className="fas fa-gifts"></i>
              </div>
            </div>
            <div className="stat-cards">
              <div className="stat-card">
                <i className="fas fa-birthday-cake"></i>
                <h3>500+</h3>
                <p>Cakes Made</p>
              </div>
              <div className="stat-card">
                <i className="fas fa-smile"></i>
                <h3>400+</h3>
                <p>Happy Customers</p>
              </div>
            </div>
          </div>
          <div className="about-text">
            <p className="lead">
              At AsiBakers, we believe every celebration deserves a beautiful, delicious cake that creates lasting memories.
            </p>
            <p>
              Founded with passion and dedication, AsiBakers has been creating artisan cakes that combine traditional baking techniques with modern, elegant designs. Each cake is handcrafted with premium ingredients and decorated with artistic precision.
            </p>
            <div className="features-grid">
              <div className="feature-item">
                <i className="fas fa-leaf"></i>
                <div>
                  <h4>Natural Ingredients</h4>
                  <p>Only the finest, freshest ingredients</p>
                </div>
              </div>
              <div className="feature-item">
                <i className="fas fa-palette"></i>
                <div>
                  <h4>Custom Designs</h4>
                  <p>Personalized to your vision</p>
                </div>
              </div>
              <div className="feature-item">
                <i className="fas fa-truck"></i>
                <div>
                  <h4>Free Delivery</h4>
                  <p>In select areas</p>
                </div>
              </div>
              <div className="feature-item">
                <i className="fas fa-award"></i>
                <div>
                  <h4>Award Winning</h4>
                  <p>Recognized for excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
