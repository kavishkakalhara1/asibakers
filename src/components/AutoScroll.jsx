import { useState, useEffect } from 'react';

const AutoScroll = () => {
  const [currentSection, setCurrentSection] = useState(0);

  const sections = ['home', 'about', 'products', 'gallery', 'testimonials', 'contact'];

  useEffect(() => {
    const handleScroll = () => {
      // Update current section indicator
      const scrollPosition = window.scrollY + 200;
      sections.forEach((sectionId, index) => {
        const section = document.getElementById(sectionId);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setCurrentSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSectionByIndex = (index) => {
    const section = document.getElementById(sections[index]);
    if (section) {
      const navbarHeight = 80;
      const targetPosition = section.offsetTop - navbarHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSectionClick = (index) => {
    setCurrentSection(index);
    scrollToSectionByIndex(index);
  };

  return (
    <div className="auto-scroll-control">
      {/* Section indicators */}
      <div className="section-indicators">
        {sections.map((section, index) => (
          <button
            key={section}
            className={`section-dot ${currentSection === index ? 'active' : ''}`}
            onClick={() => handleSectionClick(index)}
            title={section.charAt(0).toUpperCase() + section.slice(1)}
          >
            <span className="dot-label">{section.charAt(0).toUpperCase() + section.slice(1)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AutoScroll;
