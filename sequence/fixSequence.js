const fs = require('fs');
const path = require('path');

const inputFilePath = path.join(__dirname, 'sequence.txt');
const outputFilePath = path.join(__dirname, 'sequence-output-fixed.txt');

fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) return console.error('Error reading file:', err);

    // Split the file into lines and process each line
    const lines = data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const entries = [];
    let currentKey = null;
    let currentTiming = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this is a comma line first
        if (line.startsWith(',, timing:')) {
            // This is a comma line
            const timingStr = line.split('timing: ')[1];
            currentKey = ',';
            currentTiming = parseFloat(timingStr);

            // Add the entry
            entries.push({
                key: currentKey,
                timing: currentTiming
            });
        }
        // Then check for space
        else if (line.startsWith(', timing:')) {
            // This is a space line
            const timingStr = line.split('timing: ')[1];
            currentKey = ' ';
            currentTiming = parseFloat(timingStr);

            // Add the entry
            entries.push({
                key: currentKey,
                timing: currentTiming
            });
        }
        // Finally check for regular keys
        else if (line.includes('timing:')) {
            // This is a regular key line
            const [key, timingStr] = line.split(', timing: ');
            currentKey = key;
            currentTiming = parseFloat(timingStr);

            // Add the entry
            entries.push({
                key: currentKey,
                timing: currentTiming
            });
        }
    }

    // Process entries to remove duplicate key events
    const processedEntries = [];
    let lastKey = null;

    for (let i = 0; i < entries.length; i++) {
        const current = entries[i];

        // Keep the key press if:
        // 1. It's not the same as the previous key, OR
        // 2. For spaces or commas, it has a timing value greater than 100ms, OR
        // 3. For other keys, it has a timing value greater than 100ms
        if (current.key !== lastKey ||
            ((current.key === ' ' || current.key === ',') && current.timing > 100) ||
            (current.key !== ' ' && current.key !== ',' && current.timing > 100)) {
            processedEntries.push(current);
            lastKey = current.key;
        }
    }

    // Format the output
    let output = 'const guidedNoteSequence = [\n';
    processedEntries.forEach((entry, index) => {
        const isLast = index === processedEntries.length - 1;
        output += `    ['${entry.key}', ${entry.timing}]${isLast ? '' : ','}\n`;
    });
    output += '];';

    // Write to file
    fs.writeFile(outputFilePath, output, (err) => {
        if (err) return console.error('Error writing file:', err);
        console.log('Successfully wrote fixed sequence to sequence-output-fixed.txt');
    });
}); 