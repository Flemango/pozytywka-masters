import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from datetime import datetime

import sys
# Set console output encoding to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# Set pandas to show all rows and columns
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', None)

# Your provided dataset
data = [
    {'psychologistId': 3, 'date': '2.09', 'time': '14:00', 'duration': '2h'},
    {'psychologistId': 3, 'date': '5.09', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '9.09', 'time': '14:00', 'duration': '2h'},
    {'psychologistId': 4, 'date': '12.09', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '16.09', 'time': '14:00', 'duration': '2h'},
    {'psychologistId': 4, 'date': '19.09', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '23.09', 'time': '14:00', 'duration': '2h'},
    {'psychologistId': 4, 'date': '26.09', 'time': '16:00', 'duration': '1h'},
]

# Convert the dataset into a DataFrame
df = pd.DataFrame(data)

# Convert date strings to datetime objects (assuming current year)
current_year = datetime.now().year
df['date'] = pd.to_datetime(df['date'] + '.{}'.format(current_year), format='%d.%m.%Y')

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

# Split the data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train the Decision Tree model
decision_tree = DecisionTreeClassifier(random_state=42)
decision_tree.fit(X_train, y_train)

# Print the decision tree
print("\nDecision Tree Structure:")
tree_text = export_text(decision_tree, feature_names=['dayOfWeek'])
print(tree_text)

# Function to predict next appointment
def predict_next_appointment(day_of_week):
    input_data = np.array([[day_of_week]])
    prediction = decision_tree.predict(input_data)[0]
    
    next_time = time_encoder.inverse_transform([prediction[0]])[0]
    next_duration = duration_encoder.inverse_transform([prediction[1]])[0]
    
    return next_time, next_duration

# Example usage
day_of_week = 3  # Wednesday

next_appointment = predict_next_appointment(day_of_week)

print("\nPredicted Next Appointment for day {}: Time: {}, Duration: {}".format(day_of_week, next_appointment[0], next_appointment[1]))

# Print predictions for all days of the week
# print("\nPredictions for all days of the week:")
# for day in range(1, 8):
#     time, duration = predict_next_appointment(day)
#     print("Day {}: Time: {}, Duration: {}".format(day, time, duration))