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
import './styles/App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🎂 AsiBakers website loaded successfully!');
  }, []);

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
