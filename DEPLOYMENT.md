# Deploying AsiBakers to Vercel

## Quick Deploy

### Method 1: Vercel CLI (Recommended)

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the project root:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - What's your project's name? `asibakers` (or your preferred name)
   - In which directory is your code located? `./`
   - Want to override settings? `N`

5. For production deployment:
   ```bash
   vercel --prod
   ```

### Method 2: GitHub Integration

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/asibakers.git
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New Project"

4. Import your GitHub repository

5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
   - **Install Command**: `npm install`

6. Click "Deploy"

## Environment Variables

If you add environment variables later, add them in:
- Vercel Dashboard → Project Settings → Environment Variables

## Custom Domain

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## API Routes

The serverless functions are automatically deployed from the `/api` directory:
- `/api/products` - Get all products
- `/api/contact` - Contact form submission
- `/api/order` - Order placement

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch triggers a production deployment
- Pull requests get preview deployments automatically

## Troubleshooting

### Build fails
- Check that all dependencies are in `package.json`
- Ensure `npm run build` works locally

### API routes not working
- Verify files exist in `/api` folder
- Check Vercel function logs in dashboard

### Styling issues
- Clear browser cache
- Check CSS file import paths

## Performance Optimization

The project is already optimized with:
- ✅ Vite for fast builds and HMR
- ✅ React production builds
- ✅ Automatic code splitting
- ✅ Serverless functions for API
- ✅ Static asset optimization

## Monitoring

After deployment:
1. Check Analytics in Vercel Dashboard
2. Monitor function execution logs
3. Set up custom alerts if needed

## Support

For issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
