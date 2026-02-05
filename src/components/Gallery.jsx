import { useState, useRef } from 'react';

const Gallery = () => {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef(null);

  const galleryImages = [
    'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500',
    'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500',
    'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500',
    'https://images.unsplash.com/photo-1557925923-4702149a8177?w=500',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500'
  ];

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <>
      <section id="gallery" className="gallery">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Sweet Creations</span>
            <h2 className="section-title">Our Gallery</h2>
            <div className="title-decoration">
              <i className="fas fa-heart"></i>
            </div>
          </div>
          <div 
            className="gallery-grid"
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
          >
            {galleryImages.map((image, index) => (
              <div key={index} className="gallery-item" onClick={() => setLightboxImage(image)}>
                <img src={image} alt={`Cake ${index + 1}`} />
                <div className="gallery-overlay">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxImage && (
        <div 
          className="lightbox" 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            cursor: 'pointer',
            animation: 'fadeIn 0.3s'
          }}
        >
          <img 
            src={lightboxImage} 
            alt="Gallery"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(255, 105, 180, 0.5)'
            }}
          />
        </div>
      )}
    </>
  );
};

export default Gallery;
