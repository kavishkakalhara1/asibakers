import { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AutoScroll from './components/AutoScroll';
import Admin from './components/admin/Admin';
import './styles/App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if current path is /admin
    const checkRoute = () => {
      setIsAdmin(window.location.pathname === '/admin' || window.location.hash === '#admin');
    };
    
    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    
    console.log('🎂 AsiBakers website loaded successfully!');
    
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  // Admin route
  if (isAdmin) {
    return <Admin />;
  }

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />;
  }

  return (
    <AppProvider>
      <ToastProvider>
        <Navbar />
        <Hero />
        <About />
        <Products />
        <Gallery />
        <Testimonials />
        <Contact />
        <Footer />
        <ScrollToTop />
        <AutoScroll />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
