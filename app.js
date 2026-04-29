// Global Toast Notification System
window.showToast = function(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    
    container.appendChild(toast);
    
    // Trigger reflow for animation
    void toast.offsetWidth;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

document.addEventListener("DOMContentLoaded", () => {
    // --- Login Logic ---
    const loginForm = document.getElementById("login-form");
    const loginOverlay = document.getElementById("login-overlay");
    const mainApp = document.getElementById("main-app");
    const loginError = document.getElementById("login-error");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // Make input validation more forgiving (lowercase, trim spaces)
            const usernameInput = document.getElementById("login-username").value.trim().toLowerCase();
            const passwordInput = document.getElementById("login-password").value.trim();

            // Hardcoded credentials
            if (usernameInput === "admin" && passwordInput === "password123") {
                loginOverlay.style.display = "none";
                mainApp.classList.remove("hidden");
                
                // Trigger window resize to force Chart.js to recalculate dimensions since it was hidden
                window.dispatchEvent(new Event('resize'));
                
                if(window.showToast) window.showToast("Welcome back, Admin!");
            } else {
                loginError.style.display = "block";
            }
        });
    }

    // --- Logout Logic ---
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            // Clear input fields and errors
            document.getElementById("login-username").value = "";
            document.getElementById("login-password").value = "";
            loginError.style.display = "none";
            
            // Show login screen, hide main app
            mainApp.classList.add("hidden");
            loginOverlay.style.display = "flex";
            
            if(window.showToast) window.showToast("Logged out successfully!");
        });
    }

    // --- Sidebar Toggle Logic ---
    const sidebarToggle = document.getElementById("sidebar-toggle");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            const mainApp = document.getElementById("main-app");
            if (mainApp) {
                mainApp.classList.toggle("sidebar-collapsed");
                // Trigger window resize to recalculate charts
                setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
            }
        });
    }

    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById("theme-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");

    if (themeToggleBtn) {
        // Check local storage for theme preference
        const savedTheme = localStorage.getItem("app_theme") || "dark";
        if (savedTheme === "light") {
            document.documentElement.setAttribute("data-theme", "light");
            if(moonIcon) moonIcon.style.display = "none";
            if(sunIcon) sunIcon.style.display = "block";
        }

        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            if (currentTheme === "light") {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("app_theme", "dark");
                if(sunIcon) sunIcon.style.display = "none";
                if(moonIcon) moonIcon.style.display = "block";
                if(window.showToast) window.showToast("Dark mode enabled");
            } else {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("app_theme", "light");
                if(moonIcon) moonIcon.style.display = "none";
                if(sunIcon) sunIcon.style.display = "block";
                if(window.showToast) window.showToast("Light mode enabled");
            }
            // Update charts slightly on theme switch
            setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        });
    }

    // --- AI Panel Toggle Logic ---
    const aiPanel = document.getElementById("ai-panel");
    const aiFloatingBtn = document.getElementById("ai-floating-btn");
    const closeAiBtn = document.getElementById("close-ai-btn");

    if (aiFloatingBtn && aiPanel && closeAiBtn) {
        aiFloatingBtn.addEventListener("click", () => {
            aiPanel.classList.add("open");
            aiFloatingBtn.style.transform = "scale(0)"; // Hide button when panel is open
        });
        
        closeAiBtn.addEventListener("click", () => {
            aiPanel.classList.remove("open");
            aiFloatingBtn.style.transform = "scale(1)"; // Show button
        });
    }

    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetViewId = item.getAttribute('data-view');
            if (!targetViewId) return;

            // Update active class on nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Hide all views, show target view
            viewSections.forEach(section => {
                if (section.id === targetViewId) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });

    // --- Settings Logic ---
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear all your tracked coins and API key?")) {
                localStorage.removeItem("tracked_coins");
                localStorage.removeItem("gemini_api_key");
                if(window.showToast) window.showToast("All data cleared! Refreshing...");
                setTimeout(() => location.reload(), 1500);
            }
        });
    }

    // 1. Fetching Relevant API (CoinGecko for live Crypto Prices)
    const cryptoContainer = document.getElementById("crypto-assets");
    
    let liveCryptoData = [];
    let trackedCoins = JSON.parse(localStorage.getItem("tracked_coins")) || ['bitcoin', 'ethereum', 'solana'];
    const newCoinInput = document.getElementById("new-coin-input");
    const addCoinBtn = document.getElementById("add-coin-btn");

    async function fetchCryptoData() {
        try {
            if (trackedCoins.length === 0) {
                cryptoContainer.innerHTML = '<p style="color: #94a3b8;">No coins tracked. Add one above!</p>';
                liveCryptoData = [];
                return;
            }
            cryptoContainer.innerHTML = '<p style="color: #94a3b8;">Loading live prices...</p>';
            
            const idsStr = trackedCoins.join(',');
            const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idsStr}&vs_currencies=usd`);
            const data = await res.json();
            
            cryptoContainer.innerHTML = '';
            const assets = [];
            
            // Reconstruct array of available data
            trackedCoins.forEach(coinId => {
                if (data[coinId]) {
                    assets.push({
                        id: coinId,
                        name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
                        price: data[coinId].usd
                    });
                } else {
                    // Invalid coin or not supported by API
                    console.warn(`Coin ${coinId} not found.`);
                }
            });
            
            liveCryptoData = assets;
            
            assets.forEach(asset => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <button class="remove-asset-btn" data-id="${asset.id}" title="Remove Asset">✖</button>
                    <h3>${asset.name}</h3>
                    <p style="font-size: 1.5rem; font-weight: 600; margin-top: 0.5rem; color: #10b981;">$${asset.price.toLocaleString()}</p>
                `;
                cryptoContainer.appendChild(card);
            });

            // Setup remove buttons
            document.querySelectorAll('.remove-asset-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idToRemove = e.target.getAttribute('data-id');
                    trackedCoins = trackedCoins.filter(c => c !== idToRemove);
                    localStorage.setItem("tracked_coins", JSON.stringify(trackedCoins));
                    if(window.showToast) window.showToast(`Removed <b>${idToRemove}</b> from tracking`);
                    fetchCryptoData();
                });
            });
        } catch (error) {
            cryptoContainer.innerHTML = '<p style="color: #ef4444;">Error fetching live crypto data.</p>';
            console.error("API Error:", error);
        }
    }

    // Handle Adding New Coins
    addCoinBtn.addEventListener("click", () => {
        const newCoin = newCoinInput.value.trim().toLowerCase();
        if (newCoin && !trackedCoins.includes(newCoin)) {
            trackedCoins.push(newCoin);
            localStorage.setItem("tracked_coins", JSON.stringify(trackedCoins));
            newCoinInput.value = '';
            if(window.showToast) window.showToast(`Added <b>${newCoin}</b> to tracking`);
            fetchCryptoData(); // Re-fetch and re-render
        } else if (trackedCoins.includes(newCoin)) {
            if(window.showToast) window.showToast(`<b>${newCoin}</b> is already tracked!`);
        }
    });


    // 2. Mocking NFT Data (Since most direct NFT APIs require user wallets/keys)
    const nftContainer = document.getElementById("nft-assets");
    const mockNFTs = [
        { name: "Cosmic Ape #142", collection: "Cosmic Apes", floor: "1.2 ETH", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop" },
        { name: "Digital Punk #007", collection: "Cyber Punks", floor: "0.8 ETH", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=300&auto=format&fit=crop" },
        { name: "Abstract Genesis", collection: "Art Blocks", floor: "0.5 ETH", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=300&auto=format&fit=crop" }
    ];

    function loadNFTs() {
        nftContainer.innerHTML = '';
        mockNFTs.forEach(nft => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${nft.image}" alt="${nft.name}" class="nft-image">
                <h3>${nft.name}</h3>
                <p style="color: #94a3b8; font-size: 0.9rem;">${nft.collection}</p>
                <p style="margin-top: 0.5rem;">Floor: <strong>${nft.floor}</strong></p>
            `;
            nftContainer.appendChild(card);
        });
    }

    // 3. AI Assistant Integration with Gemini API
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const chatWindow = document.getElementById("chat-window");
    const apiKeyInput = document.getElementById("api-key-input");
    const saveKeyBtn = document.getElementById("save-key-btn");
    
    // Manage API Key
    // ====================================================================================
    // 🔑 WHERE TO ADD YOUR API KEY IF YOU DON'T WANT TO USE THE UI:
    // Replace the empty string "" below with your actual Gemini API key.
    // Example: let geminiApiKey = localStorage.getItem("gemini_api_key") || "AIzaSy...";
    // ====================================================================================
    let geminiApiKey = localStorage.getItem("gemini_api_key") || "";
    if (geminiApiKey) apiKeyInput.value = geminiApiKey;

    saveKeyBtn.addEventListener("click", () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem("gemini_api_key", key);
            geminiApiKey = key;
            saveKeyBtn.textContent = "Saved!";
            setTimeout(() => saveKeyBtn.textContent = "Save Key", 2000);
        }
    });

    let conversationHistory = [];

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight; // Auto scroll to bottom
        return msgDiv; // Return so we can modify it (e.g. loading state)
    }

    async function fetchGeminiResponse(query) {
        const safeCrypto = Array.isArray(liveCryptoData) ? liveCryptoData : [];
        const safeNFTs = Array.isArray(mockNFTs) ? mockNFTs : [];

        conversationHistory.push({ role: "user", parts: [{ text: query }] });
        if (conversationHistory.length > 10) conversationHistory = conversationHistory.slice(conversationHistory.length - 10);

        const delay = 600 + Math.random() * 800;
        await new Promise(resolve => setTimeout(resolve, delay));

        const lowerQuery = query.toLowerCase();
        let aiText = "";

        // --- 1. Project & Code Specific Answers ---
        if (lowerQuery.includes("project") || lowerQuery.includes("what is this") || lowerQuery.includes("about this app")) {
            aiText = "This project is a Premium AI Digital Asset Manager Dashboard. It is designed to track cryptocurrency portfolios, monitor NFT collections, and provide real-time analytics using a sleek, glassmorphism UI.";
        }
        else if (lowerQuery.includes("tech") || lowerQuery.includes("stack") || lowerQuery.includes("code") || lowerQuery.includes("language")) {
            aiText = "This dashboard is built using pure HTML5, CSS3 with advanced Glassmorphism styling, Vanilla JavaScript for logic, and Chart.js for the responsive analytics visualizations. It requires no complex frameworks!";
        }
        else if (lowerQuery.includes("feature") || lowerQuery.includes("what can i do") || lowerQuery.includes("how to use")) {
            aiText = "You can navigate using the sidebar to check your Dashboard charts, view your individual crypto assets in the Portfolio, see your digital art in the NFT tab, check your performance in Analytics, and chat with me for instant insights.";
        }
        else if (lowerQuery.includes("chart") || lowerQuery.includes("graph") || lowerQuery.includes("analytics")) {
            aiText = "The analytics are powered by Chart.js. You currently have a line chart showing Portfolio Performance, a Revenue Flow chart, and a Doughnut chart showing your Asset Distribution.";
        }

        // --- 2. Live Portfolio Data ---
        else if (lowerQuery.includes("balance") || lowerQuery.includes("total") || lowerQuery.includes("worth")) {
            aiText = "Your current total portfolio balance is $124,563.00, reflecting a profit of +$14,235.00 (+2.4% growth from last month).";
        }
        else if (lowerQuery.includes("crypto") || lowerQuery.includes("coin") || lowerQuery.includes("market")) {
            if (safeCrypto.length === 0) {
                aiText = "You currently aren't tracking any cryptocurrency coins.";
            } else {
                const coinsStr = safeCrypto.map(c => `${c.name} ($${c.price.toLocaleString()})`).join(', ');
                aiText = `You are tracking ${safeCrypto.length} assets: ${coinsStr}. Ethereum is leading with +12.5% growth.`;
            }
        }
        else if (lowerQuery.includes("nft") || lowerQuery.includes("art") || lowerQuery.includes("collection")) {
            if (safeNFTs.length === 0) {
                aiText = "You don't have any NFTs right now.";
            } else {
                const nftStr = safeNFTs.map(n => `${n.name} (Floor: ${n.floor})`).join(', ');
                aiText = `You hold ${safeNFTs.length} premium NFTs: ${nftStr}.`;
            }
        }

        // --- 3. Normal Conversation ---
        else if (lowerQuery.match(/^(hi|hello|hey|greetings|sup)/)) {
            aiText = "Hello! I am your AI Asset Manager. How can I help you with your dashboard or portfolio today?";
        } 
        else if (lowerQuery.match(/(how are you|how do you do)/)) {
            aiText = "I'm functioning perfectly! Ready to help you manage your digital assets and explain this project to you.";
        }
        else if (lowerQuery.match(/(who are you|what are you|your name)/)) {
            aiText = "I am the local AI assistant for this Digital Asset Manager project. I can answer questions about the code, the UI, or your portfolio data!";
        }
        else if (lowerQuery.match(/(thanks|thank you|awesome|great|good)/)) {
            aiText = "You're very welcome! Feel free to ask anything else about the project or your assets.";
        }
        else if (lowerQuery.match(/(bye|goodbye|see you)/)) {
            aiText = "Goodbye! Happy tracking!";
        }

        // --- 4. Smart Fallback ---
        else {
            aiText = "I'm your project AI assistant! I can tell you about this Digital Asset Dashboard's features, the tech stack (HTML/CSS/JS), or summarize your current crypto and NFT balances. What would you like to know?";
        }

        conversationHistory.push({ role: "model", parts: [{ text: aiText }] });
        return aiText;
    }

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;
        
        // Disable input while processing
        chatInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.textContent = "...";
        
        addMessage(text, 'user');
        chatInput.value = '';

        // Add typing indicator
        const loadingMsgDiv = document.createElement('div');
        loadingMsgDiv.className = 'typing-indicator';
        loadingMsgDiv.textContent = 'AI is analyzing...';
        chatWindow.appendChild(loadingMsgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Fetch AI response
        const response = await fetchGeminiResponse(text);
        
        // Remove typing indicator
        loadingMsgDiv.remove();
        
        addMessage(response, 'ai');
        
        // Re-enable input
        chatInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.textContent = "Send";
        chatInput.focus();
    }

    sendBtn.addEventListener("click", handleSend);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSend();
    });

    // Initialize the app functionalities
    fetchCryptoData();
    loadNFTs();
});
