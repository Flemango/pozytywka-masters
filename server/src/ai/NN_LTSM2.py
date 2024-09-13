import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.optimizers import Adam
import datetime
from joblib import dump, load
import sys
from io import StringIO

# Sample data for multiple clients
data = [
    {
        {'clientId': 3, 'psychologistId': 3, 'date': '2.06', 'time': '16:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 3, 'date': '6.06', 'time': '16:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '10.06', 'time': '14:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '13.06', 'time': '14:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '17.06', 'time': '16:00', 'duration': '2h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '20.06', 'time': '16:00', 'duration': '2h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '24.06', 'time': '16:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '27.06', 'time': '16:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '1.07', 'time': '18:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '4.07', 'time': '14:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '8.07', 'time': '14:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '11.07', 'time': '16:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '15.07', 'time': '14:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '18.07', 'time': '16:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '22.07', 'time': '16:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '25.07', 'time': '16:00', 'duration': '1h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '29.07', 'time': '12:00', 'duration': '2h'},
        {'clientId': 3, 'psychologistId': 4, 'date': '1.08', 'time': '16:00', 'duration': '1h'},
    },
    {
        {'clientId': 2, 'psychologistId': 3, 'date': '6.06', 'time': '16:00', 'duration': '1h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '13.06', 'time': '14:00', 'duration': '1h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '20.06', 'time': '14:00', 'duration': '1h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '27.06', 'time': '16:00', 'duration': '2h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '4.07', 'time': '16:00', 'duration': '2h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '11.07', 'time': '16:00', 'duration': '1h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '22.07', 'time': '18:00', 'duration': '1h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '1.08', 'time': '14:00', 'duration': '1h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '8.08', 'time': '14:00', 'duration': '1h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '15.08', 'time': '16:00', 'duration': '2h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '22.08', 'time': '16:00', 'duration': '2h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '29.08', 'time': '16:00', 'duration': '1h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '9.09', 'time': '18:00', 'duration': '1h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '18.09', 'time': '14:00', 'duration': '1h'},
        {'clientId': 2, 'psychologistId': 4, 'date': '25.09', 'time': '14:00', 'duration': '1h'},
    }
    
    {'clientId': 2, 'psychologistId': 3, 'date': '6.06', 'time': '16:00', 'duration': '1h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '13.06', 'time': '14:00', 'duration': '1h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '20.06', 'time': '14:00', 'duration': '1h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '27.06', 'time': '16:00', 'duration': '2h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '4.07', 'time': '16:00', 'duration': '2h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '11.07', 'time': '16:00', 'duration': '1h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '22.07', 'time': '18:00', 'duration': '1h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '1.08', 'time': '14:00', 'duration': '1h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '8.08', 'time': '14:00', 'duration': '1h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '15.08', 'time': '16:00', 'duration': '2h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '22.08', 'time': '16:00', 'duration': '2h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '29.08', 'time': '16:00', 'duration': '1h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '9.09', 'time': '18:00', 'duration': '1h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '18.09', 'time': '14:00', 'duration': '1h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '25.09', 'time': '14:00', 'duration': '1h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '2.10', 'time': '16:00', 'duration': '2h'},
    {'clientId': 2, 'psychologistId': 4, 'date': '9.10', 'time': '16:00', 'duration': '2h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '10.09', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '14.09', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '17.09', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '21.09', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '24.09', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '28.09', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '01.10', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '05.10', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '08.10', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '12.10', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '15.10', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '19.10', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '22.10', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '26.10', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '29.10', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '02.11', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '05.11', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '09.11', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '12.11', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '16.11', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '19.11', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '23.11', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '26.11', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '30.11', 'time': '14:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '03.12', 'time': '16:00', 'duration': '1h'},
    {'clientId': 1, 'psychologistId': 4, 'date': '07.12', 'time': '14:00', 'duration': '1h'}
]

df = pd.DataFrame(data)

def preprocess_data(df):
    current_year = datetime.datetime.now().year
    
    def process_date(date_str):
        parts = date_str.split('.')
        if len(parts) == 2:  # If the date doesn't include a year
            return f"{parts[0]}.{parts[1]}.{current_year}"
        return date_str  # If the date already includes a year, return it as is
    
    df['date'] = df['date'].apply(process_date)
    df['datetime'] = pd.to_datetime(df['date'] + ' ' + df['time'], format='%d.%m.%Y %H:%M')
    df = df.sort_values(['clientId', 'datetime'])
    
    df['day_of_week'] = df['datetime'].dt.dayofweek
    df['hour'] = df['datetime'].dt.hour
    df['duration_hours'] = df['duration'].str.replace('h', '').astype(int)
    
    df['days_since_last'] = df.groupby('clientId')['datetime'].diff().dt.days.fillna(0)
    
    return df

processed_df = preprocess_data(df)

def create_sequences(data, seq_length):
    sequences = []
    targets = []
    for _, group in data.groupby('clientId'):
        group_data = group[['psychologistId', 'hour', 'duration_hours', 'days_since_last', 'day_of_week']].values
        for i in range(len(group_data) - seq_length):
            sequences.append(group_data[i:i+seq_length])
            targets.append(group_data[i+seq_length])
    return np.array(sequences), np.array(targets)

seq_length = 3  # Adjust based on how many past appointments you want to consider
X, y = create_sequences(processed_df, seq_length)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train.reshape(-1, X_train.shape[-1])).reshape(X_train.shape)
X_test_scaled = scaler.transform(X_test.reshape(-1, X_test.shape[-1])).reshape(X_test.shape)

model = Sequential([
    LSTM(64, activation='relu', input_shape=(seq_length, X_train.shape[-1]), return_sequences=True),
    LSTM(32, activation='relu'),
    Dense(y_train.shape[-1])
])

model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
model.fit(X_train_scaled, y_train, epochs=100, batch_size=32, validation_split=0.2, verbose=0)

# Save the model and scaler
# dump(model, 'multi_client_reservation_model.joblib')
# dump(scaler, 'multi_client_reservation_scaler.joblib')

def predict_next_reservation(model, client_history, scaler):
    client_history_scaled = scaler.transform(client_history)
    client_history_scaled = client_history_scaled.reshape(1, client_history.shape[0], client_history.shape[1])
    
    # Redirect stdout to a StringIO buffer
    old_stdout = sys.stdout
    sys.stdout = StringIO()
    
    try:
        prediction = model.predict(client_history_scaled)
    finally:
        # Restore stdout
        sys.stdout = old_stdout
    
    return scaler.inverse_transform(prediction)[0]

def interpret_prediction(prediction, last_date):
    psychologist_id = int(round(prediction[0]))
    hour = int(round(prediction[1]))
    duration = int(round(prediction[2]))
    days_since_last = int(round(prediction[3]))
    day_of_week = int(round(prediction[4])) % 7  # Ensure day_of_week is 0-6
    
    predicted_date = last_date + datetime.timedelta(days=days_since_last)
    predicted_date = predicted_date + datetime.timedelta(days=(day_of_week - predicted_date.weekday() + 7) % 7)
    
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return {
        'psychologistId': psychologist_id,
        'date': predicted_date.strftime('%d.%m.%Y'),
        'time': f'{hour:02d}:00',
        'duration': f'{duration}h',
        'day_of_week': days[day_of_week]
    }
        
# # Example usage
# client_id = 1
# client_history = processed_df[processed_df['clientId'] == client_id][['psychologistId', 'hour', 'duration_hours', 'days_since_last', 'day_of_week']].values[-seq_length:]
# next_reservation = predict_next_reservation(model, client_history, scaler)
# last_date = processed_df[processed_df['clientId'] == client_id]['datetime'].iloc[-1]
# predicted_reservation = interpret_prediction(next_reservation, last_date)

# Generate new sample data for client ID 4
new_client_data = [
    {'clientId': 4, 'psychologistId': 5, 'date': '04.08.2023', 'time': '16:00', 'duration': '1h'},
    {'clientId': 4, 'psychologistId': 5, 'date': '12.08.2023', 'time': '14:00', 'duration': '1h'},
    {'clientId': 4, 'psychologistId': 5, 'date': '18.08.2023', 'time': '15:00', 'duration': '1h'},
    {'clientId': 4, 'psychologistId': 5, 'date': '26.08.2023', 'time': '14:00', 'duration': '1h'},
    {'clientId': 4, 'psychologistId': 5, 'date': '01.09.2023', 'time': '16:00', 'duration': '1h'}
]

# Convert new data to DataFrame
new_df = pd.DataFrame(new_client_data)
processed_new_df = preprocess_data(new_df)

# Prepare the client history for prediction
seq_length = 4  # Assuming we're using the last 3 appointments for prediction
client_id = 4
client_history = processed_new_df[processed_new_df['clientId'] == client_id][['psychologistId', 'hour', 'duration_hours', 'days_since_last', 'day_of_week']].values[-seq_length:]

# Make the prediction
next_reservation = predict_next_reservation(model, client_history, scaler)
last_date = processed_new_df[processed_new_df['clientId'] == client_id]['datetime'].iloc[-1]
predicted_reservation = interpret_prediction(next_reservation, last_date)

print(f"\nNew client (ID: {client_id}) reservation history:")
print(processed_new_df[['date', 'time', 'day_of_week']].to_string(index=False))

print(f"\nPredicted next reservation for client {client_id}:")
for key, value in predicted_reservation.items():
    print(f"{key}: {value}")

# Optional: Print raw prediction for debugging
print("\nRaw prediction:")
print(next_reservation)
