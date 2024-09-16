import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Masking
from tensorflow.keras.callbacks import ReduceLROnPlateau
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import to_categorical
import datetime
import itertools
import json
from joblib import dump, load
from io import StringIO

import sys
sys.stdout.reconfigure(encoding='utf-8')

tf.get_logger().setLevel('ERROR')

# Patterns and possible classes
patterns = {
    # (2, 5): [2, 5],
    # (5, 2): [5, 2],
    # (3, 4): [3, 4],
    # (4, 3): [4, 3],
    (7, 7): [7, 7],
    # (7, 14): [7, 14],
    # (14, 7): [14, 7]
}
output_classes = [2, 3, 4, 5, 7, 14]

# Function to generate a noisy sequence
def generate_sequence(pattern, length=6):
    sequence = []
    for _ in range(length // 2):
        sequence += list(pattern)
    if length >= 3:  # Start adding noise for sequences of length 3 and above
        noise = length - len(sequence)
        if noise > 0:
            noise_indices = np.random.choice(len(sequence), size=np.random.randint(1, noise + 1), replace=False)
            for idx in noise_indices:
                sequence[idx] = np.random.choice([n for n in output_classes if n not in pattern])
    return sequence

# Generate dataset
X = []
y = []

for pattern in patterns.values():
    for length in range(2, 7):  # Gradually increase the length from 2 to 6
        for _ in range(200):  # generate 500 sequences for each pattern and length
            noisy_seq = generate_sequence(pattern, length=length)
            X.append(noisy_seq)
            y.append(pattern[0])  # Target is the next number in the pattern

max_length = 6  # Set this to the maximum length used
X = pad_sequences(X, maxlen=max_length, dtype='float32', padding='post', value=0)
y = np.array(y)

# print("X: ",X)
# print("y: ",y)

# Convert target to categorical
y = to_categorical([output_classes.index(i) for i in y], num_classes=len(output_classes))

#########################################################################################

# # Updated sequence generation with varying lengths and pattern shares
# def generate_combined_sequences(pattern1, pattern2, length, pattern_share):
#     sequence = []
#     pattern1_share, pattern2_share = pattern_share
    
#     for _ in range(pattern1_share):
#         sequence.extend(pattern1)
#     for _ in range(pattern2_share):
#         sequence.extend(pattern2)
    
#     sequence = sequence[:length]  # Trim sequence to the correct length
#     return sequence

# # All possible pattern combinations
# combined_patterns = [(p1, p2) for p1 in patterns.values() for p2 in patterns.values() if p1 != p2]

# # Generate sequences with varying lengths and pattern shares
# X_combined = []
# y_combined = []

# for _ in range(20):
#     for pattern1, pattern2 in combined_patterns:
#         for length in [4, 5, 6]:
#             if length == 4:
#                 pattern_shares = [(1, 3), (2, 2), (3, 1)]
#             elif length == 5:
#                 pattern_shares = [(1, 4), (2, 3), (3, 2)]
#             elif length == 6:
#                 pattern_shares = [(2, 4), (3, 3), (4, 2)]
            
#             for share in pattern_shares:
#                 seq = generate_combined_sequences(pattern1, pattern2, length, share)
#                 X_combined.append(seq)
                
#                 # Determine target based on share
#                 if share == (3, 1):
#                     target = seq[0]   # Take first element
#                 else:
#                     target = seq[-2]  # Take second to last element
                
#                 y_combined.append(target)

# # Print some examples
# # for seq, target in zip(X_combined, y_combined):
# #     print(f"Sequence: {seq}, Target: {target}")

# # Now we need to pad all sequences to the same length
# # Pad sequences to make them all the same length (max length is 6)
# X_combined_padded = pad_sequences(X_combined, maxlen=6, padding='post', dtype='int32')

# # Convert to numpy arrays
# X = np.array(X_combined_padded)
# y = to_categorical([output_classes.index(i) for i in y_combined], num_classes=len(output_classes))

# # print("Generated sequences with combination of patterns.")
# # print(f"X_combined_padded: {X_combined_padded.shape}, y_combined: {y_combined.shape}")

#########################################################################################

# Model parameters
input_length = X.shape[1]
num_classes = len(output_classes)

def create_model(learning_rate):
    model = Sequential()
    model.add(Masking(mask_value=0., input_shape=(input_length, 1)))
    model.add(LSTM(32, return_sequences=True))  # 64 units in LSTM layer
    model.add(LSTM(16, return_sequences=False))
    model.add(Dense(num_classes, activation='softmax'))

    model.compile(optimizer=Adam(learning_rate=learning_rate), loss='categorical_crossentropy', metrics=['accuracy'])

    # Print model summary
    model.summary()
    return model

# Define a learning rate scheduler
reduce_lr = ReduceLROnPlateau(monitor='loss', factor=0.5, patience=10, min_lr=1e-6)

# Reshape the input to [samples, time steps, features]
X = X.reshape((X.shape[0], X.shape[1], 1))
# Split the data into training and validation sets
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

def train_model(model, epochs):
    #history = model.fit(X_train_reshaped, y_train_categorical, epochs=epochs, batch_size=32, verbose=1, callbacks=[reduce_lr])
    history = model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=epochs, batch_size=32, callbacks=[reduce_lr])
    return history

