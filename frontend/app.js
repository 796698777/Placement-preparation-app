// API Configuration
const API_BASE = 'http://localhost:5000/api';

// DOM Elements
let modulesContainer = null;
let backendStatus = null;
let dashboardLink = null;
let loginDetails = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    modulesContainer = document.getElementById('modulesGrid');
    backendStatus = document.getElementById('backendStatus');
    dashboardLink = document.getElementById('dashboardLink');
    loginDetails = document.getElementById('loginDetails');

    if (dashboardLink) {
        dashboardLink.addEventListener('click', (event) => {
            event.preventDefault();
            handleDashboardClick();
        });
    }

    fetchModules();
    seedDatabaseOnInit();
});

// Fetch all modules from backend
async function fetchModules() {
    try {
        console.log('🔄 Fetching modules from backend...');
        const response = await fetch(`${API_BASE}/modules`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let modules = await response.json();
        console.log('✅ Modules fetched:', modules);
        modules = ensureMockTestsModule(modules);

        if (modules.length === 0) {
            console.log('📦 No modules found. Seeding database...');
            showBackendStatus('No modules found in backend. Seeding default data...');
            await seedDatabase();
        } else {
            renderModules(modules);
            showBackendStatus(`Backend connected — loaded ${modules.length} module(s) from server.`);
        }
    } catch (error) {
        console.error('❌ Error fetching modules:', error);
        if (backendStatus) {
            showBackendStatus('Unable to connect to backend. Start the backend server on port 5000.', true);
        }
        if (modulesContainer) {
            modulesContainer.innerHTML = `<p style="color: red; text-align: center; grid-column: 1/-1;">Error connecting to backend. Make sure the server is running on http://localhost:5000</p>`;
        }
    }
}

function ensureMockTestsModule(modules) {
    if (modules.some((m) => m.id === 'mock-tests')) {
        return modules;
    }

    return [
        ...modules,
        {
            id: 'mock-tests',
            title: 'Mock Tests',
            shortDesc: 'Practice subject-wise mock questions across DSA, Full Stack, and more.',
            longDesc: 'Open subject-specific mock tests and solve curated questions for placement rounds.',
            iconClass: 'fa-solid fa-pen-to-square',
            metaText: '25+ Questions',
            clicks: 0
        }
    ];
}

function handleDashboardClick() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userEmail = localStorage.getItem('userEmail');

    if (!isAuthenticated || !userEmail) {
        window.location.href = 'login.html';
        return;
    }

    if (!loginDetails) return;
    loginDetails.style.display = 'flex';
    loginDetails.innerHTML = `
        <div>
            <strong>Logged in as:</strong> ${userEmail}<br>
            <small>Welcome back! Your dashboard is showing live backend data.</small>
        </div>
        <button type="button" onclick="logoutUser()">Logout</button>
    `;
}

function logoutUser() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    if (loginDetails) {
        loginDetails.style.display = 'none';
    }
    window.location.reload();
}

function showBackendStatus(text, isError = false) {
    if (!backendStatus) return;
    backendStatus.textContent = text;
    backendStatus.style.color = isError ? '#f87171' : 'var(--accent-primary)';
}

// Render modules to the UI
function renderModules(modules) {
    if (!modulesContainer) return;
    
    modulesContainer.innerHTML = '';
    
    modules.forEach(module => {
        const moduleCard = document.createElement('div');
        moduleCard.className = 'module-card';
        moduleCard.style.cursor = 'pointer';
        moduleCard.innerHTML = `
            <div class="card-icon">
                <i class="${module.iconClass}"></i>
            </div>
            <h3>${module.title}</h3>
            <p class="short-desc">${module.shortDesc}</p>
            <p class="long-desc">${module.longDesc}</p>
            <div class="card-footer">
                <span class="meta-text">${module.metaText}</span>
                <span class="clicks-counter">👆 ${module.clicks || 0} clicks</span>
            </div>
            <button class="track-btn">View Details</button>
        `;
        
        // Click anywhere on card to store click in backend and then open detail page
        moduleCard.onclick = () => handleModuleClick(module.id);
        modulesContainer.appendChild(moduleCard);
    });
}

// Handle click tracking then navigation
async function handleModuleClick(moduleId) {
    const result = await trackModuleClick(moduleId);
    if (result && result.success) {
        showToast('Click stored in backend!');
    } else {
        showToast('Click recorded locally.');
    }
    setTimeout(() => openModuleDetail(moduleId), 300);
}

// Open module detail page or redirect to mock test page
function openModuleDetail(moduleId) {
    console.log(`🔗 Opening module detail: ${moduleId}`);
    if (moduleId === 'mock-tests') {
        window.location.href = 'mocktest.html';
        return;
    }
    window.location.href = `detail.html?id=${moduleId}`;
}

// Track module click analytics
async function trackModuleClick(moduleId) {
    try {
        console.log(`📊 Tracking click for module: ${moduleId}`);
        const response = await fetch(`${API_BASE}/modules/${moduleId}/click`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        console.log(`✅ Click tracked! Total clicks: ${result.clicks}`);
        
        // Refresh modules to show updated click count
        fetchModules();
        return { success: true, clicks: result.clicks };
    } catch (error) {
        console.error('❌ Error tracking click:', error);
        return null;
    }
}

function showToast(message, duration = 2000) {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '14px 20px';
        toast.style.borderRadius = '10px';
        toast.style.background = 'rgba(15, 23, 42, 0.95)';
        toast.style.color = '#e2e8f0';
        toast.style.fontSize = '0.95rem';
        toast.style.boxShadow = '0 18px 30px rgba(15, 23, 42, 0.25)';
        toast.style.zIndex = '9999';
        toast.style.maxWidth = '320px';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        toast.style.transform = 'translateY(10px)';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast.dismissTimer);
    toast.dismissTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
    }, duration);
}

// Seed database with initial data
async function seedDatabase() {
    try {
        console.log('🌱 Seeding database...');
        const response = await fetch(`${API_BASE}/modules/seed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        console.log('✅ Database seeded:', result.message);
        
        // Fetch modules again to display seeded data
        fetchModules();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
}

// Seed database on initial load if needed
async function seedDatabaseOnInit() {
    try {
        const response = await fetch(`${API_BASE}/modules`);
        const modules = await response.json();
        
        if (modules.length === 0) {
            console.log('📦 Database is empty. Auto-seeding...');
            await seedDatabase();
        }
    } catch (error) {
        console.log('⚠️ Initial seed check skipped');
    }
}
