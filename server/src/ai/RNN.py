import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import Input, SimpleRNN, Dense, Masking, Dropout
from tensorflow.keras.callbacks import ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.utils import to_categorical

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
    # [7,7],
    # [7,7,7],
    # [7,7,7,7],
    # [7,7,7,7,7],
    # [7,7,7,7,7,7],
    # [7,7,7,7,7,7,7],
    # [7,7,7,7,7,7,7,7],
    # [7,7,7,7,7,7,7,7,7],
    # [7,7,7,7,7,7,7,7,7,7],
    # [7,7,7,7,7,7,7,7,7,7,7],
    # [7,7,7,7,7,7,7,7,7,7,7,7],
    # [7,7,7,7,7,7,7,7,7,7,7,7,7],  
    # [7,7,7,7,7,7,7,7,7,7,7,7,7,7], 
    # [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    # [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    # [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
    # [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],

    # #[3],
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
    [3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3],
    

    # #[4],
    # [4,3],
    # [4,3,4],
    # [4,3,4,3],
    # [4,3,4,3,4],
    # [4,3,4,3,4,3],
    # [4,3,4,3,4,3,4],
    # [4,3,4,3,4,3,4,3],
    # [4,3,4,3,4,3,4,3,4],
    # [4,3,4,3,4,3,4,3,4,3],
    # [4,3,4,3,4,3,4,3,4,3,4],
    # [4,3,4,3,4,3,4,3,4,3,4,3],
    # [4,3,4,3,4,3,4,3,4,3,4,3,4],
    # [4,3,4,3,4,3,4,3,4,3,4,3,4,3],
    # [4,3,4,3,4,3,4,3,4,3,4,3,4,3,4],
    # [4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3],
    # [4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4],
    # [4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3],
    # [4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4,3,4],

    # #[14],
    # [14,14],
    # [14,14,14],
    # [14,14,14,14],
    # [14,14,14,14,14], 
    # [14,14,14,14,14,14], 
    # [14,14,14,14,14,14,14],
    # [14,14,14,14,14,14,14,14],  
    # [14,14,14,14,14,14,14,14,14],
    # [14,14,14,14,14,14,14,14,14,14],
    # [14,14,14,14,14,14,14,14,14,14,14],
    # [14,14,14,14,14,14,14,14,14,14,14,14],
    # [14,14,14,14,14,14,14,14,14,14,14,14,14],
    # [14,14,14,14,14,14,14,14,14,14,14,14,14,14],
    # [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
    # [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],
    # [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],   
    # [14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14],           

    # #[2],
    # [2,5],
    # [2,5,2],
    # [2,5,2,5],
    # [2,5,2,5,2],
    # [2,5,2,5,2,5],
    # [2,5,2,5,2,5,2],
    # [2,5,2,5,2,5,2,5],
    # [2,5,2,5,2,5,2,5,2],
    # [2,5,2,5,2,5,2,5,2,5],
    # [2,5,2,5,2,5,2,5,2,5,2],
    # [2,5,2,5,2,5,2,5,2,5,2,5],
    # [2,5,2,5,2,5,2,5,2,5,2,5,2],
    # [2,5,2,5,2,5,2,5,2,5,2,5,2,5],
    # [2,5,2,5,2,5,2,5,2,5,2,5,2,5,2],
    # [2,5,2,5,2,5,2,5,2,5,2,5,2,5,2,5],
    # [2,5,2,5,2,5,2,5,2,5,2,5,2,5,2,5,2],

    # #[5],
    # [5,2],
    # [5,2,5],
    # [5,2,5,2],
    # [5,2,5,2,5],
    # [5,2,5,2,5,2],
    # [5,2,5,2,5,2,5],
    # [5,2,5,2,5,2,5,2],
    # [5,2,5,2,5,2,5,2,5],
    # [5,2,5,2,5,2,5,2,5,2],
    # [5,2,5,2,5,2,5,2,5,2,5],
    # [5,2,5,2,5,2,5,2,5,2,5,2],
    # [5,2,5,2,5,2,5,2,5,2,5,2,5],
    # [5,2,5,2,5,2,5,2,5,2,5,2,5,2],
    # [5,2,5,2,5,2,5,2,5,2,5,2,5,2,5],
    # [5,2,5,2,5,2,5,2,5,2,5,2,5,2,5,2],
    # [5,2,5,2,5,2,5,2,5,2,5,2,5,2,5,2,5],

    # [14,7],
    # [14,7,14],
    # [14,7,14,7],
    # [14,7,14,7,14],
    # [14,7,14,7,14,7],
    # [14,7,14,7,14,7,14],
    # [14,7,14,7,14,7,14,7],
    # [14,7,14,7,14,7,14,7,14],
    # [14,7,14,7,14,7,14,7,14,7],
    # [14,7,14,7,14,7,14,7,14,7,14],
    # [14,7,14,7,14,7,14,7,14,7,14,7],
    # [14,7,14,7,14,7,14,7,14,7,14,7,14],
    # [14,7,14,7,14,7,14,7,14,7,14,7,14,7],
    # [14,7,14,7,14,7,14,7,14,7,14,7,14,7,14],
    # [14,7,14,7,14,7,14,7,14,7,14,7,14,7,14,7],
    # [14,7,14,7,14,7,14,7,14,7,14,7,14,7,14,7,14],
    # [14,7,14,7,14,7,14,7,14,7,14,7,14,7,14,7,14,7],

    # [7,14],
    # [7,14,7],
    # [7,14,7,14],
    # [7,14,7,14,7],
    # [7,14,7,14,7,14],
    # [7,14,7,14,7,14,7],
    # [7,14,7,14,7,14,7,14],
    # [7,14,7,14,7,14,7,14,7],
    # [7,14,7,14,7,14,7,14,7,14],
    # [7,14,7,14,7,14,7,14,7,14,7],
    # [7,14,7,14,7,14,7,14,7,14,7,14],
    # [7,14,7,14,7,14,7,14,7,14,7,14,7],
    # [7,14,7,14,7,14,7,14,7,14,7,14,7,14],
    # [7,14,7,14,7,14,7,14,7,14,7,14,7,14,7],
    # [7,14,7,14,7,14,7,14,7,14,7,14,7,14,7,14],
    # [7,14,7,14,7,14,7,14,7,14,7,14,7,14,7,14,7],
]



