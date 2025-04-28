const fs = require('fs');
const path = require('path');

const inputFilePath = path.join(__dirname, 'sequence.txt');
const outputFilePath = path.join(__dirname, 'sequence-output.txt');

fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) return console.error('Error reading file:', err);

    // Split the file into lines and process each line
    const lines = data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const entries = [];
    let currentKey = null;
    let currentTiming = null;

    // First pass: parse all entries
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this is a comma line first
        if (line.startsWith(',, timing:')) {
            // This is a comma line
            const timingStr = line.split('timing: ')[1];
            currentKey = ',';
            currentTiming = parseFloat(timingStr);
        }
        // Then check for space
        else if (line.startsWith(', timing:')) {
            // This is a space line
            const timingStr = line.split('timing: ')[1];
            currentKey = ' ';
            currentTiming = parseFloat(timingStr);
        }
        // Finally check for regular keys
        else if (line.includes('timing:')) {
            // This is a regular key line
            const [key, timingStr] = line.split(', timing: ');
            currentKey = key;
            currentTiming = parseFloat(timingStr);
        }

        // Add the entry if we found a valid key and timing
        if (currentKey !== null && currentTiming !== null) {
            entries.push({
                key: currentKey,
                timing: currentTiming
            });
        }
    }

    // Second pass: remove duplicate key events
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
        // Round timing to 2 decimal places
        const roundedTiming = Number(entry.timing.toFixed(2));
        output += `    ['${entry.key}', ${roundedTiming}]${isLast ? '' : ','}\n`;
    });
    output += '];';

    // Write to file
    fs.writeFile(outputFilePath, output, (err) => {
        if (err) return console.error('Error writing file:', err);
        console.log('Successfully processed sequence and wrote output to sequence-output.txt');
    });
}); 