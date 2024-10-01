// =================================================================

// No packets are sent by the server on first fetch.

// =================================================================
require('dotenv').config();
const readline = require('readline');
const fetch = require('./fetchPackets.js'); // Assuming this fetches the data you need
const fs = require('fs');
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to wrap rl.question in a Promise
const askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const formatDate = (date) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  return date.toLocaleString('en-GB', options).replace(/[/, :]/g, '-'); // Replace characters that are not valid in filenames
};

// Function to save the data to a randomly named file
const saveDataToFile = (data) => {
  // Ensure the output folder exists, if not, create it
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Generate a random filename using crypto
  const timestamp = formatDate(new Date());
  const fileName = `data_${timestamp}.json`;
  const filePath = path.join(outputDir, fileName);

  // Write the data to the file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log(`Data saved to ${filePath}`);
};

// Using async/await with rl.question
const getUserInput = async () => {
  const res = await askQuestion('Do you want to fetch packets(yes/no)? ');
  
  if (res.toLowerCase() === 'yes' || res.toLowerCase() === 'y') {
    try {
      // Assuming fetch returns a Promise that resolves to JSON data
      const data = await fetch();
      saveDataToFile(data); // Save the data to a file
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    getUserInput(); // Ask again after fetching
  } else {
    console.log('Exiting...');
    rl.close();
    process.exit(0); // Exit the process if user doesn't want to fetch packets
  }
};

getUserInput();
