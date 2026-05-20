'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { nutsData } from './data/nutsData';
import { PetIcon } from './components/GachaWheel';

const NUT_RARITIES: Record<number, 'Common' | 'Rare' | 'Epic' | 'Legendary'> = {
  6: 'Common', // Peanut
  0: 'Common', // Almond
  2: 'Common', // Cashew
  4: 'Common', // Hazelnut
  5: 'Rare',   // Macadamia
  10: 'Rare',  // Walnut
  7: 'Rare',   // Pecan
  8: 'Rare',   // Pine Nut
  1: 'Epic',   // Brazil Nut
  3: 'Epic',   // Chestnut
  9: 'Legendary' // Pistachio
};
import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { formatTime } from '../lib/utils';
import { audioManager } from './lib/AudioManager';

// Define OperationType as an enum or constant
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}


const WowokPortrait = () => (
    <svg viewBox="0 0 32 32" className="w-full h-full rendering-pixelated drop-shadow-md bg-[#c4b687]">
        <rect width="32" height="32" fill="#c4b687" />
        <rect x="6" y="8" width="20" height="24" rx="2" fill="#f5c69a" />
        <rect x="8" y="20" width="3" height="2" fill="#e8a87c" />
        <rect x="21" y="20" width="3" height="2" fill="#e8a87c" />
        <rect x="10" y="15" width="2" height="2" fill="#4a2f1d" />
        <rect x="20" y="15" width="2" height="2" fill="#4a2f1d" />
        <rect x="13" y="22" width="6" height="2" fill="#4a2f1d" />
        <rect x="12" y="21" width="1" height="1" fill="#4a2f1d" />
        <rect x="19" y="21" width="1" height="1" fill="#4a2f1d" />
        <rect x="2" y="8" width="28" height="3" fill="#e4d6a7" />
        <rect x="6" y="4" width="20" height="4" fill="#e4d6a7" />
        <rect x="6" y="7" width="20" height="1" fill="#d4c697" />
        <rect x="8" y="26" width="16" height="6" fill="#8c6b4a" />
        <rect x="10" y="26" width="4" height="6" fill="#497fa3" />
        <rect x="18" y="26" width="4" height="6" fill="#497fa3" />
        <rect x="12" y="29" width="8" height="3" fill="#497fa3" />
    </svg>
);

const PixelPanel = ({ children, className = '' }: any) => (
    <div className={`bg-[#e4d6a7] border-[4px] border-[#8c6b4a] shadow-[inset_0_0_0_2px_#c4b687,4px_4px_0_rgba(0,0,0,0.3)] text-[#4a2f1d] font-sans ${className}`}>
        {children}
    </div>
);

const PixelButton = ({ children, onClick, className = '', variant = 'primary' }: any) => {
    const bg = variant === 'danger' ? 'bg-[#c94f4f]' : 'bg-[#e8a87c]';
    const border = variant === 'danger' ? 'border-[#8a2222]' : 'border-[#b5653b]';
    const hover = variant === 'danger' ? 'hover:bg-[#d96666]' : 'hover:bg-[#f5c69a]';
    
    return (
        <button 
            onClick={() => {
                audioManager.playSfx('click');
                onClick?.();
            }}
            onMouseEnter={() => audioManager.playSfx('hover')}
            className={`${bg} ${hover} text-white font-bold py-2 px-4 border-[4px] ${border} shadow-[inset_0_0_0_2px_rgba(255,255,255,0.2),2px_2px_0_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.2),0px_0px_0_rgba(0,0,0,0.3)] transition-all rendering-pixelated tracking-widest uppercase text-sm hover:scale-105 active:scale-95 ${className}`}
        >
            {children}
        </button>
    );
};

