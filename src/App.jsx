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
import NotFound from './components/NotFound';
import './styles/App.css';

// Valid routes for the application
const VALID_ROUTES = ['/', '/admin', '/index.html'];

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('home');

  useEffect(() => {
    // Check current route
    const checkRoute = () => {
      const pathname = window.location.pathname;
      
      if (pathname === '/admin' || window.location.hash === '#admin') {
        setCurrentRoute('admin');
      } else if (VALID_ROUTES.includes(pathname) || pathname.startsWith('/#')) {
        setCurrentRoute('home');
      } else {
        setCurrentRoute('404');
      }
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

  // Admin route - no loading screen needed
  if (currentRoute === 'admin') {
    return <Admin />;
  }

  // 404 route - no loading screen needed
  if (currentRoute === '404') {
    return <NotFound />;
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
