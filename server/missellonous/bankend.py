from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)  


model = joblib.load("../RentPrediction/Model/dhaka_rent_model.pkl")
X_columns = joblib.load("../RentPrediction/Model/X_columns.pkl")

def predict_price(location, area, bed, bath):
    
    x = np.zeros(len(X_columns))

   
    x[0] = area
    x[1] = bed
    x[2] = bath

    
    if location in X_columns:
        location_index = X_columns.index(location)
        x[location_index] = 1

   
    predicted_price = model.predict([x])[0]
    return round(predicted_price, 2)

@app.route('/predict', methods=['POST'])
def predict():
    
    data = request.get_json()

    
    location = data.get('location')
    area = data.get('area')
    bed = data.get('bedrooms')
    bath = data.get('bathrooms')

    
    if not location or not area or not bed or not bath:
        return jsonify({'error': 'Missing required parameters'}), 400

    try:
        area = float(area)
        bed = int(bed)
        bath = int(bath)
    except ValueError:
        return jsonify({'error': 'Invalid data type for Area, Bed or Bath'}), 400

    
    predicted_rent = predict_price(location, area, bed, bath)
    predicted_rent = float(predicted_rent)
   
    return jsonify({'prediction': predicted_rent})

if __name__ == '__main__':
    app.run(debug=True)