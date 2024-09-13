import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import datetime

# Set pandas display options to show all rows and columns
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', None)

# Convert the data to a pandas DataFrame
data = [
    {'psychologistId': 3, 'date': '2.06', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 3, 'date': '6.06', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '10.06', 'time': '14:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '13.06', 'time': '14:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '17.06', 'time': '16:00', 'duration': '2h'},
    {'psychologistId': 4, 'date': '20.06', 'time': '16:00', 'duration': '2h'},
    {'psychologistId': 4, 'date': '24.06', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '27.06', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '1.07', 'time': '18:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '4.07', 'time': '14:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '8.07', 'time': '14:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '11.07', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '15.07', 'time': '14:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '18.07', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '22.07', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '25.07', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '29.07', 'time': '12:00', 'duration': '2h'},
    {'psychologistId': 4, 'date': '1.08', 'time': '16:00', 'duration': '1h'}
]

df = pd.DataFrame(data)

    # Preprocess the data
def preprocess_data(df):
    current_year = datetime.datetime.now().year
    df['datetime'] = pd.to_datetime(df['date'] + '.' + str(current_year) + ' ' + df['time'], format='%d.%m.%Y %H:%M')
    df = df.sort_values('datetime')
    
    df['day_of_week'] = df['datetime'].dt.dayofweek
    df['hour'] = df['datetime'].dt.hour
    df['duration_hours'] = df['duration'].str.replace('h', '').astype(int)
    
    df['days_since_last'] = (df['datetime'] - df['datetime'].shift(1)).dt.days.fillna(0)
    
    print('\n')
    print(df)
    return df

processed_df = preprocess_data(df)

# Prepare features and target
feature_columns = ['psychologistId', 'hour', 'duration_hours', 'days_since_last', 'day_of_week']
X = processed_df[feature_columns]
y = processed_df[feature_columns]

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale the data
scaler = StandardScaler()
X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train), columns=X_train.columns, index=X_train.index)
X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=X_test.columns, index=X_test.index)

# Train the model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# Function to predict the next reservation
def predict_next_reservation(model, last_data, scaler):
    last_data_scaled = pd.DataFrame(scaler.transform(last_data), columns=last_data.columns, index=last_data.index)
    prediction = model.predict(last_data_scaled)
    return prediction[0]

# Example usage
last_data = X_test.iloc[-1:] 
next_reservation = predict_next_reservation(model, last_data, scaler)

# Interpret prediction
def interpret_prediction(prediction, processed_df):
    psychologist_id = int(round(prediction[0]))
    hour = int(round(prediction[1]))
    duration = int(round(prediction[2]))
    days_since_last = int(round(prediction[3]))
    day_of_week = int(round(prediction[4]))
    
    last_date = processed_df['datetime'].iloc[-1]
    predicted_date = last_date + datetime.timedelta(days=days_since_last)
    predicted_date = predicted_date + datetime.timedelta(days=(day_of_week - predicted_date.weekday() + 7) % 7)
    
    return {
        'psychologistId': psychologist_id,
        'date': predicted_date.strftime('%d-%m'),
        'time': f'{hour:02d}:00',
        'duration': f'{duration}h',
        'day_of_week': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day_of_week]
    }

# Interpret and print the prediction
predicted_reservation = interpret_prediction(next_reservation, processed_df)
print("Predicted next reservation:")
for key, value in predicted_reservation.items():
    print(f"{key}: {value}")