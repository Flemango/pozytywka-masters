import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Input
from tensorflow.keras.optimizers import Adam

import sys
# Set console output encoding to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

data = [
    [
        {'date': '2.06', 'time': '16:00', 'duration': '1h'},
        {'date': '6.06', 'time': '16:00', 'duration': '1h'},
        {'date': '10.06', 'time': '14:00', 'duration': '1h'},
        {'date': '13.06', 'time': '14:00', 'duration': '1h'},
        {'date': '17.06', 'time': '16:00', 'duration': '2h'},
        {'date': '20.06', 'time': '16:00', 'duration': '2h'},
        {'date': '24.06', 'time': '16:00', 'duration': '1h'},
        {'date': '27.06', 'time': '16:00', 'duration': '1h'},
        {'date': '1.07', 'time': '18:00', 'duration': '1h'},
        {'date': '4.07', 'time': '14:00', 'duration': '1h'},
        {'date': '8.07', 'time': '14:00', 'duration': '1h'},
        {'date': '11.07', 'time': '16:00', 'duration': '1h'},
        {'date': '15.07', 'time': '14:00', 'duration': '1h'},
        {'date': '18.07', 'time': '16:00', 'duration': '1h'},
        {'date': '22.07', 'time': '16:00', 'duration': '1h'},
        {'date': '25.07', 'time': '16:00', 'duration': '1h'},
        {'date': '29.07', 'time': '12:00', 'duration': '2h'},
        {'date': '1.08', 'time': '16:00', 'duration': '1h'}
    ],
    [
        {'date': '6.06', 'time': '16:00', 'duration': '1h'},
        {'date': '13.06', 'time': '14:00', 'duration': '1h'},
        {'date': '20.06', 'time': '14:00', 'duration': '1h'},
        {'date': '27.06', 'time': '16:00', 'duration': '2h'},
        {'date': '4.07', 'time': '16:00', 'duration': '2h'},
        {'date': '11.07', 'time': '16:00', 'duration': '1h'},
        {'date': '22.07', 'time': '18:00', 'duration': '1h'},
        {'date': '1.08', 'time': '14:00', 'duration': '1h'},
        {'date': '8.08', 'time': '14:00', 'duration': '1h'},
        {'date': '15.08', 'time': '16:00', 'duration': '2h'},
        {'date': '22.08', 'time': '16:00', 'duration': '2h'},
        {'date': '29.08', 'time': '16:00', 'duration': '1h'},
        {'date': '9.09', 'time': '18:00', 'duration': '1h'},
        {'date': '18.09', 'time': '14:00', 'duration': '1h'},
        {'date': '25.09', 'time': '14:00', 'duration': '1h'}
    ],
    [
        {'date': '10.09', 'time': '16:00', 'duration': '1h'},
        {'date': '14.09', 'time': '14:00', 'duration': '1h'},
        {'date': '17.09', 'time': '16:00', 'duration': '1h'},
        {'date': '21.09', 'time': '14:00', 'duration': '1h'},
        {'date': '24.09', 'time': '16:00', 'duration': '1h'},
        {'date': '28.09', 'time': '14:00', 'duration': '1h'},
        {'date': '01.10', 'time': '16:00', 'duration': '1h'},
        {'date': '05.10', 'time': '14:00', 'duration': '1h'},
        {'date': '08.10', 'time': '16:00', 'duration': '1h'},
        {'date': '12.10', 'time': '14:00', 'duration': '1h'},
        {'date': '15.10', 'time': '16:00', 'duration': '1h'},
        {'date': '19.10', 'time': '14:00', 'duration': '1h'},
        {'date': '22.10', 'time': '16:00', 'duration': '1h'},
        {'date': '26.10', 'time': '14:00', 'duration': '1h'},
        {'date': '29.10', 'time': '16:00', 'duration': '1h'},
        {'date': '02.11', 'time': '14:00', 'duration': '1h'},
        {'date': '05.11', 'time': '16:00', 'duration': '1h'},
        {'date': '09.11', 'time': '14:00', 'duration': '1h'},
        {'date': '12.11', 'time': '16:00', 'duration': '1h'},
        {'date': '16.11', 'time': '14:00', 'duration': '1h'},
        {'date': '19.11', 'time': '16:00', 'duration': '1h'},
        {'date': '23.11', 'time': '14:00', 'duration': '1h'},
        {'date': '26.11', 'time': '16:00', 'duration': '1h'},
        {'date': '30.11', 'time': '14:00', 'duration': '1h'},
        {'date': '03.12', 'time': '16:00', 'duration': '1h'},
        {'date': '07.12', 'time': '14:00', 'duration': '1h'}
    ],
    [
        {'date': '05.03', 'time': '10:00', 'duration': '1h'},
        {'date': '19.03', 'time': '10:00', 'duration': '1h'},
        {'date': '02.04', 'time': '11:00', 'duration': '1h'},
        {'date': '16.04', 'time': '11:00', 'duration': '2h'},
        {'date': '30.04', 'time': '12:00', 'duration': '1h'},
        {'date': '14.05', 'time': '12:00', 'duration': '1h'},
        {'date': '28.05', 'time': '13:00', 'duration': '1h'},
        {'date': '11.06', 'time': '13:00', 'duration': '2h'},
        {'date': '25.06', 'time': '14:00', 'duration': '1h'},
        {'date': '09.07', 'time': '14:00', 'duration': '1h'},
        {'date': '23.07', 'time': '15:00', 'duration': '1h'}
    ],
    [
        {'date': '04.06', 'time': '10:00', 'duration': '1h'},  # Tuesday
        {'date': '08.06', 'time': '10:00', 'duration': '1h'},  # Saturday
        {'date': '11.06', 'time': '11:00', 'duration': '1h'},  # Tuesday
        {'date': '15.06', 'time': '11:00', 'duration': '2h'},  # Saturday
        {'date': '18.06', 'time': '12:00', 'duration': '1h'},  # Tuesday
        {'date': '22.06', 'time': '12:00', 'duration': '1h'},  # Saturday
        {'date': '25.06', 'time': '13:00', 'duration': '1h'},  # Tuesday
        {'date': '29.06', 'time': '13:00', 'duration': '1h'},  # Saturday
        {'date': '02.07', 'time': '14:00', 'duration': '1h'},  # Tuesday
        {'date': '06.07', 'time': '14:00', 'duration': '1h'},  # Saturday
        {'date': '09.07', 'time': '15:00', 'duration': '1h'},  # Tuesday
        {'date': '13.07', 'time': '15:00', 'duration': '1h'},  # Saturday
        {'date': '16.07', 'time': '16:00', 'duration': '2h'},  # Tuesday
        {'date': '20.07', 'time': '16:00', 'duration': '1h'}   # Saturday
    ],
    [
        {'date': '02.09', 'time': '09:00', 'duration': '1h'},  # Monday
        {'date': '06.09', 'time': '10:00', 'duration': '1h'},  # Friday
        {'date': '09.09', 'time': '09:00', 'duration': '1h'},  # Monday
        {'date': '13.09', 'time': '10:00', 'duration': '1h'},  # Friday
        {'date': '16.09', 'time': '09:00', 'duration': '1h'},  # Monday
        {'date': '20.09', 'time': '10:00', 'duration': '1h'},  # Friday
        {'date': '23.09', 'time': '09:00', 'duration': '2h'},  # Monday
        {'date': '27.09', 'time': '10:00', 'duration': '1h'},  # Friday
        {'date': '30.09', 'time': '09:00', 'duration': '1h'}   # Monday
    ]
]

