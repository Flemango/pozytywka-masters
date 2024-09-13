import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeRegressor, export_text
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta

# Set pandas to show all rows and columns
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', None)

# Your provided dataset
data = [
    {'psychologistId': 3, 'date': '2.06', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 3, 'date': '6.06', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '10.06', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '13.06', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '17.06', 'time': '16:00', 'duration': '2h'},
    {'psychologistId': 4, 'date': '20.06', 'time': '16:00', 'duration': '2h'},
    {'psychologistId': 4, 'date': '24.06', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '27.06', 'time': '16:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '1.07', 'time': '18:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '4.07', 'time': '14:00', 'duration': '1h'},
    {'psychologistId': 4, 'date': '8.07', 'time': '14:00', 'duration': '1h'}
]

# Convert the dataset into a DataFrame
df = pd.DataFrame(data)

# Convert date strings to datetime objects (assuming current year)
current_year = datetime.now().year
df['date'] = pd.to_datetime(df['date'] + f'.{current_year}', format='%d.%m.%Y')

# Sort the dataframe by date
df = df.sort_values('date')

# Calculate days since last reservation
df['daysSinceLastReservation'] = df.groupby('psychologistId')['date'].diff().dt.days

# For the first reservation of each psychologist, calculate days since the very first reservation
first_date = df['date'].min()
df.loc[df['daysSinceLastReservation'].isna(), 'daysSinceLastReservation'] = (df['date'] - first_date).dt.days

# Ensure all values are integers
df['daysSinceLastReservation'] = df['daysSinceLastReservation'].astype(int)

# Extract day of week (1 = Monday, 7 = Sunday)
df['dayOfWeek'] = df['date'].dt.dayofweek + 1

# Create combination of daysSinceLastReservation and dayOfWeek
df['combination'] = df.apply(lambda row: (row['daysSinceLastReservation'], row['dayOfWeek']), axis=1)

# Create a dictionary to store unique combinations
combination_dict = {comb: i + 1 for i, comb in enumerate(sorted(set(df['combination'])))}

# Create reverse dictionary for decoding
reverse_combination_dict = {v: k for k, v in combination_dict.items()}

# Encode the combination
df['combination_encoded'] = df['combination'].map(combination_dict)

# Output the combinations and their real data
print("Combinations, their encoded values, and the real data they consist of:")
print("Encoded Value | Days Since Last Reservation | Day of Week")
print("-" * 60)
for encoded_value, (days_since_last, day_of_week) in reverse_combination_dict.items():
    print(f"{encoded_value:12d} | {days_since_last:28d} | {day_of_week:11d}")

# Output the full dataset with calculated values
print("\nFull dataset with calculated values:")
print(df[['psychologistId', 'date', 'daysSinceLastReservation', 'dayOfWeek', 'combination_encoded']])


# Encode time and duration
time_encoder = LabelEncoder()
df['time_encoded'] = time_encoder.fit_transform(df['time'])

duration_encoder = LabelEncoder()
df['duration_encoded'] = duration_encoder.fit_transform(df['duration'])

# Prepare the input features (X) and the targets (y)
X = df[['psychologistId', 'combination_encoded', 'time_encoded', 'duration_encoded']].values
y = df[['combination_encoded', 'time_encoded', 'duration_encoded']].values

# Split the data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train the Decision Tree model
decision_tree = DecisionTreeRegressor(random_state=42)
decision_tree.fit(X_train, y_train)

# Print the decision tree
print("\nDecision Tree Structure:")
tree_text = export_text(decision_tree, feature_names=['psychologistId', 'combination_encoded', 'time_encoded', 'duration_encoded'])
print(tree_text)

# Function to predict next appointment
def predict_next_appointment(psychologist_id, last_appointment_date, last_appointment_time, last_appointment_duration):
    print(f"\nDebug: Input parameters:")
    print(f"psychologist_id: {psychologist_id}")
    print(f"last_appointment_date: {last_appointment_date}")
    print(f"last_appointment_time: {last_appointment_time}")
    print(f"last_appointment_duration: {last_appointment_duration}")

    last_date = datetime.strptime(last_appointment_date + f'.{current_year}', '%d.%m.%Y')
    print(f"Debug: last_date: {last_date}")

    time_encoded = time_encoder.transform([last_appointment_time])[0]
    print(f"Debug: time_encoded: {time_encoded}")

    duration_encoded = duration_encoder.transform([last_appointment_duration])[0]
    print(f"Debug: duration_encoded: {duration_encoded}")
    
    # Find the most recent combination_encoded for this psychologist
    last_combination = df[df['psychologistId'] == psychologist_id]['combination_encoded'].iloc[-1]
    print(f"Debug: last_combination: {last_combination}")
    
    input_data = np.array([[psychologist_id, last_combination, time_encoded, duration_encoded]])
    print(f"Debug: input_data: {input_data}")

    prediction = decision_tree.predict(input_data)[0]
    print(f"Debug: prediction: {prediction}")
    
    next_combination_encoded = int(round(prediction[0]))
    print(f"Debug: next_combination_encoded: {next_combination_encoded}")

    next_time = time_encoder.inverse_transform([int(round(prediction[1]))])[0]
    print(f"Debug: next_time: {next_time}")

    next_duration = duration_encoder.inverse_transform([int(round(prediction[2]))])[0]
    print(f"Debug: next_duration: {next_duration}")
    
    # Decode the combination
    next_days_since_last, next_day_of_week = reverse_combination_dict[next_combination_encoded]
    print(f"Debug: next_days_since_last: {next_days_since_last}, next_day_of_week: {next_day_of_week}")
    
    # Calculate the next date
    next_date = last_date + timedelta(days=next_days_since_last)
    print(f"Debug: initial next_date: {next_date}")
    
    return next_date.strftime('%d.%m'), next_time, next_duration

# Example usage
aa = [{'psychologistId': 4, 'date': '9.07', 'time': '14:00', 'duration': '1h'}]
last_appointment = aa[-1]
next_appointment = predict_next_appointment(
    last_appointment['psychologistId'],
    last_appointment['date'],
    last_appointment['time'],
    last_appointment['duration']
)

print(f"\nPredicted Next Appointment: Date: {next_appointment[0]}, Time: {next_appointment[1]}, Duration: {next_appointment[2]}")