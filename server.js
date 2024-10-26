const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

// SSL certificate paths
const privateKey = fs.readFileSync('selfsigned.key', 'utf8');
const certificate = fs.readFileSync('selfsigned.crt', 'utf8');

// HTTPS options
const httpsOptions = {
  key: privateKey,
  cert: certificate
};

// Express app for serving static files
const app = express();

// Function to run the prediction
function runPrediction(imagePath, callback) {
  const command = `./FaceFinderCLI/FaceFinderCLI2 ${imagePath}`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      callback(error, null);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      callback(stderr, null);
      return;
    }

    try {
      const predictions = JSON.parse(stdout);
      console.log(predictions);
      callback(null, predictions);
    } catch (parseError) {
      console.error("Failed to parse predictions:", parseError);
      callback(parseError, null);
    }
  });
}

// Serve static files from the 'webpage' directory
const webDir = path.join(__dirname, 'webpage');
app.use(express.static(webDir));

// Add middleware to parse JSON and base64 data
app.use(bodyParser.json({ limit: '100mb' }));

// Handle CORS in Express
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// HTTPS server
const server = https.createServer(httpsOptions, app);

// Create a WebSocket server
const wss = new WebSocket.Server({ server }); // WebSocket on the same HTTPS server

// Function to save base64 image to a file
function saveBase64Image(base64String, outputFile) {
  // Remove data URI prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Write image data to a file
  fs.writeFileSync(outputFile, buffer);
  console.log('Image saved to', outputFile);
}

function getCenterCoordinates(data) {
  // If no coords or confidence data, return null data
  if (!data || !data.coords || data.coords.length === 0 || !data.confidence || data.confidence.length === 0) {
    return { data: null };
  }

  // Proceed with center calculation if data is present
  const [x_min, y_min, width, height] = data.coords[0]; // Change coordinates to coords
  const centerX = x_min + (width / 2);
  const centerY = y_min + (height / 2);

  return {
    centerX,
    centerY,
    confidence: data.confidence[0], // Confidence is still correct
    bbox: data.coords[0] // Change coordinates to coords
  };
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('WebSocket connection established.');

  // Message handler
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.action === 'UpdatePicture') {
      const base64Image = parsedMessage.data.img;
      const outputPath = path.join(__dirname, 'latestimage.jpeg');

      // Save the base64 image to a file
      saveBase64Image(base64Image, outputPath);

      runPrediction('latestimage.jpeg', (error, predictions) => {
        if (error) {
          ws.send(JSON.stringify({
            action: 'Error',
            msg: 'Failed to process image'
          }));
          return;
        }
      
        const predictedFaceLocation = getCenterCoordinates(predictions); // Pass the predictions object
      
        ws.send(JSON.stringify({
          action: 'ImageUpdatedNewLocation',
          data: { message: 'Image successfully updated and processed', data: predictedFaceLocation }
        }));
      });
    } else {
      // Handle unknown actions
      ws.send(JSON.stringify({
        action: 'Error',
        msg: 'Unknown Action'
      }));
    }
  });

  // WebSocket close event
  ws.on('close', () => {
    console.log('WebSocket connection closed.');
  });
});

// Start HTTPS and WebSocket server
const PORT = 1920;
server.listen(PORT, () => {
  console.log(`Serving HTTPS at https://localhost:${PORT}`);
});