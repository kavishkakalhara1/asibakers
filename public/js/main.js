// ============ Navigation ============
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinksContainer = document.getElementById('navLinks');

// Sticky Navigation
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 4px 30px rgba(255, 105, 180, 0.3)';
    } else {
        navbar.style.boxShadow = '0 4px 20px rgba(255, 105, 180, 0.2)';
    }
});

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinksContainer.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Active Navigation on Scroll
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Smooth Scroll for Navigation Links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        // Close mobile menu if open
        navLinksContainer.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        
        // Smooth scroll
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// ============ Products Section ============
let allProducts = [];
const productsGrid = document.getElementById('productsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');

// Fetch Products from API
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Failed to load products. Please try again later.</p>';
    }
}

// Display Products
function displayProducts(products) {
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No products found.</p>';
        return;
    }
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
            ${product.popular ? '<div class="product-badge"><i class="fas fa-star"></i> Popular</div>' : ''}
        </div>
        <div class="product-info">
            <span class="product-category">${product.category}</span>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-footer">
                <span class="product-price">$${product.price}</span>
                <button class="order-btn" onclick="openOrderModal('${product.name}')">
                    <i class="fas fa-shopping-cart"></i> Order
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Filter Products
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        
        if (filter === 'all') {
            displayProducts(allProducts);
        } else {
            const filtered = allProducts.filter(product => product.category === filter);
            displayProducts(filtered);
        }
    });
});

// Initialize products
fetchProducts();

// ============ Order Modal ============
const orderModal = document.getElementById('orderModal');
const closeModalBtn = document.querySelector('.close-modal');
const orderForm = document.getElementById('orderForm');
const orderFormMessage = document.getElementById('orderFormMessage');
const orderProductInput = document.getElementById('orderProduct');

// Set minimum date for order date picker to today
const orderDateInput = document.getElementById('orderDate');
const today = new Date().toISOString().split('T')[0];
orderDateInput.setAttribute('min', today);

function openOrderModal(productName) {
    orderModal.style.display = 'block';
    orderProductInput.value = productName;
    orderFormMessage.style.display = 'none';
}

function closeOrderModal() {
    orderModal.style.display = 'none';
    orderForm.reset();
    orderFormMessage.style.display = 'none';
}

closeModalBtn.addEventListener('click', closeOrderModal);

window.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        closeOrderModal();
    }
});

// Handle Order Form Submission
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('orderName').value,
        email: document.getElementById('orderEmail').value,
        phone: document.getElementById('orderPhone').value,
        product: document.getElementById('orderProduct').value,
        date: document.getElementById('orderDate').value,
        message: document.getElementById('orderMessage').value
    };
    
    try {
        const response = await fetch('/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            orderFormMessage.className = 'form-message success';
            orderFormMessage.textContent = data.message;
            orderFormMessage.style.display = 'block';
            orderForm.reset();
            
            setTimeout(() => {
                closeOrderModal();
            }, 3000);
        } else {
            throw new Error('Order failed');
        }
    } catch (error) {
        orderFormMessage.className = 'form-message error';
        orderFormMessage.textContent = 'Failed to place order. Please try again.';
        orderFormMessage.style.display = 'block';
    }
});

// ============ Contact Form ============
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            formMessage.className = 'form-message success';
            formMessage.textContent = data.message;
            formMessage.style.display = 'block';
            contactForm.reset();
            
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Failed to send message. Please try again.';
        formMessage.style.display = 'block';
    }
});

// ============ Gallery Lightbox Effect ============
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            cursor: pointer;
            animation: fadeIn 0.3s;
        `;
        
        const lightboxImg = document.createElement('img');
        lightboxImg.src = img.src;
        lightboxImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(255, 105, 180, 0.5);
        `;
        
        lightbox.appendChild(lightboxImg);
        document.body.appendChild(lightbox);
        
        lightbox.addEventListener('click', () => {
            lightbox.remove();
        });
    });
});

// ============ Scroll Animations ============
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.product-card, .gallery-item, .testimonial-card, .feature-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// ============ Scroll to Top Button ============
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff69b4, #d4a5f4);
    color: white;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(255, 105, 180, 0.3);
    display: none;
    z-index: 1000;
    transition: all 0.3s;
`;

document.body.appendChild(scrollToTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

scrollToTopBtn.addEventListener('mouseenter', () => {
    scrollToTopBtn.style.transform = 'scale(1.1) translateY(-5px)';
});

scrollToTopBtn.addEventListener('mouseleave', () => {
    scrollToTopBtn.style.transform = 'scale(1) translateY(0)';
});

// ============ Loading Animation ============
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
});

console.log('🎂 AsiBakers website loaded successfully!');
