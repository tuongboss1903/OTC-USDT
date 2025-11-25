// Market Stats - Fetch from Binance REST API
let currentSymbol = 'BTCUSDT';
let statsUpdateInterval = null;

// Fetch market stats from Binance
async function fetchMarketStats(symbol = 'BTCUSDT') {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateMarketStatsUI(data, symbol);
    } catch (error) {
        console.error('Error fetching market stats:', error);
        // Show error state
        const priceElement = document.getElementById('current-price');
        if (priceElement) priceElement.textContent = 'Error';
    }
}

// Update Market Stats UI
function updateMarketStatsUI(tickerData, symbol) {
    const price = parseFloat(tickerData.lastPrice);
    const high24h = parseFloat(tickerData.highPrice);
    const low24h = parseFloat(tickerData.lowPrice);
    const volume24h = parseFloat(tickerData.volume);
    const priceChange = parseFloat(tickerData.priceChange);
    const priceChangePercent = parseFloat(tickerData.priceChangePercent);

    // Update Current Price
    const priceElement = document.getElementById('current-price');
    if (priceElement) {
        priceElement.textContent = price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Update Price Change
    const changeElement = document.getElementById('price-change');
    if (changeElement) {
        const sign = priceChangePercent >= 0 ? '+' : '';
        const changeValue = priceChangePercent.toFixed(2);
        const changeAmount = priceChange.toFixed(2);
        changeElement.innerHTML = `
            <span class="${priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${sign}${changeValue}% (${sign}${changeAmount})
            </span>
        `;
    }

    // Update 24h High
    const highElement = document.getElementById('price-high');
    if (highElement) {
        highElement.textContent = high24h.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Update 24h Low
    const lowElement = document.getElementById('price-low');
    if (lowElement) {
        lowElement.textContent = low24h.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Update 24h Volume
    const volumeElement = document.getElementById('volume-24h');
    const volumeAssetElement = document.getElementById('volume-asset');
    if (volumeElement) {
        const baseAsset = symbol.replace('USDT', '').toUpperCase();
        let volumeText = volume24h.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        if (volume24h >= 1000) {
            volumeText = (volume24h / 1000).toFixed(2) + 'K';
        }
        volumeElement.textContent = volumeText;
        if (volumeAssetElement) {
            volumeAssetElement.textContent = baseAsset;
        }
    }
}

// Initialize market stats
function initMarketStats() {
    // Fetch initial stats
    fetchMarketStats(currentSymbol);
    
    // Update every 5 seconds
    if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
    }
    statsUpdateInterval = setInterval(() => {
        fetchMarketStats(currentSymbol);
    }, 5000);
}

// Change symbol (can be called from TradingView if needed)
function changeMarketStatsSymbol(symbol) {
    currentSymbol = symbol.toUpperCase();
    fetchMarketStats(currentSymbol);
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
    }
});

// Initialize when DOM is ready
function startMarketStats() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initMarketStats, 1000);
        });
    } else {
        setTimeout(initMarketStats, 1000);
    }
}

// Make functions global
window.changeMarketStatsSymbol = changeMarketStatsSymbol;
window.initMarketStats = initMarketStats;
window.fetchMarketStats = fetchMarketStats;

// Start initialization
startMarketStats();

