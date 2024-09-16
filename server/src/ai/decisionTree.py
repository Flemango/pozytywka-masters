import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import sys
import json
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.preprocessing import LabelEncoder
from datetime import datetime

# Read input from stdin

# input_data = {'reservations': [
#   { 'date': '2024-09-13', 'time': '12:00', 'duration': '2h' },#pt
#   { 'date': '2024-09-09', 'time': '16:00', 'duration': '1h' },
#   { 'date': '2024-09-06', 'time': '12:00', 'duration': '2h' },
#   { 'date': '2024-09-02', 'time': '16:00', 'duration': '1h' },
#   { 'date': '2024-08-30', 'time': '12:00', 'duration': '2h' },
#   { 'date': '2024-08-26', 'time': '16:00', 'duration': '1h' }], 'predicted_day': 5}

input_data = json.loads(sys.stdin.read())
reservations = input_data['reservations']
predicted_day = input_data['predicted_day']

# Convert the dataset into a DataFrame
df = pd.DataFrame(reservations)

# Convert date strings to datetime objects
df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')

# Extract day of week (1 = Monday, 7 = Sunday)
df['dayOfWeek'] = df['date'].dt.dayofweek + 1

# Encode time and duration
time_encoder = LabelEncoder()
df['time_encoded'] = time_encoder.fit_transform(df['time'])

duration_encoder = LabelEncoder()
df['duration_encoded'] = duration_encoder.fit_transform(df['duration'])

# Prepare the input features (X) and the targets (y)
X = df[['dayOfWeek']].values
y = df[['time_encoded', 'duration_encoded']].values
# print(X)

# Initialize and train the Decision Tree model
decision_tree = DecisionTreeClassifier(random_state=42)
decision_tree.fit(X, y)

# Print the decision tree
# tree_structure = export_text(decision_tree, feature_names=['dayOfWeek'])
# print("Decision Tree Structure:")
# print(tree_structure)

# Function to predict next appointment
def predict_next_appointment(day_of_week):
    input_data = np.array([[day_of_week]])
    prediction = decision_tree.predict(input_data)[0]
    
    next_time = time_encoder.inverse_transform([prediction[0]])[0]
    next_duration = duration_encoder.inverse_transform([prediction[1]])[0]
    
    return next_time, next_duration

# Make prediction for the given day
predicted_time, predicted_duration = predict_next_appointment(predicted_day)

# Prepare the output
output = {
    "predicted_time": predicted_time,
    "predicted_duration": predicted_duration
}

# Write the output as JSON to stdout
print(json.dumps(output))