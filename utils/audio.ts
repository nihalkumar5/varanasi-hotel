// Synthetic Web Audio API sounds for notifications (doesn't require MP3 files)

let audioContext: AudioContext | null = null;
let adminInterval: NodeJS.Timeout | null = null;

export const initAudioContext = () => {
    if (typeof window === "undefined") return;
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
};

// Keep track of active oscillator nodes so we can stop them
let activeAdminOscillators: OscillatorNode[] = [];
let activeAdminGain: GainNode | null = null;
let isAdminAlerting = false;

export const startAdminAlert = () => {
    if (typeof window === "undefined") return;
    initAudioContext();

    if (isAdminAlerting || !audioContext) return;
    isAdminAlerting = true;

    // Royal Service Chime (C crystalline arpeggio)
    // C6 (1046.50), E6 (1318.51), G6 (1567.98), C7 (2093.00)
    const sequence = [1046.50, 1318.51, 1567.98, 2093.00];
    const oscillators: OscillatorNode[] = [];
    const gainNode = audioContext.createGain();

    const playNote = (freq: number, startTime: number) => {
        const osc = audioContext!.createOscillator();
        const noteGain = audioContext!.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
        
        osc.connect(noteGain);
        noteGain.connect(gainNode);
        osc.start(startTime);
        oscillators.push(osc);
    };

    // Create a repeating luxury arpeggio
    const now = audioContext.currentTime;
    for (let i = 0; i < 150; i++) { // Loop for ~5 mins
        const loopStart = now + (i * 2.0);
        sequence.forEach((freq, idx) => {
            playNote(freq, loopStart + (idx * 0.15));
        });
    }

    gainNode.connect(audioContext.destination);

    gainNode.connect(audioContext.destination);

    activeAdminOscillators = oscillators;
    activeAdminGain = gainNode;
};

export const stopAdminAlert = () => {
    if (!isAdminAlerting || !audioContext || !activeAdminGain) return;

    // Quick fade out to prevent speaker pop
    activeAdminGain.gain.setValueAtTime(activeAdminGain.gain.value, audioContext.currentTime);
    activeAdminGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);

    // Stop and disconnect after fade out
    setTimeout(() => {
        activeAdminOscillators.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch (e) { }
        });
        activeAdminGain?.disconnect();
        activeAdminOscillators = [];
        activeAdminGain = null;
    }, 150);

    isAdminAlerting = false;
};

// Water-specific alert (different frequency and pulsing rhythm)
let isWaterAlerting = false;
let activeWaterOscillators: OscillatorNode[] = [];
let activeWaterGain: GainNode | null = null;

export const startWaterAlert = () => {
    if (typeof window === "undefined") return;
    initAudioContext();

    if (isWaterAlerting || !audioContext) return;
    isWaterAlerting = true;

    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.type = "sine";
    // Higher, more "urgent" but "liquid" frequency
    osc.frequency.setValueAtTime(880, audioContext.currentTime);

    // Create a pulsing rhythm for water (on-off)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    // Create the pulse loop
    const now = audioContext.currentTime;
    for (let i = 0; i < 60; i++) {
        gainNode.gain.setTargetAtTime(0.4, now + (i * 0.4), 0.05);
        gainNode.gain.setTargetAtTime(0, now + (i * 0.4) + 0.2, 0.05);
    }

    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    osc.start();

    activeWaterOscillators = [osc];
    activeWaterGain = gainNode;
};

export const stopWaterAlert = () => {
    if (!isWaterAlerting || !audioContext || !activeWaterGain) return;

    activeWaterGain.gain.cancelScheduledValues(audioContext.currentTime);
    activeWaterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);

    setTimeout(() => {
        activeWaterOscillators.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch (e) { }
        });
        activeWaterGain?.disconnect();
        activeWaterOscillators = [];
        activeWaterGain = null;
    }, 150);

    isWaterAlerting = false;
};

export const playGuestNotification = () => {
    if (typeof window === "undefined") return;
    initAudioContext();

    if (!audioContext) return;

    // A premium, lush crystalline bell sound
    const playBell = (freq: number, startTime: number, outGain: number = 0.5) => {
        const osc = audioContext!.createOscillator();
        const gain = audioContext!.createGain();

        // Sine wave is smooth and "bell-like" when envelope is right
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        // Pluck attack
        gain.gain.linearRampToValueAtTime(outGain, startTime + 0.02);
        // Long smooth decay
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.0);

        osc.connect(gain);
        gain.connect(audioContext!.destination);

        osc.start(startTime);
        osc.stop(startTime + 2.0);
    };

    const now = audioContext.currentTime;
    // Major 7th arpeggio (Cmaj9) for a very relaxing, premium "hotel" feel
    // C5, E5, G5, B5, D6
    playBell(523.25, now, 0.4);         // C5
    playBell(659.25, now + 0.08, 0.3);  // E5
    playBell(783.99, now + 0.16, 0.25); // G5
    playBell(987.77, now + 0.24, 0.2);  // B5
    playBell(1174.66, now + 0.32, 0.15); // D6
};

export const playSuccessNotification = () => {
    if (typeof window === "undefined") return;
    initAudioContext();

    if (!audioContext) return;

    // A slightly more energetic and bright "success / completed" sound
    const playSparkle = (freq: number, startTime: number, outGain: number = 0.5) => {
        const osc = audioContext!.createOscillator();
        const gain = audioContext!.createGain();

        // Mixing sine with a bit of a brighter shape (sine is fine here but fast envelope)
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        // Fast pitch envelope for a "sparkle" effect (optional, keep it simple first)

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(outGain, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.0);

        osc.connect(gain);
        gain.connect(audioContext!.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.0);
    };

    const now = audioContext.currentTime;
    // Fast, ascending major pentatonic flourish for success feeling
    playSparkle(523.25, now, 0.3);          // C5
    playSparkle(659.25, now + 0.1, 0.3);    // E5
    playSparkle(783.99, now + 0.2, 0.3);    // G5
    playSparkle(1046.50, now + 0.3, 0.4);   // C6 (Triumphant finish)
};
