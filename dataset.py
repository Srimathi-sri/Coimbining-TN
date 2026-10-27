import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Configuration
total_seconds = 1200  # 20 minutes of data
start_time = datetime.now()
data = []

# Baseline "Healthy" Voltage
base_voltage = 230.0 

for s in range(total_seconds):
    timestamp = (start_time + timedelta(seconds=s)).strftime('%Y-%m-%d %H:%M:%S')
    
    # 1. Add "Real-World Noise" (Tiny fluctuations +/- 1.5V)
    noise = np.random.normal(0, 0.5) 
    current_v = base_voltage + noise
    
    # 2. Inject Random Failures
    # Minutes 5-6: A "Brownout" (Voltage Sag)
    if 300 <= s <= 360:
        current_v -= 50  # Drops to ~180V
        status = "WARNING: LOW"
    
    # Minutes 12-12.5: A "Surge" (Voltage Spike)
    elif 720 <= s <= 750:
        current_v += 45  # Spikes to ~275V
        status = "CRITICAL: SURGE"
        
    # Minutes 15-16: Total "Blackout"
    elif 900 <= s <= 960:
        current_v = 0.0
        status = "OFF"
    
    else:
        status = "STABLE"

    # Current (Amps) usually fluctuates with Voltage
    current_a = round(random.uniform(10.5, 12.5), 2) if current_v > 0 else 0.0
    
    data.append([timestamp, round(current_v, 2), current_a, status])
def get_energy_priority(voltage):
    if voltage >= 210:
        return {"status": "Stable", "ac": "ON", "lights": "100%", "icu": "ON"}
    elif 170 <= voltage < 210:
        return {"status": "Fluctuation (Possible)", "ac": "ECO", "lights": "50%", "icu": "ON"}
    elif 90 <= voltage < 170:
        return {"status": "Critical Level", "ac": "OFF", "lights": "OFF", "icu": "ON"}
    else:
        return {"status": "SYSTEM FAILURE", "ac": "OFF", "lights": "OFF", "icu": "BATTERY"}

# Save to CSV
df = pd.DataFrame(data, columns=['Timestamp', 'Voltage', 'Current', 'Status'])
df.to_csv('hospital_data.csv', index=False)
print("Real-world fluctuating dataset 'hospital_data.csv' created!")