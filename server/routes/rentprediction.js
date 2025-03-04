const express = require('express');
const { PythonShell } = require('python-shell');

class PredictionController {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    // Initialize routes
    initializeRoutes() {
        this.router.post('/predict', this.makePrediction.bind(this));
    }

    // Method to handle prediction requests
    async makePrediction(req, res) {
        try {
            // Extract parameters from the request body
            const { Location, Area, Bed, Bath } = req.body;

            // Input validation
            if (!Location || !Area || !Bed || !Bath) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            // Options for running the Python script
            const options = {
                mode: 'text',
                pythonPath: 'python',  // Specify your python version if needed (e.g., 'python3')
                pythonOptions: ['-u'],
                scriptPath: '../server/missellonous',  // Path to the directory containing your Python script
                args: [Location, Area, Bed, Bath]
            };

            // Run the Python script to get the prediction
            PythonShell.run('predict.py', options, (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Error running Python script', details: err.message });
                }

                // Parse and send the predicted rent as a response
                const predictedRent = parseFloat(results[0]);
                return res.json({ predicted_rent: predictedRent });
            });
        } catch (err) {
            // Handle any unforeseen errors
            return res.status(500).json({ error: 'Error processing prediction', details: err.message });
        }
    }
}

// Instantiate and export the PredictionController class
const predictionController = new PredictionController();
module.exports = predictionController.router;
