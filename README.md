# 📊 Trading Dashboard

A beautiful, real-time trading analytics dashboard that transforms your TradingView journal into actionable insights. Track your performance with stunning visualizations, detailed statistics, and calendar views.

![Trading Dashboard](https://via.placeholder.com/1200x600/1e293b/10b981?text=Trading+Dashboard)

## ✨ Features

### 📈 **Comprehensive Analytics**
- **Real-time P&L tracking** with Robinhood-style equity curves
- **Win rate analysis** and profit factor calculations
- **Trade history** with detailed entry/exit tracking
- **Performance metrics** including streaks, averages, and best/worst trades

### 📅 **Multiple Time Views**
- **All Time** - Overall portfolio performance
- **By Day** - Individual trading day breakdown
- **By Week** - Weekly performance trends
- **By Month** - Beautiful calendar view with color-coded days

### 🎨 **Modern Dark UI**
- Sleek dark mode interface with vibrant gradient accents
- Responsive design that works on desktop, tablet, and mobile
- Glass morphism effects and smooth animations
- Color-coded metrics (green = profit, red = loss)

### 📊 **Visual Analytics**
- Smooth line charts with gradient fills
- Interactive calendar heat maps
- Real-time statistics cards
- Comprehensive trade tables

### 🔒 **Privacy First**
- **100% client-side** - No data ever leaves your browser
- No servers, no databases, no tracking
- Process unlimited trades locally
- Your data stays on your device

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- A TradingView account with paper trading or live trading journal

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/trading-dashboard.git
cd trading-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Open your browser**
Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
```

Deploy the `build` folder to any static hosting service (Vercel, Netlify, GitHub Pages, etc.)

## 📖 How to Use

### Step 1: Export Your TradingView Journal

1. Open TradingView and navigate to your **Trading Panel**
2. Go to the **"History"** or **"List"** tab
3. Right-click and select **"Export"** or look for the export button
4. Save as **CSV format**

### Step 2: Upload to Dashboard

1. Click **"Upload CSV Journal"** on the dashboard
2. Select your exported CSV file
3. Watch your stats populate instantly!

### Step 3: Analyze Your Performance

**View All Time Stats:**
- Click **"All Time"** to see your overall performance
- Review your equity curve, win rate, and key metrics

**Analyze by Time Period:**
- Click **"By Day"** to see individual trading days
- Click **"By Week"** for weekly breakdowns
- Click **"By Month"** for a beautiful calendar view

**Monthly Calendar View:**
- Each day shows:
  - 💰 Daily P&L
  - 📊 Win rate percentage
  - 🔢 Number of trades
- Green days = Profitable
- Red days = Loss
- Gray days = No trading activity

### Step 4: Upload Chart (Optional)

- Click **"Upload Chart Image"**
- Select a screenshot of your trading chart
- View it alongside your statistics

## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x500/1e293b/10b981?text=Dashboard+Overview)

### Monthly Calendar View
![Calendar](https://via.placeholder.com/800x500/1e293b/10b981?text=Monthly+Calendar)

### Trade History
![History](https://via.placeholder.com/800x500/1e293b/10b981?text=Trade+History)

## 🎯 Key Metrics Explained

### Portfolio Value
Your total profit or loss across all trades. Displayed prominently at the top.

### Win Rate
Percentage of trades that were profitable. Higher is better!

### Profit Factor
Ratio of average win to average loss. Above 2.0 is considered excellent.

### Max Win/Loss Streak
Longest consecutive winning or losing trades. Helps identify consistency.

### Average Duration
How long you typically hold positions. Useful for strategy analysis.

## 🔧 Configuration

### Supported CSV Formats

The dashboard currently supports **TradingView journal exports** with the following format:

```csv
Time,Text
2026-01-04 10:17:03,Order 2613183471 for symbol BITSTAMP:BTCUSD has been executed at price 91248 for 1 units
2026-01-04 10:17:03,Call to place market order to buy 1 units of symbol BITSTAMP:BTCUSD
```

### Customization

Want to customize colors or metrics? Check out the [Developer Documentation](./DEVELOPER_README.md) for technical details.

## 🌟 Use Cases

### Day Traders
- Track intraday performance
- Analyze which times of day are most profitable
- Monitor win rate trends

### Swing Traders
- View weekly performance patterns
- Identify best/worst trading weeks
- Track position holding times

### Paper Traders
- Practice without risk
- Build confidence before going live
- Develop and test strategies

### Professional Traders
- Comprehensive performance analytics
- Export-ready statistics for reporting
- Privacy-focused local processing

## 🛠️ Technology Stack

- **React** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Pure SVG** - Custom chart rendering
- **JavaScript** - No external dependencies

## 📊 Statistics Tracked

### Performance Metrics
- Total Trades
- Winning Trades
- Losing Trades
- Win Rate %
- Profit Factor
- Total P&L

### Trade Analysis
- Average Win
- Average Loss
- Largest Win
- Largest Loss
- Average Duration
- Win/Loss Ratio

### Streaks & Patterns
- Max Win Streak
- Max Loss Streak
- Daily Performance
- Weekly Trends
- Monthly Patterns

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Feature Requests

Have an idea? Open an issue with the tag `enhancement`!

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Your browser and OS

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by TradingView's excellent trading platform
- Design inspired by Robinhood and modern fintech apps
- Built with the trading community in mind

## 📞 Support

- **Documentation:** [Developer README](./DEVELOPER_README.md)
- **Issues:** [GitHub Issues](https://github.com/yourusername/trading-dashboard/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/trading-dashboard/discussions)

## 🔐 Privacy & Security

- ✅ No data collection
- ✅ No analytics or tracking
- ✅ No server-side processing
- ✅ All calculations happen in your browser
- ✅ Your CSV files never leave your device
- ✅ Open source - verify the code yourself

## ⚠️ Disclaimer

This tool is for informational and educational purposes only. It is not financial advice. Always do your own research and trade responsibly. Past performance does not guarantee future results.

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/trading-dashboard)

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/trading-dashboard)

### GitHub Pages

```bash
npm run build
npm run deploy
```

## 📈 Roadmap

- [ ] Export statistics as PDF
- [ ] Compare multiple time periods
- [ ] Advanced filtering options
- [ ] Custom metric calculations
- [ ] Multi-broker support
- [ ] Mobile app version
- [ ] Dark/Light theme toggle
- [ ] CSV export of calculated stats

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Built with ❤️ for traders, by traders**

*Making trading analytics accessible to everyone*
