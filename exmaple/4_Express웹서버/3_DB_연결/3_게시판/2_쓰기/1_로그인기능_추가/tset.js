const fs = require('fs');

// 👇️ if you use CommonJS
// const fs = require('fs')

const directoryPath = 'C:\\instantclient_21_13';

if (fs.existsSync(directoryPath)) {
    console.log('The directory exists');
} else {
    console.log('The directory does NOT exist');
}