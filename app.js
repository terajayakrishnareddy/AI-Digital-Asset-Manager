// =============================================
// GLOBAL TOAST NOTIFICATION SYSTEM
// =============================================
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'success') toast.style.borderLeftColor = '#10b981';
    if (type === 'error') toast.style.borderLeftColor = '#ef4444';
    toast.innerHTML = message;
    container.appendChild(toast);
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
};

// =============================================
// NOTIFICATIONS SYSTEM
// =============================================
window.AppNotifications = {
    get() { return JSON.parse(localStorage.getItem('app_notifications') || '[]'); },
    save(list) { localStorage.setItem('app_notifications', JSON.stringify(list)); },
    add(msg, type = 'info') {
        const list = this.get();
        list.unshift({
            id: Date.now(),
            message: msg,
            type,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
        // Keep max 50 notifications
        if (list.length > 50) list.pop();
        this.save(list);
        this.updateBadge();
        this.render();
    },
    updateBadge() {
        const badge = document.getElementById('notif-badge');
        const count = this.get().length;
        if (!badge) return;
        if (count > 0) {
            badge.style.display = 'inline-flex';
            badge.textContent = count > 99 ? '99+' : count;
        } else {
            badge.style.display = 'none';
        }
    },
    render() {
        const container = document.getElementById('notifications-list');
        if (!container) return;
        const list = this.get();
        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-secondary); margin-bottom: 1rem;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    <p>No notifications yet.</p>
                    <p style="font-size: 0.85rem; margin-top: 0.4rem;">Add a coin from Portfolio to get notified here.</p>
                </div>`;
            return;
        }
        container.innerHTML = list.map(n => {
            const iconColor = n.type === 'success' ? '#10b981' : n.type === 'error' ? '#ef4444' : '#3b82f6';
            return `
            <div class="notif-item" style="display:flex; align-items:flex-start; gap:1rem; padding:1rem; border-bottom: 1px solid var(--border-color);">
                <div style="width:10px;height:10px;border-radius:50%;background:${iconColor};margin-top:5px;flex-shrink:0;"></div>
                <div style="flex:1;">
                    <p style="font-size:0.9rem; line-height:1.4;">${n.message}</p>
                    <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.3rem;">${n.date} at ${n.time}</p>
                </div>
                <button onclick="AppNotifications.remove(${n.id})" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:1rem;padding:0 0.3rem;">✕</button>
            </div>`;
        }).join('');
    },
    remove(id) {
        const list = this.get().filter(n => n.id !== id);
        this.save(list);
        this.updateBadge();
        this.render();
    },
    clear() {
        this.save([]);
        this.updateBadge();
        this.render();
    }
};

// =============================================
// LIKES SYSTEM
// =============================================
window.LikesSystem = {
    get() { return JSON.parse(localStorage.getItem('liked_coins') || '[]'); },
    save(list) { localStorage.setItem('liked_coins', JSON.stringify(list)); },
    toggle(coinId, coinName, coinPrice) {
        let list = this.get();
        const exists = list.find(c => c.id === coinId);
        if (exists) {
            list = list.filter(c => c.id !== coinId);
            window.showToast(`Removed <b>${coinName}</b> from likes`);
        } else {
            list.push({ id: coinId, name: coinName, price: coinPrice, likedAt: new Date().toLocaleDateString() });
            window.showToast(`❤️ <b>${coinName}</b> added to likes!`, 'success');
        }
        this.save(list);
        this.render();
        this.renderDiscoverGrid();
    },
    isLiked(coinId) { return this.get().some(c => c.id === coinId); },
    render() {
        const container = document.getElementById('liked-assets-list');
        if (!container) return;
        const list = this.get();
        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-secondary); margin-bottom: 1rem;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    <p>No liked assets yet.</p>
                    <p style="font-size: 0.85rem; margin-top: 0.4rem;">Click the ♡ heart button on any coin below to like it.</p>
                </div>`;
            return;
        }
        container.innerHTML = `<div class="crypto-assets">${list.map(c => `
            <div class="card" style="position:relative;">
                <button onclick="LikesSystem.toggle('${c.id}','${c.name}',${c.price})" class="like-btn liked" title="Unlike">❤️</button>
                <h3>${c.name}</h3>
                <p style="font-size: 1.3rem; font-weight: 600; margin-top: 0.5rem; color: #10b981;">$${Number(c.price).toLocaleString()}</p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.3rem;">Liked on ${c.likedAt}</p>
            </div>`).join('')}
        </div>`;
    },
    renderDiscoverGrid() {
        // Rendered by the portfolio fetch - just refresh heart states
        document.querySelectorAll('.like-btn-discover').forEach(btn => {
            const id = btn.dataset.id;
            if (this.isLiked(id)) {
                btn.textContent = '❤️';
                btn.classList.add('liked');
            } else {
                btn.textContent = '♡';
                btn.classList.remove('liked');
            }
        });
    }
};