# Data preprocessing
def preprocess_data(data, for_training=True):
    processed_data = []
    for client_history in data:
        last_date = None
        for reservation in client_history:
            date = datetime.strptime(reservation['date'] + '.2024', '%d.%m.%Y')
            day_of_week = date.weekday() + 1
            
            if last_date is None:
                days_since_last = 0
            else:
                days_since_last = (date - last_date).days
            
            time = int(reservation['time'].split(':')[0])
            duration = int(reservation['duration'].split('h')[0])
            
            processed_data.append([day_of_week, days_since_last, time, duration])
            
            last_date = date
    
    return np.array(processed_data)

# Prepare data for the model
X = preprocess_data(data)
y = X[:, 1:]  # Use days_since_last, time, and duration as target variables

# Normalize the data
scaler_X = StandardScaler()
scaler_y = StandardScaler()
X_scaled = scaler_X.fit_transform(X)
y_scaled = scaler_y.fit_transform(y)

def create_and_train_model(learning_rate):
    model = Sequential([
        Input(shape=(4,)),
        Dense(64, activation='relu'),
        Dense(32, activation='relu'),
        Dense(16, activation='relu'),
        Dense(3)  # Output: days_since_last, time, duration
    ])

    model.compile(optimizer=Adam(learning_rate=learning_rate), loss='mse')
    history = model.fit(X_scaled, y_scaled, epochs=200, batch_size=32, verbose=0)
    return model, history

