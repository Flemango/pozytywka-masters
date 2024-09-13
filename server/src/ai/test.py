# test_python.py
import sys
import json

# Read input from Node.js
input_data = sys.argv[1]

# Parse JSON data
data = json.loads(input_data)

# Process the data
result = f"Hello, {data['name']}! You are {data['age']} years old. You'll be escorted to museum, you ancient fuck."

# Print the result (this will be captured by Node.js)
print(result)