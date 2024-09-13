import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Model
from tensorflow.keras.layers import LSTM, Dense, Masking, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.sequence import pad_sequences

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
        client_data = []
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
            
            client_data.append([day_of_week, days_since_last, time, duration])
            
            last_date = date
        processed_data.append(client_data)
    
    # Find the length of the longest sequence
    max_len = max(len(seq) for seq in processed_data)
    
    # Pad sequences
    padded_data = pad_sequences(processed_data, maxlen=max_len, dtype='float32', padding='post', value=0.0)
    
    return np.array(padded_data)

# Prepare data for the model
X = preprocess_data(data)

# Normalize the data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X.reshape(-1, X.shape[-1])).reshape(X.shape)

def create_sequences(data, n_prev=3):
    X, y = [], []
    for client in data:
        for i in range(len(client) - n_prev):
            X.append(client[i:i+n_prev])
            y.append(client[i+n_prev])
    return np.array(X), np.array(y)

X_seq, y_seq = create_sequences(X_scaled)

def create_and_train_model(learning_rate):
    inputs = Input(shape=(X_seq.shape[1], X_seq.shape[2]))
    masked = Masking(mask_value=0.)(inputs)
    lstm1 = LSTM(64, activation='relu', return_sequences=True)(masked)
    lstm2 = LSTM(32, activation='relu', return_sequences=True)(lstm1)
    lstm3 = LSTM(16, activation='relu')(lstm2)
    outputs = Dense(4)(lstm3)  # Output: day_of_week, days_since_last, time, duration

    model = Model(inputs=inputs, outputs=outputs)

    model.compile(optimizer=Adam(learning_rate=learning_rate), loss='mse')
    history = model.fit(X_seq, y_seq, epochs=200, batch_size=32, verbose=0)
    return model, history

# Function to predict next reservation
def predict_next_reservation(model, history):
    processed_history = preprocess_data([history], for_training=False)[0]
    scaled_history = scaler.transform(processed_history)
    
    input_seq = scaled_history[-3:]  # Use last 3 reservations for prediction
    input_seq = np.expand_dims(input_seq, axis=0)  # Add batch dimension
    
    prediction = model.predict(input_seq)
    prediction = scaler.inverse_transform(prediction.reshape(1, -1))[0]
    
    day_of_week = round(prediction[0])
    days_since_last = round(prediction[1])
    time = round(prediction[2])
    duration = round(prediction[3])
    
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