const DialogueBox = ({ dialogues, onFinish }: { dialogues: string[], onFinish: () => void }) => {
    const [index, setIndex] = useState(0);
    const [displayedLength, setDisplayedLength] = useState(0);
    const [isTyping, setIsTyping] = useState(true);

    const currentText = dialogues[index];

    useEffect(() => {
        if (isTyping && displayedLength < currentText.length) {
            const timer = setTimeout(() => {
                setDisplayedLength(prev => prev + 1);
            }, 30);
            return () => clearTimeout(timer);
        } else if (displayedLength >= currentText.length && isTyping) {
            const timer = setTimeout(() => setIsTyping(false), 0);
            return () => clearTimeout(timer);
        }
    }, [displayedLength, isTyping, currentText.length]);

    const handleNext = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
        if (e) {
            e.stopPropagation();
            if ('preventDefault' in e) e.preventDefault();
        }

        audioManager.playSfx('click');

        if (isTyping) {
            setDisplayedLength(currentText.length);
            setIsTyping(false);
            return;
        }

        if (index < dialogues.length - 1) {
            setIndex(prev => prev + 1);
            setDisplayedLength(0);
            setIsTyping(true);
        } else {
            onFinish();
        }
    }, [isTyping, index, currentText.length, dialogues.length, onFinish]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return; // Prevent auto-repeat from skipping dialogues
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleNext(e);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext]);

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-[1000] flex items-end drop-shadow-2xl animate-[slideUp_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] font-sans">
            <div className="bg-[#e4d6a7] border-[6px] border-[#8c6b4a] rounded-3xl p-5 md:p-8 w-full flex flex-col md:flex-row gap-4 md:gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_-8px_0_rgba(140,107,74,0.3)] pointer-events-auto cursor-pointer" onClick={handleNext}>
                
                <div className="w-24 h-24 shrink-0 mx-auto md:mx-0 md:-mt-12 rounded-2xl overflow-hidden shadow-lg border-[4px] border-[#4a2f1d] bg-[#c4b687] relative animate-[bounce_3s_infinite_ease-in-out]">
                    <WowokPortrait />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="font-black text-[#4a2f1d] text-xl mb-1 tracking-widest uppercase drop-shadow-sm" style={{textShadow: '0 1px 0 #fff5d1'}}>Wowok</div>
                        <div className="font-bold text-[#7a421e] text-lg leading-relaxed min-h-[4.5rem]">
                            {currentText.slice(0, displayedLength)}
                            <span className="opacity-0">
                                {currentText.slice(displayedLength)}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-2 md:mt-0">
                        <button 
                            className="bg-transparent border-none outline-none text-[#8c6b4a] font-bold uppercase tracking-widest text-sm hover:!text-[#4a2f1d] transition-colors flex items-center animate-pulse"
                        >
                            {isTyping ? 'Skip ▼' : 'Next ▼'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Next.js dynamic import requires avoiding server-side execution for Phaser
export default function PhaserApp({ characterConfig, onQuit }: { characterConfig: { name: string, hairColor: string, shirtColor: string, biome?: string, equippedPet?: any }, onQuit?: () => void }) {
    const gameContainer = useRef<HTMLDivElement>(null);
    const game = useRef<any>(null);
    const [activeNut, setActiveNut] = useState<any>(null);
    const [showIntroDialogue, setShowIntroDialogue] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);
    const [isGameplayStarted, setIsGameplayStarted] = useState(false);
    const [gameplayTime, setGameplayTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const [showEndingDialogue, setShowEndingDialogue] = useState(false);
    const [isGameFinished, setIsGameFinished] = useState(false);
    const [collectedNuts, setCollectedNuts] = useState(0);
    const [isQuitting, setIsQuitting] = useState(false);
    const [worldStatus, setWorldStatus] = useState<'generating' | 'ready' | 'fading_out' | 'done'>('generating');
    const timerFreezeEnd = useRef<number>(0);

    useEffect(() => {
        const handleFreeze = (e: any) => {
            timerFreezeEnd.current = Date.now() + e.detail;
        };
        window.addEventListener('FREEZE_TIMER', handleFreeze);
        return () => window.removeEventListener('FREEZE_TIMER', handleFreeze);
    }, []);

    useEffect(() => {
        const handleReady = () => setWorldStatus('ready');
        const handleFadeOut = () => setWorldStatus('fading_out');
        const handleDone = () => setWorldStatus('done');
        
        window.addEventListener('WORLD_STATUS_READY', handleReady);
        window.addEventListener('WORLD_STATUS_FADEOUT', handleFadeOut);
        window.addEventListener('WORLD_STATUS_DONE', handleDone);
        
        return () => {
            window.removeEventListener('WORLD_STATUS_READY', handleReady);
            window.removeEventListener('WORLD_STATUS_FADEOUT', handleFadeOut);
            window.removeEventListener('WORLD_STATUS_DONE', handleDone);
        };
    }, []);

    useEffect(() => {
        const handleGameReady = () => {
            setShowIntroDialogue(true);
        };
        window.addEventListener('GAME_READY_EVENT', handleGameReady);
        return () => window.removeEventListener('GAME_READY_EVENT', handleGameReady);
    }, []);

    useEffect(() => {
        const handlePlayerMoved = () => {
            setHasMoved(true);
            setIsTimerRunning(true);
        };
        window.addEventListener('PLAYER_MOVED', handlePlayerMoved);
        return () => window.removeEventListener('PLAYER_MOVED', handlePlayerMoved);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                if (Date.now() > timerFreezeEnd.current) {
                    setGameplayTime(prev => prev + 1);
                }
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const saveToLeaderboard = async () => {
        console.log('--- LEADERBOARD SAVE START ---');
        console.log('Player:', characterConfig.name || 'Explorer', 'Time:', gameplayTime);
        console.log('Firebase Auth State:', auth.currentUser ? `Authenticated as ${auth.currentUser.uid}` : 'Not authenticated');

        if (!db) {
            console.error('Firestore not initialized! Cannot save.');
            return false;
        }

        // Add a timeout for the entire save operation
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), 5000));
        
        const saveOperation = async () => {
            try {
                // Ensure auth
                if (!auth.currentUser) {
                    console.log('Attempting auth before save...');
                    await signInAnonymously(auth);
                    console.log('Auth success.');
                }
                
                const collectionName = characterConfig.biome === 'night' ? 'leaderboard_night' : 'leaderboard';
                const leaderboardCollection = collection(db, collectionName);
                const docRef = await addDoc(leaderboardCollection, {                
                    playerName: characterConfig.name || 'Explorer',
                    completionTime: gameplayTime,
                    createdAt: serverTimestamp()
                });
                console.log('--- LEADERBOARD SAVE SUCCESS! Document ID:', docRef.id);
                return 'SUCCESS';
            } catch (e: any) {
                console.error('--- LEADERBOARD SAVE FAILED. Details:', e);
                return 'FAILED';
            }
        };

        try {
            const result = await Promise.race([saveOperation(), timeoutPromise]);
            console.log('--- LEADERBOARD SAVE OPERATION RESULT:', result);
            return result === 'SUCCESS';
        } catch (e) {
            console.error('Unexpected error in race condition:', e);
            return false;
        }
    };

    const introDialogues = React.useMemo(() => [
        `Welcome, ${characterConfig.name || 'Explorer'}, to Sawit Village.`,
        "Your goal here is to find my 10 missing nuts.",
        "Each nut has a unique shape, and you will get information from each nut you find. Read them to increase your knowledge.",
        "To make it more exciting, I'll time everyone who successfully finds my 10 nuts. The fastest will be entered into the Sawit Village leaderboard."
    ], [characterConfig.name]);

    const handleIntroFinish = () => {
        setShowIntroDialogue(false);
        setIsGameplayStarted(true);
        window.dispatchEvent(new CustomEvent('START_GAMEPLAY_EVENT'));
    };

    useEffect(() => {
        if (showMenu) {
            window.dispatchEvent(new Event('pauseGame'));
            setIsTimerRunning(false);
        } else {
            // Only resume if we are not looking at a nut, not in intro dialogue, and not in ending dialogue
            // And the game is not finished.
            if (!activeNut && !showIntroDialogue && !showEndingDialogue && !isGameFinished) {
                window.dispatchEvent(new Event('resumeGame'));
                if (hasMoved) setIsTimerRunning(true);
            }
            setShowQuitConfirm(false);
        }
    }, [showMenu, activeNut, showIntroDialogue, showEndingDialogue, hasMoved, isGameFinished]);

    const endingDialogues = React.useMemo(() => [
        "Thank you, my friend, you have collected all 10 of my missing nuts.",
        `You have successfully collected all my nuts in ${formatTime(gameplayTime)}. Check the leaderboard to see if you are among the fastest!`,
        `Thank you, ${characterConfig.name || 'Explorer'}. See you again.`
    ], [characterConfig.name, gameplayTime]);

    const handleEndingFinish = async () => {
        setIsTimerRunning(false);
        setIsGameFinished(true); // Game is now truly finished
        setShowEndingDialogue(false);
        setIsQuitting(true); // Hide React HUD
        
        // Save in background
        saveToLeaderboard();

        // No need to dispatch to Phaser anymore, React handles the overlay
        
        // Wait for fade to complete (1.5s) before returning to menu
        setTimeout(() => {
            if (onQuit) onQuit();
        }, 1500);
    };

    useEffect(() => {
        signInAnonymously(auth).catch(err => console.error("Anonymous auth failed", err));
    }, []);

    useEffect(() => {
        const handleShow = (e: any) => {
            const nutData = e.detail;
            let isNewUnlock = false;
            
            if (nutData && nutData.id !== undefined) {
                try {
                    const saved = localStorage.getItem('sawit_village_encyclopedia');
                    const parsed = saved ? JSON.parse(saved) : [];
                    if (!parsed.includes(nutData.id)) {
                        localStorage.setItem('sawit_village_encyclopedia', JSON.stringify([...parsed, nutData.id]));
                        isNewUnlock = true;
                    }
                } catch {}
            }
            
            setCollectedNuts(prev => prev + 1);
            
            setActiveNut({ ...nutData, isNewUnlock });
            setIsTimerRunning(false);
        };
        window.addEventListener('showNutModal', handleShow);
        return () => window.removeEventListener('showNutModal', handleShow);
    }, []);

    const closeNutModal = () => {
        audioManager.playSfx('close');
        setActiveNut(null);
        if (collectedNuts >= 10) {
            setShowEndingDialogue(true);
        } else {
            setIsTimerRunning(true);
            window.dispatchEvent(new Event('resumeGame'));
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        // Lazy load phaser so it doesn't break SSR
        import('phaser').then((Phaser) => {
            if (game.current) return;

            class BootScene extends Phaser.Scene {
                loadingText: any;

                constructor() {
                    super('BootScene');
                }

                preload() {
                    // Load actual nut assets from public/nuts/ for the UI
                    nutsData.forEach(nut => {
                        this.load.image(`nut_ui_${nut.id}`, nut.image);
                    });

                    // Defer heavy generation for a cinematic feel
                    this.time.delayedCall(1200, () => {
                        this.generatePixelNuts();
                        this.generatePetTextures();
                        this.generateAssets();
                        this.generateRadialLight();
                    });
                }

                generateRadialLight() {
                    const canvas = document.createElement('canvas');
                    canvas.width = 256;
                    canvas.height = 256;
                    const ctx = canvas.getContext('2d')!;
                    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
                    
                    // Super smooth gradient matching true lantern/flashlight falloff
                    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');     
                    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.85)'); 
                    grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.35)'); 
                    grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.08)');  
                    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');      
                    
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, 256, 256);
                    
                    if (this.textures.exists('radial_light')) this.textures.remove('radial_light');
                    this.textures.addCanvas('radial_light', canvas);
                }

                generatePixelNuts() {
                    const canvas = document.createElement('canvas');
                    canvas.width = 640; // 32 * 20
                    canvas.height = 32;
                    const ctx = canvas.getContext('2d')!;
                    
                    const drawNut = (idx: number, style: any) => {
                        const ox = idx * 32;
                        
                        // 1. Draw Body (The lower nut part)
                        ctx.fillStyle = style.body;
                        // Elongated tapered shape
                        ctx.fillRect(ox + 10, 14, 12, 10);
                        ctx.fillRect(ox + 12, 24, 8, 4);
                        ctx.fillRect(ox + 14, 28, 4, 2);
                        ctx.fillRect(ox + 8, 16, 16, 6);
                        
                        // 2. Draw Cap (The top part)
                        ctx.fillStyle = style.cap;
                        ctx.fillRect(ox + 6, 10, 20, 6);
                        ctx.fillRect(ox + 8, 8, 16, 2);
                        ctx.fillRect(ox + 10, 6, 12, 2);
                        
                        // 3. Stem
                        ctx.fillStyle = style.stem || '#4a2f1d';
                        ctx.fillRect(ox + 15, 2, 2, 4);
                        
                        // 4. Shading / Highlights
                        ctx.fillStyle = style.highlight;
                        ctx.fillRect(ox + 10, 12, 4, 2); // Cap highlight
                        ctx.fillRect(ox + 10, 16, 2, 4); // Body highlight
                        
                        // 5. Unique Texture Pattern
                        if (style.pattern === 'dots') {
                            ctx.fillStyle = style.accent;
                            ctx.fillRect(ox + 12, 20, 2, 2);
                            ctx.fillRect(ox + 18, 18, 2, 2);
                        } else if (style.pattern === 'stripes') {
                            ctx.fillStyle = style.accent;
                            ctx.fillRect(ox + 10, 18, 12, 2);
                        } else if (style.pattern === 'rough') {
                            ctx.fillStyle = style.accent;
                            ctx.fillRect(ox + 8, 12, 2, 2);
                            ctx.fillRect(ox + 22, 12, 2, 2);
                        }
                    };

                    const nutStyles = [
                        { body: '#d4aa79', cap: '#8c6b4a', highlight: '#e6bd8b', accent: '#7a5230', pattern: 'dots' },    // 0: almond
                        { body: '#a67c52', cap: '#5c3c23', highlight: '#d4aa79', accent: '#3d2b1f', pattern: 'rough' },   // 1: brazil
                        { body: '#e6bd8b', cap: '#c29867', highlight: '#fff5d1', accent: '#8c6b4a', pattern: 'none' },    // 2: cashew
                        { body: '#8c4a2a', cap: '#5c3c23', highlight: '#b5653b', accent: '#4a2f1d', pattern: 'stripes' }, // 3: chestnut
                        { body: '#c29867', cap: '#8c6b4a', highlight: '#d4aa79', accent: '#7a5230', pattern: 'dots' },    // 4: hazelnut
                        { body: '#e4d6a7', cap: '#c4b687', highlight: '#fff5d1', accent: '#8c6b4a', pattern: 'none' },    // 5: macadamia
                        { body: '#d4aa79', cap: '#a67c52', highlight: '#e6bd8b', accent: '#8c4a2a', pattern: 'stripes' }, // 6: peanut
                        { body: '#5c3c23', cap: '#3d2b1f', highlight: '#8c6b4a', accent: '#1a0a05', pattern: 'rough' },   // 7: pecan
                        { body: '#d4c697', cap: '#b4a677', highlight: '#e4d6a7', accent: '#8c6b4a', pattern: 'dots' },    // 8: pine
                        { body: '#a69e52', cap: '#8c842a', highlight: '#c2ba67', accent: '#5c541a', pattern: 'rough' },   // 9: pistachio
                        { body: '#8c6b4a', cap: '#5c3c23', highlight: '#d4aa79', accent: '#4a2f1d', pattern: 'dots' },    // 10: walnut
                        { body: '#4ade80', cap: '#22c55e', highlight: '#86efac', accent: '#166534', pattern: 'stripes' }, // 11: buncis
                        { body: '#a3e635', cap: '#65a30d', highlight: '#d9f99d', accent: '#3f6212', pattern: 'none' },    // 12: kacang hijau
                        { body: '#1f2937', cap: '#111827', highlight: '#4b5563', accent: '#000000', pattern: 'rough' },   // 13: kacang hitam
                        { body: '#34d399', cap: '#10b981', highlight: '#6ee7b7', accent: '#047857', pattern: 'dots' },    // 14: kacang kapri
                        { body: '#ef4444', cap: '#dc2626', highlight: '#fca5a5', accent: '#7f1d1d', pattern: 'none' },    // 15: kacang merah
                        { body: '#16a34a', cap: '#15803d', highlight: '#4ade80', accent: '#14532d', pattern: 'stripes' }, // 16: kacang panjang
                        { body: '#fef08a', cap: '#fde047', highlight: '#fef9c3', accent: '#ca8a04', pattern: 'rough' },   // 17: kacang pili
                        { body: '#facc15', cap: '#eab308', highlight: '#fef08a', accent: '#854d0e', pattern: 'none' },    // 18: kedelai
                        { body: '#f8fafc', cap: '#e2e8f0', highlight: '#ffffff', accent: '#94a3b8', pattern: 'dots' }     // 19: koro
                    ];

                    nutStyles.forEach((s, i) => drawNut(i, s));
                    
                    if (this.textures.exists('pixel_nuts')) this.textures.remove('pixel_nuts');
                    const tex = this.textures.addCanvas('pixel_nuts', canvas);
                    for(let i=0; i<20; i++) tex!.add(i, 0, i*32, 0, 32, 32);
                }

                generatePetTextures() {
                    const colors = {
                        squirrel: '#8c6b4a',
                        squirrel_belly: '#e4d6a7',
                        firefly: '#d4ff33',
                        fox: '#ea580c',
                        fox_belly: '#ffffff',
                        deer: '#22d3ee',
                        raven: '#0f172a',
                        red: '#ef4444'
                    };

                    // 1. Squirrel (Frame 0)
                    const canvasS = document.createElement('canvas');
                    canvasS.width = 16; canvasS.height = 16;
                    const ctxS = canvasS.getContext('2d')!;
                    ctxS.fillStyle = colors.squirrel;
                    ctxS.fillRect(4, 4, 8, 8); // body
                    ctxS.fillStyle = colors.squirrel_belly;
                    ctxS.fillRect(6, 6, 4, 6); // belly
                    ctxS.fillStyle = colors.squirrel;
                    ctxS.fillRect(2, 2, 4, 4); // tail
                    ctxS.fillStyle = '#000000';
                    ctxS.fillRect(10, 5, 1, 1); // eye
                    if (this.textures.exists('companion_squirrel')) this.textures.remove('companion_squirrel');
                    this.textures.addCanvas('companion_squirrel', canvasS);

                    // 2. Firefly
                    const canvasF = document.createElement('canvas');
                    canvasF.width = 16; canvasF.height = 16;
                    const ctxF = canvasF.getContext('2d')!;
                    ctxF.fillStyle = 'rgba(212, 255, 51, 0.4)';
                    ctxF.beginPath(); ctxF.arc(8, 8, 6, 0, Math.PI*2); ctxF.fill(); // glow
                    ctxF.fillStyle = colors.firefly;
                    ctxF.beginPath(); ctxF.arc(8, 8, 3, 0, Math.PI*2); ctxF.fill(); // center
                    ctxF.fillStyle = '#ffffff';
                    ctxF.fillRect(6, 6, 1, 1); ctxF.fillRect(9, 6, 1, 1); // wings
                    if (this.textures.exists('companion_firefly')) this.textures.remove('companion_firefly');
                    this.textures.addCanvas('companion_firefly', canvasF);

                    // 3. Fox
                    const canvasFox = document.createElement('canvas');
                    canvasFox.width = 16; canvasFox.height = 16;
                    const ctxFox = canvasFox.getContext('2d')!;
                    ctxFox.fillStyle = colors.fox;
                    ctxFox.fillRect(4, 5, 8, 7); // body
                    ctxFox.fillStyle = colors.fox_belly;
                    ctxFox.fillRect(6, 7, 4, 5); // belly
                    ctxFox.fillStyle = colors.fox;
                    ctxFox.fillRect(10, 3, 3, 5); // tail
                    ctxFox.fillStyle = colors.fox_belly;
                    ctxFox.fillRect(12, 3, 1, 2); // tail tip
                    ctxFox.fillStyle = '#000000';
                    ctxFox.fillRect(8, 6, 1, 1); // eye
                    if (this.textures.exists('companion_fox')) this.textures.remove('companion_fox');
                    this.textures.addCanvas('companion_fox', canvasFox);

                    // 4. Deer
                    const canvasD = document.createElement('canvas');
                    canvasD.width = 16; canvasD.height = 16;
                    const ctxD = canvasD.getContext('2d')!;
                    ctxD.fillStyle = 'rgba(34, 211, 238, 0.2)';
                    ctxD.beginPath(); ctxD.arc(8, 8, 7, 0, Math.PI*2); ctxD.fill(); // aura glow
                    ctxD.fillStyle = colors.deer;
                    ctxD.fillRect(5, 6, 6, 6); // body
                    ctxD.fillRect(8, 2, 3, 5); // neck/head
                    ctxD.fillStyle = '#ffffff';
                    ctxD.fillRect(6, 1, 1, 2); ctxD.fillRect(10, 1, 1, 2); // antlers
                    if (this.textures.exists('companion_deer')) this.textures.remove('companion_deer');
                    this.textures.addCanvas('companion_deer', canvasD);

                    // 5. Owl (Cosmic Watcher)
                    const canvasO = document.createElement('canvas');
                    canvasO.width = 16; canvasO.height = 16;
                    const ctxO = canvasO.getContext('2d')!;
                    ctxO.fillStyle = '#6b21a8'; // Purple body
                    ctxO.fillRect(4, 4, 8, 8); // body
                    ctxO.fillStyle = '#f3e8ff'; // Creamy belly
                    ctxO.fillRect(6, 7, 4, 5); // belly
                    ctxO.fillStyle = '#fbbf24'; // Glowing golden eyes
                    ctxO.fillRect(5, 5, 2, 2); 
                    ctxO.fillRect(9, 5, 2, 2);
                    ctxO.fillStyle = '#000000'; // Pupils
                    ctxO.fillRect(5, 6, 1, 1);
                    ctxO.fillRect(9, 6, 1, 1);
                    ctxO.fillStyle = '#f97316'; // Beak
                    ctxO.fillRect(7, 6, 2, 1);
                    if (this.textures.exists('companion_owl')) this.textures.remove('companion_owl');
                    this.textures.addCanvas('companion_owl', canvasO);

                    // 5. Raven
                    const canvasR = document.createElement('canvas');
                    canvasR.width = 16; canvasR.height = 16;
                    const ctxR = canvasR.getContext('2d')!;
                    ctxR.fillStyle = colors.raven;
                    ctxR.fillRect(5, 5, 7, 7); // body
                    ctxR.fillRect(8, 3, 4, 3); // head
                    ctxR.fillStyle = colors.red;
                    ctxR.fillRect(10, 4, 1, 1); // eye
                    ctxR.fillStyle = '#92400e'; // beak
                    ctxR.fillRect(12, 4, 2, 1);
                    if (this.textures.exists('companion_raven')) this.textures.remove('companion_raven');
                    this.textures.addCanvas('companion_raven', canvasR);
                }

                generateAssets() {
                    const MAP_SIZE = 60;
                    
                    // Generate tileset canvas
                    const tCanvas = document.createElement('canvas');
                    tCanvas.width = 160; tCanvas.height = 32;
                    const ctx = tCanvas.getContext('2d')!;
                    
                    const rect = (tx: number, x: number, y: number, w: number, h: number, col: string) => {
                        ctx.fillStyle = col; ctx.fillRect(tx*32 + x*2, y*2, w*2, h*2);
                    }
                    
                    // 0: Grass (x=0)
                    ctx.fillStyle = '#6a9c3e'; ctx.fillRect(0,0,32,32);
                    for(let j=0; j<15; j++) rect(0, Math.floor(Math.random()*16), Math.floor(Math.random()*16), 1, 1, Math.random() > 0.5 ? '#77ab49' : '#57852f');
                    
                    // 1: Path (x=1)
                    ctx.fillStyle = '#d4aa79'; ctx.fillRect(32,0,32,32);
                    for(let j=0; j<30; j++) rect(1, Math.floor(Math.random()*16), Math.floor(Math.random()*16), 1, 1, Math.random() > 0.5 ? '#c29867' : '#e6bd8b');

                    // 2: Water (x=2)
                    ctx.fillStyle = '#3f88c2'; ctx.fillRect(64,0,32,32);
                    for(let j=0; j<6; j++) rect(2, Math.floor(Math.random()*12), Math.floor(Math.random()*16), Math.floor(Math.random()*3)+2, 1, '#5aa0d9');

                    // 3: Tree (x=3)
                    rect(3, 6, 11, 4, 5, '#5c3c23');
                    rect(3, 4, 2, 8, 10, '#2b5e28');
                    rect(3, 2, 4, 12, 6, '#2b5e28');
                    rect(3, 5, 3, 6, 8, '#397535');
                    rect(3, 3, 5, 10, 4, '#397535');
                    rect(3, 6, 4, 3, 3, '#4c9147');

                    // 4: Rock (x=4)
                    rect(4, 3, 7, 10, 7, '#595959');
                    rect(4, 2, 8, 12, 5, '#595959');
                    rect(4, 4, 6, 8, 8, '#707070');
                    rect(4, 5, 7, 4, 3, '#8e8e8e');

                    if (this.textures.exists('tilesKey')) this.textures.remove('tilesKey');
                    this.textures.addCanvas('tilesKey', tCanvas);

                    if (this.textures.exists('tilesKey')) this.textures.remove('tilesKey');
                    this.textures.addCanvas('tilesKey', tCanvas);

                    // Generate player canvas as a sprite sheet
                    const pCanvas = document.createElement('canvas');
                    pCanvas.width = 128; // 4 columns (frames: idle, walk1, idle, walk2)
                    pCanvas.height = 128; // 4 rows (down, up, left, right)
                    const pCtx = pCanvas.getContext('2d')!;
                    
                    const drawPlayer = (pctx: CanvasRenderingContext2D, fX: number, fY: number, dir: number, frame: number) => {
                        const baseX = fX * 32;
                        const baseY = fY * 32;
                        const prect = (px: number, py: number, pw: number, ph: number, col: string) => {
                            pctx.fillStyle = col; pctx.fillRect(baseX + px * 2, baseY + py * 2, pw * 2, ph * 2);
                        };
                    
                        const skin = '#f5c69a';
                        const hair = characterConfig.hairColor || '#4a2f1d';
                        const shirt = characterConfig.shirtColor || '#497fa3';
                        const pants = '#354359';
                    
                        // Body
                        prect(5,6,6,7, shirt);
                        
                        // Head
                        if (dir === 1) { // Up
                            prect(5,1,6,5, hair); // back of head
                            prect(4,0,8,3, hair);
                            prect(4,0,2,5, hair); prect(10,0,2,5, hair);
                        } else {
                            prect(5,1,6,5, skin); // face
                            prect(4,0,8,3, hair); prect(4,0,2,5, hair); prect(10,0,2,5, hair);
                        }
                    
                        let lLegY = 13, rLegY = 13;
                        if (frame === 1) { lLegY = 12; rLegY = 14; }
                        if (frame === 3) { lLegY = 14; rLegY = 12; }
                        
                        if (dir === 2) { // Left
                            if (frame === 1 || frame === 3) prect(6,12,2,3, pants);
                            else prect(6,13,2,3, pants);
                            prect(6,6,2,5, shirt);
                            prect(6,11,2,2, skin);
                        } else if (dir === 3) { // Right
                            if (frame === 1 || frame === 3) prect(8,12,2,3, pants);
                            else prect(8,13,2,3, pants);
                            prect(8,6,2,5, shirt);
                            prect(8,11,2,2, skin);
                        } else { // Down/Up
                            prect(5, lLegY, 2, 3, pants);
                            prect(9, rLegY, 2, 3, pants);
                            prect(3,6,2,5, shirt); prect(11,6,2,5, shirt);
                            prect(3,11,2,2, skin); prect(11,11,2,2, skin);
                        }
                    }

                    for(let dir=0; dir<4; dir++) {
                        for(let frame=0; frame<4; frame++) {
                            drawPlayer(pCtx, frame, dir, dir, frame);
                        }
                    }

                    if (this.textures.exists('playerKey')) this.textures.remove('playerKey');
                    const tex = this.textures.addCanvas('playerKey', pCanvas);
                    for(let d=0; d<4; d++) {
                        for(let f=0; f<4; f++) {
                            tex!.add(d*4 + f, 0, f*32, d*32, 32, 32);
                        }
                    }

                    // Create animations
                    const directions = ['down', 'up', 'left', 'right'];
                    directions.forEach((dir, i) => {
                        this.anims.create({
                            key: 'walk_' + dir,
                            frames: [
                                { key: 'playerKey', frame: i*4 + 1 },
                                { key: 'playerKey', frame: i*4 + 0 },
                                { key: 'playerKey', frame: i*4 + 3 },
                                { key: 'playerKey', frame: i*4 + 0 }
                            ],
                            frameRate: 6,
                            repeat: -1
                        });
                        this.anims.create({
                            key: 'idle_' + dir,
                            frames: [{ key: 'playerKey', frame: i*4 + 0 }],
                            frameRate: 1,
                            repeat: -1
                        });
                    });

                    // Generate map definition
                    let groundData: number[][] = [];
                    let objectData: number[][] = [];
                    
                    const noiser = (x: number, y: number) => {
                        return Math.sin(x * 0.1) * Math.cos(y * 0.1) 
                             + Math.sin(x * 0.3 + y * 0.2) * 0.5;
                    };

                    for(let y=0; y<MAP_SIZE; y++) {
                        let gRow: number[] = [];
                        let oRow: number[] = [];
                        for(let x=0; x<MAP_SIZE; x++) {
                            if(x===0 || y===0 || x===MAP_SIZE-1 || y===MAP_SIZE-1) {
                                gRow.push(0); oRow.push(3); continue;
                            }
                            
                            let dist = Math.hypot(x - MAP_SIZE/2, y - MAP_SIZE/2);
                            let n = noiser(x, y);
                            
                            if (dist < 5) {
                                gRow.push(0); oRow.push(-1); 
                            } else if (dist < 10 && n > 0.5) {
                                gRow.push(1); oRow.push(-1);
                            } else {
                                if (n > 0.8) {
                                    gRow.push(2); oRow.push(-1); // water
                                } else if (n > 0.3 && n <= 0.8) {
                                    gRow.push(1); oRow.push(-1); // path
                                } else {
                                    gRow.push(0); // grass
                                    if (n < -0.8) {
                                        oRow.push(4); // rock
                                    } else if (n < -0.2 || Math.random() < 0.04) {
                                        oRow.push(3); // tree
                                    } else {
                                        oRow.push(-1);
                                    }
                                }
                            }
                        }
                        groundData.push(gRow);
                        objectData.push(oRow);
                    }

                    // Generate Minimap Texture (1 pixel per tile to save performance)
                    const miniCanvas = document.createElement('canvas');
                    miniCanvas.width = MAP_SIZE; miniCanvas.height = MAP_SIZE;
                    const miniCtx = miniCanvas.getContext('2d')!;
                    for(let y=0; y<MAP_SIZE; y++) {
                        for(let x=0; x<MAP_SIZE; x++) {
                            let g = groundData[y][x];
                            let o = objectData[y][x];
                            let color = '#6a9c3e'; // grass
                            if (g === 1) color = '#d4aa79'; // path
                            if (g === 2) color = '#3f88c2'; // water
                            if (o === 3) color = '#2b5e28'; // tree
                            if (o === 4) color = '#595959'; // rock
                            miniCtx.fillStyle = color;
                            miniCtx.fillRect(x, y, 1, 1);
                        }
                    }
                    if (this.textures.exists('minimapKey')) this.textures.remove('minimapKey');
                    this.textures.addCanvas('minimapKey', miniCanvas);

                    // Flood fill to find all reachable tiles from player spawn (center)
                    const isWalkable = (x: number, y: number) => {
                        if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) return false;
                        if (groundData[y][x] === 2) return false; // water
                        if (objectData[y][x] === 3 || objectData[y][x] === 4) return false; // tree, rock
                        return true;
                    };

                    const cx = Math.floor(MAP_SIZE / 2);
                    const cy = Math.floor(MAP_SIZE / 2);
                    const reachable = new Set<string>();
                    const queue: {x: number, y: number}[] = [{x: cx, y: cy}];
                    reachable.add(`${cx},${cy}`);

                    let head = 0;
                    while (head < queue.length) {
                        const {x, y} = queue[head++];
                        const neighbors = [[x-1, y], [x+1, y], [x, y-1], [x, y+1]];
                        for (const [nx, ny] of neighbors) {
                            if (isWalkable(nx, ny)) {
                                const key = `${nx},${ny}`;
                                if (!reachable.has(key)) {
                                    reachable.add(key);
                                    queue.push({x: nx, y: ny});
                                }
                            }
                        }
                    }

                    // Filter queue for valid spawn tiles
                    const validSpawnTiles = queue.filter(pos => {
                        const distFromCenter = Math.hypot(pos.x - cx, pos.y - cy);
                        // Make sure it's far from center, and no object is placed there
                        return distFromCenter > 8 && objectData[pos.y][pos.x] === -1;
                    });

                    // Generate nut spawn locations using rarity weights
                    const nutsLocations: {x: number, y: number, nutId: number}[] = [];
                    const pet = characterConfig.equippedPet;
                    
                    // Rarity configuration
                    const rarities = [
                        { name: 'Common', baseChance: 51 },
                        { name: 'Uncommon', baseChance: 31 },
                        { name: 'Rare', baseChance: 15.75 },
                        { name: 'Legendary', baseChance: 2 },
                        { name: 'Mythic', baseChance: 0.25 }
                    ];

                    // Apply Biome Modifiers
                    if (characterConfig.biome === 'night') {
                        // Night mode bonus: +10% overall rare spawns (shifts from common/uncommon)
                        rarities[0].baseChance -= 5;
                        rarities[1].baseChance -= 5;
                        rarities[2].baseChance += 5; // Rare
                        rarities[3].baseChance += 3;  // Legendary
                        rarities[4].baseChance += 2;  // Mythic
                    }

                    // Apply Pet Modifiers
                    if (pet?.id === 'fox') {
                        const level = pet.level || 1;
                        // Rare drop rate increase: +2% at Lv1 to +12% at Lv10
                        const rareBonus = Math.round(2 + ((level - 1) * 10) / 9);

                        // Epic (Legendary) drop rate increase: +1% at Lv1 to +10% at Lv10
                        const legendaryBonus = level;

                        // Apply spawn rate increases:
                        rarities[2].baseChance += rareBonus;       // Rare
                        rarities[3].baseChance += legendaryBonus;  // Legendary (Epic)

                        // Trade-off: spawn uncommon and common decreased
                        rarities[1].baseChance -= legendaryBonus;  // Uncommon
                        rarities[0].baseChance -= rareBonus;       // Common
                    } else if (pet?.id === 'deer') {
                        // Spirit Deer tradeoff: rarity legendary -1%
                        rarities[3].baseChance -= 1; // Legendary -1%
                        rarities[0].baseChance += 1; // Common +1% (balance)
                    } else if (pet?.id === 'raven') {
                        const ravenLevel = pet.level || 1;
                        // Rare: +4% at Lv1, +1% per level
                        const rareBonus = 4 + (ravenLevel - 1) * 1;
                        // Epic: +3% at Lv1, +1% per level
                        const epicBonus = 3 + (ravenLevel - 1) * 1;
                        // Legendary: +2% at Lv1, +1% per level
                        const legendaryBonus = 2 + (ravenLevel - 1) * 1;
                        // Mythic: +1% at Lv1, +1% per level
                        const mythicBonus = 1 + (ravenLevel - 1) * 1;

                        rarities[2].baseChance += rareBonus; // Rare
                        rarities[3].baseChance += epicBonus; // Legendary (Epic)
                        rarities[4].baseChance += (legendaryBonus + mythicBonus); // Mythic

                        // Trade-off: decrease Common and Uncommon to keep 100% total weight
                        const totalBonus = rareBonus + epicBonus + legendaryBonus + mythicBonus;
                        const commonReduction = Math.floor(totalBonus / 2);
                        const uncommonReduction = totalBonus - commonReduction;

                        rarities[0].baseChance -= commonReduction; // Common
                        rarities[1].baseChance -= uncommonReduction; // Uncommon
                    }

                    // Pre-calculate cumulative weights for weighted random
                    let totalWeight = 0;
                    const cumulativeWeights = rarities.map(r => {
                        totalWeight += Math.max(0, r.baseChance);
                        return { name: r.name, weight: totalWeight };
                    });

                    // Build nut pools per rarity
                    const nutPools: Record<string, number[]> = {
                        Common: [], Uncommon: [], Rare: [], Legendary: [], Mythic: []
                    };
                    nutsData.forEach(nut => {
                        if (nutPools[nut.rarity]) {
                            nutPools[nut.rarity].push(nut.id);
                        }
                    });

                    // Spawn exactly 10 nuts
                    while(nutsLocations.length < 10 && validSpawnTiles.length > 0) {
                        const rIndex = Math.floor(Math.random() * validSpawnTiles.length);
                        const selected = validSpawnTiles[rIndex];
                        validSpawnTiles.splice(rIndex, 1);
                        
                        // Pick rarity
                        const roll = Math.random() * totalWeight;
                        let selectedRarity = 'Common';
                        for (const r of cumulativeWeights) {
                            if (roll <= r.weight) {
                                selectedRarity = r.name;
                                break;
                            }
                        }

                        // Fallback to common if pool is somehow empty (should not happen with 20 nuts)
                        const pool = nutPools[selectedRarity].length > 0 ? nutPools[selectedRarity] : nutPools['Common'];
                        const selectedNutId = pool[Math.floor(Math.random() * pool.length)];

                        nutsLocations.push({ x: selected.x, y: selected.y, nutId: selectedNutId });
                        
                        // Remove nearby tiles to ensure good distribution (radius 5)
                        for (let i = validSpawnTiles.length - 1; i >= 0; i--) {
                            if (Math.hypot(validSpawnTiles[i].x - selected.x, validSpawnTiles[i].y - selected.y) < 5) {
                                validSpawnTiles.splice(i, 1);
                            }
                        }
                    }

                    // Lucky Fox Companion Spawn Adjustment (Obsolete, passive drop-rate shift is used instead)

                    // Pre-warm done, transfer to Game with a polished delay
                    this.time.delayedCall(500, () => {
                        window.dispatchEvent(new CustomEvent('WORLD_STATUS_READY'));

                        this.time.delayedCall(1500, () => {
                            window.dispatchEvent(new CustomEvent('WORLD_STATUS_FADEOUT'));
                            
                            this.time.delayedCall(1000, () => {
                                window.dispatchEvent(new CustomEvent('WORLD_STATUS_DONE'));
                                if (this.scene && this.scene.isActive('BootScene')) {
                                    this.scene.start('GameScene', { groundData, objectData, MAP_SIZE, nutsLocations });
                                }
                            });
                        });
                    });
                }
            }

            class GameScene extends Phaser.Scene {
                player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
                playerSprite!: Phaser.GameObjects.Sprite;
                playerContainer!: Phaser.GameObjects.Container;
                groundLayer!: Phaser.Tilemaps.TilemapLayer;
                cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
                wasd!: any;
                facing: string = 'down';
                
                minimapImage!: Phaser.GameObjects.Image;
                minimapBlip!: Phaser.GameObjects.Rectangle;
                playerNameText!: Phaser.GameObjects.Text;
                MAP_SIZE: number = 60;
                
                nutsGroup!: Phaser.GameObjects.Group;
                nutBlips!: Phaser.GameObjects.Rectangle[];
                interactionText!: Phaser.GameObjects.Text;
                activeNutIndex: number = -1;
                isPaused: boolean = false;
                isGameplayStarted: boolean = false;
                eKey!: Phaser.Input.Keyboard.Key;
                darknessTexture?: Phaser.Textures.CanvasTexture;
                darknessOverlay?: Phaser.GameObjects.Image;
                lanternGlow?: Phaser.GameObjects.Image;
                nightParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
                spookyEyesGroup?: Phaser.GameObjects.Group;

                // Companion pet systems
                petCompanion?: Phaser.GameObjects.Image;
                petGlow?: Phaser.GameObjects.Image;
                petEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
                deerAuraEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
                deerBoostEndTime?: number;
                lastRavenCueTime?: number;
                petSkillCooldownEnd?: number;
                petSkillEffectEnd?: number;
                nextStepTime: number = 0;

                // Track frame to avoid physics startup spikes
                isFirstFrame: boolean = true;

                constructor() {
                    super('GameScene');
                }

                create(data: any) {
                    this.isPaused = true;
                    this.physics.world.isPaused = true;

                    this.MAP_SIZE = data.MAP_SIZE || 60;
                    const groundData = data.groundData;
                    const objectData = data.objectData;

                    const map = this.make.tilemap({ tileWidth: 32, tileHeight: 32, width: this.MAP_SIZE, height: this.MAP_SIZE });
                    const tileset = map.addTilesetImage('tiles', 'tilesKey', 32, 32, 0, 0);

                    const groundLayer = map.createBlankLayer('Ground', tileset!, 0, 0);
                    this.groundLayer = groundLayer!;
                    const objectLayer = map.createBlankLayer('Objects', tileset!, 0, 0);

                    groundLayer!.putTilesAt(groundData, 0, 0);
                    objectLayer!.putTilesAt(objectData, 0, 0);
                    
                    groundLayer!.setCullPadding(2, 2);
                    objectLayer!.setCullPadding(2, 2);

                    groundLayer!.setCollision([2]); // water
                    objectLayer!.setCollision([3, 4]); // tree, rock

                    const worldWidth = this.MAP_SIZE * 32;
                    const worldHeight = this.MAP_SIZE * 32;

                    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

                    this.playerSprite = this.add.sprite(0, 0, 'playerKey', 0);
                    
                    this.playerNameText = this.add.text(0, -20, characterConfig.name || 'Explorer', {
                        font: '12px Arial',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 3
                    }).setOrigin(0.5);

                    this.playerContainer = this.add.container(worldWidth / 2, worldHeight / 2, [this.playerSprite, this.playerNameText]);
                    this.playerContainer.setDepth(50);
                    
                    this.physics.world.enable(this.playerContainer);
                    this.player = this.playerContainer as unknown as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
                    this.player.body.collideWorldBounds = true;
                    // Our sprite is centered locally at 0,0. We want the body to match the sprite's bottom half (16x16)
                    // The container's origin is effectively 0,0 relative to its physics body top-left, so we must set size and offset.
                    this.player.body.setSize(16, 16);
                    this.player.body.setOffset(-8, 0); // local offset within container bounds
                    
                    // Reusable collision bounds logic (faster than dynamic creation)
                    this.physics.add.collider(this.player, groundLayer!);
                    this.physics.add.collider(this.player, objectLayer!);

                    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
                    // Instant camera follow: setting lerpX/Y to 1
                    this.cameras.main.startFollow(this.player, true, 1, 1);
                    this.cameras.main.roundPixels = true;

                    // Setup static minimap UI using scrollFactor(0) for fixed positioning
                    const minimapContainer = this.add.container(10, 10).setScrollFactor(0);
                    minimapContainer.setDepth(100);
                    
                    if (characterConfig.biome === 'night') {
                        minimapContainer.setVisible(false);
                    }
                    
                    const uiMapSize = this.MAP_SIZE * 2;

                    // Background/Border
                    const mapBg = this.add.rectangle(0, 0, uiMapSize, uiMapSize, 0x002244, 1).setOrigin(0);
                    mapBg.setStrokeStyle(3, 0xffffff, 0.4);
                    minimapContainer.add(mapBg);

                    // The pre-rendered texture
                    this.minimapImage = this.add.image(0, 0, 'minimapKey').setOrigin(0);
                    this.minimapImage.setScale(2.0);
                    this.minimapImage.setAlpha(0.9);
                    minimapContainer.add(this.minimapImage);

                    this.nutsGroup = this.add.group();
                    this.nutBlips = [];

                    if (data.nutsLocations) {
                        data.nutsLocations.forEach((loc: {x: number, y: number, nutId: number}, i: number) => {
                            const worldX = loc.x * 32 + 16;
                            const worldY = loc.y * 32 + 16;
                            const nutId = loc.nutId;
                            
                            // Create a container for the nut
                            const container = this.add.container(worldX, worldY);
                            
                            // The collectible nut sprite using our generated pixel art
                            const nutSprite = this.add.sprite(0, 0, 'pixel_nuts', nutId);
                            nutSprite.setOrigin(0.5);
                            nutSprite.setScale(0.8); // 32px scaled down slightly
                            
                            // Subtle idle animation
                            this.tweens.add({
                                targets: nutSprite,
                                y: -6,
                                duration: 1500,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Sine.easeInOut'
                            });
                            
                            // Pulse effect
                            this.tweens.add({
                                targets: nutSprite,
                                scaleX: 0.85,
                                scaleY: 0.85,
                                duration: 2000,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Sine.easeInOut'
                            });
                            
                            // Gentle idle glow (tint variation)
                            this.tweens.add({
                                targets: nutSprite,
                                tint: 0xffffaa, // Slightly yellowish glow
                                duration: 1000,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Linear'
                            });
                            
                            container.add(nutSprite);
                            container.setData('index', nutId);
                            container.setData('sprite', nutSprite);
                            
                            this.nutsGroup.add(container);
                            
                            // Add physics body to container for interaction
                            this.physics.world.enable(container);
                            const body = container.body as Phaser.Physics.Arcade.Body;
                            body.setCircle(16);
                            body.setOffset(-16, -16); // Center the 16-radius circle on 0,0
                            
                            // nut blip on minimap
                            const px = loc.x / this.MAP_SIZE;
                            const py = loc.y / this.MAP_SIZE;
                            const blip = this.add.rectangle(px * uiMapSize, py * uiMapSize, 4, 4, 0xffd700).setOrigin(0.5);
                            this.nutBlips.push(blip);
                            minimapContainer.add(blip);

                            // Handle nut interaction (proximate or click)
                            let isCollected = false;
                            container.setData('onInteract', () => {
                                if (isCollected) return;
                                isCollected = true;
                                
                                // Visual feedback
                                audioManager.playSfx('collect');
                                
                                // Particle effect
                                this.createSparkles(container.x, container.y);
                                
                                this.tweens.add({
                                    targets: container,
                                    scaleX: 1.5,
                                    scaleY: 1.5,
                                    alpha: 0,
                                    duration: 400,
                                    ease: 'Back.easeIn',
                                    onComplete: () => {
                                        audioManager.playSfx('discover');
                                        this.events.emit('nutCollected', nutId, i);
                                        container.destroy();
                                    }
                                });
                            });
                        });
                    }

                    // The player blip on the minimap
                    this.minimapBlip = this.add.rectangle(0, 0, 4, 4, 0xff0000).setOrigin(0.5);
                    minimapContainer.add(this.minimapBlip);

                    this.interactionText = this.add.text(0, 0, 'Press E to Interact', {
                        font: '12px Arial',
                        backgroundColor: '#000000aa',
                        color: '#ffffff',
                        padding: { x: 4, y: 2 }
                    }).setOrigin(0.5).setDepth(200).setVisible(false);
                    
                    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
                    
                    window.addEventListener('resumeGame', () => {
                        this.isPaused = false;
                    });
                    window.addEventListener('pauseGame', () => {
                        this.isPaused = true;
                    });

                    // @ts-ignore
                    this.cursors = this.input.keyboard.createCursorKeys();
                    // @ts-ignore
                    this.wasd = {
                        up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                        down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                        left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                        right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                    };
                    
                    this.isFirstFrame = true;

                    // Black overlay covering everything while map is settling
                    const cx = this.cameras.main.centerX;
                    const cy = this.cameras.main.centerY;
                    const loadingRect = this.add.rectangle(cx, cy, 9999, 9999, 0x000000).setScrollFactor(0).setDepth(9999);
                    
                    if (characterConfig.biome === 'night') {
                        // Create a CanvasTexture of size 640x360 named 'darkness_mask'
                        this.darknessTexture = this.textures.createCanvas('darkness_mask', 640, 360) as Phaser.Textures.CanvasTexture;
                        this.darknessOverlay = this.add.image(0, 0, 'darkness_mask');
                        this.darknessOverlay.setOrigin(0, 0);
                        this.darknessOverlay.setScrollFactor(0);
                        this.darknessOverlay.setDepth(150);

                        // Warm ambient lantern glow centered on the player
                        this.lanternGlow = this.add.image(0, 0, 'radial_light');
                        this.lanternGlow.setDepth(151); // placed slightly above the dark mask
                        this.lanternGlow.setBlendMode(Phaser.BlendModes.ADD);
                        
                        // Much colder/darker tint for tiles to fit the true horror atmosphere
                        groundLayer!.setTint(0x1a243a); // Dark cold navy blue
                        objectLayer!.setTint(0x1a243a);

                        // Ambient nighttime fog/mist particles
                        this.nightParticles = this.add.particles(0, 0, 'pixel_nuts', {
                            frame: 0,
                            x: { min: 0, max: worldWidth },
                            y: { min: 0, max: worldHeight },
                            quantity: 1,
                            frequency: 120,
                            lifespan: 6000,
                            speedY: { min: -1, max: -3 },
                            speedX: { min: -2, max: 2 },
                            scale: { start: 0.12, end: 0 },
                            alpha: { start: 0.25, end: 0 },
                            tint: 0xdddddd,
                            blendMode: 'NORMAL'
                        });
                        this.nightParticles.setDepth(149);

                        // Setup spooky eyes group and spawn initially
                        this.spookyEyesGroup = this.add.group();
                        for (let i = 0; i < 15; i++) {
                            // @ts-ignore
                            this.spawnSpookyEyes(worldWidth, worldHeight);
                        }
                    }

                    // Defer startup to ensure rendering has completed and huge delta gets flushed
                    this.events.once('update', () => {
                        this.time.delayedCall(500, () => {
                            loadingRect.destroy();
                            
                            this.cameras.main.fadeIn(300, 0, 0, 0);
                            
                            this.isFirstFrame = false;
                            
                            // Trigger React Dialogue
                            window.dispatchEvent(new CustomEvent('GAME_READY_EVENT'));
                        });
                    });

                    const startGameplayHandler = () => {
                        this.physics.world.isPaused = false;
                        this.isPaused = false;
                        this.isGameplayStarted = true;
                        this.showTutorialPrompt();
                    };
                    window.addEventListener('START_GAMEPLAY_EVENT', startGameplayHandler);
                    this.events.on('destroy', () => {
                        window.removeEventListener('START_GAMEPLAY_EVENT', startGameplayHandler);
                    });

                    this.events.on('nutCollected', (nutId: number, blipIndex: number) => {
                        const collectedNut = nutsData.find(n => n.id === nutId) || nutsData[0];
                        window.dispatchEvent(new CustomEvent('showNutModal', { detail: collectedNut }));
                        if (this.nutBlips[blipIndex]) this.nutBlips[blipIndex].destroy();

                        // Award 5 Nut Coins per nut found
                        try {
                            const currentCoins = parseInt(localStorage.getItem('sawit_village_nut_coins') || '200');
                            const nextCoins = currentCoins + 5;
                            localStorage.setItem('sawit_village_nut_coins', nextCoins.toString());
                            
                            const storedHistory = localStorage.getItem('sawit_village_spin_history');
                            const history = storedHistory ? JSON.parse(storedHistory) : [];
                            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            const message = `[${timestamp}] Found ${collectedNut.name} (+5 Coins)`;
                            history.unshift({ message, id: Date.now() });
                            localStorage.setItem('sawit_village_spin_history', JSON.stringify(history));
                        } catch (e) {
                            console.error(e);
                        }

                        // Spirit Deer collection speed burst
                        if (characterConfig.equippedPet?.id === 'deer') {
                            this.deerBoostEndTime = this.time.now + 3000; // 3 seconds speed boost
                        }
                    });

                    // Spawn floating companion pet
                    if (characterConfig.equippedPet) {
                        const petId = characterConfig.equippedPet.id;
                        const textureKey = `companion_${petId}`;
                        
                        this.petCompanion = this.add.image(this.playerContainer.x - 20, this.playerContainer.y - 15, textureKey);
                        this.petCompanion.setOrigin(0.5);
                        this.petCompanion.setDepth(51); // draw slightly above player
                        this.physics.world.enable(this.petCompanion);
                        
                        if (characterConfig.biome === 'night') {
                            this.petGlow = this.add.image(this.petCompanion.x, this.petCompanion.y, 'radial_light');
                            this.petGlow.setDepth(151); // draw slightly above dark mask
                            this.petGlow.setBlendMode(Phaser.BlendModes.ADD);
                        }

                        // Init passive skill cooldown tracking
                        this.petSkillCooldownEnd = 0;   // timestamp when next activation is allowed
                        this.petSkillEffectEnd = 0;      // timestamp when current effect ends

                        // Premium customized companion pet particle emitter
                        let emitterConfig: any = null;
                        
                        switch (petId) {
                            case 'squirrel':
                                emitterConfig = {
                                    frame: 0,
                                    lifespan: 800,
                                    speed: { min: 5, max: 15 },
                                    angle: { min: 0, max: 360 },
                                    scale: { start: 0.08, end: 0 },
                                    alpha: { start: 0.5, end: 0 },
                                    quantity: 1,
                                    frequency: 180,
                                    tint: 0xd4c697, // Golden acorn sparkles
                                    blendMode: 'ADD'
                                };
                                break;
                            case 'firefly':
                                emitterConfig = {
                                    frame: 8,
                                    lifespan: 1200,
                                    speed: { min: 10, max: 25 },
                                    angle: { min: 0, max: 360 },
                                    scale: { start: 0.1, end: 0 },
                                    alpha: { start: 0.6, end: 0 },
                                    quantity: 1,
                                    frequency: 120,
                                    tint: 0x99ff33, // neon firefly green
                                    blendMode: 'ADD'
                                };
                                break;
                            case 'owl':
                                emitterConfig = {
                                    frame: 9,
                                    lifespan: 1000,
                                    speed: { min: 8, max: 18 },
                                    angle: { min: 0, max: 360 },
                                    scale: { start: 0.1, end: 0 },
                                    alpha: { start: 0.5, end: 0 },
                                    quantity: 1,
                                    frequency: 150,
                                    tint: 0x805ad5, // Cosmic violet vision sparks
                                    blendMode: 'ADD'
                                };
                                break;
                            case 'fox':
                                emitterConfig = {
                                    frame: 1,
                                    lifespan: 900,
                                    speed: { min: 10, max: 22 },
                                    angle: { min: 0, max: 360 },
                                    scale: { start: 0.1, end: 0 },
                                    alpha: { start: 0.55, end: 0 },
                                    quantity: 1,
                                    frequency: 140,
                                    tint: 0xed8936, // Vibrant lucky orange fireflies
                                    blendMode: 'ADD'
                                };
                                break;
                            case 'deer':
                                emitterConfig = {
                                    frame: 3,
                                    lifespan: 1100,
                                    speed: { min: 8, max: 20 },
                                    angle: { min: 0, max: 360 },
                                    scale: { start: 0.09, end: 0 },
                                    alpha: { start: 0.5, end: 0 },
                                    quantity: 1,
                                    frequency: 130,
                                    tint: 0x38a169, // Forest emerald energy leaves
                                    blendMode: 'ADD'
                                };
                                break;
                            case 'raven':
                                emitterConfig = {
                                    frame: 5,
                                    lifespan: 1300,
                                    speed: { min: 12, max: 24 },
                                    angle: { min: 0, max: 360 },
                                    scale: { start: 0.12, end: 0 },
                                    alpha: { start: 0.45, end: 0 },
                                    quantity: 1,
                                    frequency: 110,
                                    tint: 0xe53e3e, // Mystical mythical red shadow embers
                                    blendMode: 'ADD'
                                };
                                break;
                        }

                        if (emitterConfig && this.petCompanion) {
                            this.petEmitter = this.add.particles(0, 0, 'pixel_nuts', emitterConfig);
                            // Emitter follows the pet companion itself, making it follow the delay lag and look incredibly responsive!
                            this.petEmitter.startFollow(this.petCompanion);
                            this.petEmitter.setDepth(55); // draw above player but under dark mask
                        }
                    }
                }
                
                spawnSpookyEyes(worldWidth: number, worldHeight: number) {
                    const rx = Phaser.Math.Between(100, worldWidth - 100);
                    const ry = Phaser.Math.Between(100, worldHeight - 100);
                    
                    const eyes = this.add.graphics({ x: rx, y: ry });
                    // Spooky glowing red eyes!
                    eyes.fillStyle(0xff3333, 1.0);
                    eyes.fillCircle(-6, 0, 2);      // Left eye
                    eyes.fillCircle(6, 0, 2);       // Right eye
                    eyes.setDepth(160);             // Render above the darkness mask!
                    eyes.setAlpha(0);
                    
                    // Fade them in slowly
                    this.tweens.add({
                        targets: eyes,
                        alpha: { start: 0, to: Phaser.Math.FloatBetween(0.5, 0.95) },
                        duration: Phaser.Math.Between(1500, 3000),
                        ease: 'Sine.easeInOut'
                    });
                    
                    eyes.setData('x', rx);
                    eyes.setData('y', ry);
                    
                    if (this.spookyEyesGroup) {
                        this.spookyEyesGroup.add(eyes);
                    }
                }
                
                showTutorialPrompt() {
                    const promptBg = this.add.rectangle(0, 0, 140, 26, 0xe4d6a7).setOrigin(0.5);
                    promptBg.setStrokeStyle(3, 0x8c6b4a);
                    
                    const pointer = this.add.triangle(0, 13, -5, 0, 5, 0, 0, 5, 0xe4d6a7).setOrigin(0.5);
                    pointer.setStrokeStyle(3, 0x8c6b4a);
                    // cover top stroke of triangle
                    const patch = this.add.rectangle(0, 12, 10, 4, 0xe4d6a7);
                    
                    const promptText = this.add.text(0, 0, 'Use WASD to Move', {
                        font: '12px "Courier New", Courier, monospace',
                        color: '#4a2f1d',
                        fontStyle: 'bold'
                    }).setOrigin(0.5);
                    
                    const tutorialObj = this.add.container(0, -40, [promptBg, pointer, patch, promptText]).setAlpha(0).setDepth(200);
                    this.playerContainer.add(tutorialObj);
                    
                    this.tweens.add({
                        targets: tutorialObj,
                        alpha: 1,
                        y: -50,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            const floatTween = this.tweens.add({
                                targets: tutorialObj,
                                y: -54,
                                duration: 800,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Sine.easeInOut'
                            });
                            
                            this.time.delayedCall(3000, () => {
                                this.tweens.add({
                                    targets: tutorialObj,
                                    alpha: 0,
                                    y: -60,
                                    duration: 500,
                                    ease: 'Power2',
                                    onComplete: () => {
                                        floatTween.stop();
                                        tutorialObj.destroy();
                                    }
                                });
                            });
                        }
                    });
                }

                createSparkles(x: number, y: number) {
                    for (let i = 0; i < 12; i++) {
                        const sparkle = this.add.circle(x, y, 2, 0xfff5d1);
                        const angle = Math.random() * Math.PI * 2;
                        const dist = 20 + Math.random() * 40;
                        this.tweens.add({
                            targets: sparkle,
                            x: x + Math.cos(angle) * dist,
                            y: y + Math.sin(angle) * dist,
                            alpha: 0,
                            scale: 0,
                            duration: 600 + Math.random() * 400,
                            ease: 'Cubic.easeOut',
                            onComplete: () => sparkle.destroy()
                        });
                    }
                }

                update(time: number, delta: number) {
                    if (this.isFirstFrame) {
                        return;
                    }

                    if (this.isPaused) {
                        this.player.body.setVelocity(0, 0);
                        this.playerSprite.anims.stop();
                        return;
                    }

                    let speed = 150;
                    const pet = characterConfig.equippedPet;
                    if (pet) {
                        if (pet.id === 'deer') {
                            const deerLevel = pet.level || 1;
                             // Passive Speed: +0.2 (+2% speed increase) at Lv1, +0.2 (+2% speed increase) per level
                             const passiveMultiplier = 1.0 + (2 + (deerLevel - 1) * 2) / 100;
                             speed *= passiveMultiplier;
                            
                             // Temporary speed collection burst: +0.5 (+5% speed increase) per level for 3 seconds constant duration
                             if (this.deerBoostEndTime && this.time.now < this.deerBoostEndTime) {
                                 const activeMultiplier = 1.0 + (deerLevel * 5) / 100;
                                 speed *= activeMultiplier;
                                
                                // Cyan trailing speed aura
                                if (!this.deerAuraEmitter) {
                                    this.deerAuraEmitter = this.add.particles(0, 0, 'pixel_nuts', {
                                        frame: 5,
                                        lifespan: 300,
                                        speed: 0,
                                        scale: { start: 0.12, end: 0 },
                                        alpha: { start: 0.5, end: 0 },
                                        quantity: 1,
                                        frequency: 60,
                                        tint: 0x00ffff,
                                        blendMode: 'ADD'
                                    });
                                    this.deerAuraEmitter.startFollow(this.playerContainer);
                                    this.deerAuraEmitter.setDepth(49);
                                }
                            } else {
                                if (this.deerAuraEmitter) {
                                    this.deerAuraEmitter.destroy();
                                    this.deerAuraEmitter = undefined;
                                }
                            }
                        } else if (pet.id === 'raven') {
                            const ravenLevel = pet.level || 1;
                            // Passive Speed: +0.5% at Lv1, +0.2% per level (+0.5% to +2.3%)
                            const passiveMultiplier = 1.0 + (0.5 + (ravenLevel - 1) * 0.2) / 100;
                            speed *= passiveMultiplier;
                        }
                    }

                    // ─── Passive Skill System ──────────────────────────────────
                    if (pet && pet.id !== 'squirrel') {
                        const petLevel = pet.level || 1;
                        const now = this.time.now;

                        // ── Freeze Firefly: ACTIVE pause timeScale ────────────
                        if (pet.id === 'firefly') {
                            const cooldownMs = Math.max(12, 30 - (petLevel - 1) * 2) * 1000;
                            const freezeDurationS = 3 + Math.floor((petLevel - 1) / 2);
                            const freezeDurationMs = freezeDurationS * 1000;

                            // Active skill triggering via SPACE
                            if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
                                if (!this.petSkillCooldownEnd || now >= this.petSkillCooldownEnd) {
                                    // Activate freeze cooldown
                                    this.petSkillCooldownEnd = now + cooldownMs;
                                    this.petSkillEffectEnd = now + freezeDurationMs;
                                    
                                    // Dispatch custom event to freeze React timer logic
                                    window.dispatchEvent(new CustomEvent('FREEZE_TIMER', { detail: freezeDurationMs }));
                                    
                                    audioManager.playSfx('discover');

                                    // Visual: green flash on firefly
                                    if (this.petCompanion) {
                                        this.tweens.add({
                                            targets: this.petCompanion,
                                            scale: { from: 1.5, to: 1 },
                                            alpha: { from: 1, to: 0.2 },
                                            duration: 200, yoyo: true, repeat: 4
                                        });
                                    }
                                }
                            }

                            // Clear effect marker
                            if (this.petSkillEffectEnd && now >= this.petSkillEffectEnd) {
                                this.petSkillEffectEnd = 0;
                            }
                        }


                    }
                    // ──────────────────────────────────────────────────────────

                    this.player.body.setVelocity(0, 0);

                    let dx = 0; let dy = 0;

                    if (this.cursors.left.isDown || this.wasd.left.isDown) dx = -1;
                    else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;

                    if (this.cursors.up.isDown || this.wasd.up.isDown) dy = -1;
                    else if (this.cursors.down.isDown || this.wasd.down.isDown) dy = 1;

                    if (dx !== 0 && dy !== 0) {
                        dx *= Math.SQRT1_2;
                        dy *= Math.SQRT1_2;
                    }

                    this.player.body.setVelocityX(dx * speed);
                    this.player.body.setVelocityY(dy * speed);
                    
                    if (dx !== 0 || dy !== 0) {
                        if (!(this as any).playerHasMoved) {
                            (this as any).playerHasMoved = true;
                            window.dispatchEvent(new CustomEvent('PLAYER_MOVED'));
                        }
                        if (dx < 0) this.facing = 'left';
                        else if (dx > 0) this.facing = 'right';
                        else if (dy < 0) this.facing = 'up';
                        else if (dy > 0) this.facing = 'down';
                        this.playerSprite.anims.play('walk_' + this.facing, true);

                        // Procedural footstep sounds based on ground grass/sand tiles
                        if (!this.nextStepTime || this.time.now >= this.nextStepTime) {
                            const tile = this.groundLayer.getTileAtWorldXY(this.player.x, this.player.y);
                            const tileIndex = tile ? tile.index : 0;
                            const stepType = tileIndex === 1 ? 'sand' : 'grass';
                            audioManager.playStep(stepType);
                            this.nextStepTime = this.time.now + 280; // step every 280ms while walking
                        }
                    } else {
                        this.playerSprite.anims.play('idle_' + this.facing, true);
                    }

                    let closestDist = 9999;
                    let closestNut: any = null;

                    const squirrelLevel = pet?.level || 1;
                    // Squirrel auto-collect radius: 28px at Lvl 1, +8px per level
                    const squirrelAutoRadius = pet?.id === 'squirrel' ? (28 + (squirrelLevel - 1) * 8) : 0;
                    const squirrelBonus = pet?.id === 'squirrel' ? (1.05 + (squirrelLevel - 1) * 0.02) : 1.0;
                    const detectionRadius = 60 * squirrelBonus;
                    const interactionRadius = 40 * squirrelBonus;

                    this.nutsGroup.getChildren().forEach((child: any) => {
                         const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, child.x, child.y);
                         
                         // Squirrel auto-collect: silently collect within 1 tile radius, no E press needed
                         if (squirrelAutoRadius > 0 && dist < squirrelAutoRadius) {
                             const onInteract = child.getData('onInteract');
                             if (onInteract) {
                                 child.setData('onInteract', null); // prevent double-trigger
                                 this.isPaused = true;
                                 onInteract();
                             }
                             return;
                         }
                         
                         if (dist < detectionRadius) {
                             if (dist < closestDist) {
                                 closestDist = dist;
                                 closestNut = child;
                             }
                         }

                         // Nutty Squirrel "Treasure Sniff" nearby blink indicator
                         if (pet?.id === 'squirrel') {
                             const sprite = child.getData('sprite');
                             if (sprite) {
                                 if (dist < 150) {
                                     const alpha = 0.5 + 0.5 * Math.sin(this.time.now * 0.008);
                                     sprite.setAlpha(alpha);
                                     sprite.setTint(0x9ae6b4);
                                 } else {
                                     sprite.setAlpha(1.0);
                                     sprite.setTint(0xffffff);
                                 }
                             }
                         }
                    });

                    if (closestNut && closestDist < interactionRadius) {
                         this.interactionText.setVisible(true);
                         this.interactionText.setPosition(closestNut.x, closestNut.y - 30);
                         this.interactionText.setText('Press E to Interact');

                         if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                             this.isPaused = true;
                             closestNut.getData('onInteract')();
                         }
                    } else {
                         // Reset all nuts to normal brightness (if not squirrel)
                         if (pet?.id !== 'squirrel') {
                             this.nutsGroup.getChildren().forEach((child: any) => {
                                 const sprite = child.getData('sprite');
                                 if (sprite) {
                                     sprite.setAlpha(1.0);
                                     sprite.setTint(0xffffff);
                                 }
                             });
                         }
                         
                         this.interactionText.setVisible(false);
                         this.activeNutIndex = -1;
                    }

                    // Highlight closest nut
                    if (closestNut && closestDist < interactionRadius) {
                         const sprite = closestNut.getData('sprite');
                         if (sprite) sprite.setTint(0xffffcc); // Slightly brighten
                    }

                    if (this.darknessTexture) {
                        const cam = this.cameras.main;
                        const cx = this.cameras.main.centerX;

                        // Calculate screen position of player
                        const screenX = this.player.x - cam.scrollX;
                        const screenY = this.player.y - cam.scrollY;

                        // Get canvas context and dimensions
                        const ctx = this.darknessTexture.context;
                        
                        // 1. Clear the canvas
                        ctx.clearRect(0, 0, 640, 360);

                        // 2. Draw solid black rectangle over the entire screen (100% opaque)
                        ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
                        ctx.fillRect(0, 0, 640, 360);

                        // 3. Setup flashlight cutout using destination-out composite mode
                        ctx.globalCompositeOperation = 'destination-out';

                        let baseScale = 0.80;

                        // Owl Watcher: permanent night visibility scaling (+0.30 per level)
                        if (pet?.id === 'owl') {
                            const owlLevel = pet.level || 1;
                            baseScale += (owlLevel * 0.30);
                        }
                        // Glow Firefly ambient light — moderate bonus
                        else if (pet?.id === 'firefly') {
                            const fireflyLevel = pet.level || 1;
                            baseScale += (0.10 + (fireflyLevel - 1) * 0.02);
                        }
                        else if (pet?.id === 'raven') {
                            const ravenLevel = pet.level || 1;
                            // Light scale: +0.20 at Lv1, +0.20 per level
                            baseScale += (0.20 + (ravenLevel - 1) * 0.20);
                        }
                        
                        // Soft flickering lantern light
                        const flicker = Math.sin(this.time.now * 0.009) * 0.035 + (Math.random() - 0.5) * 0.02;
                        const finalScale = baseScale + flicker;
                        const radius = 128 * finalScale;

                        // Create perfect smooth radial gradient cutout
                        const grad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
                        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');     // 100% transparent cutout at center
                        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.85)'); 
                        grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.3)');  
                        grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.05)'); 
                        grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');      // 100% solid black outside

                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
                        ctx.fill();

                        // Draw companion pet glow cutout (only after gameplay starts)
                        if (this.isGameplayStarted && this.petCompanion && pet) {
                            const petScreenX = this.petCompanion.x - cam.scrollX;
                            const petScreenY = this.petCompanion.y - cam.scrollY;
                            
                            let petBaseScale = 0.25; // Default small pet glow
                            
                            switch (pet.id) {
                                case 'squirrel':
                                    petBaseScale = 0.22;
                                    break;
                                case 'firefly':
                                    petBaseScale = 0.50; // Neon firefly glow
                                    break;
                                case 'owl':
                                    petBaseScale = 0.45; // Cosmic watcher glow
                                    break;
                                case 'fox':
                                    petBaseScale = 0.35; // Lucky fox glow
                                    break;
                                case 'deer':
                                    petBaseScale = 0.40; // Spirit deer aura
                                    break;
                                case 'raven':
                                    petBaseScale = 0.38; // Raven shadow glow
                                    break;
                            }
                            
                            const petFlicker = Math.sin(this.time.now * 0.015) * 0.015; // Independent soft flicker
                            const petFinalScale = petBaseScale + petFlicker;
                            const petRadius = 128 * petFinalScale;
                            
                            const petGrad = ctx.createRadialGradient(petScreenX, petScreenY, 0, petScreenX, petScreenY, petRadius);
                            petGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');     // 100% transparent cutout at center
                            petGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.85)'); 
                            petGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.25)');  
                            petGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.05)'); 
                            petGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
                            
                            ctx.fillStyle = petGrad;
                            ctx.beginPath();
                            ctx.arc(petScreenX, petScreenY, petRadius, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        // 4. Reset blend mode to standard
                        ctx.globalCompositeOperation = 'source-over';

                        // 5. Upload canvas texture to GPU
                        this.darknessTexture.update();

                        // Update the warm lantern glow overlay
                        if (this.lanternGlow) {
                            this.lanternGlow.setPosition(this.player.x, this.player.y);
                            this.lanternGlow.setScale(finalScale * 1.15);
                            
                            // Adjust intensity and color warmth
                            const baseAlpha = 0.15;
                            this.lanternGlow.setAlpha(baseAlpha + flicker * 0.5);
                            this.lanternGlow.setTint(0xffddaa); // warm white-yellow
                        }

                        // Update the colored pet glow overlay (only after gameplay starts)
                        if (this.petGlow) {
                            if (this.isGameplayStarted && this.petCompanion && pet) {
                                this.petGlow.setVisible(true);
                                this.petGlow.setPosition(this.petCompanion.x, this.petCompanion.y);
                                
                                let petBaseScale = 0.25;
                                let tintColor = 0xffddaa; // Default warm white
                                
                                switch (pet.id) {
                                    case 'squirrel':
                                        petBaseScale = 0.22;
                                        tintColor = 0xd4c697; // Golden brown acorn
                                        break;
                                    case 'firefly':
                                        petBaseScale = 0.50;
                                        tintColor = 0x99ff33; // Neon green/yellow
                                        break;
                                    case 'owl':
                                        petBaseScale = 0.45;
                                        tintColor = 0x805ad5; // Deep cosmic violet
                                        break;
                                    case 'fox':
                                        petBaseScale = 0.35;
                                        tintColor = 0xed8936; // Warm campfire orange
                                        break;
                                    case 'deer':
                                        petBaseScale = 0.40;
                                        tintColor = 0x22d3ee; // Mystic cyan/teal
                                        break;
                                    case 'raven':
                                        petBaseScale = 0.38;
                                        tintColor = 0xe53e3e; // Crimson red glow
                                        break;
                                }
                                
                                const petFlicker = Math.sin(this.time.now * 0.015) * 0.015;
                                const petFinalScale = petBaseScale + petFlicker;
                                this.petGlow.setScale(petFinalScale * 1.15);
                                this.petGlow.setAlpha(0.20 + petFlicker * 0.5);
                                this.petGlow.setTint(tintColor);
                            } else {
                                this.petGlow.setVisible(false);
                            }
                        }
                    }

                    // Update spooky eyes fading when player gets close
                    if (characterConfig.biome === 'night' && this.spookyEyesGroup) {
                        this.spookyEyesGroup.getChildren().forEach((eyes: any) => {
                            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, eyes.x, eyes.y);
                            
                            // If player gets close (within lantern range or slightly wider), fade out and respawn somewhere else!
                            const triggerDist = 120;
                            if (dist < triggerDist && !eyes.getData('fading')) {
                                eyes.setData('fading', true);
                                this.tweens.add({
                                    targets: eyes,
                                    alpha: 0,
                                    duration: 800,
                                    ease: 'Linear',
                                    onComplete: () => {
                                        eyes.destroy();
                                        // Respawn eyes somewhere else
                                        // @ts-ignore
                                        this.spawnSpookyEyes(this.MAP_SIZE * 32, this.MAP_SIZE * 32);
                                    }
                                });
                            }
                        });
                    }

                    // Update floating pet companion follow and Raven Scout direction guidance
                    if (this.petCompanion && pet) {
                        let targetX = this.player.x;
                        let targetY = this.player.y - 12;

                        // Float dynamically behind the player depending on facing movement direction
                        if (this.facing === 'left') {
                            targetX = this.player.x + 22;
                        } else if (this.facing === 'right') {
                            targetX = this.player.x - 22;
                        } else if (this.facing === 'up') {
                            targetY = this.player.y + 20;
                        } else if (this.facing === 'down') {
                            targetY = this.player.y - 22;
                        }

                        // Raven Scout Sensing Direction Instinct
                        if (pet.id === 'raven') {
                            let closestRareNut: any = null;
                            let closestRareDist = 9999;
                            
                            this.nutsGroup.getChildren().forEach((child: any) => {
                                const nutIdx = child.getData('index');
                                const rarity = NUT_RARITIES[nutIdx];
                                if (rarity === 'Rare' || rarity === 'Epic' || rarity === 'Legendary') {
                                     const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, child.x, child.y);
                                     if (dist < closestRareDist) {
                                         closestRareDist = dist;
                                         closestRareNut = child;
                                     }
                                }
                            });

                            if (closestRareNut && closestRareDist > 80 && closestRareDist < 220) {
                                // Restless visual jitter shake
                                this.petCompanion.x += (Math.random() - 0.5) * 1.5;
                                this.petCompanion.y += (Math.random() - 0.5) * 1.5;

                                // Play high chirp procedural sound (throttled every 2 seconds)
                                if (!this.lastRavenCueTime || this.time.now - this.lastRavenCueTime > 2500) {
                                     audioManager.playSfx('hover');
                                     this.lastRavenCueTime = this.time.now;
                                }

                                // Offsetting pet position outwards in that nut's direction to guide the player!
                                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, closestRareNut.x, closestRareNut.y);
                                const flyDist = 15;
                                targetX = this.player.x + Math.cos(angle) * flyDist;
                                targetY = this.player.y - 12 + Math.sin(angle) * flyDist;
                            }
                        }

                        // Bobbing floating motion calculated mathematically (no conflicting tweens)
                        const bob = Math.sin(this.time.now * 0.005) * 3;
                        
                        // Elastic lag movement follow effect (lerp 0.06 creates a cozy, delayed, floaty catch-up feel)
                        this.petCompanion.x = Phaser.Math.Linear(this.petCompanion.x, targetX, 0.06);
                        this.petCompanion.y = Phaser.Math.Linear(this.petCompanion.y, targetY + bob, 0.06);

                        // Flip image based on player facing direction
                        if (this.facing === 'left') {
                            this.petCompanion.setFlipX(true);
                        } else if (this.facing === 'right') {
                            this.petCompanion.setFlipX(false);
                        }
                    }

                    // Update minimap blip position
                    if (characterConfig.biome !== 'night' && this.minimapBlip) {
                        const percentX = this.player.x / (this.MAP_SIZE * 32);
                        const percentY = this.player.y / (this.MAP_SIZE * 32);
                        this.minimapBlip.setPosition(percentX * (this.MAP_SIZE * 2), percentY * (this.MAP_SIZE * 2));
                    }
                }
            }

            const phaserConfig: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: 640,
                height: 360,
                parent: gameContainer.current!,
                pixelArt: true,
                roundPixels: true,
                backgroundColor: '#1a1a1a',
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { x: 0, y: 0 },
                        // Native flexible timestep prevents "catching up" stutter
                        debug: false
                    }
                },
                scene: [BootScene, GameScene],
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH
                }
            };

            game.current = new Phaser.Game(phaserConfig);
        });

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const mapLuck = characterConfig.biome === 'night' ? 10 : 0;
    let petLuck = 0;
    if (characterConfig.equippedPet?.id === 'fox') {
        const level = characterConfig.equippedPet.level || 1;
        const rareBonus = Math.round(2 + ((level - 1) * 10) / 9);
        const legendaryBonus = level;
        petLuck = rareBonus + legendaryBonus;
    } else if (characterConfig.equippedPet?.id === 'raven') {
        petLuck = 15;
    }
    
    let luckText = '';
    if (mapLuck === 0 && petLuck === 0) luckText = 'Luck 0%';
    else if (mapLuck === 10 && petLuck === 0) luckText = 'Luck Map 10%';
    else if (mapLuck === 0 && petLuck > 0) luckText = `Luck Pet ${petLuck}%`;
    else if (mapLuck === 10 && petLuck > 0) luckText = `Luck Map 10% + Luck Pet ${petLuck}%`;

    return (
        <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
            <div ref={gameContainer} style={{ width: '100%', height: '100%' }} />
            
            {/* HUD / Menu Button */}
            {isGameplayStarted && !activeNut && !showEndingDialogue && !isQuitting && (
                <div className="absolute top-4 right-4 pointer-events-auto z-[500] animate-[slideUp_0.5s_ease-out]">
                    <PixelButton onClick={() => setShowMenu(true)}>
                        Menu
                    </PixelButton>
                </div>
            )}

            {isGameplayStarted && !showIntroDialogue && !showEndingDialogue && !isQuitting && characterConfig.equippedPet && (
                <div className="absolute bottom-4 left-4 pointer-events-auto z-[500] animate-[slideRight_0.5s_ease-out] flex items-center gap-2">
                    <div className="bg-[#e4d6a7] border-[3px] border-[#8c6b4a] rounded-xl px-2.5 py-1.5 flex items-center gap-2.5 shadow-lg max-w-[170px] pointer-events-none select-none">
                        <div className="w-10 h-10 bg-[#c4b687] border-2 border-[#8c6b4a] rounded-lg flex items-center justify-center relative overflow-hidden shrink-0">
                            {/* Rarity colored backing glow */}
                            <div className="absolute inset-0 opacity-40 animate-pulse" style={{ backgroundColor: characterConfig.equippedPet.glowColor }} />
                            <div className="scale-90 z-10">
                                <PetIcon id={characterConfig.equippedPet.id} className="w-9 h-9" />
                            </div>
                        </div>
                        <div className="text-left font-sans pr-1 overflow-hidden">
                            <h4 className="text-[8px] font-black uppercase opacity-65 tracking-wider leading-none">Scout Partner</h4>
                            <p className="text-[10px] font-black text-[#4a2f1d] leading-tight truncate">{characterConfig.equippedPet.name}</p>
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 leading-none block">
                                Lvl {characterConfig.equippedPet.level}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Luck UI Indicator */}
            {isGameplayStarted && !showIntroDialogue && !showEndingDialogue && !isQuitting && (
                <div className="absolute bottom-4 right-4 pointer-events-none z-[500] animate-[slideLeft_0.5s_ease-out]">
                    <div className="bg-[#e4d6a7] border-[3px] border-[#8c6b4a] rounded-xl px-3 py-1.5 shadow-lg flex items-center justify-center">
                        <span className="text-[10px] md:text-xs font-black uppercase text-[#4a2f1d] tracking-widest">{luckText}</span>
                    </div>
                </div>
            )}

            {isGameplayStarted && !showIntroDialogue && !showEndingDialogue && !isQuitting && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-[500]">
                    <PixelPanel className="px-4 py-2 animate-[slideDown_0.5s_ease-out]">
                        <div className="font-mono text-xl font-bold text-[#4a2f1d]">{formatTime(gameplayTime)}</div>
                    </PixelPanel>
                </div>
            )}

            {/* In-Game Menu */}
            {showMenu && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[2000] backdrop-blur-sm pointer-events-auto">
                    {!showQuitConfirm ? (
                        <PixelPanel className="p-6 max-w-sm w-full mx-4 flex flex-col gap-4 text-center animate-[slideUp_0.2s_ease-out]">
                            <h2 className="text-3xl font-black uppercase tracking-widest mb-4 drop-shadow-sm text-[#4a2f1d]" style={{textShadow: '0 2px 0 #fff5d1'}}>Paused</h2>
                            <PixelButton onClick={() => setShowMenu(false)}>Resume Game</PixelButton>
                            <PixelButton variant="danger" onClick={() => setShowQuitConfirm(true)}>Quit The Game</PixelButton>
                        </PixelPanel>
                    ) : (
                        <PixelPanel className="p-6 max-w-sm w-full mx-4 flex flex-col gap-6 text-center animate-[slideUp_0.2s_ease-out]">
                            <h2 className="text-xl font-bold leading-relaxed text-[#4a2f1d]">Are you sure you want to quit?<br/><span className="text-sm opacity-80 font-normal">All your progress will be lost!</span></h2>
                            <div className="flex gap-4">
                                <PixelButton className="flex-1" onClick={() => setShowQuitConfirm(false)}>Cancel</PixelButton>
                                <PixelButton variant="danger" className="flex-1" onClick={onQuit}>Yes, Quit</PixelButton>
                            </div>
                        </PixelPanel>
                    )}
                </div>
            )}
            
            {showIntroDialogue && (
                <DialogueBox dialogues={introDialogues} onFinish={handleIntroFinish} />
            )}

            {showEndingDialogue && (
                <DialogueBox dialogues={endingDialogues} onFinish={handleEndingFinish} />
            )}
            
            {activeNut && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[1500] backdrop-blur-sm pointer-events-auto p-4 animate-[fadeIn_0.3s_ease-out]">
                    <div className="relative max-w-sm w-full mx-4">
                        <PixelPanel className="p-6 md:p-8 w-full animate-[slideUp_0.3s_ease-out] max-h-[85vh] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col pr-6">
                            {activeNut.isNewUnlock && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#7ab84f] border-[3px] border-[#4a7a2a] text-white px-4 py-1 font-black text-xs uppercase tracking-widest shadow-[0_4px_0_rgba(0,0,0,0.2)] whitespace-nowrap z-[100] animate-[bounce_1.5s_infinite]">
                                    New Entry Unlocked!
                                </div>
                            )}
                            
                            <div className="flex flex-col items-center mb-6 shrink-0">
                                <div className={`w-24 h-24 mb-3 flex items-center justify-center drop-shadow-md rounded-xl overflow-hidden relative border-[4px] ${
                                    activeNut.rarity === 'Mitos' ? 'bg-gradient-to-br from-amber-100 to-yellow-200 border-amber-500 shadow-[inset_0_0_0_2px_#fff5d1,0_0_15px_rgba(245,158,11,0.6)] animate-pulse' :
                                    activeNut.rarity === 'Mythic' ? 'bg-[#ffed4a] border-red-500 shadow-[inset_0_0_0_2px_#fff5d1,0_0_15px_rgba(239,68,68,0.6)] animate-pulse' :
                                    activeNut.rarity === 'Legendary' ? 'bg-[#f3e8ff] border-purple-500 shadow-[inset_0_0_0_2px_#fff5d1,0_0_10px_rgba(168,85,247,0.5)]' :
                                    activeNut.rarity === 'Rare' ? 'bg-[#dbeafe] border-blue-500 shadow-[inset_0_0_0_2px_#fff5d1,0_0_8px_rgba(59,130,246,0.4)]' :
                                    activeNut.rarity === 'Uncommon' ? 'bg-[#dcfce7] border-green-600 shadow-[inset_0_0_0_2px_#fff5d1]' :
                                    'bg-[#c4b687] border-[#8c6b4a] shadow-[inset_0_0_0_2px_#fff5d1]'
                                }`}>
                                    <img 
                                        src={activeNut.image} 
                                        alt={activeNut.name} 
                                        className="w-full h-full object-contain p-2 image-pixelated"
                                    />
                                </div>
                                <h2 className="text-2xl font-black uppercase text-[#4a2f1d] text-center drop-shadow-sm leading-tight">{activeNut.name}</h2>
                                <span className="text-sm italic text-[#7a421e] font-bold">{activeNut.latinName}</span>
                                
                                <div className={`mt-3 px-4 py-1 text-xs font-black uppercase tracking-widest border-[2px] rounded ${
                                    activeNut.rarity === 'Mitos' ? 'bg-amber-100 border-amber-500 text-amber-700 animate-bounce' :
                                    activeNut.rarity === 'Mythic' ? 'bg-red-100 border-red-500 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-600 animate-pulse drop-shadow-sm animate-bounce' :
                                    activeNut.rarity === 'Legendary' ? 'bg-purple-100 border-purple-500 text-purple-700' :
                                    activeNut.rarity === 'Rare' ? 'bg-blue-100 border-blue-500 text-blue-700' :
                                    activeNut.rarity === 'Uncommon' ? 'bg-green-100 border-green-600 text-green-800' :
                                    'bg-[#e4d6a7] border-[#8c6b4a] text-[#7a421e]'
                                }`}>
                                    {activeNut.rarity || 'Common'}
                                </div>
                            </div>

                            <div className="space-y-4 text-[#4a2f1d] flex-1">
                                <div className="bg-[#c4b687] p-4 border-[2px] border-[#8c6b4a] shadow-[inset_0_0_0_2px_#d4c697]">
                                    <h3 className="font-black uppercase text-xs tracking-widest border-b-[2px] border-[#8c6b4a] pb-1 mb-2 inline-block">General Info</h3>
                                    <p className="text-sm leading-relaxed font-bold whitespace-pre-line">{activeNut.description}</p>
                                </div>
                                <div className="bg-[#c4b687] p-4 border-[2px] border-[#8c6b4a] shadow-[inset_0_0_0_2px_#d4c697]">
                                    <h3 className="font-black uppercase text-xs tracking-widest border-b-[2px] border-[#8c6b4a] pb-1 mb-2 inline-block">Allergy Info</h3>
                                    <p className="text-sm leading-relaxed font-bold whitespace-pre-line">{activeNut.allergyInfo}</p>
                                </div>
                            </div>
                            
                            <PixelButton onClick={closeNutModal} className="w-full mt-6 shrink-0">
                                Continue
                            </PixelButton>
                        </PixelPanel>

                        {/* Close Button (Moved outside overflow container) */}
                        <button  
                            onClick={closeNutModal}
                            className="absolute -top-4 -right-2 bg-[#c94f4f] border-[4px] border-[#8a2222] text-white w-10 h-10 font-bold shadow-[2px_2px_0_rgba(0,0,0,0.3)] hover:bg-[#d96666] active:translate-y-[2px] active:scale-[0.95] flex items-center justify-center transition-all rendering-pixelated z-[1600]"
                        >
                            <span className="leading-none mt-[-2px] text-xl">x</span>
                        </button>
                    </div>
                </div>
            )}

            {/* High-Resolution Cinematic Loading Overlay */}
            {worldStatus !== 'done' && (
                <div className={`absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1a1a1a] transition-opacity duration-1000 ${worldStatus === 'fading_out' ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex flex-col items-center">
                        <div className={`text-4xl md:text-5xl font-black uppercase tracking-widest text-[#e4d6a7] drop-shadow-lg transition-all duration-700 ${worldStatus === 'ready' || worldStatus === 'fading_out' ? 'scale-110 text-[#fff5d1]' : 'animate-pulse'}`}>
                            {worldStatus === 'generating' ? 'Generating World...' : 'World Ready!'}
                        </div>
                        <div className={`mt-4 text-sm font-bold tracking-widest text-[#8c6b4a] uppercase transition-opacity duration-500 ${worldStatus === 'ready' || worldStatus === 'fading_out' ? 'opacity-0' : 'opacity-100'}`}>
                            Building Terrain & Placing Nuts
                        </div>
                    </div>
                </div>
            )}

            {/* Cinematic Ending Overlay */}
            {isQuitting && (
                <div className="absolute inset-0 bg-[#1a1a1a] z-[9999] animate-[fadeIn_1.5s_ease-out_forwards]" />
            )}
        </div>
    );
}


