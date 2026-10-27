from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

CSV_FILE = 'hospital_data.csv'

def get_dataframe():
    if not os.path.exists(CSV_FILE):
        return None
    return pd.read_csv(CSV_FILE)

@app.route('/analyze')
def analyze():
    df = get_dataframe()
    if df is None or df.empty:
        return jsonify({"error": "No data found"})
    
    # 1. Energy Calculation (Wh)
    df['Power'] = df['Voltage'] * df['Current']
    total_energy_wh = df['Power'].sum() / 3600
    
    # 2. Voltage-based measure (Average Voltage)
    # This gives you the "mean pressure" of the system over the dataset
    avg_voltage = df['Voltage'].mean()
    
    # 3. Energy Saved Logic
    saved_energy = df[(df['Voltage'] == 0) & (df['Status'] == 'OFF')].shape[0] * (500/3600)
    
    return jsonify({
        "total_energy_wh": round(total_energy_wh, 4),
        "average_voltage": round(avg_voltage, 2), # The measure you requested
        "saved_energy": round(saved_energy, 4),
        "data_points": len(df)
    })

@app.route('/live-data')
def live_data():
    df = get_dataframe()
    if df is None or df.empty:
        return jsonify({"voltage": 0, "status": "No Data"})

    # Get the very last row for the "current" status
    latest_row = df.iloc[-1]
    
    return jsonify({
        "voltage": float(latest_row['Voltage']),
        "current": float(latest_row['Current']),
        "status": "Safe" if latest_row['Voltage'] > 200 else "Warning" # Example logic
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)