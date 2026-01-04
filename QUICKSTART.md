# 🚀 Quick Start Guide

Get your trading dashboard up and running in 5 minutes!

## Prerequisites

- **Node.js 16+** ([Download here](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **A code editor** (VS Code recommended)

## Setup Steps

### 1. Create Project Structure

Create a new folder and add these files:

```
trading-dashboard/
├── src/
│   ├── TradingDashboard.jsx    (the main component)
│   ├── App.js
│   ├── index.js
│   └── index.css
├── public/
│   └── index.html
├── package.json
├── tailwind.config.js
└── .gitignore
```

### 2. Install Dependencies

```bash
# Navigate to project folder
cd trading-dashboard

# Install all dependencies
npm install

# Or if you prefer yarn
yarn install
```

This will install:
- React 18
- React DOM
- Lucide React (icons)
- Tailwind CSS
- React Scripts

### 3. Create Required Files

**src/index.js:**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**src/App.js:**
```javascript
import TradingDashboard from './TradingDashboard';

function App() {
  return <TradingDashboard />;
}

export default App;
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**public/index.html:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Trading Dashboard - Analyze your trading performance" />
    <title>Trading Dashboard</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### 4. Copy the Main Component

Copy `trading-dashboard.jsx` to `src/TradingDashboard.jsx`

### 5. Start Development Server

```bash
npm start
```

Your browser will automatically open to `http://localhost:3000`

## 🎉 You're Done!

You should now see the trading dashboard with:
- Dark themed interface
- Upload areas for CSV and chart
- "No Data Yet" message

## Next Steps

1. **Export your TradingView journal:**
   - Open TradingView
   - Go to Trading Panel → History
   - Export as CSV

2. **Upload to dashboard:**
   - Click "Upload CSV Journal"
   - Select your file
   - Watch your stats appear!

3. **Customize (optional):**
   - Edit colors in `tailwind.config.js`
   - Modify metrics in `TradingDashboard.jsx`
   - Add your own features!

## Troubleshooting

### Port 3000 already in use?

```bash
# Use a different port
PORT=3001 npm start
```

### Tailwind styles not working?

```bash
# Clear cache and restart
rm -rf node_modules
npm install
npm start
```

### Module not found errors?

```bash
# Reinstall dependencies
npm install react react-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
```

### Build errors?

- Make sure you're using Node 16+
- Check that all files are in the correct folders
- Verify `package.json` has all dependencies

## Production Build

Ready to deploy?

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Deploy Options

### Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Auto-deploys on push!

### Netlify
1. Drag and drop `build/` folder
2. Done!

### GitHub Pages
```bash
npm install -g gh-pages
npm run build
gh-pages -d build
```

## Support

- 📚 Read the [README](./README.md) for features
- 🔧 Check [Developer Docs](./DEVELOPER_README.md) for technical details
- 🛠️ See [Integration Guide](./INTEGRATION_GUIDE.md) for advanced setup
- 🐛 Report issues on GitHub

## Common Questions

**Q: Can I use this without Node.js?**
A: Yes! Open the dashboard.jsx in any React sandbox (CodeSandbox, StackBlitz)

**Q: Is my data safe?**
A: Absolutely! Everything runs in your browser. No data is sent anywhere.

**Q: Can I customize the colors?**
A: Yes! Edit `tailwind.config.js` to change the color scheme.

**Q: Does this work with other trading platforms?**
A: Currently only TradingView CSV exports are supported, but you can modify the parser.

**Q: Can I export my stats?**
A: Not yet, but it's on the roadmap! You can screenshot or use browser print.

---

**Need help?** Open an issue on GitHub or check the documentation files included.

**Happy trading! 📈**
