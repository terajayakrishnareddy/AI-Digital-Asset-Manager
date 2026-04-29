document.addEventListener("DOMContentLoaded", () => {
    // 1. Dynamic Portfolio Performance Chart
    const canvas = document.getElementById('portfolioChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Gradient for the chart fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        let portfolioChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Loading...'],
                datasets: [{
                    label: 'Loading Data...',
                    data: [0],
                    borderColor: '#3b82f6',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#8b5cf6',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                        ticks: { color: '#94a3b8', maxTicksLimit: 7 }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                        ticks: {
                            color: '#94a3b8',
                            callback: function(value) { return '$' + value.toLocaleString(); }
                        }
                    }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });

        // Fetch dynamic data
        async function loadChartData() {
            const trackedCoins = JSON.parse(localStorage.getItem("tracked_coins")) || [];
            if (trackedCoins.length === 0) return; // No coins to track

            // Get the primary coin (first in list) to chart
            const primaryCoin = trackedCoins[0];
            
            try {
                // Fetch 7-day hourly data
                const res = await fetch(`https://api.coingecko.com/api/v3/coins/${primaryCoin}/market_chart?vs_currency=usd&days=7`);
                const data = await res.json();
                
                if (data.prices) {
                    const labels = [];
                    const prices = [];
                    
                    // Filter to 1 data point per day for cleaner chart (approx every 24th item since it's hourly for 7 days)
                    for (let i = 0; i < data.prices.length; i += 24) {
                        const pt = data.prices[i];
                        const date = new Date(pt[0]);
                        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                        prices.push(pt[1]);
                    }
                    
                    // Add the very last current price
                    const lastPt = data.prices[data.prices.length - 1];
                    labels.push('Today');
                    prices.push(lastPt[1]);

                    // Update Chart
                    portfolioChart.data.labels = labels;
                    portfolioChart.data.datasets[0].data = prices;
                    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
                    portfolioChart.data.datasets[0].label = `${capitalize(primaryCoin)} Price ($)`;
                    portfolioChart.update();

                    // Update UI Title
                    const chartTitle = document.getElementById('chart-title');
                    if(chartTitle) {
                        chartTitle.innerText = `${capitalize(primaryCoin)} - 7 Day Trend`;
                    }
                }
            } catch (err) {
                console.error("Error loading chart data:", err);
            }
        }
        
        loadChartData();
    }

    // 2. Mock Connect Wallet Functionality
    const connectBtn = document.getElementById('connect-wallet-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            connectBtn.textContent = "Connecting...";
            connectBtn.disabled = true;
            
            setTimeout(() => {
                connectBtn.textContent = "0x7A2...9B4";
                connectBtn.style.background = "#10b981"; // Green to indicate success
                connectBtn.style.color = "white";
                connectBtn.style.transform = "none";
                connectBtn.style.cursor = "default";
                if(window.showToast) window.showToast("Wallet Connected Successfully! 🟢");
            }, 1200); // Simulated delay
        });
    }
    // 3. Analytics Asset Distribution Chart
    const analyticsCanvas = document.getElementById('assetDistributionChart');
    if (analyticsCanvas) {
        const analyticsCtx = analyticsCanvas.getContext('2d');
        new Chart(analyticsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Bitcoin', 'Ethereum', 'Solana', 'Other'],
                datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: [
                        '#3b82f6', // blue
                        '#8b5cf6', // purple
                        '#10b981', // green
                        '#ef4444'  // red
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#94a3b8', padding: 20, font: { size: 12, family: "'Outfit', sans-serif" } }
                    }
                }
            }
        });
    }

    // 4. Analytics Revenue Flow Chart
    const revenueCanvas = document.getElementById('revenueFlowChart');
    if (revenueCanvas) {
        const revenueCtx = revenueCanvas.getContext('2d');
        const revGradient = revenueCtx.createLinearGradient(0, 0, 0, 300);
        revGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        revGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                    borderColor: '#10b981',
                    backgroundColor: revGradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                        ticks: {
                            color: '#94a3b8',
                            callback: function(value) { return '$' + (value/1000) + 'k'; }
                        }
                    }
                }
            }
        });
    }
});
