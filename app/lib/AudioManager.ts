class AudioManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private musicGain: GainNode | null = null;
    private sfxGain: GainNode | null = null;
    private currentMusic: OscillatorNode[] = [];
    private musicType: 'menu' | 'game' | 'night' | null = null;
    private isInitialized = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.init();
        }
    }

    private init() {
        if (this.isInitialized) return;
        
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 1.0;

        this.musicGain = this.ctx.createGain();
        this.musicGain.connect(this.masterGain);
        this.musicGain.gain.value = 0.75;

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.connect(this.masterGain);
        this.sfxGain.gain.value = 0.85;

        this.isInitialized = true;
    }

    private resume() {
        if (this.ctx?.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playSfx(type: 'click' | 'hover' | 'collect' | 'discover' | 'popup' | 'close' | 'tick' | 'suspense' | 'reward') {
        if (!this.isInitialized) this.init();
        this.resume();
        if (!this.ctx || !this.sfxGain) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);

        switch (type) {
            case 'click':
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'hover':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case 'collect':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'discover':
                this.playArpeggio([440, 554, 659, 880], 0.1, 'square');
                break;
            case 'popup':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'close':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'tick':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                osc.start(now);
                osc.stop(now + 0.03);
                break;
            case 'suspense':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.linearRampToValueAtTime(90, now + 0.25);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
                break;
            case 'reward':
                this.playArpeggio([523.25, 659.25, 783.99, 1046.50, 1318.51], 0.08, 'square');
                break;
        }
    }

    playStep(type: 'grass' | 'sand') {
        if (!this.isInitialized) this.init();
        this.resume();
        if (!this.ctx || !this.sfxGain) return;

        const now = this.ctx.currentTime;
        
        // Generate custom procedural noise footstep
        const duration = 0.06; // 60ms crunch duration
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        if (type === 'grass') {
            // High-pass crunch for grass rustling
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1200, now);
            gain.gain.setValueAtTime(0.08, now); // Soft distinct crunchy sound
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        } else {
            // Bandpass soft crunch for sandy friction
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(450, now);
            filter.Q.setValueAtTime(3.0, now);
            gain.gain.setValueAtTime(0.12, now); // Softer but deeper step sound
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        }

        noiseSource.start(now);
    }

    private playArpeggio(freqs: number[], duration: number, type: OscillatorType) {
        if (!this.ctx || !this.sfxGain) return;
        const now = this.ctx.currentTime;
        freqs.forEach((freq, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now + i * duration);
            osc.connect(gain);
            gain.connect(this.sfxGain!);
            gain.gain.setValueAtTime(0.2, now + i * duration);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * duration + duration);
            osc.start(now + i * duration);
            osc.stop(now + i * duration + duration);
        });
    }

    playMusic(type: 'menu' | 'game' | 'night') {
        if (!this.isInitialized) this.init();
        if (this.musicType === type) return;
        this.resume();
        this.stopMusic();
        this.musicType = type;

        if (!this.ctx || !this.musicGain) return;

        // Simple procedural loop
        const tempo = type === 'menu' ? 0.5 : type === 'game' ? 0.25 : 0.8; // Night biome is slow, heavy, atmospheric
        const melody = type === 'menu' 
            ? [261, 329, 392, 523, 392, 329] // C major calm
            : type === 'game'
            ? [329, 392, 440, 523, 587, 523, 440, 392] // G major adventure
            : [110, 123, 131, 147, 131, 123, 110, 82]; // Deep ominous minor A-E drone for absolute tension

        const playLoop = () => {
            if (this.musicType !== type) return;
            const now = this.ctx!.currentTime;
            melody.forEach((freq, i) => {
                const osc = this.ctx!.createOscillator();
                const gain = this.ctx!.createGain();
                osc.type = type === 'night' ? 'sine' : 'triangle'; // Sine wave for spooky wind/drone feel
                osc.frequency.setValueAtTime(freq, now + i * tempo);
                
                // Add a low-frequency oscillator (LFO) style pitch swell for creepy wind whistling/pulsing
                if (type === 'night') {
                    osc.frequency.linearRampToValueAtTime(freq * 1.03, now + i * tempo + tempo * 0.5);
                    osc.frequency.linearRampToValueAtTime(freq * 0.97, now + i * tempo + tempo);
                }
                
                osc.connect(gain);
                gain.connect(this.musicGain!);
                
                const vol = type === 'night' ? 0.08 : 0.1; // Deep subtle atmospheric volume
                gain.gain.setValueAtTime(vol, now + i * tempo);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * tempo + tempo * 0.95);
                osc.start(now + i * tempo);
                osc.stop(now + i * tempo + tempo);
                this.currentMusic.push(osc);
            });
            
            const nextLoopTime = melody.length * tempo * 1000;
            setTimeout(playLoop, nextLoopTime);
        };

        playLoop();
    }

    stopMusic() {
        this.currentMusic.forEach(osc => {
            try { osc.stop(); } catch {}
        });
        this.currentMusic = [];
        this.musicType = null;
    }

    setVolume(val: number) {
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(val, this.ctx!.currentTime, 0.1);
        }
    }
}

export const audioManager = new AudioManager();
