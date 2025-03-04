from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model and feature columns
model = joblib.load("rental_price_model.pkl")
X_columns = joblib.load("X_columns.pkl")

def predict_price(location, area, bed, bath):
    # Create an input array with zeros, matching the number of features in the model
    x = np.zeros(len(X_columns))

    # Set the features based on the provided input
    x[0] = area
    x[1] = bed
    x[2] = bath

    # If the location is part of the feature columns, encode it
    if location in X_columns:
        x[np.where(X_columns == location)[0][0]] = 1

    # Predict the price using the trained model
    predicted_price = model.predict([x])[0]
    return round(predicted_price, 2)

@app.route('/predict', methods=['POST'])
def predict():
    # Get the JSON data from the request
    data = request.get_json()

    # Extract location, area, bed, and bath from the request data
    location = data.get('location')
    area = data.get('area')
    bed = data.get('bedrooms')
    bath = data.get('bathrooms')

    # Input validation
    if not location or not area or not bed or not bath:
        return jsonify({'error': 'Missing required parameters'}), 400

    try:
        area = float(area)
        bed = int(bed)
        bath = int(bath)
    except ValueError:
        return jsonify({'error': 'Invalid data type for Area, Bed or Bath'}), 400

    # Get the predicted rent
    predicted_rent = predict_price(location, area, bed, bath)

    # Return the predicted rent as a JSON response
    return jsonify({'prediction': predicted_rent})

if __name__ == '__main__':
    app.run(debug=True)
