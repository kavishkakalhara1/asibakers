const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Bride',
      text: 'The most beautiful and delicious cake I\'ve ever had! AsiBakers made my wedding day extra special.'
    },
    {
      name: 'Emily Davis',
      role: 'Happy Mom',
      text: 'Absolutely stunning unicorn cake for my daughter\'s birthday! She was over the moon!'
    },
    {
      name: 'Lisa Martinez',
      role: 'Regular Customer',
      text: 'Professional service and amazing taste! Will definitely order again for future celebrations.'
    }
  ];

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Reviews</span>
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="title-decoration">
            <i className="fas fa-heart"></i>
          </div>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
