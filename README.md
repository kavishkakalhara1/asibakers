# AsiBakers - Modern Cake Shop Website

A beautiful, modern website for AsiBakers cake shop featuring a girlish aesthetic with soft colors and elegant design. Built with React and Vite for optimal performance and deployed on Vercel.

## Features
- Modern, responsive React design
- Product showcase with filtering
- Image gallery with lightbox
- Contact form
- Order functionality with modal
- Smooth scrolling navigation
- Scroll-to-top button
- Optimized for Vercel deployment

## Installation

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy

Or connect your GitHub repository to Vercel for automatic deployments.

## Technologies
- Frontend: React 18, Vite
- Backend: Vercel Serverless Functions
- Styling: CSS3 with CSS Variables
- Icons: Font Awesome
- Fonts: Google Fonts (Playfair Display, Poppins)

## Project Structure
```
├── api/                    # Vercel serverless functions
│   ├── products.js        # Products API
│   ├── contact.js         # Contact form handler
│   └── order.js           # Order processing
├── src/
│   ├── components/        # React components
│   ├── styles/            # CSS files
│   ├── App.jsx            # Main App component
│   └── main.jsx           # Entry point
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
└── vercel.json            # Vercel configuration
```
