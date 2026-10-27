const ctx = document.getElementById('voltageChart').getContext('2d');
let chartLabels = [];
let chartData = [];

// Initialize Chart
const voltageChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: chartLabels,
        datasets: [{
            label: 'Voltage',
            data: chartData,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        scales: { y: { beginAtZero: true, max: 250 } }
    }
});

// Function to fetch analysis (Total Energy & Avg Voltage)
async function runAnalysis() {
    try {
        const response = await fetch('http://127.0.0.1:5000/analyze');
        const data = await response.json();
        
        document.getElementById('energy-val').innerText = data.total_energy_wh;
        document.getElementById('voltage-val').innerText = data.average_voltage;
        document.getElementById('saved-val').innerText = data.saved_energy;
    } catch (error) {
        console.error("Error fetching analysis:", error);
    }
}

// Function to fetch Live Data for the Graph
async function updateLiveData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/live-data');
        const data = await response.json();

        const now = new Date().toLocaleTimeString();
        
        // Keep only last 15 points on the graph
        if (chartLabels.length > 15) {
            chartLabels.shift();
            chartData.shift();
        }

        chartLabels.push(now);
        chartData.push(data.voltage);
        voltageChart.update();

    } catch (error) {
        console.log("Waiting for backend...");
    }
}

// Poll for live data every 2 seconds
setInterval(updateLiveData, 2000);