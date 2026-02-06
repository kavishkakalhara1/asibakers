import { useState, useEffect } from 'react';

const PopupModal = () => {
  const [popup, setPopup] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already dismissed popup this session
    const dismissed = sessionStorage.getItem('popupDismissed');
    if (dismissed) return;

    const fetchPopup = async () => {
      try {
        const res = await fetch('/api/popup');
        const data = await res.json();
        if (data.success && data.popup && data.popup.active) {
          // Show popup after 2 seconds
          setTimeout(() => {
            setPopup(data.popup);
            setIsVisible(true);
          }, 2000);
        }
      } catch {
        // Silently fail
      }
    };

    fetchPopup();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('popupDismissed', 'true');
    setTimeout(() => setPopup(null), 300);
  };

  if (!popup) return null;

  return (
    <div className={`site-popup-overlay ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
      <div className="site-popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="site-popup-close" onClick={handleClose}>
          <i className="fas fa-times"></i>
        </button>
        <div className="site-popup-content">
          {popup.type === 'image' ? (
            <img src={popup.content} alt="Special Announcement" className="site-popup-image" />
          ) : (
            <div
              className="site-popup-html"
              dangerouslySetInnerHTML={{ __html: popup.content }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
