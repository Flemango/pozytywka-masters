import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import numpy as np
from datetime import datetime
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import SimpleRNN, Dense, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.sequence import pad_sequences
import tensorflow as tf

# Set random seeds for reproducibility
# SEED = 42
# np.random.seed(SEED)
# tf.random.set_seed(SEED)

# Suppress TensorFlow warnings
tf.get_logger().setLevel('ERROR')

import sys
sys.stdout.reconfigure(encoding='utf-8')

# Sample data (you can replace this with your actual data)
data = [
    [
        {'date': '2.06', 'time': '16:00', 'duration': '1h'},
        {'date': '9.06', 'time': '16:00', 'duration': '1h'},
        {'date': '16.06', 'time': '16:00', 'duration': '1h'},
        {'date': '23.06', 'time': '16:00', 'duration': '1h'},
        {'date': '30.06', 'time': '16:00', 'duration': '1h'},
        {'date': '7.07', 'time': '16:00', 'duration': '1h'},
    ],
    [
        {'date': '1.06', 'time': '14:00', 'duration': '1h'},
        {'date': '5.06', 'time': '14:00', 'duration': '1h'},
        {'date': '8.06', 'time': '14:00', 'duration': '1h'},
        {'date': '12.06', 'time': '14:00', 'duration': '1h'},
        {'date': '15.06', 'time': '14:00', 'duration': '1h'},
        {'date': '19.06', 'time': '14:00', 'duration': '1h'},
        {'date': '22.06', 'time': '14:00', 'duration': '1h'},
        {'date': '26.06', 'time': '14:00', 'duration': '1h'},
        {'date': '29.06', 'time': '14:00', 'duration': '1h'},
        {'date': '3.07', 'time': '14:00', 'duration': '1h'},
    ],
]

def preprocess_data(data):
    processed_data = []
    for client_history in data:
        days_since_last = []
        last_date = None
        for reservation in client_history:
            date = datetime.strptime(reservation['date'] + '.2024', '%d.%m.%Y')
            if last_date is not None:
                days_since_last.append((date - last_date).days)
            last_date = date
        processed_data.append(days_since_last)
    return processed_data

# Prepare data for the model
#X = preprocess_data(data)
X = [[7,7,7,7,7],[4,3,4,3,4,3,4,3,4],[2,5,2,5,2,5,2,5,2,5,2,5,2,5,2],[14,14,14,14,14],[7,7],[3,4,3,4,3,4,3],[3,4,3,4],[7,7,7,7,7,7],[14,14,14,14,14,14,14],[7,7,7,7,7,7,7,7,7,7,7,7,7,7],[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]]
print(X)

# Pad sequences to the same length
max_len = max(len(seq) for seq in X)
X_padded = pad_sequences(X, maxlen=max_len, padding='pre', dtype='float32')

# Reshape data for RNN input (samples, time steps, features)
X_reshaped = X_padded.reshape(X_padded.shape[0], X_padded.shape[1], 1)

def create_and_train_model(learning_rate):
    inputs = Input(shape=(max_len, 1))
    x = SimpleRNN(32, activation='relu', return_sequences=True)(inputs)
    x = SimpleRNN(16, activation='relu')(x)
    outputs = Dense(1)(x)

    model = Model(inputs=inputs, outputs=outputs)

    model.compile(optimizer=Adam(learning_rate=learning_rate), loss='mse')
    history = model.fit(X_reshaped, X_padded, epochs=200, batch_size=1, verbose=0)
    return model, history

def predict_next_interval(model, history):
    processed_history = preprocess_data([history])[0]
    padded_history = pad_sequences([processed_history], maxlen=max_len, padding='pre', dtype='float32')
    reshaped_history = padded_history.reshape(1, max_len, 1)
    
    prediction = model.predict(reshaped_history)
    return round(prediction[0][0])

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
learning_rates = [0.001]#, 0.01, 0.1]

for lr in learning_rates:
    print(f"\nTesting with learning rate: {lr}")
    try:
        model, history = create_and_train_model(lr)
        next_interval = predict_next_interval(model, testData)
        print(f"Predicted days until next reservation: {next_interval}")
        print(f"Final loss: {history.history['loss'][-1]}")
    except Exception as e:
        print("An error occurred:")
        print(repr(e))