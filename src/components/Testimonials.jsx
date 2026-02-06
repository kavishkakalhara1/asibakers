import { useState, useEffect } from 'react';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    name: '',
    email: '',
    rating: 5,
    text: ''
  });

  const defaultTestimonials = [
    {
      _id: 'default-1',
      name: 'Sarah Johnson',
      rating: 5,
      text: 'The most beautiful and delicious cake I\'ve ever had! AsiBakers made my wedding day extra special.',
      createdAt: '2025-01-15'
    },
    {
      _id: 'default-2',
      name: 'Emily Davis',
      rating: 5,
      text: 'Absolutely stunning unicorn cake for my daughter\'s birthday! She was over the moon!',
      createdAt: '2025-02-10'
    },
    {
      _id: 'default-3',
      name: 'Lisa Martinez',
      rating: 5,
      text: 'Professional service and amazing taste! Will definitely order again for future celebrations.',
      createdAt: '2025-03-05'
    }
  ];

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success && data.reviews.length > 0) {
        setReviews(data.reviews);
      } else {
        setReviews(defaultTestimonials);
      }
    } catch {
      setReviews(defaultTestimonials);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) {
        setSubmitMessage({ type: 'success', text: 'Thank you for your review! 💖' });
        setForm({ name: '', email: '', rating: 5, text: '' });
        setShowForm(false);
        fetchReviews();
      } else {
        setSubmitMessage({ type: 'error', text: data.message });
      }
    } catch {
      setSubmitMessage({ type: 'error', text: 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage({ type: '', text: '' }), 4000);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`fas fa-star ${i < rating ? '' : 'empty'}`}></i>
    ));
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
    } catch {
      return '';
    }
  };

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

        {/* Submit Message */}
        {submitMessage.text && (
          <div className={`review-submit-message ${submitMessage.type}`}>
            <i className={`fas ${submitMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {submitMessage.text}
          </div>
        )}

        {/* Reviews Grid */}
        <div className="testimonials-grid">
          {reviews.map((review) => (
            <div key={review._id} className="testimonial-card">
              <div className="stars">
                {renderStars(review.rating || 5)}
              </div>
              <p className="testimonial-text">&ldquo;{review.text}&rdquo;</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="author-info">
                  <h4>{review.name}</h4>
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Write a Review Button */}
        <div className="review-cta">
          <button className="write-review-btn" onClick={() => setShowForm(!showForm)}>
            <i className={`fas ${showForm ? 'fa-times' : 'fa-pen'}`}></i>
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="review-form-container">
            <form className="review-form" onSubmit={handleSubmit}>
              <h3><i className="fas fa-star"></i> Share Your Experience</h3>
              <div className="review-form-grid">
                <div className="review-form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="review-form-group">
                  <label>Email (optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="review-form-group">
                <label>Rating *</label>
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= form.rating ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, rating: star })}
                    >
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                  <span className="rating-label">
                    {form.rating === 1 && 'Poor'}
                    {form.rating === 2 && 'Fair'}
                    {form.rating === 3 && 'Good'}
                    {form.rating === 4 && 'Very Good'}
                    {form.rating === 5 && 'Excellent'}
                  </span>
                </div>
              </div>

              <div className="review-form-group">
                <label>Your Review *</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Tell us about your experience with AsiBakers..."
                  rows="4"
                  required
                  minLength="10"
                ></textarea>
              </div>

              <button type="submit" className="submit-review-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> Submit Review</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