# Define the possible output classes
output_classes = [2, 3, 4, 5, 7, 14]
num_classes = len(output_classes)

# Pad sequences
max_len = max(len(seq) for seq in X)
X_padded = pad_sequences(X, maxlen=max_len, padding='pre', dtype='float32')

# Prepare input-output pairs
X_train, y_train = [], []
for seq in X:
    for i in range(1, len(seq)):
        X_train.append(seq[:i])
        y_train.append(seq[i])

# Pad sequences
max_len = max(len(seq) for seq in X_train)
X_train_padded = pad_sequences(X_train, maxlen=max_len, padding='pre', dtype='float32')

# Reshape X_train for RNN input
X_train_reshaped = X_train_padded.reshape((X_train_padded.shape[0], X_train_padded.shape[1], 1))

# Convert y_train to categorical
y_train_categorical = []
for y in y_train:
    y_train_categorical.append(output_classes.index(int(y)))
y_train_categorical = to_categorical(y_train_categorical, num_classes=num_classes)

def create_model(learning_rate):
    inputs = Input(shape=(max_len, 1))
    #x = Masking(mask_value=0.0)(inputs)  # Masking padded zeros
    x = SimpleRNN(32, activation='relu', return_sequences=True)(inputs)
    x = SimpleRNN(16, activation='relu', return_sequences=True)(x)
    x = SimpleRNN(8, activation='relu')(x)
    outputs = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=inputs, outputs=outputs)
    model.compile(optimizer=Adam(learning_rate=learning_rate), loss='categorical_crossentropy', metrics=['accuracy'])
    return model

# Define a learning rate scheduler
reduce_lr = ReduceLROnPlateau(monitor='loss', factor=0.5, patience=10, min_lr=1e-6)

def train_model(model, epochs):
    history = model.fit(X_train_reshaped, y_train_categorical, epochs=epochs, batch_size=32, verbose=1, callbacks=[reduce_lr])
    return history

def predict_next(model, sequence):
    sequence = pad_sequences([sequence], maxlen=max_len, padding='pre', dtype='float32')
    sequence = sequence.reshape((1, max_len, 1))
    prediction = model.predict(sequence)
    predicted_class = np.argmax(prediction[0])
    return output_classes[predicted_class]
    
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
    train_model(final_model, epochs=1750)
    save_model(final_model)

def continue_training(model, X_train, y_train, epochs=1000):
    reduce_lr = ReduceLROnPlateau(monitor='loss', factor=0.5, patience=10, min_lr=1e-6)
    history = model.fit(X_train, y_train, epochs=epochs, batch_size=32, verbose=1, callbacks=[reduce_lr])
    return history

# Function to load, continue training, and save the updated model
def additional_learning(epochs=1000):
    # Load the existing model
    model = load_saved_model()
    
    # Prepare your new data or use existing data
    # X_train and y_train should be prepared as before
    
    # Continue training
    history = continue_training(model, X_train_reshaped, y_train_categorical, epochs=epochs)
    
    # Save the updated model
    save_model(model)
    
    return history

def load_and_test_model():
    loaded_model = load_saved_model()
    
    test_sequences = [
        [14,7],
        [7,14],
        [14,14,7],
        [3,4,7,3,4],
        [2,5,3,4],
        [2,5,3,4,3],
        [7,7,7,10,7,7],
        [7,7,5,7,7],
        [7,4,7,7,7,7],
        [7,7,7,3,7,7],
        # [4,3,7,4,3,4],
        # [2,5,3,2,5,2,5,2],
        # [2,5],
        # [5,2],
        # [5,7,7,14,7,7]
    ]

    print("\nTest Predictions:")
    for seq in test_sequences:
        prediction = predict_next(loaded_model, seq)
        print(f"Sequence: {seq}, Predicted next: {prediction}")

#train_and_save_model()
#additional_learning(epochs=500)
#load_and_test_model()

sequence = [int(arg) for arg in sys.argv[1:]]
loaded_model = load_saved_model()
prediction = predict_next(loaded_model, sequence)
print(prediction)