def save_model(model, filename='LSTM_model.keras'): #LTSM_model
    model.save(filename)
    print(f"Model saved as {filename}")

def load_saved_model(filename='LSTM_model.keras'):
    return load_model(filename)

def train_and_save_model():
    final_model = create_model(0.001)
    train_model(final_model, epochs=1750)
    save_model(final_model)

def continue_training(model, X_train, y_train, epochs=1000):
    reduce_lr = ReduceLROnPlateau(monitor='loss', factor=0.5, patience=10, min_lr=1e-6)
    history = model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=epochs, batch_size=32)
    return history

def additional_learning(epochs=500):
    model = load_saved_model()
    history = continue_training(model, X_train, y_train, epochs=epochs)
    save_model(model)
    
    return history

def predict_next(model, sequence):
    _sequence = np.array(sequence).reshape((1, len(sequence), 1))
    prediction = model.predict(_sequence)
    # predicted_class = output_classes[np.argmax(prediction)]
    predicted_class = np.argmax(prediction[0])
    return output_classes[predicted_class]

def load_and_test_model():
    loaded_model = load_saved_model()
    
    test_sequences = [
        [7,7],
        [3,4],
        [4,3],
        [3,4,3,4,3],
        [4,3,4,3,4],
        [2,5],
        [5,2],
        [14,7],
        [7,14],
        [14,14,7],
        [3,4,7,3,4],
        [2,5,3,4,3],
        [7,7,7,10,7,7],
        [7,7,5,7,7],
        [7,7,7,5,7],
        [7,4,7,7,7,7],
        [7,7,7,3,7,7],
        [7,5,7,7,7],
        [5,7,7,7,7],
        [7,7,7,7,7],
        [7,7,7,5,7],
        [4,3,7,4,3,4],
        [2,5,7,5,2,5,2,5],
        [5,7,7,14,7,7],
        [5,2,5,3,4],
        [5,2,7,5,2],
        [2,7,5,2],
        [3,4,2,5,2]
    ]

    print("\nTest Predictions:")
    for seq in test_sequences:
        prediction = predict_next(loaded_model, seq)
        print(f"Sequence: {seq}, Predicted next: {prediction}")

def predict_next_seq(model, sequence):
    _sequence = pad_sequences([sequence], maxlen=max_length, padding='pre', dtype='float32')
    _sequence = _sequence.reshape((1, max_length, 1))
    prediction = model.predict(_sequence, verbose=0)
    predicted_class = np.argmax(prediction[0])
    return output_classes[predicted_class]

#train_and_save_model()
#additional_learning()
#load_and_test_model()
#stare
loaded_model = load_saved_model()
print("Prediction service started. Waiting for input...", flush=True)
while True:
    try:
        input_data = input()
        sequence = json.loads(input_data)
        prediction = predict_next_seq(loaded_model, sequence)
        print(json.dumps({"prediction": int(prediction)}), flush=True)
    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)