// =============================================
// WALLET SYSTEM
// =============================================
window.WalletSystem = {
    getHoldings() { return JSON.parse(localStorage.getItem('wallet_holdings') || '{}'); },
    getTransactions() { return JSON.parse(localStorage.getItem('wallet_transactions') || '[]'); },
    saveHoldings(h) { localStorage.setItem('wallet_holdings', JSON.stringify(h)); },
    saveTransactions(t) { localStorage.setItem('wallet_transactions', JSON.stringify(t)); },

    async buy(coinId, amount) {
        coinId = coinId.toLowerCase().trim();
        amount = parseFloat(amount);
        if (!coinId || isNaN(amount) || amount <= 0) {
            window.showToast('Please enter a valid coin ID and amount.', 'error'); return;
        }

        const btn = document.getElementById('buy-coin-btn');
        btn.textContent = 'Fetching price...';
        btn.disabled = true;

        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
            const data = await res.json();
            if (!data[coinId]) {
                window.showToast(`Coin "<b>${coinId}</b>" not found on CoinGecko.`, 'error');
                btn.textContent = 'Buy Now'; btn.disabled = false; return;
            }
            const price = data[coinId].usd;
            const totalCost = price * amount;
            const name = coinId.charAt(0).toUpperCase() + coinId.slice(1);

            // Update holdings
            const holdings = this.getHoldings();
            if (!holdings[coinId]) {
                holdings[coinId] = { name, id: coinId, amount: 0, avgPrice: 0 };
            }
            const existing = holdings[coinId];
            const totalUnits = existing.amount + amount;
            existing.avgPrice = ((existing.avgPrice * existing.amount) + (price * amount)) / totalUnits;
            existing.amount = totalUnits;
            existing.currentPrice = price;
            this.saveHoldings(holdings);

            // Log transaction
            const txns = this.getTransactions();
            txns.unshift({
                id: Date.now(),
                type: 'BUY',
                coinId, name,
                amount,
                price,
                total: totalCost,
                date: new Date().toLocaleString()
            });
            this.saveTransactions(txns);

            // Notification
            AppNotifications.add(`🛒 Bought ${amount} ${name} at $${price.toLocaleString()} each. Total: $${totalCost.toFixed(2)}`, 'success');
            window.showToast(`✅ Bought <b>${amount} ${name}</b> for $${totalCost.toFixed(2)}`, 'success');

            document.getElementById('buy-coin-id').value = '';
            document.getElementById('buy-coin-amount').value = '';

            this.render();
            this.updateDashboard();

        } catch(e) {
            window.showToast('Error fetching price. Check your connection.', 'error');
        }
        btn.textContent = 'Buy Now'; btn.disabled = false;
    },

    async render() {
        const holdingsDiv = document.getElementById('wallet-holdings');
        const txDiv = document.getElementById('transaction-history');
        const totalEl = document.getElementById('wallet-total-value');
        if (!holdingsDiv) return;

        const holdings = this.getHoldings();
        const txns = this.getTransactions();
        const keys = Object.keys(holdings);

        if (keys.length === 0) {
            holdingsDiv.innerHTML = `<div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-secondary); margin-bottom: 1rem;"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4H6a2 2 0 0 1-2-2V6z"></path></svg>
                <p>Your wallet is empty.</p>
                <p style="font-size: 0.85rem; margin-top: 0.4rem;">Use the form above to buy your first coin.</p>
            </div>`;
            if (totalEl) totalEl.textContent = '$0.00';
            if (txDiv) txDiv.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem; text-align:center; padding:1rem 0;">No transactions yet.</p>';
            return;
        }

        // Fetch live prices
        const ids = keys.join(',');
        let liveData = {};
        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
            liveData = await res.json();
        } catch(e) {}

        let grandTotal = 0;
        const cards = keys.map(id => {
            const h = holdings[id];
            const livePrice = liveData[id] ? liveData[id].usd : h.avgPrice;
            h.currentPrice = livePrice;
            const value = livePrice * h.amount;
            const pnl = (livePrice - h.avgPrice) * h.amount;
            const pnlPct = ((livePrice - h.avgPrice) / h.avgPrice * 100).toFixed(2);
            grandTotal += value;

            return `<div class="wallet-holding-card card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.8rem;">
                    <h3 style="font-size:1rem;font-weight:600;">${h.name}</h3>
                    <span style="font-size:0.75rem;background:rgba(59,130,246,0.1);color:#3b82f6;padding:0.2rem 0.5rem;border-radius:6px;">${h.amount.toFixed(4)} units</span>
                </div>
                <p style="font-size:1.3rem;font-weight:700;color:#10b981;">$${value.toFixed(2)}</p>
                <div style="display:flex;gap:1rem;margin-top:0.6rem;font-size:0.8rem;color:var(--text-secondary);">
                    <span>Avg: $${h.avgPrice.toFixed(2)}</span>
                    <span>Live: $${livePrice.toLocaleString()}</span>
                </div>
                <p style="margin-top:0.5rem;font-size:0.85rem;color:${pnl >= 0 ? '#10b981':'#ef4444'};">
                    ${pnl >= 0 ? '▲' : '▼'} $${Math.abs(pnl).toFixed(2)} (${pnlPct}%)
                </p>
                <button onclick="WalletSystem.sell('${id}')" class="glass-btn" style="margin-top:0.8rem;width:100%;font-size:0.8rem;color:var(--accent-red);border-color:rgba(239,68,68,0.3);">Sell All</button>
            </div>`;
        }).join('');

        holdingsDiv.innerHTML = `<div class="crypto-assets">${cards}</div>`;
        if (totalEl) totalEl.textContent = `$${grandTotal.toFixed(2)}`;
        this.saveHoldings(holdings); // save updated prices

        // Transactions
        if (txDiv) {
            if (txns.length === 0) {
                txDiv.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem; text-align:center; padding:1rem 0;">No transactions yet.</p>';
            } else {
                txDiv.innerHTML = `<div style="display:flex;flex-direction:column;gap:0.5rem;">
                    ${txns.slice(0, 20).map(tx => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.8rem 1rem;background:rgba(255,255,255,0.02);border:1px solid var(--border-color);border-radius:8px;">
                        <div>
                            <span style="font-size:0.8rem;font-weight:600;color:${tx.type==='BUY'?'#10b981':'#ef4444'};margin-right:0.6rem;">${tx.type}</span>
                            <span style="font-size:0.9rem;">${tx.amount} ${tx.name}</span>
                        </div>
                        <div style="text-align:right;">
                            <p style="font-size:0.9rem;font-weight:600;">$${tx.total.toFixed(2)}</p>
                            <p style="font-size:0.75rem;color:var(--text-secondary);">${tx.date}</p>
                        </div>
                    </div>`).join('')}
                </div>`;
            }
        }

        this.updateDashboard();
    },

    sell(coinId) {
        if (!confirm(`Sell all of your ${coinId} holdings?`)) return;
        const holdings = this.getHoldings();
        if (!holdings[coinId]) return;
        const h = holdings[coinId];
        const value = (h.currentPrice || h.avgPrice) * h.amount;
        const txns = this.getTransactions();
        txns.unshift({
            id: Date.now(),
            type: 'SELL',
            coinId,
            name: h.name,
            amount: h.amount,
            price: h.currentPrice || h.avgPrice,
            total: value,
            date: new Date().toLocaleString()
        });
        delete holdings[coinId];
        this.saveHoldings(holdings);
        this.saveTransactions(txns);
        AppNotifications.add(`💰 Sold all ${h.name} holdings for $${value.toFixed(2)}`, 'success');
        window.showToast(`✅ Sold all <b>${h.name}</b> for $${value.toFixed(2)}`, 'success');
        this.render();
    },

    updateDashboard() {
        const holdings = this.getHoldings();
        const keys = Object.keys(holdings);
        const wCount = document.getElementById('dash-wallet-count');
        const wValue = document.getElementById('dash-wallet-value');
        if (wCount) wCount.textContent = `${keys.length} Coin${keys.length !== 1 ? 's' : ''}`;
        if (wValue) {
            let total = 0;
            keys.forEach(k => {
                const h = holdings[k];
                total += (h.currentPrice || h.avgPrice) * h.amount;
            });
            wValue.textContent = `$${total.toFixed(2)} total value`;
        }
    }
};

// =============================================
// MAIN APP LOGIC
// =============================================
document.addEventListener("DOMContentLoaded", () => {

    // Init systems
    AppNotifications.updateBadge();
    AppNotifications.render();
    LikesSystem.render();
    WalletSystem.render();
    WalletSystem.updateDashboard();

    // --- Login ---
    const loginForm = document.getElementById("login-form");
    const loginOverlay = document.getElementById("login-overlay");
    const mainApp = document.getElementById("main-app");
    const loginError = document.getElementById("login-error");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const u = document.getElementById("login-username").value.trim().toLowerCase();
            const p = document.getElementById("login-password").value.trim();
            if (u === "admin" && p === "password123") {
                loginOverlay.style.display = "none";
                mainApp.classList.remove("hidden");
                window.dispatchEvent(new Event('resize'));
                window.showToast("Welcome back, Admin! 👋", 'success');
            } else {
                loginError.style.display = "block";
            }
        });
    }

    // --- Logout ---
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("login-username").value = "";
            document.getElementById("login-password").value = "";
            loginError.style.display = "none";
            mainApp.classList.add("hidden");
            loginOverlay.style.display = "flex";
            window.showToast("Logged out successfully!");
        });
    }

    // --- Sidebar Toggle ---
    const sidebarToggle = document.getElementById("sidebar-toggle");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            const app = document.getElementById("main-app");
            if (app) {
                app.classList.toggle("sidebar-collapsed");
                setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
            }
        });
    }

    // --- Theme Toggle ---
    const themeToggleBtn = document.getElementById("theme-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");
    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem("app_theme") || "dark";
        if (savedTheme === "light") {
            document.documentElement.setAttribute("data-theme", "light");
            if (moonIcon) moonIcon.style.display = "none";
            if (sunIcon) sunIcon.style.display = "block";
        }
        themeToggleBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            if (current === "light") {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("app_theme", "dark");
                if (sunIcon) sunIcon.style.display = "none";
                if (moonIcon) moonIcon.style.display = "block";
                window.showToast("Dark mode enabled");
            } else {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("app_theme", "light");
                if (moonIcon) moonIcon.style.display = "none";
                if (sunIcon) sunIcon.style.display = "block";
                window.showToast("Light mode enabled");
            }
            setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        });
    }

    // --- AI Panel Toggle ---
    const aiPanel = document.getElementById("ai-panel");
    const aiFloatingBtn = document.getElementById("ai-floating-btn");
    const closeAiBtn = document.getElementById("close-ai-btn");
    if (aiFloatingBtn && aiPanel && closeAiBtn) {
        aiFloatingBtn.addEventListener("click", () => {
            aiPanel.classList.add("open");
            aiFloatingBtn.style.transform = "scale(0)";
        });
        closeAiBtn.addEventListener("click", () => {
            aiPanel.classList.remove("open");
            aiFloatingBtn.style.transform = "scale(1)";
        });
    }

    // --- Navigation ---
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetViewId = item.getAttribute('data-view');
            if (!targetViewId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            viewSections.forEach(section => {
                section.id === targetViewId
                    ? section.classList.remove('hidden')
                    : section.classList.add('hidden');
            });

            // Refresh views when opened
            if (targetViewId === 'view-notifications') AppNotifications.render();
            if (targetViewId === 'view-likes') { LikesSystem.render(); LikesSystem.renderDiscoverGrid(); }
            if (targetViewId === 'view-wallet') WalletSystem.render();
        });
    });

    // --- Connect Wallet Button ---
    const connectBtn = document.getElementById('connect-wallet-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            connectBtn.textContent = "Connecting...";
            connectBtn.disabled = true;
            setTimeout(() => {
                connectBtn.textContent = "0x7A2...9B4";
                connectBtn.style.background = "#10b981";
                connectBtn.style.color = "white";
                connectBtn.style.cursor = "default";
                window.showToast("Wallet Connected Successfully! 🟢", 'success');
            }, 1200);
        });
    }

    // --- Clear Notifications ---
    const clearNotifBtn = document.getElementById('clear-notifs-btn');
    if (clearNotifBtn) {
        clearNotifBtn.addEventListener('click', () => {
            AppNotifications.clear();
            window.showToast("All notifications cleared.");
        });
    }

    // --- Settings: Clear Data ---
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear all your tracked coins, wallet data, likes, and notifications?")) {
                localStorage.removeItem("tracked_coins");
                localStorage.removeItem("liked_coins");
                localStorage.removeItem("wallet_holdings");
                localStorage.removeItem("wallet_transactions");
                localStorage.removeItem("app_notifications");
                window.showToast("All data cleared! Refreshing...");
                setTimeout(() => location.reload(), 1500);
            }
        });
    }

    // --- Settings: Save Gemini Key ---
    const apiKeyInput = document.getElementById("api-key-input");
    const saveKeyBtn = document.getElementById("save-key-btn");
    let geminiApiKey = localStorage.getItem("gemini_api_key") || "";
    if (apiKeyInput && geminiApiKey) apiKeyInput.value = geminiApiKey;
    if (saveKeyBtn) {
        saveKeyBtn.addEventListener("click", () => {
            const key = apiKeyInput.value.trim();
            if (key) {
                localStorage.setItem("gemini_api_key", key);
                geminiApiKey = key;
                saveKeyBtn.textContent = "Saved! ✓";
                setTimeout(() => saveKeyBtn.textContent = "Save Key", 2000);
                window.showToast("API Key saved!", 'success');
            }
        });
    }

    // =============================================
    // CRYPTO DATA (Portfolio + Likes Discover Grid)
    // =============================================
    const cryptoContainer = document.getElementById("crypto-assets");
    let liveCryptoData = [];
    let trackedCoins = JSON.parse(localStorage.getItem("tracked_coins")) || ['bitcoin', 'ethereum', 'solana'];

    async function fetchCryptoData() {
        try {
            if (trackedCoins.length === 0) {
                cryptoContainer.innerHTML = '<p style="color: #94a3b8; padding:1rem;">No coins tracked. Add one above!</p>';
                liveCryptoData = [];
                renderLikeableCoins([]);
                return;
            }
            cryptoContainer.innerHTML = '<p style="color: #94a3b8; padding:1rem;">Loading live prices...</p>';
            const idsStr = trackedCoins.join(',');
            const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idsStr}&vs_currencies=usd`);
            const data = await res.json();
            cryptoContainer.innerHTML = '';
            const assets = [];
            trackedCoins.forEach(coinId => {
                if (data[coinId]) {
                    assets.push({ id: coinId, name: coinId.charAt(0).toUpperCase() + coinId.slice(1), price: data[coinId].usd });
                }
            });
            liveCryptoData = assets;

            assets.forEach(asset => {
                const card = document.createElement('div');
                card.className = 'card';
                const liked = LikesSystem.isLiked(asset.id);
                card.innerHTML = `
                    <button class="remove-asset-btn" data-id="${asset.id}" title="Remove Asset">✖</button>
                    <button class="like-btn-discover ${liked ? 'liked' : ''}" data-id="${asset.id}" data-name="${asset.name}" data-price="${asset.price}" title="${liked ? 'Unlike' : 'Like'}">${liked ? '❤️' : '♡'}</button>
                    <h3>${asset.name}</h3>
                    <p style="font-size: 1.4rem; font-weight: 600; margin-top: 0.5rem; color: #10b981;">$${asset.price.toLocaleString()}</p>
                `;
                cryptoContainer.appendChild(card);
            });

            // Remove buttons
            document.querySelectorAll('.remove-asset-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idToRemove = e.target.getAttribute('data-id');
                    trackedCoins = trackedCoins.filter(c => c !== idToRemove);
                    localStorage.setItem("tracked_coins", JSON.stringify(trackedCoins));
                    window.showToast(`Removed <b>${idToRemove}</b> from tracking`);
                    fetchCryptoData();
                });
            });

            // Like buttons on portfolio cards
            document.querySelectorAll('.like-btn-discover').forEach(btn => {
                btn.addEventListener('click', () => {
                    LikesSystem.toggle(btn.dataset.id, btn.dataset.name, btn.dataset.price);
                    // Update button
                    const nowLiked = LikesSystem.isLiked(btn.dataset.id);
                    btn.textContent = nowLiked ? '❤️' : '♡';
                });
            });

            renderLikeableCoins(assets);

        } catch (error) {
            cryptoContainer.innerHTML = '<p style="color: #ef4444; padding:1rem;">Error fetching live crypto data.</p>';
            console.error("API Error:", error);
        }
    }

    function renderLikeableCoins(assets) {
        const grid = document.getElementById('likeable-coins-grid');
        if (!grid) return;
        if (assets.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-secondary);">Add coins from Portfolio to discover them here.</p>';
            return;
        }
        grid.innerHTML = '';
        assets.forEach(asset => {
            const liked = LikesSystem.isLiked(asset.id);
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <button class="like-btn-discover ${liked ? 'liked' : ''}" data-id="${asset.id}" data-name="${asset.name}" data-price="${asset.price}">${liked ? '❤️' : '♡'}</button>
                <h3>${asset.name}</h3>
                <p style="font-size: 1.4rem; font-weight: 600; margin-top: 0.5rem; color: #10b981;">$${asset.price.toLocaleString()}</p>
            `;
            grid.appendChild(card);
            card.querySelector('.like-btn-discover').addEventListener('click', (e) => {
                const btn = e.currentTarget;
                LikesSystem.toggle(btn.dataset.id, btn.dataset.name, btn.dataset.price);
                const nowLiked = LikesSystem.isLiked(btn.dataset.id);
                btn.textContent = nowLiked ? '❤️' : '♡';
            });
        });
    }

    // Add coin
    const newCoinInput = document.getElementById("new-coin-input");
    const addCoinBtn = document.getElementById("add-coin-btn");
    if (addCoinBtn) {
        addCoinBtn.addEventListener("click", () => {
            const newCoin = newCoinInput.value.trim().toLowerCase();
            if (newCoin && !trackedCoins.includes(newCoin)) {
                trackedCoins.push(newCoin);
                localStorage.setItem("tracked_coins", JSON.stringify(trackedCoins));
                newCoinInput.value = '';
                window.showToast(`Added <b>${newCoin}</b> to tracking`, 'success');
                // Send notification
                AppNotifications.add(`📈 New coin added to tracking: <b>${newCoin.charAt(0).toUpperCase() + newCoin.slice(1)}</b>`, 'success');
                fetchCryptoData();
            } else if (trackedCoins.includes(newCoin)) {
                window.showToast(`<b>${newCoin}</b> is already tracked!`);
            }
        });
    }
    if (newCoinInput) {
        newCoinInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addCoinBtn.click(); });
    }

    // Buy coin
    const buyCoinBtn = document.getElementById('buy-coin-btn');
    if (buyCoinBtn) {
        buyCoinBtn.addEventListener('click', () => {
            const coinId = document.getElementById('buy-coin-id').value;
            const amount = document.getElementById('buy-coin-amount').value;
            WalletSystem.buy(coinId, amount);
        });
    }

    fetchCryptoData();

    // =============================================
    // AI CHATBOT — Powered by Anthropic API
    // =============================================
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const chatWindow = document.getElementById("chat-window");
    let conversationHistory = [];

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerHTML = text;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return msgDiv;
    }

    async function fetchAIResponse(userQuery) {
        // Build rich context for the AI
        const portfolio = Array.isArray(liveCryptoData) && liveCryptoData.length > 0
            ? `User is tracking: ${liveCryptoData.map(c => `${c.name} at $${c.price.toLocaleString()}`).join(', ')}.`
            : 'User has no coins tracked yet.';

        const walletHoldings = WalletSystem.getHoldings();
        const walletSummary = Object.keys(walletHoldings).length > 0
            ? `Wallet holds: ${Object.values(walletHoldings).map(h => `${h.amount.toFixed(4)} ${h.name}`).join(', ')}.`
            : 'Wallet is empty.';

        const systemPrompt = `You are a smart, friendly AI assistant for a crypto digital asset management dashboard called "Codinglab".
You help users with:
- Cryptocurrency prices, trends, and market analysis
- Portfolio advice and investment guidance  
- Explaining blockchain, DeFi, NFTs, Web3 concepts
- General financial questions
- How to use features of this dashboard

Current portfolio context:
${portfolio}
${walletSummary}

Be concise (2-4 sentences max per reply), helpful, and conversational. Use emojis sparingly. Never give specific financial advice to buy/sell specific assets. For sensitive financial decisions, suggest consulting a professional.`;

        conversationHistory.push({ role: "user", content: userQuery });
        if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    system: systemPrompt,
                    messages: conversationHistory
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'API error');
            }

            const data = await response.json();
            const aiText = data.content?.[0]?.text || "I couldn't generate a response. Please try again.";
            conversationHistory.push({ role: "assistant", content: aiText });
            return aiText;

        } catch (err) {
            console.error("AI Error:", err);
            // Fallback if API fails
            return getFallbackResponse(userQuery);
        }
    }

    function getFallbackResponse(query) {
        const q = query.toLowerCase();
        if (q.match(/hi|hello|hey/)) return "Hello! I'm your AI Asset Manager. How can I help with your crypto portfolio today? 👋";
        if (q.includes('bitcoin') || q.includes('btc')) return "Bitcoin (BTC) is the world's largest cryptocurrency by market cap. Check the Portfolio tab for live prices!";
        if (q.includes('ethereum') || q.includes('eth')) return "Ethereum is the leading smart contract platform. Its price is shown live in your Portfolio section.";
        if (q.includes('portfolio') || q.includes('balance')) return "Your portfolio is tracked in the Portfolio section. Add coins using their CoinGecko IDs to track live prices.";
        if (q.includes('wallet')) return "Your Wallet section lets you buy and track coin purchases. Click the Wallet icon in the sidebar!";
        if (q.includes('nft')) return "NFTs are unique digital assets on the blockchain. Each NFT proves ownership of a specific item — art, music, collectibles, and more.";
        return "I'm your crypto AI assistant! Ask me about Bitcoin, Ethereum, DeFi, your portfolio, or any crypto concept. 🚀";
    }

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.textContent = "...";

        addMessage(text, 'user');
        chatInput.value = '';

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'typing-indicator';
        loadingDiv.textContent = 'AI is thinking...';
        chatWindow.appendChild(loadingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        const response = await fetchAIResponse(text);
        loadingDiv.remove();
        addMessage(response, 'ai');

        chatInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.textContent = "Send";
        chatInput.focus();
    }

    if (sendBtn) sendBtn.addEventListener("click", handleSend);
    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => { if (e.key === "Enter") handleSend(); });
    }

});
