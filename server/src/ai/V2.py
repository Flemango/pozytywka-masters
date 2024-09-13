import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import Input, SimpleRNN, Dense, Masking, LSTM, Dropout
from tensorflow.keras.callbacks import ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.sequence import pad_sequences

# from keras import backend as K
# K.tensorflow_backend._get_available_gpus()

import sys
# Set console output encoding to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# Suppress TensorFlow warnings
tf.get_logger().setLevel('ERROR')

# Training data
X = [
    #[7],
    [7,7],
    [7,7,7],
    [7,7,7,7],
    [7,7,7,7,7],
    [7,7,7,7,7,7],
    [7,7,7,7,7,7,7],
    [7,7,7,7,7,7,7,7],
    [7,7,7,7,7,7,7,7,7],
    [7,7,7,7,7,7,7,7,7,7],
    [7,7,7,7,7,7,7,7,7,7,7],
    [7,7,7,7,7,7,7,7,7,7,7,7],
    [7,7,7,7,7,7,7,7,7,7,7,7,7],  
    [7,7,7,7,7,7,7,7,7,7,7,7,7,7], 
    [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],

    #[3],
    [3,4],
    [3,4,3],
    [3,4,3,4],
    [3,4,3,4,3],
    [3,4,3,4,3,4],
    [3,4,3,4,3,4,3],
    [3,4,3,4,3,4,3,4],
    [3,4,3,4,3,4,3,4,3],
    [3,4,3,4,3,4,3,4,3,4],
    [3,4,3,4,3,4,3,4,3,4,3],
    [3,4,3,4,3,4,3,4,3,4,3,4],
    [3,4,3,4,3,4,3,4,3,4,3,4,3],
    [3,4,3,4,3,4,3,4,3,4,3,4,3,4],
    [3,4,3,4,3,4,3,4,3,4,3,4,3,4,3],
    [3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4],
    [3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3],
    [3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4],

    #[4],
    [4,3],
    [4,3,4],
    [4,3,4,3],
    [4,3,4,3,4],
    [4,3,4,3,4,3],
    [4,3,4,3,4,3,4],
    [4,3,4,3,4,3,4,3],
    [4,3,4,3,4,3,4,3,4],
    [4,3,4,3,4,3,4,3,4,3],
    [4,3,4,3,4,3,4,3,4,3,4],
    [4,3,4,3,4,3,4,3,4,3,4,3],
    [4,3,4,3,4,3,4,3,4,3,4,3,4],
    [4,3,4,3,4,3,4,3,4,3,4,3,4,3],
    [4,3,4,3,4,3,4,3,4,3,4,3,4,3,4],
    [4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3],
    [4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4],
    [4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3],

    #[14],
    [14,14],
    [14,14,14],
    [14,14,14,14],
    [14,14,14,14,14], 
    [14,14,14,14,14,14], 
    [14,14,14,14,14,14,14],
    [14,14,14,14,14,14,14,14],  
    [14,14,14,14,14,14,14,14,14],
    [14,14,14,14,14,14,14,14,14,14],
    [14,14,14,14,14,14,14,14,14,14,14],
    [14,14,14,14,14,14,14,14,14,14,14,14],
    [14,14,14,14,14,14,14,14,14,14,14,14,14],
    [14,14,14,14,14,14,14,14,14,14,14,14,14,14],
    [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
    [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
    [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],   
    [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],           

    #[2],
    [2,5],
    [2,5,2],
    [2,5,2,5],
    [2,5,2,5,2],
    [2,5,2,5,2,5],
    [2,5,2,5,2,5,2],
    [2,5,2,5,2,5,2,5],
    [2,5,2,5,2,5,2,5,2],
    [2,5,2,5,2,5,2,5,2,5],
    [2,5,2,5,2,5,2,5,2,5,2],
    [2,5,2,5,2,5,2,5,2,5,2,5],
    [2,5,2,5,2,5,2,5,2,5,2,5,2],
    [2,5,2,5,2,5,2,5,2,5,2,5,2,5],
    [2,5,2,5,2,5,2,5,2,5,2,5,2,5,2],
    [2,5,2,5,2,5,2,5,2,5,2,5,2,5,2,5],
    [2,5,2,5,2,5,2,5,2,5,2,5,2,5,2,5,2],
    [2,5,2,5,2,5,2,5,2,5,2,5,2,5,2,5,2,5],

    #[5],
    [5,2],
    [5,2,5],
    [5,2,5,2],
    [5,2,5,2,5],
    [5,2,5,2,5,2],
    [5,2,5,2,5,2,5],
    [5,2,5,2,5,2,5,2],
    [5,2,5,2,5,2,5,2,5],
    [5,2,5,2,5,2,5,2,5,2],
    [5,2,5,2,5,2,5,2,5,2,5],
    [5,2,5,2,5,2,5,2,5,2,5,2],
    [5,2,5,2,5,2,5,2,5,2,5,2,5],
    [5,2,5,2,5,2,5,2,5,2,5,2,5,2],
    [5,2,5,2,5,2,5,2,5,2,5,2,5,2,5],
    [5,2,5,2,5,2,5,2,5,2,5,2,5,2,5,2],
    [5,2,5,2,5,2,5,2,5,2,5,2,5,2,5,2,5],
    [5,2,5,2,5,2,5,2,5,2,5,2,5,2,5,2,5,2],

    [14,7],
    [14,7,14],
    [14,7,14,7],
    [14,7,14,7,14],
    [14,7,14,7,14,7],
    [14,7,14,7,14,7,14],
    [14,7,14,7,14,7,14,7],
    [14,7,14,7,14,7,14,7,14],
    [14,7,14,7,14,7,14,7,14,7],
    [14,7,14,7,14,7,14,7,14,7,14],
    [14,7,14,7,14,7,14,7,14,7,14,7],
    [14,7,14,7,14,7,14,7,14,7,14,7,14],
    [14,7,14,7,14,7,14,7,14,7,14,7,14,7],
    [14,7,14,7,14,7,14,7,14,7,14,7,14,7,14],
    [14,7,14,7,14,7,14,7,14,7,14,7,14,7,14,7],
    [14,7,14,7,14,7,14,7,14,7,14,7,14,7,14,7,14],
    [14,7,14,7,14,7,14,7,14,7,14,7,14,7,14,7,14,7],

    [7,14],
    [7,14,7],
    [7,14,7,14],
    [7,14,7,14,7],
    [7,14,7,14,7,14],
    [7,14,7,14,7,14,7],
    [7,14,7,14,7,14,7,14],
    [7,14,7,14,7,14,7,14,7],
    [7,14,7,14,7,14,7,14,7,14],
    [7,14,7,14,7,14,7,14,7,14,7],
    [7,14,7,14,7,14,7,14,7,14,7,14],
    [7,14,7,14,7,14,7,14,7,14,7,14,7],
    [7,14,7,14,7,14,7,14,7,14,7,14,7,14],
    [7,14,7,14,7,14,7,14,7,14,7,14,7,14,7],
    [7,14,7,14,7,14,7,14,7,14,7,14,7,14,7,14],
    [7,14,7,14,7,14,7,14,7,14,7,14,7,14,7,14,7],
    [7,14,7,14,7,14,7,14,7,14,7,14,7,14,7,14,7,14],
]

# Pad sequences
max_len = max(len(seq) for seq in X)
X_padded = pad_sequences(X, maxlen=max_len, padding='pre', dtype='float32')

# Prepare input-output pairs
X_train, y_train = [], []
for seq in X_padded:
    for i in range(1, len(seq)):
        X_train.append(seq[:i])
        y_train.append(seq[i])

X_train = pad_sequences(X_train, maxlen=max_len, padding='pre', dtype='float32')
X_train = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))
y_train = np.array(y_train)

