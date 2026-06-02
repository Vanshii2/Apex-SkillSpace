/*
   APEX SKILLSPACE - ACTIVITY HEATMAP
   GitHub-style contribution heatmap
*/

export function createActivityHeatmap(elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    // Generate heatmap data for last 52 weeks (364 days)
    const heatmapGrid = document.createElement('div');
    heatmapGrid.className = 'heatmap-grid';

    // Create 52 weeks (columns) x 7 days (rows)
    for (let week = 0; week < 52; week++) {
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            
            // Random activity level (0-4)
            const activity = Math.floor(Math.random() * 5);
            
            if (activity > 0) {
                cell.classList.add('active');
                cell.style.opacity = (activity / 4);
            }
            
            // Add tooltip
            const date = new Date();
            date.setDate(date.getDate() - (52 * 7) + (week * 7) + day);
            cell.title = `${date.toLocaleDateString()}: ${activity} contributions`;
            
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
        cells[cellIndex].style.opacity = (activityLevel / 4);
    }
}
