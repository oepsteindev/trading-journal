# Quick Integration Guide

## Adding to Existing React Project

### Option 1: Direct Component Integration

1. **Copy the component file:**
```bash
cp trading-dashboard.jsx src/components/TradingDashboard.jsx
```

2. **Install dependencies:**
```bash
npm install lucide-react
```

3. **Ensure Tailwind CSS is configured:**

`tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

4. **Import and use:**
```javascript
import TradingDashboard from './components/TradingDashboard';

function App() {
  return <TradingDashboard />;
}
```

### Option 2: Create React App from Scratch

```bash
# Create new React app
npx create-react-app trading-dashboard
cd trading-dashboard

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install icons
npm install lucide-react

# Copy component
cp trading-dashboard.jsx src/TradingDashboard.jsx

# Update src/index.css
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Update `src/App.js`:
```javascript
import TradingDashboard from './TradingDashboard';

function App() {
  return <TradingDashboard />;
}

export default App;
```

## Standalone HTML (No Build Step)

For quick testing without a build process:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trading Dashboard</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="module">
    // Paste component code here and render
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(TradingDashboard));
  </script>
</body>
</html>
```

## VS Code Setup

Recommended extensions:
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **Prettier - Code formatter**

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*=\\s*['\"`]([^'\"`]*)['\"`]", "['\"`]([^'\"`]*)['\"`]"]
  ]
}
```

## Environment Setup

### Node Version
Use Node 16+ (LTS recommended)

```bash
# Check version
node --version

# Use nvm to switch versions
nvm use 16
```

### Package Manager

Works with npm, yarn, or pnpm:

```bash
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install
```

## Deployment

### Vercel

1. Push code to GitHub
2. Import project to Vercel
3. Deploy automatically

### Netlify

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=build
```

### Static Server

```bash
# Install serve
npm install -g serve

# Serve build folder
serve -s build
```

## Troubleshooting

**Tailwind not working:**
- Check `tailwind.config.js` content paths
- Verify `@tailwind` directives in CSS
- Restart dev server

**Icons not showing:**
- Verify `lucide-react` is installed
- Check import statement
- Clear node_modules and reinstall

**Build errors:**
- Update React to 18+
- Check for ESLint errors
- Verify all imports are correct

## File Structure

```
trading-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── TradingDashboard.jsx    # Main component
│   ├── index.css                # Tailwind imports
│   ├── index.js                 # React entry point
│   └── App.js                   # App wrapper
├── package.json
├── tailwind.config.js
├── README.md
└── DEVELOPER_README.md
```

## Next Steps

1. Read the [Developer Documentation](./DEVELOPER_README.md)
2. Customize colors and styling
3. Add your own metrics
4. Deploy to production

## Quick Commands

```bash
# Development
npm start

# Production build
npm run build

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```