def create_model(learning_rate):
    inputs = Input(shape=(max_len, 1))
    #x = Masking(mask_value=0.0)(inputs)  # Masking padded zeros
    x = SimpleRNN(32, activation='relu', return_sequences=True)(inputs)
    x = SimpleRNN(16, activation='relu', return_sequences=True)(x)
    x = SimpleRNN(8, activation='relu')(x)
    outputs = Dense(1)(x)
    
    model = Model(inputs=inputs, outputs=outputs)
    model.compile(optimizer=Adam(learning_rate=learning_rate), loss='mse')
    return model

# Define a learning rate scheduler
reduce_lr = ReduceLROnPlateau(monitor='loss', factor=0.5, patience=10, min_lr=1e-6)

def train_model(model, epochs=1000):
    history = model.fit(X_train, y_train, epochs=epochs, batch_size=32, verbose=0, callbacks=[reduce_lr])
    return history

def predict_next(model, sequence):
    sequence = pad_sequences([sequence], maxlen=max_len, padding='pre', dtype='float32')
    sequence = sequence.reshape((1, max_len, 1))
    prediction = model.predict(sequence)
    return round(prediction[0][0])

# Function to save the model
def save_model(model, filename='pattern_prediction_model.keras'):
    model.save(filename)
    print(f"Model saved as {filename}")

# Function to load the model
def load_saved_model(filename='pattern_prediction_model.keras'):
    return load_model(filename)

# Train and save the model (run this part only once)
def train_and_save_model():
    final_model = create_model(0.001)
    train_model(final_model, epochs=2000)
    save_model(final_model)

# Load and use the model for predictions
def load_and_test_model():
    loaded_model = load_saved_model()
    
    test_sequences = [
        [14,7],
        [7,14],
        [14,14,7],
        [3,4,7,3,4],
        [2,5,3,4],
        [2,5,3,4,3],
        [4,3,7,4,3],
        [7,7,7,10,7,7],
        [7,7,5,7,7],
        [7,4,7,7,7,7],
        [7,7,7,3,7,7]
    ]

    print("\nTest Predictions:")
    for seq in test_sequences:
        prediction = predict_next(loaded_model, seq)
        print(f"Sequence: {seq}, Predicted next: {prediction}")

# Uncomment the following line to train and save the model (run only once)
train_and_save_model()

# Use this line to load the saved model and make predictions
load_and_test_model()