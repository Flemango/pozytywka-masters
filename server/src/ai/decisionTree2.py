import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeRegressor, export_text
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta
from collections import Counter

# Set pandas to show all rows and columns
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', None)

# Your provided dataset
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
    {'psychologistId': 4, 'date': '29.07', 'time': '12:00', 'duration': '2h'}
]

# data = [
#     {'psychologistId': 4, 'date': '10.09', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '14.09', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '17.09', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '21.09', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '24.09', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '28.09', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '01.10', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '05.10', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '08.10', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '12.10', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '15.10', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '19.10', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '22.10', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '26.10', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '29.10', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '02.11', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '05.11', 'time': '16:00', 'duration': '2h'},
#     {'psychologistId': 4, 'date': '09.11', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '12.11', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '16.11', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '19.11', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '23.11', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '26.11', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '30.11', 'time': '14:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '03.12', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '07.12', 'time': '14:00', 'duration': '2h'},
#     {'psychologistId': 4, 'date': '10.12', 'time': '14:00', 'duration': '1h'}
# ]

# data = [
#     {'psychologistId': 4, 'date': '13.09', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '20.09', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '27.09', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '04.10', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '11.10', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '18.10', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '25.10', 'time': '16:00', 'duration': '1h'},
#     {'psychologistId': 4, 'date': '01.11', 'time': '16:00', 'duration': '1h'}
# ]

# Convert the dataset into a DataFrame
df = pd.DataFrame(data)

# Convert date strings to datetime objects (assuming current year)
current_year = datetime.now().year
df['date'] = pd.to_datetime(df['date'] + f'.{current_year}', format='%d.%m.%Y')

# Sort the dataframe by date
df = df.sort_values('date')

# Calculate days since last reservation without grouping by psychologist
df['daysSinceLastReservation'] = (df['date'] - df['date'].shift()).dt.days

# For the first reservation, set daysSinceLastReservation to 0
df.loc[df.index[0], 'daysSinceLastReservation'] = 0

# Ensure daysSinceLastReservation is integer
df['daysSinceLastReservation'] = df['daysSinceLastReservation'].astype(int)

# Extract day of week (1 = Monday, 7 = Sunday)
df['dayOfWeek'] = df['date'].dt.dayofweek + 1

# Create combination of daysSinceLastReservation and dayOfWeek
df['combination'] = df.apply(lambda row: (row['daysSinceLastReservation'], row['dayOfWeek']), axis=1)

# Count the frequency of each combination
combination_counts = Counter(df['combination'])

# Sort combinations by frequency (most common first)
sorted_combinations = sorted(combination_counts, key=combination_counts.get, reverse=True)

# Create a dictionary to store unique combinations, sorted by frequency
combination_dict = {comb: i + 1 for i, comb in enumerate(sorted_combinations)}

# Create reverse dictionary for decoding
reverse_combination_dict = {v: k for k, v in combination_dict.items()}

# Encode the combination
df['combination_encoded'] = df['combination'].map(combination_dict)

# Output the combinations and their real data
print("Combinations, their encoded values, and the real data they consist of:")
print("Encoded Value | Days Since Last Reservation | Day of Week | Frequency")
print("-" * 75)
for encoded_value, (days_since_last, day_of_week) in reverse_combination_dict.items():
    frequency = combination_counts[(days_since_last, day_of_week)]
    print(f"{encoded_value:12d} | {days_since_last:28d} | {day_of_week:11d} | {frequency:9d}")

# Output the full dataset with calculated values
print("\nFull dataset with calculated values:")
print(df[['psychologistId', 'date', 'daysSinceLastReservation', 'dayOfWeek', 'combination_encoded']])

# Encode time and duration
time_encoder = LabelEncoder()
df['time_encoded'] = time_encoder.fit_transform(df['time'])

duration_encoder = LabelEncoder()
df['duration_encoded'] = duration_encoder.fit_transform(df['duration'])

# Prepare the input features and targets for each tree
X_combination = df[['psychologistId', 'time_encoded', 'duration_encoded']].values
y_combination = df['combination_encoded'].values

