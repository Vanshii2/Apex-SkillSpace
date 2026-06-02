/*
   ==========================================================================
   FUTURISTIC PORTFOLIO MARKETPLACE - CREATOR HUB DASHBOARD SCRIPT
   Renders custom LeetCode heatmaps, pure JS SVG analytics trends,
   achievement badge triggers, and streak tracking matrices.
   ==========================================================================
*/

import { getCurrentUser, getProjects, getLiked, getBookmarked, getActivityLog, getNotifications } from './db.js';

export function initDashboard() {
    const user = getCurrentUser();
    if (!user) return;

    // Set user info
    const nameEl = document.getElementById('dashboard-user-name');
    if (nameEl) nameEl.textContent = user.name || 'Creator';

    // Hydrate top dashboard stat values
    const projCount = document.getElementById('dash-proj-count');
    if (projCount) projCount.textContent = user.stats ? user.stats.projects : 0;

    const likesCount = document.getElementById('dash-likes-count');
    if (likesCount) likesCount.textContent = user.stats ? user.stats.likes : 0;

    const bkCount = document.getElementById('dash-bookmarks-count');
    if (bkCount) bkCount.textContent = getBookmarked().length;

    const streakCount = document.getElementById('dash-streak-count');
    if (streakCount) streakCount.textContent = (user.streak || 0) + ' Days';

    // Draw components
    renderLeetCodeHeatmap();
    renderPureJSCharts();
    renderProgressRing(user.profileProgress || 0);
    renderAchievements(user);
    renderRecentActivity();
}

// --- 1. Draw 365-Day LeetCode-style Contribution Heatmap ---
function renderLeetCodeHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    if (!grid) return;

    const logs = getActivityLog(); // Array of { date: 'YYYY-MM-DD', count: N }
    const logMap = new Map(logs.map(item => [item.date, item.count]));

    const today = new Date();
    const cells = [];

    // Calculate total contributions count
    let totalAct = 0;
    logs.forEach(l => totalAct += l.count);
    const totalActNode = document.getElementById('heatmap-total-contributions');
    if (totalActNode) totalActNode.textContent = `${totalAct} actions in the past year`;

    // To construct the grid: we dates back 365 days (52.1 weeks).
    // To make sure each column starts on Sunday, we align the start date.
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // 365 days ago

    // Align start to the preceding Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    // Generate 371 cells (53 weeks * 7 days) to fill the grid flawlessly
    for (let i = 0; i < 371; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const dateStr = currentDate.toISOString().split('T')[0];
        const count = logMap.get(dateStr) || 0;

        // Choose level based on count density
        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count > 2 && count <= 4) level = 2;
        else if (count > 4 && count <= 7) level = 3;
        else if (count > 7) level = 4;

        // Tooltip description
        const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const tooltipText = `${count === 0 ? 'No' : count} activity point${count === 1 ? '' : 's'} on ${formattedDate}`;

        cells.push(`
            <div class="heatmap-cell level-${level}" 
                 data-date="${dateStr}" 
                 data-tooltip="${tooltipText}">
            </div>
        `);
    }

    grid.innerHTML = cells.join('');
}

