const fs = require('fs');
const path = require('path');

// Replace with the path to your .txt file
const inputFilePath = path.join(__dirname, 'sequence.txt');
const outputFilePath = path.join(__dirname, 'sequence-output.txt');

fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) return console.error('Error reading file:', err);

    // Split the file into lines and process each line
    const lines = data.split('\n');
    const guidedNoteSequence = [];

    for (const line of lines) {
        if (!line.trim()) continue; // Skip empty lines

        // Extract key and timing using regex
        const match = line.match(/(.+), timing: (.+)/);
        if (match) {
            const key = match[1];
            const timing = parseFloat(match[2]);
            // Round to two decimal places
            const roundedTiming = Number(timing.toFixed(2));
            guidedNoteSequence.push([key, roundedTiming]);
        }
    }

    // Prepare the output string
    let output = 'const guidedNoteSequence = [\n';
    guidedNoteSequence.forEach(([key, timing], index) => {
        const isLast = index === guidedNoteSequence.length - 1;
        output += `    ['${key}', ${timing}]${isLast ? '' : ','}\n`;
    });
    output += '];';

    // Write to file
    fs.writeFile(outputFilePath, output, (err) => {
        if (err) return console.error('Error writing file:', err);
        console.log('Successfully wrote output to sequence-output.txt');
    });
});