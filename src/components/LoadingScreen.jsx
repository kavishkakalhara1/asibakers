import { useState, useEffect } from 'react';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onLoadingComplete();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* Animated Cake Stack */}
        <div className="cake-stack">
          <div className="cake-layer layer-3">
            <i className="fas fa-birthday-cake"></i>
          </div>
          <div className="cake-layer layer-2">
            <i className="fas fa-birthday-cake"></i>
          </div>
          <div className="cake-layer layer-1">
            <i className="fas fa-birthday-cake"></i>
          </div>
        </div>
        
        {/* Logo and Title */}
        <div className="loading-logo">
          <h1>AsiBakers</h1>
          <p className="loading-tagline">
            <i className="fas fa-heart"></i> Baking Sweet Memories <i className="fas fa-heart"></i>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              <div className="progress-shine"></div>
            </div>
          </div>
          <p className="progress-text">{Math.round(progress)}%</p>
        </div>

        {/* Floating Elements */}
        <div className="loading-decorations">
          <i className="fas fa-cupcake deco-1"></i>
          <i className="fas fa-cookie deco-2"></i>
          <i className="fas fa-ice-cream deco-3"></i>
          <i className="fas fa-candy-cane deco-4"></i>
          <i className="fas fa-cookie-bite deco-5"></i>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
