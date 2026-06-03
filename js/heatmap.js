/*
   APEX SKILLSPACE - ACTIVITY HEATMAP
   GitHub-style contribution heatmap loaded from database
*/

export function createActivityHeatmap(elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    // Load actual activity log from localStorage
    const logRaw = localStorage.getItem('fpm_activity_log');
    const activityLog = logRaw ? JSON.parse(logRaw) : [];

    // Clear previous heatmap if any
    container.innerHTML = '';

    const heatmapGrid = document.createElement('div');
    heatmapGrid.className = 'heatmap-grid';

    // Create 52 weeks (columns) x 7 days (rows)
    const today = new Date();
    for (let week = 0; week < 52; week++) {
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            
            // Calculate date for this cell
            const date = new Date(today);
            date.setDate(today.getDate() - (52 * 7) + (week * 7) + day);
            const dateString = date.toISOString().split('T')[0];
            
            // Find activity count in log
            const logEntry = activityLog.find(item => item.date === dateString);
            const activityCount = logEntry ? logEntry.count : 0;
            
            // Determine activity level (0-4)
            let activityLevel = 0;
            if (activityCount > 0) {
                if (activityCount <= 2) activityLevel = 1;
                else if (activityCount <= 4) activityLevel = 2;
                else if (activityCount <= 6) activityLevel = 3;
                else activityLevel = 4;
            }
            
            if (activityLevel > 0) {
                cell.classList.add('active');
                // Use the level to adjust opacity of primary accent color (#00ffaa)
                cell.style.background = '#00ffaa';
                cell.style.opacity = 0.2 + (activityLevel * 0.2);
            }
            
            // Add tooltip
            cell.title = `${date.toLocaleDateString()}: ${activityCount} contributions`;
            
            heatmapGrid.appendChild(cell);
        }
    }

    container.appendChild(heatmapGrid);
}

export function updateHeatmapCell(week, day, activityLevel) {
    const cells = document.querySelectorAll('.heatmap-cell');
    const cellIndex = week * 7 + day;
    
    if (cells[cellIndex]) {
        cells[cellIndex].classList.toggle('active', activityLevel > 0);
        if (activityLevel > 0) {
            cells[cellIndex].style.background = '#00ffaa';
            cells[cellIndex].style.opacity = 0.2 + (activityLevel * 0.2);
        } else {
            cells[cellIndex].style.background = '';
            cells[cellIndex].style.opacity = '';
        }
    }
}
