import React, { useState } from 'react';
import { Upload, Activity } from 'lucide-react';

export default function TradingDashboard() {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartImage, setChartImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ csv: false, chart: false });
  const [viewMode, setViewMode] = useState('all');
  const [groupedStats, setGroupedStats] = useState(null);
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [pendingCSVData, setPendingCSVData] = useState(null);
  const [detectedFormat, setDetectedFormat] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Detect CSV format based on headers and content
  const detectCSVFormat = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return null;

    const textLower = text.toLowerCase();

    // Check for ThinkOrSwim format
    if (textLower.includes('account statement for') &&
        textLower.includes('account trade history')) {
      return 'thinkorswim';
    }

    const firstLine = lines[0].toLowerCase();

    // Check for Tradovate format
    if (firstLine.includes('symbol') &&
        firstLine.includes('buyprice') &&
        firstLine.includes('sellprice') &&
        firstLine.includes('pnl') &&
        firstLine.includes('boughttimestamp')) {
      return 'tradovate';
    }

    // Check for TradingView format
    if (firstLine.includes('time') && firstLine.includes('text')) {
      return 'tradingview';
    }

    // Check for TradingView by content pattern
    if (lines.length > 1 && lines[1].includes('has been executed at price')) {
      return 'tradingview';
    }

    return null;
  };

  // Parse Tradovate CSV format
  const parseTradovate = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const executedTrades = [];

    // Find column indices
    const indices = {
      qty: headers.indexOf('qty'),
      buyPrice: headers.indexOf('buyPrice'),
      sellPrice: headers.indexOf('sellPrice'),
      pnl: headers.indexOf('pnl'),
      boughtTimestamp: headers.indexOf('boughtTimestamp'),
      soldTimestamp: headers.indexOf('soldTimestamp'),
      duration: headers.indexOf('duration')
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Simple CSV parsing (handles basic cases)
      const values = line.split(',').map(v => v.trim());

      const qty = parseFloat(values[indices.qty]) || 1;
      const buyPrice = parseFloat(values[indices.buyPrice]);
      const sellPrice = parseFloat(values[indices.sellPrice]);

      // Parse PnL - remove $ and parentheses for negative values
      let pnl = values[indices.pnl] || '0';
      pnl = pnl.replace(/\$/g, '').replace(/[()]/g, '');
      pnl = values[indices.pnl].includes('(') ? -parseFloat(pnl) : parseFloat(pnl);

      const boughtTimestamp = values[indices.boughtTimestamp];
      const soldTimestamp = values[indices.soldTimestamp];

      // Parse duration
      const durationStr = values[indices.duration] || '';
      let durationMs = 0;
      const minMatch = durationStr.match(/(\d+)min/);
      const secMatch = durationStr.match(/(\d+)sec/);
      if (minMatch) durationMs += parseInt(minMatch[1]) * 60000;
      if (secMatch) durationMs += parseInt(secMatch[1]) * 1000;

      // Determine trade type based on whether buy or sell price is higher
      const entryType = buyPrice < sellPrice ? 'BUY' : 'SELL';

      executedTrades.push({
        entryTime: boughtTimestamp,
        entryType: entryType,
        entryPrice: buyPrice,
        exitTime: soldTimestamp,
        exitType: entryType === 'BUY' ? 'SELL' : 'BUY',
        exitPrice: sellPrice,
        size: qty,
        pnl: pnl,
        duration: durationMs
      });
    }

    return executedTrades;
  };

  // Parse ThinkOrSwim CSV format
  const parseThinkOrSwim = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const executedTrades = [];

    // Find the "Account Trade History" section
    let tradeHistoryIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('account trade history')) {
        tradeHistoryIndex = i;
        break;
      }
    }

    if (tradeHistoryIndex === -1) return [];

    // Find the header line (next non-empty line after section title)
    let headerIndex = -1;
    for (let i = tradeHistoryIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && line.includes('Exec Time')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) return [];

    const headers = lines[headerIndex].split(',').map(h => h.trim());
    const indices = {
      execTime: headers.findIndex(h => h.toLowerCase().includes('exec time')),
      side: headers.findIndex(h => h.toLowerCase() === 'side'),
      qty: headers.findIndex(h => h.toLowerCase() === 'qty'),
      symbol: headers.findIndex(h => h.toLowerCase() === 'symbol'),
      price: headers.findIndex(h => h.toLowerCase() === 'price' && !h.toLowerCase().includes('net')),
      netPrice: headers.findIndex(h => h.toLowerCase().includes('net price'))
    };

    // Parse trade data - group by pairs (entry/exit)
    const trades = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('Account Summary') || line.includes('Total')) break;

      const values = line.split(',').map(v => v.trim());
      if (values.length < headers.length) continue;

      const execTime = values[indices.execTime];
      const side = values[indices.side];
      const qty = parseFloat(values[indices.qty]) || 0;
      const symbol = values[indices.symbol];
      const price = parseFloat(values[indices.price]) || 0;

      if (!execTime || !side || !qty || !symbol || !price) continue;

      trades.push({
        execTime,
        side: side.toUpperCase(),
        qty,
        symbol,
        price
      });
    }

    // Match buy/sell pairs to create complete trades
    const openPositions = {};

    trades.forEach(trade => {
      const key = trade.symbol;

      if (!openPositions[key]) {
        // Opening position
        openPositions[key] = {
          entryTime: trade.execTime,
          entryType: trade.side,
          entryPrice: trade.price,
          size: trade.qty,
          symbol: trade.symbol
        };
      } else {
        // Closing position
        const position = openPositions[key];
        const opposingSide = (position.entryType === 'BUY' && trade.side === 'SELL') ||
                            (position.entryType === 'SELL' && trade.side === 'BUY');

        if (opposingSide) {
          const pnl = position.entryType === 'BUY'
            ? (trade.price - position.entryPrice) * position.size
            : (position.entryPrice - trade.price) * position.size;

          executedTrades.push({
            entryTime: position.entryTime,
            entryType: position.entryType,
            entryPrice: position.entryPrice,
            exitTime: trade.execTime,
            exitType: trade.side,
            exitPrice: trade.price,
            size: position.size,
            pnl: pnl,
            duration: 0 // ThinkOrSwim doesn't provide duration
          });

          delete openPositions[key];
        }
      }
    });

    return executedTrades.reverse(); // Most recent first
  };

  // Parse TradingView CSV format
  const parseTradingView = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const executedTrades = [];
    let currentPosition = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',');
      if (parts.length < 2) continue;

      const timestamp = parts[0].trim();
      const message = parts.slice(1).join(',').trim();

      if (message.includes('has been executed at price')) {
        const priceMatch = message.match(/at price (\d+)/);
        if (!priceMatch) continue;

        const price = parseFloat(priceMatch[1]);
        const unitsMatch = message.match(/for ([\d.]+) units/);
        const units = unitsMatch ? parseFloat(unitsMatch[1]) : 1;

        let type = null;
        for (let j = i; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j];
          if (nextLine.includes('order to buy')) {
            type = 'BUY';
            break;
          } else if (nextLine.includes('order to sell')) {
            type = 'SELL';
            break;
          }
        }

        if (!type) continue;

        if (currentPosition) {
          if ((currentPosition.type === 'BUY' && type === 'SELL') ||
              (currentPosition.type === 'SELL' && type === 'BUY')) {
            const pnl = currentPosition.type === 'BUY'
              ? (price - currentPosition.entryPrice) * units
              : (currentPosition.entryPrice - price) * units;

            executedTrades.unshift({
              entryTime: currentPosition.timestamp,
              entryType: currentPosition.type,
              entryPrice: currentPosition.entryPrice,
              exitTime: timestamp,
              exitType: type,
              exitPrice: price,
              size: units,
              pnl: pnl,
              duration: new Date(timestamp) - new Date(currentPosition.timestamp)
            });
            currentPosition = null;
          }
        } else {
          currentPosition = { timestamp, type, entryPrice: price, size: units };
        }
      }
    }
    return executedTrades;
  };

  // Main parsing function that routes to appropriate parser
  const parseCSV = (text, format) => {
    if (format === 'tradovate') {
      return parseTradovate(text);
    } else if (format === 'tradingview') {
      return parseTradingView(text);
    } else if (format === 'thinkorswim') {
      return parseThinkOrSwim(text);
    }
    return [];
  };

  const calculateStats = (trades) => {
    if (!trades || trades.length === 0) return null;

    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const winRate = (wins.length / trades.length) * 100;
    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length : 0;
    const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
    
    let cumPnL = 0;
    const equityCurve = trades.map((t, i) => {
      cumPnL += t.pnl;
      return { trade: i + 1, pnl: cumPnL };
    });

    let currentStreak = 0, maxWinStreak = 0, maxLossStreak = 0, streakType = null;
    trades.forEach(t => {
      if (t.pnl > 0) {
        if (streakType === 'win') currentStreak++; else { currentStreak = 1; streakType = 'win'; }
        maxWinStreak = Math.max(maxWinStreak, currentStreak);
      } else {
        if (streakType === 'loss') currentStreak++; else { currentStreak = 1; streakType = 'loss'; }
        maxLossStreak = Math.max(maxLossStreak, currentStreak);
      }
    });

    return {
      totalTrades: trades.length,
      totalWins: wins.length,
      totalLosses: losses.length,
      winRate,
      totalPnL,
      avgWin,
      avgLoss,
      profitFactor,
      largestWin: wins.length > 0 ? Math.max(...wins.map(t => t.pnl)) : 0,
      largestLoss: losses.length > 0 ? Math.min(...losses.map(t => t.pnl)) : 0,
      avgDuration: trades.reduce((sum, t) => sum + t.duration, 0) / trades.length,
      equityCurve,
      maxWinStreak,
      maxLossStreak
    };
  };

  const groupTradesByPeriod = (trades, period) => {
    if (!trades || trades.length === 0) return {};
    const groups = {};
    trades.forEach(trade => {
      const date = new Date(trade.exitTime);
      let key;
      if (period === 'day') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else if (period === 'week') {
        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);
        key = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
      } else if (period === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(trade);
    });
    const groupedWithStats = {};
    Object.keys(groups).sort().reverse().forEach(key => {
      groupedWithStats[key] = { trades: groups[key], stats: calculateStats(groups[key]) };
    });
    return groupedWithStats;
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;
        const format = detectCSVFormat(csvText);

        if (format) {
          // Auto-detected format successfully
          processCSVData(csvText, format);
          setDetectedFormat(format);
        } else {
          // Could not detect format, show manual selector
          setPendingCSVData(csvText);
          setShowFormatSelector(true);
        }
      };
      reader.readAsText(file);
    }
  };

  const processCSVData = (csvText, format) => {
    const parsedTrades = parseCSV(csvText, format);
    setTrades(parsedTrades);
    setStats(calculateStats(parsedTrades));
    setGroupedStats({
      day: groupTradesByPeriod(parsedTrades, 'day'),
      week: groupTradesByPeriod(parsedTrades, 'week'),
      month: groupTradesByPeriod(parsedTrades, 'month')
    });
    setUploadStatus(prev => ({ ...prev, csv: true }));
    setShowFormatSelector(false);
    setPendingCSVData(null);
  };

  const handleManualFormatSelection = (format) => {
    if (pendingCSVData) {
      processCSVData(pendingCSVData, format);
      setDetectedFormat(format);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setChartImage(event.target.result);
        setUploadStatus(prev => ({ ...prev, chart: true }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  };

  const formatPeriodLabel = (key, period) => {
    if (period === 'day') {
      return new Date(key).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } else if (period === 'week') {
      const date = new Date(key);
      const endDate = new Date(date);
      endDate.setDate(date.getDate() + 6);
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (period === 'month') {
      const [year, month] = key.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return key;
  };

  const renderMonthCalendar = (monthKey, monthData) => {
    const [year, month] = monthKey.split('-');
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 = Sunday

    // Create a map of day -> trades for this month
    const dayTradesMap = {};
    const dayKeyToDateString = {}; // Maps day number to full date string (YYYY-MM-DD)
    monthData.trades.forEach(trade => {
      const tradeDate = new Date(trade.exitTime);
      const dayKey = tradeDate.getDate();
      if (!dayTradesMap[dayKey]) {
        dayTradesMap[dayKey] = [];
        dayKeyToDateString[dayKey] = `${year}-${String(month).padStart(2, '0')}-${String(dayKey).padStart(2, '0')}`;
      }
      dayTradesMap[dayKey].push(trade);
    });

    // Calculate stats for each day
    const dayStatsMap = {};
    Object.keys(dayTradesMap).forEach(day => {
      const dayTrades = dayTradesMap[day];
      const fullStats = calculateStats(dayTrades);
      dayStatsMap[day] = {
        pnl: fullStats.totalPnL,
        winRate: fullStats.winRate,
        trades: fullStats.totalTrades,
        fullStats: fullStats
      };
    });

    const weeks = [];
    let currentWeek = new Array(7).fill(null);
    let dayCounter = 1;

    // Fill in the first week with empty days
    for (let i = 0; i < startDay; i++) {
      currentWeek[i] = null;
    }

    // Fill in the rest of the days
    for (let i = startDay; i < 7 && dayCounter <= daysInMonth; i++) {
      currentWeek[i] = dayCounter;
      dayCounter++;
    }
    weeks.push(currentWeek);

    // Fill in the remaining weeks
    while (dayCounter <= daysInMonth) {
      currentWeek = new Array(7).fill(null);
      for (let i = 0; i < 7 && dayCounter <= daysInMonth; i++) {
        currentWeek[i] = dayCounter;
        dayCounter++;
      }
      weeks.push(currentWeek);
    }

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-6">{formatPeriodLabel(monthKey, 'month')}</h2>
        
        {/* Month Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50">
            <div className="text-sm font-medium text-gray-400 mb-1">Monthly P&L</div>
            <div className={`text-2xl font-semibold ${monthData.stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(monthData.stats.totalPnL)}
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50">
            <div className="text-sm font-medium text-gray-400 mb-1">Win Rate</div>
            <div className="text-2xl font-semibold text-cyan-400">{monthData.stats.winRate.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50">
            <div className="text-sm font-medium text-gray-400 mb-1">Total Trades</div>
            <div className="text-2xl font-semibold text-purple-400">{monthData.stats.totalTrades}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50">
            <div className="text-sm font-medium text-gray-400 mb-1">Trading Days</div>
            <div className="text-2xl font-semibold text-orange-400">{Object.keys(dayStatsMap).length}</div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-2">
                {week.map((day, dayIdx) => {
                  if (day === null) {
                    return <div key={dayIdx} className="aspect-square" />;
                  }

                  const dayStats = dayStatsMap[day];
                  const hasData = dayStats !== undefined;

                  return (
                    <div
                      key={dayIdx}
                      onClick={() => hasData && setSelectedDay({ dateKey: dayKeyToDateString[day], trades: dayTradesMap[day], stats: dayStats.fullStats })}
                      className={`aspect-square rounded-lg p-2 border transition-all ${
                        hasData
                          ? dayStats.pnl >= 0
                            ? 'bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer'
                            : 'bg-rose-500/20 border-rose-500/40 hover:bg-rose-500/30 cursor-pointer'
                          : 'bg-slate-700/20 border-slate-600/30'
                      }`}
                    >
                      <div className="h-full flex flex-col justify-between text-xs">
                        <div className="text-right mb-1">
                          <span className={`text-sm font-semibold ${hasData ? 'text-white' : 'text-gray-600'}`}>
                            {day}
                          </span>
                        </div>
                        {hasData && (
                          <div className="space-y-0.5">
                            <div className={`font-bold truncate ${dayStats.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {dayStats.pnl >= 0 ? '+' : ''}{Math.abs(dayStats.pnl) >= 1000 
                                ? `$${(dayStats.pnl / 1000).toFixed(1)}k` 
                                : formatCurrency(dayStats.pnl)}
                            </div>
                            <div className="text-[10px] text-gray-300 leading-tight">
                              {dayStats.winRate.toFixed(0)}%
                            </div>
                            <div className="text-[10px] text-gray-400 leading-tight">
                              {dayStats.trades}T
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStatsSection = (periodStats, title, periodTrades) => {
    const displayTrades = periodTrades || trades;
    
    return (
      <div>
        {title && <div className="mb-6"><h2 className="text-2xl font-semibold text-white">{title}</h2></div>}

        <div className="mb-8">
          <div className="text-sm font-medium text-gray-400 mb-1">Portfolio Value</div>
          <div className={`text-5xl font-medium mb-2 ${periodStats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(Math.abs(periodStats.totalPnL))}
          </div>
          <div className={`text-xl font-medium ${periodStats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {periodStats.totalPnL >= 0 ? '+' : ''}{formatCurrency(periodStats.totalPnL)}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-slate-700/50">
          <svg className="w-full h-80" viewBox="0 0 1000 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${title || 'main'}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={periodStats.totalPnL >= 0 ? '#10b981' : '#f43f5e'} stopOpacity="0.4" />
                <stop offset="100%" stopColor={periodStats.totalPnL >= 0 ? '#10b981' : '#f43f5e'} stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {[0, 25, 50, 75, 100].map(y => (
              <line key={y} x1="0" y1={y * 4} x2="1000" y2={y * 4} stroke="#334155" strokeWidth="1" strokeOpacity="0.3" />
            ))}
            
            {(() => {
              const points = periodStats.equityCurve.map((point, i) => {
                const x = (i / (periodStats.equityCurve.length - 1)) * 1000;
                const minPnL = Math.min(...periodStats.equityCurve.map(p => p.pnl), 0);
                const maxPnL = Math.max(...periodStats.equityCurve.map(p => p.pnl), 0);
                const range = maxPnL - minPnL || 1;
                const y = 350 - ((point.pnl - minPnL) / range) * 300;
                return `${x},${y}`;
              }).join(' ');
              
              return (
                <>
                  <polygon points={`0,400 ${points} 1000,400`} fill={`url(#grad-${title || 'main'})`} />
                  <polyline points={points} fill="none" stroke={periodStats.totalPnL >= 0 ? '#10b981' : '#f43f5e'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </>
              );
            })()}
          </svg>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            ['Win Rate', `${periodStats.winRate.toFixed(1)}%`, 'from-cyan-500 to-blue-500'],
            ['Total Trades', periodStats.totalTrades, 'from-purple-500 to-pink-500'],
            ['Profit Factor', periodStats.profitFactor.toFixed(2), 'from-orange-500 to-red-500'],
            ['Avg Duration', formatDuration(periodStats.avgDuration), 'from-teal-500 to-emerald-500']
          ].map(([label, value, gradient]) => (
            <div key={label} className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-all">
              <div className="text-sm font-medium text-gray-400 mb-1">{label}</div>
              <div className={`text-2xl font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full mr-3"></div>
              Performance
            </h3>
            <div className="space-y-3">
              {[
                ['Winning Trades', periodStats.totalWins, 'text-gray-300'],
                ['Losing Trades', periodStats.totalLosses, 'text-gray-300'],
                ['Average Win', formatCurrency(periodStats.avgWin), 'text-emerald-400'],
                ['Average Loss', formatCurrency(periodStats.avgLoss), 'text-rose-400'],
                ['Best Trade', formatCurrency(periodStats.largestWin), 'text-emerald-400'],
                ['Worst Trade', formatCurrency(periodStats.largestLoss), 'text-rose-400']
              ].map(([label, value, color], i) => (
                <div key={i} className={`flex justify-between py-2 ${i > 0 ? 'border-t border-slate-700/50' : ''}`}>
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className={`text-sm font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
              Statistics
            </h3>
            <div className="space-y-3">
              {[
                ['Win Streak', `${periodStats.maxWinStreak} trades`],
                ['Loss Streak', `${periodStats.maxLossStreak} trades`],
                ['Win/Loss Ratio', `${periodStats.avgLoss !== 0 ? (Math.abs(periodStats.avgWin / periodStats.avgLoss)).toFixed(2) : 'N/A'}:1`],
                ['Total Return', `${periodStats.totalPnL >= 0 ? '+' : ''}${formatCurrency(periodStats.totalPnL)}`]
              ].map(([label, value], i) => (
                <div key={i} className={`flex justify-between py-2 ${i > 0 ? 'border-t border-slate-700/50' : ''}`}>
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-gray-200">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
            <h3 className="text-lg font-semibold text-white">Trade History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/30">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Entry</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Exit</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {displayTrades.map((trade, i) => (
                  <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-300">{i + 1}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.entryType === 'BUY' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {trade.entryType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-200">${trade.entryPrice.toLocaleString()}</td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-200">${trade.exitPrice.toLocaleString()}</td>
                    <td className="py-4 px-6 text-sm text-gray-400">{formatDuration(trade.duration)}</td>
                    <td className={`py-4 px-6 text-sm font-semibold text-right ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <img src="/logo.svg" alt="TraderJourney" className="h-32 md:h-40 lg:h-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
            <label className={`flex flex-col items-center justify-center cursor-pointer p-8 rounded-xl border-2 border-dashed transition-all ${
              uploadStatus.csv
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-slate-600/50 hover:border-slate-500/50'
            }`}>
              <Upload className={`w-12 h-12 mb-4 ${uploadStatus.csv ? 'text-emerald-400' : 'text-gray-400'}`} />
              <span className="text-lg font-medium text-white mb-1">
                {uploadStatus.csv ? `✓ ${trades.length} trades loaded` : 'Upload CSV Journal'}
              </span>
              <span className="text-sm text-gray-400">
                {uploadStatus.csv
                  ? detectedFormat
                    ? `${detectedFormat === 'tradovate' ? 'Tradovate' : detectedFormat === 'thinkorswim' ? 'ThinkOrSwim' : 'TradingView'} format detected`
                    : 'CSV uploaded successfully'
                  : 'TradingView, Tradovate, or ThinkOrSwim export'}
              </span>
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
            </label>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
            <label className={`flex flex-col items-center justify-center cursor-pointer p-8 rounded-xl border-2 border-dashed transition-all ${
              uploadStatus.chart 
                ? 'border-blue-500/50 bg-blue-500/10' 
                : 'border-slate-600/50 hover:border-slate-500/50'
            }`}>
              <Upload className={`w-12 h-12 mb-4 ${uploadStatus.chart ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className="text-lg font-medium text-white mb-1">
                {uploadStatus.chart ? '✓ Chart uploaded' : 'Upload Chart Image'}
              </span>
              <span className="text-sm text-gray-400">{uploadStatus.chart ? 'Image ready to view' : 'Screenshot of your trades'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {showFormatSelector && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-4">Select CSV Format</h2>
              <p className="text-gray-400 mb-6">We couldn't automatically detect your CSV format. Please select your trading platform:</p>

              <div className="space-y-3">
                <button
                  onClick={() => handleManualFormatSelection('tradingview')}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 text-white p-4 rounded-xl border border-slate-600 transition-all flex items-center justify-between group"
                >
                  <div className="text-left">
                    <div className="font-semibold text-lg">TradingView</div>
                    <div className="text-sm text-gray-400">Time, Text format</div>
                  </div>
                  <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                </button>

                <button
                  onClick={() => handleManualFormatSelection('tradovate')}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 text-white p-4 rounded-xl border border-slate-600 transition-all flex items-center justify-between group"
                >
                  <div className="text-left">
                    <div className="font-semibold text-lg">Tradovate</div>
                    <div className="text-sm text-gray-400">Performance export format</div>
                  </div>
                  <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                </button>

                <button
                  onClick={() => handleManualFormatSelection('thinkorswim')}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 text-white p-4 rounded-xl border border-slate-600 transition-all flex items-center justify-between group"
                >
                  <div className="text-left">
                    <div className="font-semibold text-lg">ThinkOrSwim</div>
                    <div className="text-sm text-gray-400">Account Statement format</div>
                  </div>
                  <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                </button>
              </div>

              <button
                onClick={() => {
                  setShowFormatSelector(false);
                  setPendingCSVData(null);
                }}
                className="mt-6 w-full text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {chartImage && (
          <div className="mb-8 bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Trading Chart</h2>
            <img src={chartImage} alt="Chart" className="w-full rounded-lg border border-slate-700/50" />
          </div>
        )}

        {stats && (
          <div className="mb-8 bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Time Period</h2>
            <div className="flex gap-3 flex-wrap">
              {[
                ['all', 'All Time', 'from-cyan-500 to-blue-500'],
                ['day', 'By Day', 'from-emerald-500 to-teal-500'],
                ['week', 'By Week', 'from-purple-500 to-pink-500'],
                ['month', 'By Month', 'from-orange-500 to-red-500']
              ].map(([mode, label, gradient]) => (
                <button
                  key={mode}
                  onClick={() => {
                    setViewMode(mode);
                    setSelectedDay(null);
                  }}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                      : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700 border border-slate-600/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {stats && viewMode === 'all' && renderStatsSection(stats, null, trades)}

        {stats && viewMode === 'day' && groupedStats && groupedStats.day && (
          <div className="space-y-8">
            {Object.keys(groupedStats.day).map((periodKey) => {
              const { trades: periodTrades, stats: periodStats } = groupedStats.day[periodKey];
              return (
                <div key={periodKey} className="bg-slate-800/30 backdrop-blur rounded-xl p-8 border-2 border-slate-700/50">
                  {renderStatsSection(periodStats, formatPeriodLabel(periodKey, 'day'), periodTrades)}
                </div>
              );
            })}
          </div>
        )}

        {stats && viewMode === 'week' && groupedStats && groupedStats.week && (
          <div className="space-y-8">
            {Object.keys(groupedStats.week).map((periodKey) => {
              const { trades: periodTrades, stats: periodStats } = groupedStats.week[periodKey];
              return (
                <div key={periodKey} className="bg-slate-800/30 backdrop-blur rounded-xl p-8 border-2 border-slate-700/50">
                  {renderStatsSection(periodStats, formatPeriodLabel(periodKey, 'week'), periodTrades)}
                </div>
              );
            })}
          </div>
        )}

        {stats && viewMode === 'month' && groupedStats && groupedStats.month && (
          <div className="space-y-8">
            {selectedDay ? (
              <div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="mb-6 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-all flex items-center gap-2"
                >
                  <span>←</span> Back to Calendar
                </button>
                <div className="bg-slate-800/30 backdrop-blur rounded-xl p-8 border-2 border-slate-700/50">
                  {renderStatsSection(selectedDay.stats, formatPeriodLabel(selectedDay.dateKey, 'day'), selectedDay.trades)}
                </div>
              </div>
            ) : (
              Object.keys(groupedStats.month).map((monthKey) => {
                const monthData = groupedStats.month[monthKey];
                return (
                  <div key={monthKey}>
                    {renderMonthCalendar(monthKey, monthData)}
                  </div>
                );
              })
            )}
          </div>
        )}

        {!stats && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-12 border border-slate-700/50 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-medium text-white mb-2">No Data Yet</h3>
            <p className="text-gray-400">Upload your CSV to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