// --- 2. Render Premium Pure JS SVG Analytics Line Graph ---
function renderPureJSCharts() {
    const container = document.getElementById('dashboard-sales-chart');
    if (!container) return;

    // Custom mock data representing 7 weeks of sales/views
    const weeks = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7'];
    const views = [420, 580, 510, 740, 980, 890, 1240];
    const sales = [40, 80, 110, 160, 240, 180, 312];

    const svgWidth = container.clientWidth || 560;
    const svgHeight = 220;
    const paddingLeft = 40;
    const paddingBottom = 30;
    const paddingTop = 20;
    const paddingRight = 20;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    const maxVal = 1300; // Fits maximum views of 1240

    // Coordinate mapping helper
    const getX = (index) => paddingLeft + (index / (weeks.length - 1)) * chartWidth;
    const getY = (val) => svgHeight - paddingBottom - (val / maxVal) * chartHeight;

    // Formulate SVG path nodes
    const viewsPoints = views.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');
    const salesPoints = sales.map((s, i) => `${getX(i)},${getY(s * 3.5)}`).join(' '); // scaled up for visibility

    // Draw grids
    let grids = '';
    for (let k = 0; k <= 4; k++) {
        const yVal = getY((maxVal / 4) * k);
        grids += `
            <line x1="${paddingLeft}" y1="${yVal}" x2="${svgWidth - paddingRight}" y2="${yVal}" class="chart-grid-line" />
            <text x="${paddingLeft - 10}" y="${yVal + 4}" class="chart-axis-label" text-anchor="end">${Math.round((maxVal / 4) * k)}</text>
        `;
    }

    // Draw week axis descriptions
    let axisTexts = '';
    weeks.forEach((w, i) => {
        axisTexts += `<text x="${getX(i)}" y="${svgHeight - 10}" class="chart-axis-label" text-anchor="middle">${w}</text>`;
    });

    // Compile full SVG
    container.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none">
            <!-- Grid Lines & Labels -->
            ${grids}
            ${axisTexts}
            
            <!-- Views Gradient overlay -->
            <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
                </linearGradient>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
                </linearGradient>
            </defs>
            
            <!-- Views Area & Line -->
            <path d="M ${paddingLeft} ${svgHeight - paddingBottom} L ${viewsPoints} L ${svgWidth - paddingRight} ${svgHeight - paddingBottom} Z" fill="url(#viewsGrad)" />
            <polyline points="${viewsPoints}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" />
            
            <!-- Sales Line -->
            <polyline points="${salesPoints}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" />
            
            <!-- Intersecting Data Dot Nodes -->
            ${views.map((v, i) => `<circle cx="${getX(i)}" cy="${getY(v)}" r="4.5" fill="var(--bg-surface)" stroke="var(--primary)" stroke-width="2" class="clickable" />`).join('')}
            ${sales.map((s, i) => `<circle cx="${getX(i)}" cy="${getY(s * 3.5)}" r="4.5" fill="var(--bg-surface)" stroke="var(--accent)" stroke-width="2" class="clickable" />`).join('')}
        </svg>
    `;
}

// --- 3. Profile Completion radial loader ---
function renderProgressRing(pct) {
    const fillRing = document.getElementById('progress-ring-fill');
    if (!fillRing) return;

    const circumference = 226; // 2 * PI * 36
    const offset = circumference - (pct / 100) * circumference;

    // Set percentage text
    document.getElementById('progress-percentage-text').textContent = pct + '%';

    // Trigger stroke animate
    setTimeout(() => {
        fillRing.style.strokeDashoffset = offset;
    }, 400);
}

// --- 4. Render unlocked LeetCode achievement badges ---
function renderAchievements(user) {
    const container = document.getElementById('achievements-list');
    if (!container) return;

    // Schema of achievements
    const badges = [
        { id: 'first_upload', title: 'First Listing', desc: 'Publish your first creative asset', icon: '✦', unlock: user.stats.projects >= 1 },
        { id: 'streak_master', title: 'Streak Maker', desc: 'Maintain a 5+ day streak log', icon: '⚡', unlock: user.streak >= 5 },
        { id: 'popular_creator', title: 'Aron Thorne', desc: 'Secure 100+ likes on code assets', icon: '★', unlock: user.stats.likes >= 100 },
        { id: 'collector', title: 'Aesthetic Collector', desc: 'Bookmark 3+ creative spaces', icon: '⚱', unlock: getBookmarked().length >= 3 }
    ];

    container.innerHTML = badges.map(b => `
        <div class="achievement-card ${b.unlock ? 'unlocked spotlight-card' : ''}">
            <div class="achievement-badge-icon">${b.icon}</div>
            <h4 style="font-size:0.85rem;margin-bottom:4px;color:${b.unlock ? 'var(--text-primary)' : 'var(--text-muted)'}">${b.title}</h4>
            <p style="font-size:0.7rem;color:var(--text-muted);">${b.desc}</p>
        </div>
    `).join('');
}

// --- 5. Renders Recent Activity timeline ---
function renderRecentActivity() {
    const list = document.getElementById('recent-activity-timeline');
    if (!list) return;

    const notifs = getNotifications();
    if (notifs.length === 0) {
        list.innerHTML = `<div style="color:var(--text-muted);font-size:0.8rem;text-align:center;">No recent actions logs</div>`;
        return;
    }

    list.innerHTML = notifs.map(n => `
        <div class="timeline-item ${n.unread ? 'unread' : ''}">
            <p style="font-size:0.85rem;font-weight:500;color:var(--text-primary);">${n.text}</p>
            <span style="font-size:0.75rem;color:var(--text-muted);">${n.time}</span>
        </div>
    `).join('');
}
