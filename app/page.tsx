'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { nutsData } from './data/nutsData';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatTime } from '../lib/utils';
import { audioManager } from './lib/AudioManager';

const PhaserApp = dynamic(() => import('./PhaserApp'), {
  ssr: false,
});

const ClassifyNuts = dynamic(() => import('./components/ClassifyNuts'), {
  ssr: false,
});

const GachaWheel = dynamic(() => import('./components/GachaWheel'), {
  ssr: false,
});

import { PETS } from './components/GachaWheel';

const CharacterPreview = ({ hairColor, shirtColor }: { hairColor: string, shirtColor: string }) => {
    return (
        <svg viewBox="0 0 16 16" width="160" height="160" className="drop-shadow-md rendering-pixelated">
            {/* Pants */}
            <rect x="5" y="13" width="2" height="3" fill="#354359" />
            <rect x="9" y="13" width="2" height="3" fill="#354359" />
            {/* Body/Shirt */}
            <rect x="5" y="6" width="6" height="7" fill={shirtColor} />
            <rect x="3" y="6" width="2" height="5" fill={shirtColor} />
            <rect x="11" y="6" width="2" height="5" fill={shirtColor} />
            {/* Hands */}
            <rect x="3" y="11" width="2" height="2" fill="#f5c69a" />
            <rect x="11" y="11" width="2" height="2" fill="#f5c69a" />
            {/* Face/Skin */}
            <rect x="5" y="1" width="6" height="5" fill="#f5c69a" />
            {/* Hair */}
            <rect x="4" y="0" width="8" height="3" fill={hairColor} />
            <rect x="4" y="0" width="2" height="5" fill={hairColor} />
            <rect x="10" y="0" width="2" height="5" fill={hairColor} />
            {/* Eyes */}
            <rect x="6" y="3" width="1" height="1" fill="#000000" fillOpacity="0.6" />
            <rect x="9" y="3" width="1" height="1" fill="#000000" fillOpacity="0.6" />
        </svg>
    )
}

const MenuButton = ({ onClick, children, type = 'button' }: { onClick?: () => void, children: React.ReactNode, type?: 'button' | 'submit' }) => (
    <button 
        type={type}
        onClick={() => {
            audioManager.playSfx('click');
            onClick?.();
        }}
        onMouseEnter={() => audioManager.playSfx('hover')}
        className="group relative flex items-center justify-center w-full max-w-sm mx-auto mb-4 py-3 bg-gradient-to-b from-[#8c6b4a] to-[#7a421e] hover:from-[#9c7855] hover:to-[#8c6b4a] transition-all duration-200 text-[#fff5d1] font-bold rounded-xl border-[4px] border-[#4a2f1d] shadow-[0_6px_0_#4a2f1d,0_10px_10px_rgba(0,0,0,0.3)] hover:translate-y-1 hover:shadow-[0_2px_0_#4a2f1d,0_4px_4px_rgba(0,0,0,0.3)] active:translate-y-[6px] active:shadow-none overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
    >
        <span className="relative z-10 tracking-widest uppercase drop-shadow-md text-lg leading-none">{children}</span>
        <div className="absolute inset-0 bg-white/20 -translate-y-full group-hover:translate-y-full transition-transform duration-[600ms] ease-in-out" />
    </button>
);

