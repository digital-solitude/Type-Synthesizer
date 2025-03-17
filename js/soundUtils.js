/*******************************************************
 * soundUtils.js
 *
 * Functions for note-to-MIDI conversions and actually
 * playing notes via p5.PolySynth, Envelope, etc.
 ******************************************************/

function noteToMidi(note) {
    let notes = {
        "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4,
        "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9,
        "A#": 10, "B": 11
    };
    let match = note.match(/([A-G]#?)(\d)/);
    if (match) {
        let pitch = match[1];
        let octave = parseInt(match[2]);
        return 12 * (octave + 1) + notes[pitch];
    }
    return 60; // default to middle C (C4)
}

function playNote(note) {
    if (synth) {
        let midiNum = noteToMidi(note);
        let freq = midiToFreq(midiNum);

        envelope.setADSR(attackTime, 0.1, 0.5, 0.5);

        distortion.set(distortionAmount, '2x');

        let playFreq = Math.max(0, freq + globalNoteShift);

        synth.play(playFreq, 0.5, 0, 0.5);
        envelope.play(synth.output);

        delay.process(synth.output, delayTime, 0.5, 2300);
    } else {
        console.error("synth is undefined");
    }
}
