# Trading Dashboard - Developer Documentation

## Architecture Overview

This is a single-page React application that provides advanced trading analytics and visualization. The entire application is contained in one React component with no external dependencies beyond React, Tailwind CSS, and Lucide icons.

## Tech Stack

- **React 18+** - Functional components with Hooks
- **Tailwind CSS** - Utility-first styling with dark mode
- **Lucide React** - Icon library
- **Pure SVG** - Custom-built equity curve charts
- **Native JavaScript** - All data processing and calculations

## Core Components & Architecture

### State Management

The application uses React's `useState` hook for all state management:

```javascript
const [trades, setTrades] = useState([]);           // Parsed trade data
const [stats, setStats] = useState(null);           // Calculated statistics
const [chartImage, setChartImage] = useState(null); // Uploaded chart image
const [uploadStatus, setUploadStatus] = useState({  // Upload tracking
  csv: false, 
  chart: false 
});
const [viewMode, setViewMode] = useState('all');    // Time period filter
const [groupedStats, setGroupedStats] = useState(null); // Grouped data
```

## Data Flow

### 1. CSV Upload & Parsing

**Function:** `parseTradingJournal(text)`

**Input:** Raw CSV text from TradingView journal export

**Process:**
1. Splits CSV into lines and filters empty ones
2. Iterates through each line looking for execution messages
3. Uses regex to extract price, units, and order details
4. Looks ahead 5 lines to determine if order is BUY or SELL
5. Tracks open positions using `currentPosition` variable
6. When opposite order type is found, closes position and calculates P&L
7. Builds array of completed trades

**Trade Object Structure:**
```javascript
{
  entryTime: string,      // ISO timestamp
  entryType: 'BUY'|'SELL',
  entryPrice: number,
  exitTime: string,       // ISO timestamp
  exitType: 'BUY'|'SELL',
  exitPrice: number,
  size: number,           // Position size in units
  pnl: number,            // Profit/loss in USD
  duration: number        // Trade duration in milliseconds
}
```

**Key Algorithm - P&L Calculation:**
```javascript
const pnl = currentPosition.type === 'BUY' 
  ? (price - currentPosition.entryPrice) * units  // Long position
  : (currentPosition.entryPrice - price) * units; // Short position
```

### 2. Statistics Calculation

**Function:** `calculateStats(trades)`

**Metrics Calculated:**
- Total trades, wins, losses
- Win rate percentage
- Average win/loss amounts
- Profit factor (avg win / avg loss ratio)
- Largest win/loss
- Average trade duration
- Max win/loss streaks

**Equity Curve Generation:**
```javascript
let cumPnL = 0;
const equityCurve = trades.map((t, i) => {
  cumPnL += t.pnl;
  return { trade: i + 1, pnl: cumPnL };
});
```

This creates a cumulative P&L progression for charting.

### 3. Time Period Grouping

**Function:** `groupTradesByPeriod(trades, period)`

**Periods Supported:** `'day'`, `'week'`, `'month'`

**Process:**
1. Iterates through trades and extracts exit time
2. Generates key based on period type:
   - **Day:** `YYYY-MM-DD` format using local timezone
   - **Week:** Monday of the week in `YYYY-MM-DD` format
   - **Month:** `YYYY-MM` format
3. Groups trades by generated key
4. Calculates statistics for each group
5. Sorts keys in reverse chronological order

**Important Note on Timezones:**
Uses local dates instead of UTC to prevent timezone shift issues:
```javascript
key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
```

## Rendering Functions

### Main Stats Section

**Function:** `renderStatsSection(periodStats, title, periodTrades)`

Renders a complete analytics view including:
1. Portfolio value display (large format)
2. SVG equity curve with gradient fill
3. Four key metric cards
4. Performance and statistics panels
5. Complete trade history table

### Monthly Calendar View

**Function:** `renderMonthCalendar(monthKey, monthData)`

**Algorithm:**
1. Parses month key to get year and month
2. Calculates first day of month and days in month
3. Determines starting day of week (0 = Sunday)
4. Groups trades by day of month
5. Calculates daily statistics (P&L, win rate, trade count)
6. Builds calendar grid with proper week alignment
7. Color codes days: green (profit), red (loss), gray (no activity)

**Calendar Grid Structure:**
- 7 columns (Sun-Sat)
- Variable rows based on month length
- Each cell is a square (aspect-square)
- Displays day number, P&L, win rate, trade count

## Chart Rendering (SVG)

### Equity Curve

The equity curve is rendered using pure SVG with no external chart libraries.

**Key Components:**

1. **Grid Lines:**
```javascript
{[0, 25, 50, 75, 100].map(y => (
  <line x1="0" y1={y * 4} x2="1000" y2={y * 4} 
        stroke="#334155" strokeWidth="1" />
))}
```

2. **Gradient Fill:**
```javascript
<linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
</linearGradient>
```

3. **Line & Area:**
- Uses `<polygon>` for gradient-filled area
- Uses `<polyline>` for line stroke
- Coordinates calculated with viewport of 1000x400

**Coordinate Calculation:**
```javascript
const points = equityCurve.map((point, i) => {
  const x = (i / (equityCurve.length - 1)) * 1000;
  const minPnL = Math.min(...equityCurve.map(p => p.pnl), 0);
  const maxPnL = Math.max(...equityCurve.map(p => p.pnl), 0);
  const range = maxPnL - minPnL || 1;
  const y = 350 - ((point.pnl - minPnL) / range) * 300;
  return `${x},${y}`;
}).join(' ');
```

## Styling System

### Color Palette