const ScreenWrapper = ({ children, isClient, particles = [], isTransitioning = false }: { children: React.ReactNode, isClient: boolean, particles?: any[], isTransitioning?: boolean }) => {
    return (
        <div className="absolute inset-0 bg-[#6a9c3e] flex items-center justify-center font-sans tracking-wide overflow-hidden animate-[fadeIn_1.2s_ease-out]">
            {/* Rich Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#7ab84f] to-[#5c8a36]" />
            
            {/* Grass patterns */}
            <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(#4a7a2a 3px, transparent 3px)',
                backgroundSize: '48px 48px',
                backgroundPosition: '0 0'
            }} />
            
            {/* Floating Particles / Leaves */}
            <div className="absolute inset-0 pointer-events-none">
                {isClient && particles.map(p => (
                    <div 
                        key={p.id}
                        className="absolute bg-[#4a7a2a] w-3 h-3 rounded-sm rendering-pixelated opacity-0 animate-[fall_linear_infinite]"
                        style={{
                            left: p.left,
                            top: p.top,
                            animationDuration: p.animationDuration,
                            animationDelay: p.animationDelay,
                        }}
                    />
                ))}
            </div>

            {children}
            
            {isTransitioning && (
                <div className="absolute inset-0 bg-[#1a1a1a] z-[9999] animate-[fadeIn_0.8s_ease-out_forwards]" />
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                .rendering-pixelated {
                    image-rendering: pixelated;
                    shape-rendering: crispEdges;
                }
                @keyframes fall {
                    0% { transform: translate(0, -10vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.8; }
                    100% { transform: translate(30vw, 110vh) rotate(360deg); opacity: 0; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes popOut {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .horror-vignette {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 8000;
                    box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.98);
                    background: radial-gradient(circle, transparent 35%, rgba(0, 0, 0, 0.6) 70%, rgba(0, 0, 0, 1.0) 100%);
                }
            `}} />
        </div>
    );
};

export default function Page() {
    const [view, setView] = useState('menu');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [leaderboardTab, setLeaderboardTab] = useState<'day' | 'night'>('day');
    const [config, setConfig] = useState({
        name: '',
        hairColor: '#4a2f1d',
        shirtColor: '#497fa3',
        biome: 'day'
    });
    const [showGacha, setShowGacha] = useState(false);
    const [equippedPet, setEquippedPet] = useState<any>(null);
    const [showNightWarning, setShowNightWarning] = useState(false);

    useEffect(() => {
        try {
            const storedEquipped = localStorage.getItem('sawit_village_equipped_pet');
            if (storedEquipped) {
                const petId = JSON.parse(storedEquipped);
                if (petId) {
                    const levels = JSON.parse(localStorage.getItem('sawit_village_pet_levels') || '{}');
                    const shards = JSON.parse(localStorage.getItem('sawit_village_pet_shards') || '{}');
                    const petData = PETS.find(p => p.id === petId);
                    if (petData) {
                        setEquippedPet({
                            ...petData,
                            level: levels[petId] || 1,
                            shards: shards[petId] || 0
                        });
                    }
                }
            }
        } catch {}
    }, []);



    const handlePlaySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (config.name.trim() === '') return;
        audioManager.playSfx('click');
        setView('biome');
    };

    const handleBiomeSelect = (selectedBiome: string) => {
        audioManager.playSfx('click');
        setConfig(prev => ({ ...prev, biome: selectedBiome }));
        
        if (selectedBiome === 'night') {
            setShowNightWarning(true);
        } else {
            setIsTransitioning(true);
            setTimeout(() => {
                setView('game');
                setIsTransitioning(false);
            }, 800);
        }
    };

    const handleProceedToNightGame = () => {
        audioManager.playSfx('click');
        setShowNightWarning(false);
        setIsTransitioning(true);
        setTimeout(() => {
            setView('game');
            setIsTransitioning(false);
        }, 800);
    };

    const [showInfo, setShowInfo] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [unlockedNuts, setUnlockedNuts] = useState<number[]>([]);
    const [discoveredNuts, setDiscoveredNuts] = useState<any[]>([]);
    const [selectedNut, setSelectedNut] = useState<any>(null);
    const [redeemCode, setRedeemCode] = useState('');
    const [redeemStatus, setRedeemStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleRedeem = (e: React.FormEvent) => {
        e.preventDefault();
        const code = redeemCode.trim();
        if (!code) return;

        try {
            const redeemed = JSON.parse(localStorage.getItem('sawit_village_redeemed_codes') || '[]');
            
            if (code === 'JUARAVIBECODING') {
                if (redeemed.includes(code)) {
                    setRedeemStatus({ type: 'error', text: 'already redeemed' });
                    audioManager.playSfx('close');
                } else {
                    const currentCoins = parseInt(localStorage.getItem('sawit_village_nut_coins') || '200');
                    const nextCoins = currentCoins + 500;
                    localStorage.setItem('sawit_village_nut_coins', nextCoins.toString());
                    
                    redeemed.push(code);
                    localStorage.setItem('sawit_village_redeemed_codes', JSON.stringify(redeemed));
                    
                    setRedeemStatus({ type: 'success', text: 'Success! Received 500 coins.' });
                    audioManager.playSfx('reward');
                }
            } else if (code === 'WOWOK1NUT') {
                if (redeemed.includes(code)) {
                    setRedeemStatus({ type: 'error', text: 'already redeemed' });
                    audioManager.playSfx('close');
                } else {
                    const encyclopedia = JSON.parse(localStorage.getItem('sawit_village_encyclopedia') || '[]');
                    if (!encyclopedia.includes(99)) {
                        encyclopedia.push(99);
                        localStorage.setItem('sawit_village_encyclopedia', JSON.stringify(encyclopedia));
                        setUnlockedNuts(encyclopedia);
                    }
                    
                    redeemed.push(code);
                    localStorage.setItem('sawit_village_redeemed_codes', JSON.stringify(redeemed));
                    
                    setRedeemStatus({ type: 'success', text: 'Success! Unlocked Secret Wowok Nut!' });
                    audioManager.playSfx('reward');
            } else {
                setRedeemStatus({ type: 'error', text: 'code salah' });
                audioManager.playSfx('close');
            }
        } catch {
            setRedeemStatus({ type: 'error', text: 'Redeem failed' });
            audioManager.playSfx('close');
        }
    };
    
    useEffect(() => {
        if (view === 'leaderboard') {
            const fetchLeaderboard = async () => {
                try {
                    const colName = leaderboardTab === 'night' ? 'leaderboard_night' : 'leaderboard';
                    const q = query(collection(db, colName), orderBy('completionTime', 'asc'), limit(10));
                    const snapshot = await getDocs(q);
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setLeaderboard(data);
                } catch (e) {
                    console.error(e);
                }
            };
            fetchLeaderboard();
        } else if (view === 'encyclopedia') {
            const t = setTimeout(() => {
                try {
                    const unlockedData = localStorage.getItem('sawit_village_encyclopedia');
                    if (unlockedData) setUnlockedNuts(JSON.parse(unlockedData));
                    
                    const discoveredData = localStorage.getItem('sawit_village_discovered_nuts');
                    if (discoveredData) setDiscoveredNuts(JSON.parse(discoveredData));
                } catch {}
            }, 0);
            return () => clearTimeout(t);
        }
    }, [view, leaderboardTab]);

    useEffect(() => {
        if (view === 'menu' || view === 'create' || view === 'biome' || view === 'leaderboard' || view === 'encyclopedia') {
            audioManager.playMusic('menu');
        } else if (view === 'game') {
            if (config.biome === 'night') {
                audioManager.playMusic('night');
            } else {
                audioManager.playMusic('game');
            }
        }
    }, [view, config.biome]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const [particles, setParticles] = useState<any[]>([]);
    useEffect(() => {
        const init = setTimeout(() => setIsClient(true), 0);
        const timer = setTimeout(() => {
            const newParticles = Array.from({ length: 20 }).map((_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDuration: `${5 + Math.random() * 8}s`,
                animationDelay: `${Math.random() * 10}s`,
            }));
            setParticles(newParticles);
        }, 0);
        return () => {
            clearTimeout(init);
            clearTimeout(timer);
        };
    }, []);

    if (view === 'game') {
        return (
            <div className="relative w-full h-full overflow-hidden">
                <PhaserApp characterConfig={{ ...config, equippedPet }} onQuit={() => setView('menu')} />
                {config.biome === 'night' && <div className="horror-vignette" />}
            </div>
        );
    }

    const renderInfoModal = () => (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9000] backdrop-blur-md pointer-events-auto p-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="relative max-w-md w-full">
                <div className="bg-[#e4d6a7] border-[6px] border-[#8c6b4a] rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_-8px_0_rgba(140,107,74,0.3)] animate-[popOut_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="flex items-center justify-center gap-4 mb-6 border-b-4 border-[#8c6b4a]/20 pb-4">
    <div className="w-12 h-12 bg-[#8c6b4a] border-[3px] border-[#4a2f1d] rounded-lg flex items-center justify-center text-[#fff5d1] font-black text-2xl shrink-0">
        !
    </div>

    <h2
        className="text-2xl font-black text-[#4a2f1d] tracking-widest leading-tight text-center"
        style={{ textShadow: '0 1px 0 #fff5d1' }}
    >
        Information
    </h2>
</div>

                    <div className="space-y-6 text-left mt-2">

                        {/* Section 1: AI Scanner & Identification Tips */}
                        <div className="bg-[#c4b687]/40 p-4 rounded-xl border-2 border-[#8c6b4a]/30 shadow-inner">
                            <h4 className="text-xs uppercase font-black tracking-widest text-[#4a2f1d] mb-2 flex items-center gap-1.5">
                                🔍 AI Nut Scanner
                            </h4>
                            <p className="text-[#4a2f1d] font-bold leading-relaxed text-xs">
                                Identify Nut features an advanced, real-time AI recognition model. Snap a clear photo of any nut to immediately unlock its scientific classification, allergy details, and lore in your Encyclopedia.
                            </p>
                            <div className="mt-3 bg-[#e4d6a7]/60 p-2.5 rounded-lg border border-[#8c6b4a]/20 text-[10px] text-[#7a421e] font-bold leading-relaxed">
                                💡 <span className="underline">Tip for Best Results:</span> Ensure your photos are well-lit, in-focus, and taken from a clear top-down angle for maximum AI accuracy.
                            </div>
                        </div>

                        {/* Section 2: Redeem Code Form */}
                        <div className="bg-[#c4b687]/40 p-4 rounded-xl border-2 border-[#8c6b4a]/30 shadow-inner text-left">
                            <h4 className="text-xs uppercase font-black tracking-widest text-[#4a2f1d] mb-2 flex items-center gap-1.5">
                                🎁 Redeem Code
                            </h4>
                            <p className="text-[#7a421e] font-bold text-[10px] leading-relaxed mb-3">
                                Enter secret promo codes below to instantly claim extra spin coins, unlock companion pets, or reveal classified encyclopedia species!
                            </p>
                            <form onSubmit={handleRedeem} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Code..."
                                    value={redeemCode}
                                    onChange={(e) => setRedeemCode(e.target.value)}
                                    className="flex-1 bg-[#fff5d1] border-[3px] border-[#8c6b4a] rounded-lg px-3 py-1.5 font-bold text-xs text-[#4a2f1d] placeholder-[#8c6b4a]/60 focus:outline-none focus:border-[#4a2f1d]"
                                />
                                <button
                                    type="submit"
                                    className="bg-[#8c6b4a] hover:bg-[#7a421e] text-[#fff5d1] font-black rounded-lg border-[3px] border-[#4a2f1d] px-4 py-1 text-[10px] uppercase tracking-widest shadow-[0_2px_0_#4a2f1d] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                                >
                                    Claim
                                </button>
                            </form>
                            {redeemStatus && (
                                <p className={`text-[10px] font-black mt-2 tracking-widest uppercase ${redeemStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                                    {redeemStatus.type === 'success' ? '✨' : '❌'} {redeemStatus.text}
                                </p>
                            )}
                        </div>

                        {/* Section 3: Rarity Drop Rates */}
                        <div className="bg-[#c4b687]/40 p-4 rounded-xl border-2 border-[#8c6b4a]/30 shadow-inner text-left">
                            <h4 className="text-xs uppercase font-black tracking-widest text-[#4a2f1d] mb-3 flex items-center gap-1.5">
                                📊 World Drop Rates
                            </h4>
                            <p className="text-[#7a421e] font-bold text-[10px] leading-relaxed mb-3">
                                Rarity distribution of nuts spawning naturally in the world. Drop weights shift at night to spawn rarer species!
                            </p>
                            <div className="overflow-hidden rounded-lg border border-[#8c6b4a]/40 bg-[#e4d6a7]/60">
                                <table className="w-full text-xs font-bold text-[#4a2f1d] border-collapse">
                                    <thead>
                                        <tr className="bg-[#8c6b4a] text-[#fff5d1] text-[9px] uppercase tracking-wider text-left border-b border-[#8c6b4a]">
                                            <th className="p-2 border-r border-[#8c6b4a]/30">Rarity</th>
                                            <th className="p-2 border-r border-[#8c6b4a]/30 text-center">☀️ Day</th>
                                            <th className="p-2 text-center">🌙 Night</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-[#8c6b4a]/20 bg-white/20">
                                            <td className="p-2 border-r border-[#8c6b4a]/20 flex items-center gap-1.5 font-bold">
                                                <span className="w-2.5 h-2.5 bg-[#e4d6a7] border border-[#8c6b4a] rounded-sm shrink-0" />
                                                Common
                                            </td>
                                            <td className="p-2 border-r border-[#8c6b4a]/20 text-center font-black">51%</td>
                                            <td className="p-2 text-center font-black text-blue-900">46%</td>
                                        </tr>
                                        <tr className="border-b border-[#8c6b4a]/20 bg-white/10">
                                            <td className="p-2 border-r border-[#8c6b4a]/20 flex items-center gap-1.5 font-bold">
                                                <span className="w-2.5 h-2.5 bg-green-500 border border-green-600 rounded-sm shrink-0" />
                                                Uncommon
                                            </td>
                                            <td className="p-2 border-r border-[#8c6b4a]/20 text-center font-black">31%</td>
                                            <td className="p-2 text-center font-black text-blue-900">26%</td>
                                        </tr>
                                        <tr className="border-b border-[#8c6b4a]/20 bg-white/20">
                                            <td className="p-2 border-r border-[#8c6b4a]/20 flex items-center gap-1.5 font-bold">
                                                <span className="w-2.5 h-2.5 bg-blue-500 border border-blue-600 rounded-sm shrink-0" />
                                                Rare
                                            </td>
                                            <td className="p-2 border-r border-[#8c6b4a]/20 text-center font-black">15.75%</td>
                                            <td className="p-2 text-center font-black text-green-700">20.75% 📈</td>
                                        </tr>
                                        <tr className="border-b border-[#8c6b4a]/20 bg-white/10">
                                            <td className="p-2 border-r border-[#8c6b4a]/20 flex items-center gap-1.5 font-bold">
                                                <span className="w-2.5 h-2.5 bg-purple-500 border border-purple-600 rounded-sm shrink-0" />
                                                Legendary
                                            </td>
                                            <td className="p-2 border-r border-[#8c6b4a]/20 text-center font-black">2%</td>
                                            <td className="p-2 text-center font-black text-green-700">5% 📈</td>
                                        </tr>
                                        <tr className="border-b border-[#8c6b4a]/20 bg-white/20">
                                            <td className="p-2 border-r border-[#8c6b4a]/20 flex items-center gap-1.5 font-bold text-red-600">
                                                <span className="w-2.5 h-2.5 bg-red-500 border border-red-600 rounded-sm shrink-0 animate-bounce" />
                                                Mythic
                                            </td>
                                            <td className="p-2 border-r border-[#8c6b4a]/20 text-center font-black text-red-600">0.25%</td>
                                            <td className="p-2 text-center font-black text-green-700">2.25% 📈</td>
                                        </tr>
                                        <tr className="bg-amber-100/50">
                                            <td className="p-2 border-r border-[#8c6b4a]/20 flex items-center gap-1.5 font-bold text-amber-800">
                                                <span className="w-2.5 h-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 border border-amber-600 rounded-sm shrink-0 animate-bounce" />
                                                Mitos
                                            </td>
                                            <td className="p-2 border-r border-[#8c6b4a]/20 text-center font-black text-amber-800">Redeem</td>
                                            <td className="p-2 text-center font-black text-amber-800">Redeem</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-[9px] text-[#7a421e]/80 font-bold mt-2 leading-tight">
                                💡 <span className="underline">Tip:</span> Equipped pets (like 🦊 <strong>Lucky Fox</strong> or 🐦 <strong>Raven Scout</strong>) can modify these drop rates even further in your favor!
                            </p>
                        </div>


                        <div className="pt-2 text-center">
                            <button 
                                onClick={() => {
                                    audioManager.playSfx('close');
                                    setShowInfo(false);
                                }}
                                className="w-full py-3 bg-[#8c6b4a] hover:bg-[#7a421e] text-[#fff5d1] font-bold rounded-xl border-[4px] border-[#4a2f1d] shadow-[0_4px_0_#4a2f1d] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top corner close button for quick access */}
                <button 
                    className="absolute -top-4 -right-4 w-12 h-12 bg-[#c4b687] border-[4px] border-[#8c6b4a] rounded-full flex items-center justify-center font-bold text-[#4a2f1d] hover:bg-[#d4c697] hover:scale-110 active:scale-95 transition-all outline-none z-[9500] text-2xl leading-none shadow-[0_4px_0_#8c6b4a]" 
                    onClick={() => {
                        audioManager.playSfx('close');
                        setShowInfo(false);
                    }}
                >
                    <span className="mb-1">×</span>
                </button>
            </div>
        </div>
    );

    if (view === 'game') {
        return <PhaserApp characterConfig={{ ...config, equippedPet }} onQuit={() => setView('menu')} />;
    }

    const renderPlaceholder = (title: string, desc: string) => (
        <ScreenWrapper isClient={isClient} particles={particles} isTransitioning={isTransitioning}>
            <div className={`z-10 bg-[#e4d6a7] border-[6px] border-[#8c6b4a] rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_-8px_0_rgba(140,107,74,0.3)] text-center relative flex flex-col max-h-[90vh] animate-[slideUp_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)] ${title === 'Encyclopedia' ? 'mt-12' : ''}`}>
                <h1 className="text-4xl font-black text-[#4a2f1d] tracking-widest leading-tight mb-2" style={{textShadow: '0 2px 0 #fff5d1'}}>{title}</h1>
                <p className="text-[#7a421e] mb-8 font-bold">{desc}</p>
                
                {title === 'Encyclopedia' && (
                    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-2">
                        {/* Summary */}
                        <div className="mb-4 bg-[#c4b687] p-4 rounded-xl border-4 border-[#8c6b4a] shadow-inner">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-[#4a2f1d] mb-2">
                                <span>Collection Progress</span>
                                <span>{unlockedNuts.length + discoveredNuts.length} Total</span>
                            </div>
                            <div className="bg-[#a39570] rounded-full h-3 border-2 border-[#8c6b4a] overflow-hidden">
                                <div className="h-full bg-[#7ab84f] transition-all duration-1000" style={{width: `${(unlockedNuts.length / nutsData.length) * 100}%`}}></div>
                            </div>
                        </div>

                        <h3 className="text-left text-xs font-black uppercase tracking-widest text-[#7a421e] mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#8c6b4a] rounded-full" />
                            Village Collection
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 text-left shrink-0">
                            {[...nutsData].sort((a, b) => {
                                const rarityVal: any = { 'Mitos': 6, 'Mythic': 5, 'Legendary': 4, 'Rare': 3, 'Uncommon': 2, 'Common': 1 };
                                return rarityVal[a.rarity || 'Common'] - rarityVal[b.rarity || 'Common'];
                            }).map((nut) => {
                                const isUnlocked = unlockedNuts.includes(nut.id);
                                return (
                                    <div 
                                        key={nut.id} 
                                        className={`bg-[#c4b687] p-3 rounded-xl border-[4px] flex flex-col items-center text-center ${isUnlocked ? 
                                            (nut.rarity === 'Mitos' ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] bg-gradient-to-br from-amber-100 to-yellow-200 hover:-translate-y-1 hover:scale-105 cursor-pointer active:scale-95 animate-pulse' :
                                            nut.rarity === 'Mythic' ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] hover:-translate-y-1 hover:scale-105 cursor-pointer active:scale-95' :
                                            nut.rarity === 'Legendary' ? 'border-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.4)] hover:-translate-y-1 hover:scale-105 cursor-pointer active:scale-95' :
                                            nut.rarity === 'Rare' ? 'border-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.3)] hover:-translate-y-1 hover:scale-105 cursor-pointer active:scale-95' :
                                            nut.rarity === 'Uncommon' ? 'border-green-600 shadow-md hover:-translate-y-1 hover:scale-105 cursor-pointer active:scale-95' :
                                            'border-[#8c6b4a] shadow-md hover:-translate-y-1 hover:scale-105 cursor-pointer active:scale-95') 
                                            : 'border-[#a39570] opacity-80 cursor-not-allowed'}`}
                                        onClick={() => { 
                                            if (isUnlocked) {
                                                audioManager.playSfx('popup');
                                                setSelectedNut(nut); 
                                            }
                                        }}
                                        onMouseEnter={() => { if (isUnlocked) audioManager.playSfx('hover'); }}
                                    >
                                        {isUnlocked ? (
                                            <>
                                                <div className="w-12 h-12 bg-[#e4d6a7] rounded-lg mb-2 mx-auto border-2 border-[#8c6b4a] overflow-hidden flex items-center justify-center">
                                                    <img src={nut.image} alt={nut.name} className="w-full h-full object-cover rendering-pixelated" />
                                                </div>
                                                <div className="text-[#4a2f1d] font-bold text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5rem] flex items-center justify-center">{nut.name}</div>
                                                <div className={`mt-auto text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                                                    nut.rarity === 'Mitos' ? 'border-amber-600 text-amber-900 bg-amber-200/90 font-black animate-bounce' :
                                                    nut.rarity === 'Mythic' ? 'border-red-500 text-red-700 bg-red-100/80 drop-shadow-sm animate-bounce' :
                                                    nut.rarity === 'Legendary' ? 'border-purple-500 text-purple-700 bg-purple-100/80' :
                                                    nut.rarity === 'Rare' ? 'border-blue-500 text-blue-700 bg-blue-100/80' :
                                                    nut.rarity === 'Uncommon' ? 'border-green-600 text-green-800 bg-green-100/80' :
                                                    'border-[#8c6b4a] text-[#7a421e] bg-[#e4d6a7]/80'
                                                }`}>
                                                    {nut.rarity || 'Common'}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-[#a39570] rounded-lg mb-2 mx-auto border-2 border-[#8c6b4a] flex items-center justify-center">
                                                    <span className="text-2xl font-black opacity-30 text-[#4a2f1d]">?</span>
                                                </div>
                                                <div className="text-[#5a4836] font-bold text-sm mb-1 mt-auto">???</div>
                                                <div className="mt-auto text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-[#8c6b4a]/30 text-[#7a421e]/50 bg-transparent">
                                                    {nut.rarity || 'Common'}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Discovered Section */}
                        {discoveredNuts.length > 0 && (
                            <>
                                <h3 className="text-left text-xs font-black uppercase tracking-widest text-[#7a421e] mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#7ab84f] rounded-full" />
                                    Discovered Collection
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 text-left shrink-0">
                                    {discoveredNuts.map((nut, i) => (
                                        <div 
                                            key={nut.id} 
                                            className="bg-[#d4c697] p-4 rounded-xl border-4 border-[#7ab84f] shadow-md hover:-translate-y-1 transition-transform cursor-pointer"
                                            onClick={() => setSelectedNut(nut)}
                                        >
                                            <div className="w-12 h-12 bg-[#e4d6a7] rounded-lg mb-2 mx-auto border-2 border-[#7ab84f] overflow-hidden flex items-center justify-center">
                                                <img src={nut.image} alt={nut.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-[#4a2f1d] font-bold text-center text-sm leading-tight mb-1">{nut.name}</div>
                                            <div className="text-[#7a421e] italic text-center text-[10px] leading-tight">{nut.latinName}</div>
                                            <div className="mt-2 text-center text-[9px] font-black text-white bg-[#7ab84f] rounded px-1">{nut.confidence}%</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
                
                {title === 'Leaderboard' && (
                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="flex justify-center gap-4 mb-4 shrink-0">
                            <button 
                                onClick={() => { audioManager.playSfx('click'); setLeaderboardTab('day'); }}
                                className={`px-4 py-2 font-black uppercase tracking-widest text-sm rounded-lg border-[3px] transition-all ${leaderboardTab === 'day' ? 'bg-[#c4b687] border-[#8c6b4a] text-[#4a2f1d] shadow-[0_4px_0_#8c6b4a] translate-y-0' : 'bg-[#e4d6a7] border-[#c4b687] text-[#8c6b4a] shadow-none translate-y-1'}`}
                            >
                                ☀️ Day
                            </button>
                            <button 
                                onClick={() => { audioManager.playSfx('click'); setLeaderboardTab('night'); }}
                                className={`px-4 py-2 font-black uppercase tracking-widest text-sm rounded-lg border-[3px] transition-all ${leaderboardTab === 'night' ? 'bg-[#354359] border-[#202938] text-[#e4d6a7] shadow-[0_4px_0_#202938] translate-y-0' : 'bg-[#435570] border-[#354359] text-[#a3b8cc] shadow-none translate-y-1'}`}
                            >
                                🌙 Night
                            </button>
                        </div>
                        <div className="space-y-3 mb-8 overflow-y-auto pr-2 custom-scrollbar text-left text-[#4a2f1d] flex-1 min-h-0">
                            {leaderboard.length === 0 ? (
                                <div className="text-center font-bold text-[#7a421e] mt-4">No records yet for {leaderboardTab} mode. Be the first!</div>
                            ) : (
                                leaderboard.map((row, i) => (
                                    <div key={i} className="bg-[#c4b687] p-4 rounded-xl border-4 border-[#8c6b4a] shadow-md flex justify-between items-center text-sm sm:text-base hover:-translate-y-1 transition-all cursor-default">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#8c6b4a] text-[#fff5d1] flex items-center justify-center font-bold">{i + 1}</div>
                                            <span className="font-bold">{row.playerName}</span>
                                        </div>
                                        <span className="font-bold text-[#7a421e]">{formatTime(row.completionTime)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                
                {title === 'Identify My Nut' && (
                    <div className="bg-[#c4b687] p-8 rounded-xl border-4 border-[#8c6b4a] border-dashed shadow-inner mb-8 text-[#7a421e] font-bold flex flex-col items-center justify-center cursor-pointer hover:bg-[#b5a675] transition-colors relative group">
                        <div className="text-4xl mb-2 animate-bounce group-hover:scale-110 transition-transform">📂</div>
                        Click to upload or capture nut photo
                    </div>
                )}

                {title === 'Encyclopedia' ? (
                     <div className="mt-10 pt-4 border-t-4 border-[#8c6b4a]/20 w-full flex justify-center">
                        <MenuButton onClick={() => setView('menu')}>Back to Menu</MenuButton>
                    </div>
                ) : (
                    <MenuButton onClick={() => setView('menu')}>Back to Menu</MenuButton>
                )}
            </div>

            {selectedNut && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[1500] backdrop-blur-md pointer-events-auto p-4 animate-[fadeIn_0.3s_ease-out]">
                    <div className="relative max-w-md w-full">
                        {/* Scrollable Popup Card */}
                        <div className="bg-[#e4d6a7] border-[6px] border-[#8c6b4a] rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_-8px_0_rgba(140,107,74,0.3)] animate-[popOut_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] max-h-[85vh] overflow-y-scroll custom-scrollbar flex flex-col pr-5">
                            <div className="flex gap-6 mb-8 shrink-0">
                                <div className={`w-24 h-24 rounded-xl border-[4px] flex-shrink-0 relative overflow-hidden shadow-inner flex items-center justify-center transform -rotate-3 p-1 ${
                                    selectedNut.rarity === 'Mitos' ? 'bg-gradient-to-br from-amber-100 to-yellow-200 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.8)] animate-pulse' :
                                    selectedNut.rarity === 'Mythic' ? 'bg-[#ffed4a] border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-pulse' :
                                    selectedNut.rarity === 'Legendary' ? 'bg-[#f3e8ff] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' :
                                    selectedNut.rarity === 'Rare' ? 'bg-[#dbeafe] border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' :
                                    selectedNut.rarity === 'Uncommon' ? 'bg-[#dcfce7] border-green-500' :
                                    'bg-[#c4b687] border-[#8c6b4a]'
                                }`}>
                                    <img src={selectedNut.image} alt={selectedNut.name} className="w-full h-full object-cover rendering-pixelated animate-[float_4s_ease-in-out_infinite]" onError={(e) => { console.error('[DetailView] Image failed to load:', selectedNut.image); e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23c4b687"/><circle cx="16" cy="16" r="8" fill="%238c6b4a"/></svg>' }} />
                                </div>
                                <div className="flex-1 flex flex-col justify-center text-left">
                                    <h2 className="text-2xl font-black text-[#4a2f1d] tracking-widest leading-tight mb-1" style={{textShadow: '0 1px 0 #fff5d1'}}>{selectedNut.name}</h2>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-[#8c6b4a] italic font-bold tracking-wide text-xs bg-white/40 px-2 py-0.5 rounded">#{selectedNut.id.toString().padStart(3, '0')}</p>
                                        <p className={`text-xs font-black uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded border ${
                                            selectedNut.rarity === 'Mitos' ? 'border-amber-500 text-amber-700 bg-amber-100 font-black animate-bounce' :
                                            selectedNut.rarity === 'Mythic' ? 'border-red-400 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 animate-pulse drop-shadow-md animate-bounce' :
                                            selectedNut.rarity === 'Legendary' ? 'border-purple-400 text-purple-600' :
                                            selectedNut.rarity === 'Rare' ? 'border-blue-400 text-blue-600' :
                                            selectedNut.rarity === 'Uncommon' ? 'border-green-500 text-green-700' :
                                            'border-[#8c6b4a]/30 text-[#8c6b4a]'
                                        }`}>
                                            {selectedNut.rarity || 'Common'}
                                        </p>
                                    </div>
                                    <p className="text-[#a39570] italic text-sm">{selectedNut.latinName}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-[#c4b687]/40 p-5 rounded-xl border-2 border-[#8c6b4a]/30 shadow-inner text-left">
                                    <h4 className="text-[10px] uppercase font-black tracking-widest text-[#7a421e] mb-2 opacity-60">General Info</h4>
                                    <p className="text-[#4a2f1d] font-bold leading-relaxed text-sm md:text-base whitespace-pre-line">{selectedNut.description}</p>
                                </div>
                                
                                <div className="bg-[#d4c697] p-5 rounded-xl border-2 border-[#8c6b4a]/30 border-dashed shadow-inner flex gap-4 text-left">
                                    <span className="text-3xl animate-pulse shrink-0">⚠️</span>
                                    <div className="flex flex-col">
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-[#7a421e] mb-1 opacity-60">Safety Note</h4>
                                        <p className="text-[#7a421e] text-sm font-bold leading-tight whitespace-pre-line">{selectedNut.allergyInfo}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t-2 border-[#8c6b4a]/10 text-xs italic text-[#a39570] font-bold text-left pb-2">
                                    Scientific Data: Part of the Sawit Village Nut Collection. Discoverable through exploration and classification.
                                </div>
                            </div>
                        </div>

                        {/* Close Button (Layered Above and After for priority) */}
                        <button 
                            className="absolute -top-4 -right-4 w-12 h-12 bg-[#c4b687] border-[4px] border-[#8c6b4a] rounded-full flex items-center justify-center font-bold text-[#4a2f1d] hover:bg-[#d4c697] hover:scale-110 active:scale-95 transition-all outline-none z-[2000] text-2xl leading-none shadow-[0_4px_0_#8c6b4a] group" 
                            onClick={() => {
                                audioManager.playSfx('close');
                                setSelectedNut(null);
                            }}
                        >
                            <span className="mb-1">×</span>
                        </button>
                    </div>
                </div>
            )}
        </ScreenWrapper>
    );

    if (view === 'encyclopedia') return renderPlaceholder('Encyclopedia', 'Discover and manage your nut collection.');
    if (view === 'classification') return <ScreenWrapper isClient={isClient} particles={particles}><ClassifyNuts onBack={() => setView('menu')} /></ScreenWrapper>;
    if (view === 'leaderboard') return renderPlaceholder('Leaderboard', 'Top 10 Fastest Explorers');

    if (view === 'create') {
        return (
            <ScreenWrapper isClient={isClient} particles={particles}>
                <div className="z-10 bg-[#e4d6a7] border-[6px] border-[#8c6b4a] rounded-3xl p-6 md:p-8 max-w-2xl w-full mx-4 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_-8px_0_rgba(140,107,74,0.3)] flex flex-col md:flex-row gap-8 animate-[slideUp_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#c4b687] border-[4px] border-[#8c6b4a] rounded-2xl py-8 shadow-inner relative overflow-hidden group">
                        <CharacterPreview hairColor={config.hairColor} shirtColor={config.shirtColor} />
                        <div className="mt-6 font-bold text-[#7a421e] tracking-widest uppercase text-sm bg-white/30 px-3 py-1 rounded-full border border-white/50 backdrop-blur-sm shadow-sm group-hover:scale-105 transition-transform">Live Preview</div>
                    </div>
                    
                    <form onSubmit={handlePlaySubmit} className="flex-1 flex flex-col text-[#4a2f1d]">
                        <h2 className="text-3xl font-black text-[#4a2f1d] border-b-[4px] border-[#8c6b4a] pb-3 mb-6 tracking-wide drop-shadow-sm" style={{textShadow: '0 1px 0 #fff5d1'}}>Create Character</h2>
                        
                        <label className="font-bold mb-2 break-words uppercase text-xs text-[#7a421e] tracking-wider">Explorer Name</label>
                        <input 
                            type="text" 
                            required
                            maxLength={16}
                            value={config.name}
                            onChange={(e) => setConfig({ ...config, name: e.target.value })}
                            className="mb-5 p-3 bg-white/80 border-[4px] border-[#8c6b4a] rounded-xl outline-none focus:border-[#4a2f1d] focus:bg-white font-bold text-[#4a2f1d] shadow-inner transition-colors focus:-translate-y-0.5"
                            placeholder="Enter name..."
                        />

                        <label className="font-bold mb-2 break-words uppercase text-xs text-[#7a421e] tracking-wider">Hair Color</label>
                        <div className="relative mb-5 group">
                            <input 
                                type="color" 
                                value={config.hairColor}
                                onChange={(e) => setConfig({ ...config, hairColor: e.target.value })}
                                className="w-full h-12 cursor-pointer opacity-0 absolute inset-0 z-10"
                            />
                            <div className="h-12 border-[4px] border-[#8c6b4a] rounded-xl group-hover:border-[#4a2f1d] shadow-inner transition-colors flex items-center justify-center px-2 relative" style={{backgroundColor: config.hairColor}}>
                                <div className="bg-black/20 px-2 py-1 rounded text-xs font-bold text-white drop-shadow-md border border-white/20 uppercase tracking-widest">{config.hairColor}</div>
                            </div>
                        </div>

                        <label className="font-bold mb-2 break-words uppercase text-xs text-[#7a421e] tracking-wider">Shirt Color</label>
                        <div className="relative mb-8 group">
                            <input 
                                type="color" 
                                value={config.shirtColor}
                                onChange={(e) => setConfig({ ...config, shirtColor: e.target.value })}
                                className="w-full h-12 cursor-pointer opacity-0 absolute inset-0 z-10"
                            />
                            <div className="h-12 border-[4px] border-[#8c6b4a] rounded-xl group-hover:border-[#4a2f1d] shadow-inner transition-colors flex items-center justify-center px-2 relative" style={{backgroundColor: config.shirtColor}}>
                                <div className="bg-black/20 px-2 py-1 rounded text-xs font-bold text-white drop-shadow-md border border-white/20 uppercase tracking-widest">{config.shirtColor}</div>
                            </div>
                        </div>

                        <MenuButton type="submit">Enter World</MenuButton>
                        <button 
                            type="button" 
                            onClick={() => setView('menu')} 
                            className="text-xs font-bold text-[#7a421e] hover:text-[#4a2f1d] text-center w-full uppercase tracking-wider transition-colors pt-2 pb-1"
                        >
                            Back To Menu
                        </button>
                    </form>
                </div>
            </ScreenWrapper>
        );
    }

    if (view === 'biome') {
        return (
            <ScreenWrapper isClient={isClient} particles={particles} isTransitioning={isTransitioning}>
                <div className="z-10 bg-[#e4d6a7] border-[6px] border-[#8c6b4a] rounded-3xl p-8 max-w-4xl w-full mx-4 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_-8px_0_rgba(140,107,74,0.3)] text-center relative flex flex-col animate-[slideUp_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                    <h1 className="text-4xl font-black text-[#4a2f1d] tracking-widest leading-tight mb-2 uppercase" style={{textShadow: '0 2px 0 #fff5d1'}}>Choose Time</h1>
                    <p className="text-[#7a421e] mb-8 font-bold">Select your exploration atmosphere</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Day Biome Card */}
                        <div 
                            onClick={() => handleBiomeSelect('day')}
                            onMouseEnter={() => audioManager.playSfx('hover')}
                            className="bg-[#c4b687] border-[4px] border-[#8c6b4a] rounded-2xl p-6 cursor-pointer hover:border-[#4a2f1d] hover:bg-[#d4c697] hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group relative overflow-hidden shadow-[0_8px_0_#8c6b4a] hover:shadow-[0_4px_0_#4a2f1d] active:shadow-none active:translate-y-[8px]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-5xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">☀️</div>
                            <h3 className="text-2xl font-black text-[#4a2f1d] tracking-widest uppercase mb-2">DAY</h3>
                            <p className="text-[#7a421e] font-bold text-sm">A bright and peaceful exploration. The standard cozy experience.</p>
                        </div>

                        {/* Night Biome Card */}
                        <div 
                            onClick={() => handleBiomeSelect('night')}
                            onMouseEnter={() => audioManager.playSfx('hover')}
                            className="bg-[#354359] border-[4px] border-[#202938] rounded-2xl p-6 cursor-pointer hover:border-[#101520] hover:bg-[#435570] hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group relative overflow-hidden shadow-[0_8px_0_#202938] hover:shadow-[0_4px_0_#101520] active:shadow-none active:translate-y-[8px]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-5xl mb-4 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300">🌙</div>
                            <h3 className="text-2xl font-black text-[#e4d6a7] tracking-widest uppercase mb-2">NIGHT</h3>
                            <p className="text-[#a3b8cc] font-bold text-sm mb-3">A dark, mysterious atmosphere. Limited visibility, tense exploration.</p>
                            <div className="inline-block bg-[#1f2937] border-2 border-[#e4d6a7] rounded-lg px-3 py-1 text-[10px] font-black text-yellow-300 uppercase tracking-widest animate-pulse shadow-md">
                                🍀 +10% Luck Drop!
                            </div>
                        </div>
                    </div>

                    {showNightWarning && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[2000] backdrop-blur-sm pointer-events-auto rounded-3xl p-4">
                            <div className="bg-[#e4d6a7] border-[4px] border-[#8c6b4a] rounded-2xl p-6 text-center max-w-sm animate-[slideUp_0.3s_ease-out] shadow-2xl">
                                <h3 className="text-xl font-black text-[#4a2f1d] uppercase tracking-widest mb-4">⚠️Warning</h3>
                                <p className="text-sm font-bold text-[#7a421e] mb-6 leading-relaxed">
                                    We highly recommend using the Owl or Raven pet, as visibility and environmental lighting during Night Time are extremely limited. Its enhanced vision ability will greatly improve exploration and navigation in dark areas.</p>
                                <button
                                    onClick={handleProceedToNightGame}
                                    className="bg-[#c4b687] border-[3px] border-[#8c6b4a] px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[#4a2f1d] shadow-[0_4px_0_#8c6b4a] hover:translate-y-1 hover:shadow-none transition-all active:scale-95 w-full"
                                >
                                    Okay
                                </button>
                            </div>
                        </div>
                    )}

                    <button 
                        type="button" 
                        onClick={() => setView('create')} 
                        className="text-xs font-bold text-[#7a421e] hover:text-[#4a2f1d] text-center w-full uppercase tracking-wider transition-colors pt-2 pb-1"
                    >
                        Back
                    </button>
                </div>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper isClient={isClient} particles={particles}>
            <div className="z-10 bg-[#e4d6a7] border-[6px] border-[#8c6b4a] rounded-3xl p-8 max-w-md w-full mx-4 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_-8px_0_rgba(140,107,74,0.3)] text-center relative overflow-hidden animate-[slideUp_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)] group">
                <div className="mb-10 mt-2 relative">
                    <h1 
                        className="text-5xl md:text-6xl font-black text-[#fff5d1] tracking-widest leading-tight animate-[float_3s_ease-in-out_infinite]" 
                        style={{
                            textShadow: '0 6px 0 #8c6b4a, 0 -3px 0 #8c6b4a, 3px 0 0 #8c6b4a, -3px 0 0 #8c6b4a, 0 15px 20px rgba(0,0,0,0.5)',
                            WebkitTextStroke: '1px #4a2f1d'
                        }}
                    >
                        Find My
                        <br/>
                        Nutz
                    </h1>
                </div>
                
                <div className="space-y-4 relative z-10 mt-4">
                    <MenuButton onClick={() => setView('create')}>Play</MenuButton>
                    <MenuButton onClick={() => setView('encyclopedia')}>Encyclopedia</MenuButton>
                    <MenuButton onClick={() => setView('classification')}>Identify My Nut</MenuButton>
                    <MenuButton onClick={() => setView('leaderboard')}>Leaderboard</MenuButton>
                </div>

            </div>

            {/* Floating circular Gacha Spin Wheel Button - Positioned top-left of screen, only in Main Menu */}
            <button 
                onClick={() => {
                    audioManager.playSfx('popup');
                    setShowGacha(true);
                }}
                onMouseEnter={() => audioManager.playSfx('hover')}
                className="fixed top-6 left-6 w-12 h-12 bg-[#e8a87c] border-[4px] border-[#4a2f1d] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-[0_4px_0_#4a2f1d,0_0_15px_rgba(251,191,36,0.6)] hover:translate-y-1 hover:shadow-none transition-all active:scale-95 group z-[100] animate-[float_3s_ease-in-out_infinite]"
                style={{ animationDelay: '0.5s' }}
                title="Spin Wheel"
            >
                <span className="group-hover:scale-110 transition-transform">🎡</span>
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Cozy flashing border overlay */}
                <div className="absolute inset-0 border-2 border-dashed border-[#ffd700] opacity-35 animate-pulse pointer-events-none rounded-full" />
            </button>

            {/* Floating Info Button - Positioned top-right of screen, only in Main Menu */}
            <button 
                onClick={() => {
                    audioManager.playSfx('popup');
                    setShowInfo(true);
                }}
                onMouseEnter={() => audioManager.playSfx('hover')}
                className="fixed top-6 right-6 w-12 h-12 bg-[#8c6b4a] border-[4px] border-[#4a2f1d] rounded-full flex items-center justify-center text-[#fff5d1] font-black text-2xl shadow-[0_4px_0_#4a2f1d] hover:translate-y-1 hover:shadow-none transition-all active:scale-95 group z-[100] animate-[float_3s_ease-in-out_infinite]"
                title="Information"
            >
                <span className="group-hover:scale-110 transition-transform">!</span>
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            {showInfo && renderInfoModal()}
            {showGacha && (
                <GachaWheel 
                    onClose={() => setShowGacha(false)} 
                    onEquippedPetChange={(pet) => setEquippedPet(pet)} 
                />
            )}
        </ScreenWrapper>
    );
}