# Function to predict next reservation
def predict_next_reservation(model, history):
    processed_history = preprocess_data([history], for_training=False)
    last_reservation = processed_history[-1]
    
    input_data = np.array([last_reservation])
    input_data_scaled = scaler_X.transform(input_data)
    
    prediction = model.predict(input_data_scaled)
    prediction = scaler_y.inverse_transform(prediction)[0]
    
    days_since_last = round(prediction[0])
    time = round(prediction[1])
    duration = round(prediction[2])
    
    last_date = datetime.strptime(history[-1]['date'] + '.2024', '%d.%m.%Y')
    next_date = last_date + timedelta(days=days_since_last)
    
    return {
        'date': next_date.strftime('%d.%m'),
        'time': f'{time:02d}:00',
        'duration': f'{duration}h'
    }

# Test data
testData = [
    {'date': '1.06', 'time': '10:00', 'duration': '1h'},
    {'date': '8.06', 'time': '10:00', 'duration': '1h'},
    {'date': '15.06', 'time': '10:00', 'duration': '1h'},
    {'date': '22.06', 'time': '11:00', 'duration': '1h'},
    {'date': '29.06', 'time': '11:00', 'duration': '1h'},
    {'date': '6.07', 'time': '12:00', 'duration': '1h'},
    {'date': '13.07', 'time': '12:00', 'duration': '2h'},
    {'date': '20.07', 'time': '12:00', 'duration': '1h'},
    {'date': '27.07', 'time': '12:00', 'duration': '1h'},
    {'date': '3.08', 'time': '14:00', 'duration': '1h'},
    {'date': '10.08', 'time': '14:00', 'duration': '1h'},
    {'date': '17.08', 'time': '14:00', 'duration': '1h'},
    {'date': '24.08', 'time': '15:00', 'duration': '1h'},
    {'date': '31.08', 'time': '15:00', 'duration': '1h'}
]

# testData = [
#     {'date': '03.09', 'time': '10:00', 'duration': '1h'},  # Tuesday
#     {'date': '07.09', 'time': '11:00', 'duration': '1h'},  # Saturday
#     {'date': '10.09', 'time': '10:00', 'duration': '1h'},  # Tuesday
#     {'date': '14.09', 'time': '11:00', 'duration': '1h'},  # Saturday
#     {'date': '17.09', 'time': '10:00', 'duration': '1h'},  # Tuesday
#     {'date': '21.09', 'time': '11:00', 'duration': '1h'},  # Saturday
#     {'date': '24.09', 'time': '10:00', 'duration': '2h'},  # Tuesday
#     {'date': '28.09', 'time': '11:00', 'duration': '1h'},  # Saturday
# ]

# Test the model with different learning rates
learning_rates = [0.001, 0.01, 0.1]

for lr in learning_rates:
    print(f"\nTesting with learning rate: {lr}")
    try:
        model, history = create_and_train_model(lr)
        next_reservation = predict_next_reservation(model, testData)
        print("Next suggested reservation:")
        print("Date: " + next_reservation['date'])
        print("Time: " + next_reservation['time'])
        print("Duration: " + next_reservation['duration'])
        print(f"Final loss: {history.history['loss'][-1]}")
    except Exception as e:
        print("An error occurred:")
        print(repr(e))