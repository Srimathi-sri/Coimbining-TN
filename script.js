let battery = 100;
let isGridUp = true;
let logHistory = [];

// Initialize Chart
const ctx = document.getElementById('energyChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Battery %', data: [], borderColor: '#2ed573', fill: true, backgroundColor: 'rgba(46, 213, 115, 0.1)' }]},
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 }}}
});

function addLog(msg) {
    const time = new Date().toLocaleTimeString();
    const entry = `[${time}] ${msg}`;
    logHistory.push(entry);
    const logBox = document.getElementById('logs');
    logBox.innerHTML += `<div>${entry}</div>`;
    logBox.scrollTop = logBox.scrollHeight;
}

// Button Functions
function simulateFailure() { 
    isGridUp = false; 
    addLog("CRITICAL: Grid failure detected!"); 
}
function restorePower() { 
    isGridUp = true; 
    addLog("SUCCESS: Grid power restored."); 
}
function resetSystem() {
    battery = 100;
    isGridUp = true;
    logHistory = [];
    document.getElementById('logs').innerHTML = "System Reset.";
    addLog("System initialized.");
}
function downloadReport() {
    const blob = new Blob([logHistory.join('\n')], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Hospital_Report.txt';
    a.click();
}

// The "Bot" Logic (Runs every second)
setInterval(() => {
    // 1. Update Metrics
    if (!isGridUp) {
        battery = Math.max(0, battery - 1.5);
        document.getElementById('voltage-val').innerText = "0V";
        document.getElementById('source-val').innerText = "BATTERY";
    } else {
        battery = Math.min(100, battery + 0.5);
        document.getElementById('voltage-val').innerText = (228 + Math.floor(Math.random()*5)) + "V";
        document.getElementById('source-val').innerText = "GRID";
    }
    
    document.getElementById('battery-val').innerText = Math.floor(battery) + "%";
    document.getElementById('batt-card').style.background = battery > 50 ? "#2ed573" : (battery > 20 ? "#ffa502" : "#ff4757");

    // 2. Update Graph
    chart.data.labels.push(new Date().toLocaleTimeString());
    chart.data.datasets[0].data.push(battery);
    if(chart.data.labels.length > 20) { chart.data.labels.shift(); chart.data.datasets[0].data.shift(); }
    chart.update();

    // 3. Load Shedding Logic
    const hvac = document.getElementById('dev-hvac');
    const light = document.getElementById('dev-light');

    if (battery < 75) {
        hvac.classList.add('offline');
        document.getElementById('lbl-hvac').innerText = "SHEDDED";
    } else {
        hvac.classList.remove('offline');
        document.getElementById('lbl-hvac').innerText = "ONLINE";
    }

    if (battery < 30) {
        light.classList.add('offline');
        document.getElementById('lbl-light').innerText = "SHEDDED";
    } else {
        light.classList.remove('offline');
        document.getElementById('lbl-light').innerText = "ONLINE";
    }
}, 1000);