X_time = df[['psychologistId', 'combination_encoded', 'duration_encoded']].values
y_time = df['time_encoded'].values

X_duration = df[['psychologistId', 'combination_encoded', 'time_encoded']].values
y_duration = df['duration_encoded'].values

# Initialize and train the Decision Tree models
combination_tree = DecisionTreeRegressor(random_state=42)
combination_tree.fit(X_combination, y_combination)

time_tree = DecisionTreeRegressor(random_state=42)
time_tree.fit(X_time, y_time)

duration_tree = DecisionTreeRegressor(random_state=42)
duration_tree.fit(X_duration, y_duration)

# Print the decision trees
print("\nCombination Tree Structure:")
print(export_text(combination_tree, feature_names=['psychologistId', 'time_encoded', 'duration_encoded']))

print("\nTime Tree Structure:")
print(export_text(time_tree, feature_names=['psychologistId', 'combination_encoded', 'duration_encoded']))

print("\nDuration Tree Structure:")
print(export_text(duration_tree, feature_names=['psychologistId', 'combination_encoded', 'time_encoded']))

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

    # Predict combination
    combination_input = np.array([[psychologist_id, time_encoded, duration_encoded]])
    next_combination_encoded = int(round(combination_tree.predict(combination_input)[0]))
    print(f"Debug: next_combination_encoded: {next_combination_encoded}")

    # Decode the combination
    next_days_since_last, next_day_of_week = reverse_combination_dict[next_combination_encoded]
    print(f"Debug: next_days_since_last: {next_days_since_last}, next_day_of_week: {next_day_of_week}")

    # Calculate the next date
    next_date = last_date + timedelta(days=next_days_since_last)
    print(f"Debug: initial next_date: {next_date}")

    # Check if the day of the week of next_date matches next_day_of_week
    current_day_of_week = next_date.weekday() + 1  # +1 because we're using 1-7 for days of week
    if current_day_of_week != next_day_of_week:
        print(f"Debug: Day of week mismatch. Current: {current_day_of_week}, Expected: {next_day_of_week}")
        
        # Create a copy of the sorted combination list and remove the predicted combination
        available_combinations = sorted_combinations.copy()
        available_combinations.remove((next_days_since_last, next_day_of_week))

        combo_days_since_last, combo_day_of_week = available_combinations[0]

        # Calculate days to adjust, considering week transitions
        days_to_adjust = (combo_day_of_week - current_day_of_week) % 7
        if days_to_adjust > 3:  # If it's more than 3 days forward, it's shorter to go backward
            days_to_adjust -= 7

        next_date += timedelta(days=days_to_adjust)
        
        if days_to_adjust < 0:
            print(f"Debug: Subtracted {abs(days_to_adjust)} days")
        else:
            print(f"Debug: Added {days_to_adjust} days")
        
        print(f"Debug: Adjusted to next most common combination: {available_combinations[0]}")
        print(f"Debug: Adjusted next_date: {next_date}")

    # Predict time
    time_input = np.array([[psychologist_id, next_combination_encoded, duration_encoded]])
    next_time_encoded = int(round(time_tree.predict(time_input)[0]))
    next_time = time_encoder.inverse_transform([next_time_encoded])[0]
    print(f"Debug: next_time: {next_time}")

    # Predict duration
    duration_input = np.array([[psychologist_id, next_combination_encoded, time_encoded]])
    next_duration_encoded = int(round(duration_tree.predict(duration_input)[0]))
    next_duration = duration_encoder.inverse_transform([next_duration_encoded])[0]
    print(f"Debug: next_duration: {next_duration}")

    return next_date.strftime('%d.%m'), next_time, next_duration

# Example usage
last_appointment = data[-1]  # Get the last appointment from the dataset
next_appointment = predict_next_appointment(
    last_appointment['psychologistId'],
    last_appointment['date'],
    last_appointment['time'],
    last_appointment['duration']
)

print(f"\nPredicted Next Appointment: Date: {next_appointment[0]}, Time: {next_appointment[1]}, Duration: {next_appointment[2]}")