**Background:**
- Primary: `slate-950` to `slate-900` gradient
- Cards: `slate-800/50` with backdrop blur
- Borders: `slate-700/50`

**Accent Colors:**
- Profit: `emerald-400` (#10b981)
- Loss: `rose-400` (#f43f5e)
- Neutral: Gray scale

**Gradients (for cards & buttons):**
- Cyan → Blue: Win rate
- Purple → Pink: Total trades
- Orange → Red: Profit factor
- Teal → Emerald: Duration

### Responsive Design

Uses Tailwind's responsive prefixes:
- `grid-cols-1 md:grid-cols-2` - Mobile: 1 column, Desktop: 2 columns
- `grid-cols-2 md:grid-cols-4` - Mobile: 2 columns, Desktop: 4 columns
- `text-sm md:text-base` - Responsive font sizes

## File Upload Handling

### CSV Upload
```javascript
const reader = new FileReader();
reader.onload = (event) => {
  const text = event.target.result;
  // Process CSV text
};
reader.readAsText(file);
```

### Image Upload
```javascript
const reader = new FileReader();
reader.onload = (event) => {
  setChartImage(event.target.result); // Base64 data URL
};
reader.readAsDataURL(file);
```

## Performance Considerations

### Optimizations
1. **Single render pass** - All calculations done on upload, not on every render
2. **Memoization candidate** - Consider `useMemo` for expensive calculations if scaling
3. **Virtual scrolling** - For large trade lists (>1000 trades), consider react-window
4. **SVG optimization** - Charts use `preserveAspectRatio="none"` for efficiency

### Potential Bottlenecks
- CSV parsing is synchronous (could use Web Workers for huge files)
- Stats calculation is O(n) per trade array
- Calendar rendering iterates through all trades multiple times

## Extension Points

### Adding New Metrics
Add calculations to `calculateStats()` function:
```javascript
const sharpeRatio = calculateSharpeRatio(trades);
return { ...existingStats, sharpeRatio };
```

### Adding New Time Periods
Extend `groupTradesByPeriod()` with new period type:
```javascript
if (period === 'hour') {
  key = `${date.getFullYear()}-${month}-${day}-${hour}`;
}
```

### Adding Chart Types
Create new render function similar to `renderStatsSection()`:
```javascript
const renderProfitDistribution = (stats) => {
  // Histogram of profit/loss distribution
};
```

## Browser Compatibility

**Minimum Requirements:**
- ES6+ support (arrow functions, template literals, destructuring)
- FileReader API
- SVG rendering
- CSS Grid & Flexbox

**Tested Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Considerations

### File Upload Safety
- All processing happens client-side
- No files sent to server
- CSV parsing uses regex, not `eval()`
- Image rendering uses native browser rendering

### XSS Protection
- All user data is rendered through React (auto-escapes)
- No `dangerouslySetInnerHTML` usage
- SVG content is programmatically generated, not user-provided

## Testing Strategy

### Unit Tests (Recommended)
```javascript
describe('parseTradingJournal', () => {
  it('should parse buy and sell orders correctly', () => {
    const csv = `2026-01-04 10:17:03,Order executed at price 91248 for 1 units
2026-01-04 10:17:03,Call to place market order to buy`;
    const trades = parseTradingJournal(csv);
    expect(trades).toHaveLength(1);
  });
});
```

### Integration Tests
- CSV upload → Stats calculation → Rendering
- Image upload → Display
- View mode switching

### Visual Regression Tests
- Calendar layout across months
- Chart rendering with various data sets
- Responsive breakpoints

## Deployment

### Build Requirements
```bash
npm install react react-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
```

### Environment Variables
None required - fully client-side application

### Build Command
```bash
npm run build
```

### Hosting Options
- **Static hosting:** Vercel, Netlify, GitHub Pages
- **CDN:** CloudFlare Pages, AWS S3 + CloudFront
- No server-side rendering needed

## Future Enhancements

### Potential Features
1. **Export capabilities** - Export stats as PDF/CSV
2. **Comparison mode** - Compare two time periods
3. **Advanced filters** - Filter by symbol, time of day, position size
4. **Custom metrics** - User-defined calculations
5. **Data persistence** - LocalStorage or IndexedDB
6. **Multi-currency support** - Handle different currency pairs
7. **Broker integration** - Direct API connections
8. **Real-time updates** - WebSocket integration
9. **Mobile app** - React Native port
10. **Shareable links** - Encode stats in URL params

### Technical Debt
- Add TypeScript definitions
- Split into smaller components
- Add proper error boundaries
- Implement loading states
- Add CSV export validation
- Create comprehensive test suite

## Troubleshooting

### Common Issues

**CSV not parsing:**
- Check CSV format matches TradingView export
- Verify timestamps are ISO format
- Ensure "executed at price" text is present

**Dates showing wrong day:**
- Verify timezone handling in `groupTradesByPeriod()`
- Check browser timezone settings

**Charts not rendering:**
- Verify SVG viewBox dimensions
- Check for NaN values in calculations
- Ensure equity curve has data points

**Performance issues:**
- Consider pagination for >5000 trades
- Use React DevTools Profiler to identify bottlenecks
- Implement virtual scrolling for large tables

## Contributing Guidelines

When extending this codebase:

1. **Maintain single-file architecture** - Keep it simple
2. **Use functional components** - No class components
3. **Follow Tailwind conventions** - Utility-first CSS
4. **Document calculations** - Add comments for complex math
5. **Test edge cases** - Empty data, single trade, huge datasets
6. **Preserve dark theme** - Match existing color palette

## License

[Add your license here]

## Credits

Built with React, Tailwind CSS, and Lucide React icons.

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Author:** [Your name]
