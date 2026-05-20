'use client';

import React, { useState, useEffect, useRef } from 'react';
import { audioManager } from '../lib/AudioManager';

// Define the Pet data model
export interface Pet {
  id: string;
  name: string;
  role: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  color: string;
  glowColor: string;
  skillName: string;
  skillEffect: string;
  passiveDesc: string;
  basePassiveValue: number;
  levelUpMultiplier: number;
  statName: string;
  statUnit: string;
  tradeoff?: string;
  frame: number;
}

export const MAX_PET_LEVEL = 10;

// Returns cooldown in seconds for a given pet at a given level
export const getPetCooldown = (petId: string, level: number): number => {
  const l = Math.min(Math.max(level, 1), MAX_PET_LEVEL);
  switch (petId) {
    case 'squirrel': return 0;              // Always-on passive, no cooldown
    case 'firefly': return Math.max(10, 30 - (l - 1) * 2); // L1=30s → L10=12s (cap 10s)
    case 'owl':     return Math.max(10, 45 - (l - 1) * 4); // L1=45s → L10=9s (cap 10)
    case 'fox':     return Math.max(10, 40 - (l - 1) * 3); // L1=40s → L10=13s
    case 'deer':    return Math.max(5,  20 - (l - 1) * 2); // L1=20s → L10=2s (cap 5)
    case 'raven':   return 0; // Always-on passive, no cooldown
    default: return 30;
  }
};

export const PETS: Pet[] = [
  {
    id: 'squirrel',
    name: 'Nutty Squirrel',
    role: 'Explorer / Beginner Friendly',
    rarity: 'Common',
    color: '#8c6b4a',
    glowColor: 'rgba(140, 107, 74, 0.4)',
    skillName: 'Treasure Sniff',
    skillEffect: 'Auto-collects nuts within a small radius (28px at Lv1). Radius scales +8px per level. No button press needed!',
    passiveDesc: 'Nuts within radius are automatically collected. Nearby nuts blink green as a visual indicator.',
    basePassiveValue: 28,
    levelUpMultiplier: 8,
    statName: 'Auto-collect Radius',
    statUnit: 'px',
    frame: 0
  },
  {
    id: 'firefly',
    name: 'Freeze Firefly',
    role: 'Time Stopper / Utility',
    rarity: 'Uncommon',
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    skillName: 'Time Freeze',
    skillEffect: 'Active: Press SPACE to freeze game time for 3s (duration increases by 1s every odd level). Cooldown: 30s at Lv1, -2s/level. Lv10 cooldown: 12s.',
    passiveDesc: 'Freezes in-game time (player can still move). Triggers on SPACE. Higher level = longer freeze & shorter cooldown.',
    basePassiveValue: 30,
    levelUpMultiplier: -2,
    statName: 'Skill Cooldown',
    statUnit: 's',
    frame: 1
  },
  {
    id: 'owl',
    name: 'Owl Watcher',
    role: 'Scout / Night Vision',
    rarity: 'Rare',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    skillName: 'Night Vision',
    skillEffect: 'Passive: Expands the light radius permanently. Grants +0.30 light scale per level. Max Level 10 grants massive 3.80 scale.',
    passiveDesc: 'Provides permanent night vision expansion. No active triggers. The radius permanently scales up with level.',
    basePassiveValue: 1.10,
    levelUpMultiplier: 0.30,
    statName: 'Light Scale',
    statUnit: 'x',
    frame: 2
  },
  {
    id: 'fox',
    name: 'Lucky Fox',
    role: 'Rarity Hunter',
    rarity: 'Epic',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    skillName: 'Fortune Trail',
    skillEffect: 'Passive: Increases Rare nut drop rate by +2% and Epic nut drop rate by +1% at Lv1. Each level further increases the bonus, reaching +12% Rare and +10% Epic drop rate at Lv10.',
    passiveDesc: 'Boosts Rare nut drop rate (+2% up to +12%) and Epic nut drop rate (+1% up to +10%) while slightly reducing Common and Uncommon spawn rates as a trade-off.',
    basePassiveValue: 2,
    levelUpMultiplier: 1.1111,
    statName: 'Passive Rare Drop Bonus',
    statUnit: '%',
    tradeoff: 'Reduces Common spawn rate (-2% up to -12%) and Uncommon spawn rate (-1% up to -10%) to balance the increased rare drops.',
    frame: 3
  },
  {
    id: 'deer',
    name: 'Spirit Deer',
    role: 'Speedrun / High Skill',
    rarity: 'Legendary',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.5)',
    skillName: 'Forest Blessing',
    skillEffect: 'Passive: Increases character base speed by +0.2 (+2%) at Lv1, increasing by +0.2 (+2%) per level. Active: Automatically triggers on nut collection to grant +0.5 (+5%) speed increase per level (+5% up to +50%) for 3 seconds constant duration (refreshes on collection, does not stack).',
    passiveDesc: 'Boosts character base speed (+2% up to +20%). Nut collection adds a highly potent temporary boost (+5% up to +50%) for 3s.',
    basePassiveValue: 2,
    levelUpMultiplier: 2,
    statName: 'Passive Speed Bonus',
    statUnit: '%',
    tradeoff: 'Reduces Legendary nut spawn rate by -1% to balance the mystical speed energies.',
    frame: 4
  },
  {
    id: 'raven',
    name: 'Raven Scout',
    role: 'Rare Hunter / Advanced Exploration',
    rarity: 'Mythic',
    color: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.6)',
    skillName: 'Shadow Instinct',
    skillEffect: 'Passive: Increases speed by +0.5% (+0.2%/lv), night vision by +0.20 (+0.20/lv), and luck drops: Rare +4% (+1%/lv), Epic +3% (+1%/lv), Legendary +2% (+1%/lv), and Mythic +1% (+1%/lv).',
    passiveDesc: 'Increases speed (+0.5% s/d +2.3%), night vision (+20% s/d +200%), and luck drops (Rare +4% s/d +13%, Epic +3% s/d +12%, Legendary +2% s/d +11%, Mythic +1% s/d +10%).',
    basePassiveValue: 4,
    levelUpMultiplier: 1,
    statName: 'Passive Rare Luck',
    statUnit: '%',
    tradeoff: 'Reduces Common and Uncommon spawn rates to balance the ultimate mythical scouting aura.',
    frame: 5
  }
];

// SVGs for high fidelity visual pixel elements
export const SquirrelSVG = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 32 32" className={`${className} rendering-pixelated`}>
    {/* Squirrel Body */}
    <rect x="10" y="14" width="10" height="12" fill="#8c6b4a" />
    <rect x="12" y="16" width="6" height="10" fill="#d4c697" />
    {/* Tail */}
    <rect x="18" y="10" width="8" height="12" rx="3" fill="#7a5230" />
    <rect x="22" y="8" width="4" height="8" fill="#5c3c23" />
    {/* Head & Ears */}
    <rect x="8" y="6" width="10" height="9" fill="#8c6b4a" />
    <rect x="8" y="3" width="3" height="3" fill="#7a5230" />
    <rect x="15" y="3" width="3" height="3" fill="#7a5230" />
    {/* Eyes & Nose */}
    <rect x="10" y="8" width="2" height="2" fill="#000" />
    <rect x="7" y="10" width="2" height="2" fill="#e8a87c" />
    {/* Acorn */}
    <rect x="6" y="18" width="5" height="5" fill="#f5c69a" />
    <rect x="5" y="16" width="7" height="2" fill="#4a2f1d" />
    <rect x="8" y="15" width="1" height="2" fill="#4a2f1d" />
  </svg>
);

export const FireflySVG = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 32 32" className={`${className} rendering-pixelated`}>
    <circle cx="16" cy="16" r="14" fill="#1e293b" opacity="0.4" />
    {/* Soft glow radial aura */}
    <circle cx="16" cy="16" r="8" fill="#d4ff33" opacity="0.35" className="animate-ping" />
    <circle cx="16" cy="16" r="5" fill="#d4ff33" opacity="0.6" />
    {/* Firefly Body */}
    <rect x="14" y="12" width="4" height="10" rx="2" fill="#1e1b4b" />
    <rect x="15" y="18" width="2" height="4" fill="#d4ff33" />
    {/* Wings */}
    <ellipse cx="11" cy="14" rx="4" ry="2" fill="#38bdf8" opacity="0.7" transform="rotate(-30 11 14)" />
    <ellipse cx="21" cy="14" rx="4" ry="2" fill="#38bdf8" opacity="0.7" transform="rotate(30 21 14)" />
    {/* Antennae */}
    <rect x="13" y="9" width="1" height="3" fill="#000" />
    <rect x="18" y="9" width="1" height="3" fill="#000" />
  </svg>
);

export const FoxSVG = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 32 32" className={`${className} rendering-pixelated`}>
    {/* Fox Body */}
    <rect x="9" y="15" width="12" height="11" fill="#ea580c" />
    <rect x="11" y="17" width="8" height="9" fill="#fff" />
    {/* Fluffy tail with white tip */}
    <path d="M 21,18 L 29,12 L 27,24 Z" fill="#c2410c" />
    <rect x="26" y="12" width="3" height="4" fill="#fff" />
    {/* Head */}
    <rect x="8" y="7" width="12" height="9" fill="#ea580c" />
    {/* Snout */}
    <rect x="12" y="12" width="4" height="4" fill="#fff" />
    <rect x="13" y="14" width="2" height="2" fill="#111" />
    {/* Ears */}
    <polygon points="8,7 8,2 12,7" fill="#c2410c" />
    <polygon points="20,7 20,2 16,7" fill="#c2410c" />
    {/* Eyes */}
    <rect x="10" y="9" width="2" height="2" fill="#111" />
    <rect x="16" y="9" width="2" height="2" fill="#111" />
  </svg>
);

export const DeerSVG = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 32 32" className={`${className} rendering-pixelated`}>
    <circle cx="16" cy="16" r="14" fill="#0e7490" opacity="0.2" />
    {/* Deer Body */}
    <rect x="11" y="15" width="10" height="9" fill="#22d3ee" opacity="0.8" />
    <rect x="12" y="24" width="2" height="5" fill="#0891b2" />
    <rect x="18" y="24" width="2" height="5" fill="#0891b2" />
    {/* Neck & Head */}
    <rect x="16" y="9" width="5" height="7" fill="#22d3ee" opacity="0.8" />
    <rect x="17" y="6" width="6" height="5" fill="#22d3ee" opacity="0.9" />
    <rect x="21" y="8" width="2" height="2" fill="#0891b2" />
    {/* Majestic Antlers */}
    <path d="M 18,6 L 15,1 L 11,2 M 15,1 L 16,4" stroke="#e0f7fa" strokeWidth="1" fill="none" />
    <path d="M 20,6 L 23,1 L 27,2 M 23,1 L 22,4" stroke="#e0f7fa" strokeWidth="1" fill="none" />
    {/* Soft Cyan Sparkles */}
    <circle cx="6" cy="10" r="1.5" fill="#a5f3fc" opacity="0.8" />
    <circle cx="27" cy="18" r="1.5" fill="#a5f3fc" opacity="0.8" />
  </svg>
);

export const RavenSVG = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 32 32" className={`${className} rendering-pixelated`}>
    <circle cx="16" cy="16" r="14" fill="#000" opacity="0.5" />
    {/* Raven Body */}
    <rect x="10" y="12" width="12" height="12" rx="3" fill="#0f172a" />
    <rect x="12" y="10" width="8" height="8" rx="2" fill="#0f172a" />
    {/* Beak */}
    <polygon points="20,12 26,14 20,16" fill="#f59e0b" />
    {/* Glowing Crimson Eyes */}
    <circle cx="18" cy="13" r="1.5" fill="#ef4444" className="animate-pulse" />
    {/* Wings */}
    <path d="M 10,14 L 3,18 L 9,22 Z" fill="#020617" />
    {/* Tail Feathers */}
    <rect x="14" y="24" width="4" height="4" fill="#020617" />
  </svg>
);

export const NutCoinsSVG = ({ className = 'w-16 h-16', pulse = true }) => (
  <svg viewBox="0 0 32 32" className={`${className} rendering-pixelated ${pulse ? 'animate-[float_2s_infinite_ease-in-out]' : ''}`}>
    {/* Outer gold border */}
    <circle cx="16" cy="16" r="12" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
    {/* Inner detail */}
    <circle cx="16" cy="16" r="8" fill="#f59e0b" />
    {/* Carved nut shape */}
    <path d="M 16,11 L 19,15 C 19,19 13,19 13,15 Z" fill="#d97706" />
    <rect x="15" y="9" width="2" height="2" fill="#92400e" />
    {/* Shine highlight */}
    <circle cx="13" cy="13" r="1.5" fill="#fff" opacity="0.9" />
  </svg>
);

export const OwlSVG = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 32 32" className={`${className} rendering-pixelated`}>
    {/* Cyan ambient glow */}
    <circle cx="16" cy="17" r="11" fill="#0e7490" opacity="0.25" />
    {/* Owl body */}
    <rect x="10" y="14" width="12" height="13" rx="3" fill="#475569" />
    <rect x="12" y="16" width="8" height="9" fill="#334155" />
    {/* Wing feathers */}
    <path d="M10,16 L5,22 L10,24 Z" fill="#334155" />
    <path d="M22,16 L27,22 L22,24 Z" fill="#334155" />
    {/* Head */}
    <rect x="11" y="6" width="10" height="9" rx="2" fill="#475569" />
    {/* Ear tufts */}
    <polygon points="12,6 10,1 14,5" fill="#334155" />
    <polygon points="20,6 22,1 18,5" fill="#334155" />
    {/* Large glowing cyan eyes */}
    <circle cx="13" cy="10" r="2.5" fill="#06b6d4" />
    <circle cx="19" cy="10" r="2.5" fill="#06b6d4" />
    <circle cx="13" cy="10" r="1" fill="#fff" opacity="0.8" />
    <circle cx="19" cy="10" r="1" fill="#fff" opacity="0.8" />
    {/* Beak */}
    <polygon points="15,12 17,12 16,14" fill="#f59e0b" />
  </svg>
);

export const PetIcon = ({ id, className = 'w-12 h-12' }: { id: string, className?: string }) => {
  switch (id) {
    case 'squirrel': return <SquirrelSVG className={className} />;
    case 'firefly': return <FireflySVG className={className} />;
    case 'owl': return <OwlSVG className={className} />;
    case 'fox': return <FoxSVG className={className} />;
    case 'deer': return <DeerSVG className={className} />;
    case 'raven': return <RavenSVG className={className} />;
    case 'coins': return <NutCoinsSVG className={className} pulse={false} />;
    default: return null;
  }
};

interface GachaWheelProps {
  onClose: () => void;
  onEquippedPetChange?: (pet: any) => void;
}

export default function GachaWheel({ onClose, onEquippedPetChange }: GachaWheelProps) {
  const [activeTab, setActiveTab] = useState<'gacha' | 'stable' | 'history'>('gacha');
  const [coins, setCoins] = useState<number>(200);
  const [unlockedPets, setUnlockedPets] = useState<string[]>([]);
  const [equippedPetId, setEquippedPetId] = useState<string | null>(null);
  const [petShards, setPetShards] = useState<Record<string, number>>({});
  const [petLevels, setPetLevels] = useState<Record<string, number>>({});
  const [spinHistory, setSpinHistory] = useState<any[]>([]);

  // Wheel Spin Animation States
  const [isSpinning, setIsSpinning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [rewardResult, setRewardResult] = useState<any>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  
  // Coin Recovery Gift System
  const [giftCooldown, setGiftCooldown] = useState<number>(0);

  // Auto-dismiss error toast
  useEffect(() => {
    if (errorToast) {
      const t = setTimeout(() => setErrorToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [errorToast]);

  // Load state from localStorage
  useEffect(() => {
    try {
      const storedCoins = localStorage.getItem('sawit_village_nut_coins');
      if (storedCoins) setCoins(parseInt(storedCoins));
      else localStorage.setItem('sawit_village_nut_coins', '200'); // Starting currency

      const storedPets = localStorage.getItem('sawit_village_unlocked_pets');
      if (storedPets) setUnlockedPets(JSON.parse(storedPets));

      const storedEquipped = localStorage.getItem('sawit_village_equipped_pet');
      if (storedEquipped) setEquippedPetId(JSON.parse(storedEquipped));

      const storedShards = localStorage.getItem('sawit_village_pet_shards');
      if (storedShards) setPetShards(JSON.parse(storedShards));

      const storedLevels = localStorage.getItem('sawit_village_pet_levels');
      if (storedLevels) setPetLevels(JSON.parse(storedLevels));

      const storedHistory = localStorage.getItem('sawit_village_spin_history');
      if (storedHistory) setSpinHistory(JSON.parse(storedHistory));

      // Load cooldown based on last claimed cozy seeds timestamp
      const lastClaimTime = localStorage.getItem('sawit_village_last_cozy_gift_time');
      if (lastClaimTime) {
        const elapsedSeconds = Math.floor((Date.now() - parseInt(lastClaimTime)) / 1000);
        const cooldownRemaining = Math.max(0, 1800 - elapsedSeconds);
        setGiftCooldown(cooldownRemaining);
      }
    } catch (e) {
      console.error('Failed to load Gacha states from localStorage', e);
    }
  }, []);

  // Update cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (giftCooldown > 0) {
      timer = setTimeout(() => setGiftCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [giftCooldown]);

  // Redraw canvas whenever spinning changes, activeTab changes, or component mounts
  useEffect(() => {
    if (!isSpinning && activeTab === 'gacha') {
      const timer = setTimeout(() => {
        drawWheel(0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSpinning, activeTab]);

  const saveState = (
    newCoins: number,
    newPets: string[],
    newEquipped: string | null,
    newShards: Record<string, number>,
    newLevels: Record<string, number>,
    newHistory: any[]
  ) => {
    try {
      setCoins(newCoins);
      setUnlockedPets(newPets);
      setEquippedPetId(newEquipped);
      setPetShards(newShards);
      setPetLevels(newLevels);
      setSpinHistory(newHistory);

      localStorage.setItem('sawit_village_nut_coins', newCoins.toString());
      localStorage.setItem('sawit_village_unlocked_pets', JSON.stringify(newPets));
      localStorage.setItem('sawit_village_equipped_pet', JSON.stringify(newEquipped));
      localStorage.setItem('sawit_village_pet_shards', JSON.stringify(newShards));
      localStorage.setItem('sawit_village_pet_levels', JSON.stringify(newLevels));
      localStorage.setItem('sawit_village_spin_history', JSON.stringify(newHistory));

      // Trigger custom React event to update Phaser or page states
      if (onEquippedPetChange) {
        if (newEquipped) {
          const petData = PETS.find(p => p.id === newEquipped);
          onEquippedPetChange({
            ...petData,
            level: newLevels[newEquipped] || 1,
            shards: newShards[newEquipped] || 0
          });
        } else {
          onEquippedPetChange(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Draw the Wheel on Canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 15;
    const numSlices = 7;
    const sliceAngle = (Math.PI * 2) / numSlices;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw outer wood border drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    // 2. Draw outer wood-textured circle border
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = '#4a2f1d';
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#8c6b4a';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#2b1c11';
    ctx.fill();

    // 3. Draw Slices — 7 slices: Common/Uncommon/Rare/Epic/Legendary/Mythic/Coins
    const sliceColors = [
      { bg1: '#7a6250', bg2: '#5f4b3d', label: 'Squirrel' },   // Common
      { bg1: '#16a34a', bg2: '#15803d', label: 'Firefly' },    // Uncommon
      { bg1: '#0891b2', bg2: '#0e7490', label: 'Owl' },        // Rare
      { bg1: '#7e22ce', bg2: '#6b21a8', label: 'Fox' },        // Epic
      { bg1: '#d97706', bg2: '#b45309', label: 'Deer' },       // Legendary
      { bg1: '#b91c1c', bg2: '#991b1b', label: 'Raven' },      // Mythic
      { bg1: '#eab308', bg2: '#ca8a04', label: '+300 Coins' }  // Coins
    ];

    for (let i = 0; i < numSlices; i++) {
      const currentSliceAngle = i * sliceAngle + angle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius - 4, currentSliceAngle, currentSliceAngle + sliceAngle);
      ctx.closePath();

      // Create a nice gradient for depth
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius - 4);
      grad.addColorStop(0, sliceColors[i].bg1);
      grad.addColorStop(1, sliceColors[i].bg2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw subtle dividing borders
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text / labels along radial wedges
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(currentSliceAngle + sliceAngle / 2);

      // Label text formatting
      ctx.fillStyle = '#fff5d1';
      ctx.font = 'bold 9px "Courier New", Courier, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      // Text drop shadow
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const label = sliceColors[i].label.toUpperCase();
      ctx.fillText(label, radius - 28, 0);

      // Draw simple symbolic graphics on slices
      ctx.fillStyle = '#fbbf24'; // coin gold
      ctx.beginPath();
      if (i === 5) {
        // Draw Coins
        ctx.arc(radius - 16, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.stroke();
      } else {
        // Draw little star/diamond representing pet
        ctx.moveTo(radius - 20, 0);
        ctx.lineTo(radius - 16, -3);
        ctx.lineTo(radius - 12, 0);
        ctx.lineTo(radius - 16, 3);
        ctx.closePath();
        ctx.fillStyle = i === 0 ? '#d1d5db' : i === 1 ? '#60a5fa' : i === 2 ? '#c084fc' : i === 3 ? '#fbbf24' : '#f87171';
        ctx.fill();
      }
      ctx.restore();
    }

    // 4. Draw outer brass rivets on outer wood border (every 60 degrees)
    for (let i = 0; i < 6; i++) {
      const rivetAngle = i * (Math.PI / 3) + angle;
      const rx = cx + Math.cos(rivetAngle) * (radius + 4);
      const ry = cy + Math.sin(rivetAngle) * (radius + 4);

      ctx.beginPath();
      ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700'; // shining brass rivet
      ctx.fill();
      ctx.strokeStyle = '#856404';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tiny white shine dot
      ctx.beginPath();
      ctx.arc(rx - 1, ry - 1, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // 5. Center cap brass housing & SPIN button overlay
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#4a2f1d';
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#8c6b4a';
    ctx.fill();

    // Center jewel
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626'; // glowing ruby core
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 6. Draw glowing top pointer (the indicator)
    ctx.save();
    ctx.translate(cx, cy - radius + 12);
    // Add physical bob/jiggle effect if active (handled outside, but we can add minor tilt)
    ctx.rotate(0); 

    // Draw pointer shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // Pointer body (golden arrow pointing down)
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(10, -18);
    ctx.lineTo(10, -6);
    ctx.lineTo(0, 8); // Tip points down
    ctx.lineTo(-10, -6);
    ctx.closePath();

    ctx.fillStyle = '#fbbf24'; // bright shiny gold
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Little ruby indicator inset
    ctx.beginPath();
    ctx.moveTo(-4, -12);
    ctx.lineTo(4, -12);
    ctx.lineTo(0, -3);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    ctx.restore();
  };

  // Perform Gacha Spin Wheel Logic
  const startSpin = () => {
    if (isSpinning) return;
    if (coins < 100) {
      audioManager.playSfx('close');
      setErrorToast('Not enough Nut Coins! Claim your daily cozy seeds below to get +150 Coins.');
      return;
    }

    setIsSpinning(true);
    audioManager.playSfx('click');

    // 1. Deduct Spin Cost
    const currentCoins = coins - 100;

    // 2. Roll Random Reward Weighted Index
    // Weights: Common 45% | Uncommon 28% | Rare 15% | Epic 7% | Legendary 3% | Mythic 0.5% | Coins 1.5%
    const weights = [45, 28, 15, 7, 3, 0.5, 1.5];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let winnerIndex = 0;
    
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) {
        winnerIndex = i;
        break;
      }
    }

    // 3. Set up Animation Parameters
    const startAngle = 0;
    const sliceAngle = (Math.PI * 2) / 7;
    const fullSpins = 6; // Spin 6 full loops for high suspense
    
    // Mathematically calculate precise ending angle so pointer points directly at center of winnerIndex wedge
    // Top pointer is at -90deg (1.5*PI radians) relative to standard 0-angle.
    const targetAngle = (Math.PI * 1.5) - (winnerIndex + 0.5) * sliceAngle + (Math.PI * 2 * fullSpins);
    
    const spinDuration = 5200; // 5.2 seconds long epic suspense spin
    const startTime = performance.now();
    let lastTickedSlice = -1;
    let lastSuspenseTime = 0;

    const animate = (nowTime: number) => {
      const elapsed = nowTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Beautiful retro Ease-Out Cubic function
      const easeProgress = 1 - Math.pow(1 - progress, 3.2);
      const currentAngle = startAngle + targetAngle * easeProgress;

      // Draw wheel at new angle
      drawWheel(currentAngle);

      // Tactile sound effect - tick whenever slice boundary passes under the pointer
      // We calculate current slice pointing top (-90 degrees relative to rotated wheel)
      const currentSlice = Math.floor(
        (Math.PI * 1.5 - (currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / sliceAngle
      );

      if (currentSlice !== lastTickedSlice && progress < 0.98) {
        audioManager.playSfx('tick');
        lastTickedSlice = currentSlice;
      }

      // Suspense slow dramatic hum as progress moves between 65% and 92%
      if (progress > 0.65 && progress < 0.92 && nowTime - lastSuspenseTime > 400) {
        audioManager.playSfx('suspense');
        lastSuspenseTime = nowTime;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Spin finished!
        setIsSpinning(false);
        audioManager.playSfx('reward');
        handleSpinReward(winnerIndex, currentCoins);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleSpinReward = (winnerIndex: number, currentCoins: number) => {
    let result: any = null;
    let newCoins = currentCoins;
    let newPets = [...unlockedPets];
    let newEquipped = equippedPetId;
    let newShards = { ...petShards };
    let newLevels = { ...petLevels };
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let historyMessage = '';

    if (winnerIndex === 6) {
      // Golden Coins reward — static +300
      const coinsWon = 300;
      newCoins += coinsWon;
      
      result = {
        type: 'coins',
        name: `+300 Nut Coins`,
        amount: coinsWon,
        rarity: 'Uncommon',
        color: '#fbbf24',
        skillEffect: 'Bonus Nut Coins! Spend these in the Main Menu to spin the Gacha Wheel again and expand your cozy companion collection.'
      };

      historyMessage = `[${timestamp}] Won +300 Nut Coins Bonus!`;
      
      saveState(newCoins, newPets, newEquipped, newShards, newLevels, [
        { message: historyMessage, id: Date.now() },
        ...spinHistory
      ]);

      setRewardResult(result);
      setShowRewardPopup(true);
    } else {
      // Pet Reward
      const rolledPet = PETS[winnerIndex];
      const isDuplicate = unlockedPets.includes(rolledPet.id);
      
      let duplicateRefund = 30; // duplicate coin refund
      let shardGained = 1;

      if (!isDuplicate) {
        // New Pet unlocked!
        newPets.push(rolledPet.id);
        newLevels[rolledPet.id] = 1;
        newShards[rolledPet.id] = 0;
        
        result = {
          type: 'pet',
          id: rolledPet.id,
          name: rolledPet.name,
          role: rolledPet.role,
          rarity: rolledPet.rarity,
          color: rolledPet.color,
          skillName: rolledPet.skillName,
          skillEffect: rolledPet.skillEffect,
          passiveDesc: rolledPet.passiveDesc,
          tradeoff: rolledPet.tradeoff,
          isDuplicate: false,
          level: 1,
          shards: 0
        };

        historyMessage = `[${timestamp}] UNLOCKED ${rolledPet.name} (${rolledPet.rarity})!`;
      } else {
        // Duplicate Pet duplicate handling
        const prevLevel = newLevels[rolledPet.id] || 1;
        const isAtMaxLevel = prevLevel >= MAX_PET_LEVEL;
        
        if (isAtMaxLevel) {
          // At max level: give +100 coins instead of shard
          const maxLevelBonus = 100;
          newCoins += maxLevelBonus + duplicateRefund;
          
          result = {
            type: 'pet',
            id: rolledPet.id,
            name: rolledPet.name,
            role: rolledPet.role,
            rarity: rolledPet.rarity,
            color: rolledPet.color,
            skillName: rolledPet.skillName,
            skillEffect: rolledPet.skillEffect,
            passiveDesc: rolledPet.passiveDesc,
            tradeoff: rolledPet.tradeoff,
            isDuplicate: true,
            leveledUp: false,
            levelBefore: prevLevel,
            levelAfter: prevLevel,
            shardsBefore: newShards[rolledPet.id] || 0,
            shardsAfter: newShards[rolledPet.id] || 0,
            refundCoins: maxLevelBonus + duplicateRefund,
            isMaxLevel: true
          };
          historyMessage = `[${timestamp}] ${rolledPet.name} MAX LEVEL! +${maxLevelBonus + duplicateRefund} Coins`;
        } else {
          const currentShards = (newShards[rolledPet.id] || 0) + shardGained;
          
          newCoins += duplicateRefund;
          
          let leveledUp = false;
          let finalLevel = prevLevel;
          let finalShards = currentShards;

          if (currentShards >= 3) {
            finalLevel = Math.min(prevLevel + 1, MAX_PET_LEVEL);
            finalShards = 0;
            leveledUp = true;
            audioManager.playSfx('discover');
          }

          newLevels[rolledPet.id] = finalLevel;
          newShards[rolledPet.id] = finalShards;

          result = {
            type: 'pet',
            id: rolledPet.id,
            name: rolledPet.name,
            role: rolledPet.role,
            rarity: rolledPet.rarity,
            color: rolledPet.color,
            skillName: rolledPet.skillName,
            skillEffect: rolledPet.skillEffect,
            passiveDesc: rolledPet.passiveDesc,
            tradeoff: rolledPet.tradeoff,
            isDuplicate: true,
            leveledUp,
            levelBefore: prevLevel,
            levelAfter: finalLevel,
            shardsBefore: currentShards - 1,
            shardsAfter: finalShards,
            refundCoins: duplicateRefund,
            isMaxLevel: false
          };

          if (leveledUp) {
            historyMessage = finalLevel >= MAX_PET_LEVEL
              ? `[${timestamp}] ${rolledPet.name} reached MAX LEVEL ${MAX_PET_LEVEL}! 🎉`
              : `[${timestamp}] Dup ${rolledPet.name} -> UPGRADED to Lvl ${finalLevel}!`;
          } else {
            historyMessage = `[${timestamp}] Dup ${rolledPet.name} (+${duplicateRefund} Coins, Shard +1)`;
          }
        }
      }

      saveState(newCoins, newPets, newEquipped, newShards, newLevels, [
        { message: historyMessage, id: Date.now() },
        ...spinHistory
      ]);

      setRewardResult(result);
      setShowRewardPopup(true);
    }
  };

  const handleEquipClick = (petId: string) => {
    audioManager.playSfx('click');
    const isEquipped = equippedPetId === petId;
    const nextEquipped = isEquipped ? null : petId;
    
    saveState(coins, unlockedPets, nextEquipped, petShards, petLevels, spinHistory);
  };

  const claimDailyGift = () => {
    if (giftCooldown > 0) return;
    audioManager.playSfx('collect');
    
    const giftAmount = 150;
    const nextCoins = coins + giftAmount;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    saveState(nextCoins, unlockedPets, equippedPetId, petShards, petLevels, [
      { message: `[${timestamp}] Claimed Cozy Gift +150 Nut Coins!`, id: Date.now() },
      ...spinHistory
    ]);

    localStorage.setItem('sawit_village_last_cozy_gift_time', Date.now().toString());
    setGiftCooldown(1800); // 30 minutes in seconds
  };

  const resetAllGachaProgress = () => {
    setShowConfirmReset(true);
  };

  const doReset = () => {
    saveState(200, [], null, {}, {}, []);
    localStorage.removeItem('sawit_village_last_cozy_gift_time');
    setGiftCooldown(0);
    setShowConfirmReset(false);
    audioManager.playSfx('close');
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[9000] backdrop-blur-md pointer-events-auto p-3 md:p-6 animate-[fadeIn_0.3s_ease-out] font-sans">
      
      {/* Premium Cozy Fantasy Board Container */}
      <div className="relative bg-[#e4d6a7] border-[6px] border-[#8c6b4a] rounded-[36px] w-full max-w-5xl shadow-[0_24px_50px_rgba(0,0,0,0.7),inset_0_-10px_0_rgba(140,107,74,0.4)] animate-[popOut_0.5s_cubic-bezier(0.175,0.885,0.32,1.2)] flex flex-col max-h-[92vh] overflow-hidden text-[#4a2f1d]">
        
        {/* Brass corner trim accents */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-[#ffd700]/60 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-[#ffd700]/60 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-[#ffd700]/60 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-[#ffd700]/60 rounded-br-xl pointer-events-none" />

        {/* Header Board */}
        <div className="bg-[#8c6b4a]/25 border-b-[4px] border-[#8c6b4a] py-3 px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl shrink-0">🎯</span>
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest leading-none text-[#4a2f1d]" style={{ textShadow: '0 2px 0 #fff5d1' }}>Gacha Spin Wheel</h1>
              <p className="text-[10px] uppercase font-black tracking-wider text-[#7a421e]/80">Claim cozy mythical forest companions</p>
            </div>
          </div>

          {/* Tab Navigation buttons */}
          <div className="flex bg-[#2b1c11] p-1 border-2 border-[#8c6b4a] rounded-xl gap-1">
            <button 
              onClick={() => { audioManager.playSfx('hover'); setActiveTab('gacha'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${activeTab === 'gacha' ? 'bg-[#ffd700] text-[#2b1c11] shadow-md' : 'text-[#fff5d1] hover:bg-white/10'}`}
            >
              🎡 Spin Wheel
            </button>
            <button 
              onClick={() => { audioManager.playSfx('hover'); setActiveTab('stable'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${activeTab === 'stable' ? 'bg-[#ffd700] text-[#2b1c11] shadow-md' : 'text-[#fff5d1] hover:bg-white/10'}`}
            >
              🦊 My Sanctuary ({unlockedPets.length}/6)
            </button>
            <button 
              onClick={() => { audioManager.playSfx('hover'); setActiveTab('history'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${activeTab === 'history' ? 'bg-[#ffd700] text-[#2b1c11] shadow-md' : 'text-[#fff5d1] hover:bg-white/10'}`}
            >
              📜 Log
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col min-h-0 bg-gradient-to-b from-transparent to-[#8c6b4a]/10">
          
          {activeTab === 'gacha' && (
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-center flex-1">
              
              {/* Left Panel: The Wheel Canvas */}
              <div className="flex flex-col items-center select-none relative bg-[#c4b687]/30 p-5 rounded-3xl border-4 border-[#8c6b4a]/40 shadow-inner">
                
                {/* Currency display */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2b1c11] border-2 border-[#ffd700] px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-[200]">
                  <NutCoinsSVG className="w-5 h-5" pulse={false} />
                  <span className="font-mono text-sm font-black text-[#ffd700] tracking-widest">{coins} COINS</span>
                </div>

                <div className="relative mt-2">
                  <canvas 
                    ref={canvasRef} 
                    width={320} 
                    height={320}
                    className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]"
                  />
                  
                  {/* Glowing center SPIN button overlay */}
                  <button 
                    onClick={startSpin}
                    disabled={isSpinning}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex flex-col items-center justify-center text-[10px] font-black uppercase tracking-widest text-white border-2 border-white/40 shadow-xl transition-all duration-200 ${isSpinning ? 'bg-red-800/80 cursor-not-allowed scale-90' : 'bg-red-600 hover:bg-red-500 active:scale-90 hover:scale-105 cursor-pointer animate-pulse'}`}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    <span>SPIN</span>
                    <span className="text-[8px] font-bold text-yellow-300">100 C</span>
                  </button>
                </div>

                {/* Free Coins Recovery Claim Button */}
                <div className="mt-4 flex flex-col items-center gap-1">
                  <button
                    disabled={giftCooldown > 0}
                    onClick={claimDailyGift}
                    className={`px-4 py-2 border-[3px] rounded-xl text-xs font-black uppercase tracking-widest shadow transition-all ${giftCooldown > 0 ? 'bg-[#c4b687] border-[#8c6b4a] text-[#7a421e]/50 cursor-not-allowed' : 'bg-[#e8a87c] border-[#b5653b] hover:bg-[#f5c69a] text-white active:translate-y-0.5 hover:scale-105 active:scale-95'}`}
                  >
                    {giftCooldown > 0 ? `Cozy Seeds Cooldown (${Math.floor(giftCooldown / 60)}m ${giftCooldown % 60}s)` : '🎁 Claim Cozy Seeds (+150 Coins)'}
                  </button>
                  <p className="text-[9px] font-bold italic opacity-60 text-center">Ran out of coins? Claim cozy seeds or collect nuts in-game (+5 Coins each)!</p>
                </div>
              </div>

              {/* Right Panel: Short Info board */}
              <div className="flex-1 max-w-md w-full bg-[#c4b687]/40 rounded-3xl p-5 border-4 border-[#8c6b4a]/30 shadow-inner text-left flex flex-col justify-between self-stretch">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-[#8c6b4a]/30 pb-2 mb-3">Wheel Odds & Rules</h3>
                  <div className="space-y-2.5 text-xs font-bold leading-relaxed text-[#5c3c23]">
                    <p>💡 <span className="text-[#4a2f1d] font-black">Cozy Progression:</span> Spend <span className="font-black text-[#8c6b4a]">100 Nut Coins</span> to spin the Gacha Wheel. Unlocked companions grant specialized passive abilities that boost your expedition playstyle!</p>
                    <p>🦊 <span className="text-[#4a2f1d] font-black">Level-Up Upgrades:</span> Spin duplicate companions to get <span className="font-black text-[#ffd700]">+30 Coins Refund</span> AND <span className="font-black text-purple-700">+1 Shard</span>. Reach 3 Shards to trigger automatic upgrades boosting passive stats!</p>
                    
                    <div className="mt-4 bg-[#c4b687]/80 p-3 rounded-xl border border-[#8c6b4a]/20">
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-[#7a421e] mb-2 opacity-80">Rarity & Roll Probability</h4>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-stone-400 border border-stone-500 rounded-sm" /> Common: 45%</div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-500 border border-green-600 rounded-sm" /> Uncommon: 28%</div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-500 border border-cyan-600 rounded-sm" /> Rare: 15%</div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-500 border border-purple-600 rounded-sm" /> Epic: 7%</div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-yellow-500 border border-yellow-600 rounded-sm" /> Legendary: 3%</div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-600 border border-red-700 rounded-sm" /> Mythic: 0.5%</div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 border border-amber-500 rounded-sm animate-pulse" /> +300 Coins: 1.5%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#8c6b4a]/20 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8c6b4a]/30 border border-[#8c6b4a]/60 flex items-center justify-center text-sm font-black">
                      {equippedPetId ? '🦊' : '❌'}
                    </div>
                    <div>
                      <h4 className="text-[9px] uppercase font-black opacity-60 leading-none">Equipped Companion</h4>
                      <p className="text-xs font-black text-[#4a2f1d]">{equippedPetId ? PETS.find(p => p.id === equippedPetId)?.name : 'None (Go to Sanctuary)'}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('stable')}
                    className="px-3.5 py-1.5 bg-[#8c6b4a] hover:bg-[#7a421e] text-[#fff5d1] font-black uppercase tracking-widest text-[10px] rounded-lg border-2 border-[#4a2f1d] transition-all hover:scale-105 active:scale-95"
                  >
                    Sanctuary →
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'stable' && (
            <div className="space-y-4 text-left flex-1 min-h-0 flex flex-col pr-1">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#c4b687]/40 p-4 border-2 border-[#8c6b4a]/30 rounded-2xl shrink-0">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-widest">Cozy Companion Sanctuary</h2>
                  <p className="text-xs font-bold text-[#7a421e]/80">Only 1 active companion can accompany you on expeditions. Equipping them triggers their respective passive exploration bonuses!</p>
                </div>
                <button
                  onClick={resetAllGachaProgress}
                  className="px-3 py-1 bg-red-800/10 hover:bg-red-800/20 text-red-800 border-2 border-red-800/30 font-bold uppercase tracking-wider text-[10px] rounded-lg transition-colors shrink-0"
                >
                  Reset Progress
                </button>
              </div>

              {/* Pets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
                {PETS.map(pet => {
                  const isUnlocked = unlockedPets.includes(pet.id);
                  const isEquipped = equippedPetId === pet.id;
                  const level = petLevels[pet.id] || 1;
                  const shards = petShards[pet.id] || 0;
                  
                  // Calculate passive values based on level
                  const passiveMultiplier = pet.levelUpMultiplier;
                  const currentPassiveValue = pet.basePassiveValue + (level - 1) * passiveMultiplier;
                  const nextPassiveValue = pet.basePassiveValue + level * passiveMultiplier;

                  return (
                    <div 
                      key={pet.id} 
                      className={`relative bg-[#c4b687]/50 rounded-2xl border-4 p-4 shadow flex gap-4 transition-all duration-200 ${isUnlocked ? 'border-[#8c6b4a] hover:-translate-y-0.5' : 'border-[#a39570]/40 opacity-70'}`}
                    >
                      
                      {/* Left: Animated Pet Card */}
                      <div className="flex flex-col items-center justify-between w-24 shrink-0">
                        <div className={`w-20 h-20 bg-[#e4d6a7] border-[3px] rounded-xl flex items-center justify-center relative shadow-inner ${isUnlocked ? 'border-[#8c6b4a] group-hover:scale-105 transition-transform' : 'border-[#a39570]'}`}>
                          
                          {/* Glow backdrop based on rarity */}
                          {isUnlocked && (
                            <div className="absolute inset-1 rounded-lg opacity-40 animate-pulse" style={{ backgroundColor: pet.glowColor }} />
                          )}

                          {isUnlocked ? (
                            <div className="relative z-10 animate-[float_3s_infinite_ease-in-out]">
                              <PetIcon id={pet.id} className="w-16 h-16" />
                            </div>
                          ) : (
                            <span className="text-4xl font-black text-[#8c6b4a]/30 relative z-10">?</span>
                          )}

                          {isUnlocked && (
                            <span className="absolute -bottom-2 right-1/2 translate-x-1/2 px-2 py-0.5 bg-[#4a2f1d] text-white text-[9px] font-black uppercase tracking-wider rounded border border-[#ffd700] shadow leading-none">
                              Lvl {level}
                            </span>
                          )}
                        </div>

                        {/* Rarity Tag */}
                        <span 
                          className="mt-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm text-center leading-none"
                          style={{
                            backgroundColor: pet.rarity === 'Common' ? '#6b7280' : pet.rarity === 'Uncommon' ? '#16a34a' : pet.rarity === 'Rare' ? '#0891b2' : pet.rarity === 'Epic' ? '#7c3aed' : pet.rarity === 'Legendary' ? '#d97706' : '#dc2626',
                            color: '#ffffff'
                          }}
                        >
                          {pet.rarity}
                        </span>
                      </div>

                      {/* Right: Detailed Description Info */}
                      <div className="flex-1 flex flex-col justify-between text-left">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h3 className="text-base font-black text-[#4a2f1d] leading-none">{pet.name}</h3>
                            <span className="text-[10px] font-black uppercase opacity-65 tracking-wider italic">{pet.role}</span>
                          </div>

                          <div className="text-xs font-bold leading-relaxed space-y-1.5 text-[#5c3c23]">
                            {isUnlocked ? (
                              <>
                                {pet.id === 'firefly' ? (
                                  <>
                                    <p><span className="text-[#7a421e] font-black">Active Skill:</span> {pet.skillName} — {pet.skillEffect}</p>
                                    <p><span className="text-[#7a421e] font-black">Passive Buff:</span> {pet.passiveDesc} <span className="text-emerald-700 font-black">({currentPassiveValue.toFixed(0)}{pet.statUnit} current)</span></p>
                                  </>
                                ) : (
                                  <>
                                    <p><span className="text-[#7a421e] font-black">Passive Skill:</span> {pet.skillName} — {pet.skillEffect}</p>
                                    <p><span className="text-[#7a421e] font-black">Passive Buff:</span> {pet.passiveDesc} <span className="text-emerald-700 font-black">({currentPassiveValue.toFixed(pet.id === 'owl' ? 2 : 0)}{pet.statUnit} current)</span></p>
                                  </>
                                )}
                                {pet.tradeoff && (
                                  <p className="text-[10px] text-amber-800 italic leading-tight font-black">⚠️ Tradeoff: {pet.tradeoff}</p>
                                )}
                              </>
                            ) : (
                              <p className="italic text-[#8c6b4a] opacity-80 mt-2">Locked. Spin the Gacha Wheel to rescue this companion and unlock its secret forest scout skills!</p>
                            )}
                          </div>
                        </div>

                        {isUnlocked && (
                          <div className="mt-3 pt-2.5 border-t border-[#8c6b4a]/25 flex items-center justify-between gap-3">
                            
                            {/* Upgrade progress shards bar or MAX badge */}
                            <div className="flex-1">
                              {level >= MAX_PET_LEVEL ? (
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-[#2b1c11] text-[9px] font-black uppercase tracking-widest rounded shadow animate-pulse">⭐ MAX LEVEL</span>
                                  <span className="text-[8px] font-bold text-[#7a421e] opacity-70">Dupe → +100 Coins</span>
                                </div>
                              ) : (
                                <>
                                  <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-[#7a421e] mb-1">
                                    <span>Upgrade Shards</span>
                                    <span>{shards}/3</span>
                                  </div>
                                  <div className="bg-[#a39570] rounded-full h-2.5 border border-[#8c6b4a] overflow-hidden p-0.5">
                                    <div 
                                      className="h-full bg-purple-600 rounded-full transition-all" 
                                      style={{ width: `${(shards / 3) * 100}%` }}
                                    />
                                  </div>
                                </>
                              )}
                              {pet.id !== 'squirrel' && pet.id !== 'owl' && pet.id !== 'fox' && pet.id !== 'deer' && pet.id !== 'raven' && (
                                <div className="mt-1 text-[8px] font-bold text-[#7a421e]/70">
                                  ⏱ Skill cooldown at Lv{level}: <span className="font-black text-[#4a2f1d]">{getPetCooldown(pet.id, level)}s</span>
                                </div>
                              )}
                            </div>

                            {/* Equip button */}
                            <button
                              onClick={() => handleEquipClick(pet.id)}
                              className={`px-4 py-2 border-[3px] text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 ${isEquipped ? 'bg-emerald-600 border-emerald-800 text-white shadow-none translate-y-0.5' : 'bg-[#e8a87c] border-[#b5653b] hover:bg-[#f5c69a] text-white active:translate-y-0.5'}`}
                            >
                              {isEquipped ? 'Equipped ✓' : 'Equip Pet'}
                            </button>

                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 text-left flex-1 min-h-0 flex flex-col">
              <div className="bg-[#c4b687]/40 p-4 border-2 border-[#8c6b4a]/30 rounded-2xl shrink-0">
                <h2 className="text-lg font-black uppercase tracking-widest">Spin History Log</h2>
                <p className="text-xs font-bold text-[#7a421e]/80">Scroll to see your previous gacha spins and unlocks. Unlocks are saved permanently in local browser cache.</p>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 bg-[#2b1c11] border-4 border-[#8c6b4a] rounded-2xl p-4 font-mono text-xs text-[#ffd700] space-y-2">
                {spinHistory.length === 0 ? (
                  <div className="text-center italic opacity-60 py-10 font-sans font-bold text-white">No history records yet. Try spinning the Gacha Wheel!</div>
                ) : (
                  spinHistory.map(row => (
                    <div key={row.id} className="border-b border-white/5 pb-1.5 flex justify-between gap-4 items-center">
                      <span className="text-left font-black tracking-wide">{row.message}</span>
                      <span className="text-[10px] text-white/40 shrink-0">SUCCESS</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Footer Board */}
        <div className="bg-[#8c6b4a]/25 border-t-[4px] border-[#8c6b4a] py-4 px-6 md:px-8 flex justify-center shrink-0">
          <button 
            onClick={() => { audioManager.playSfx('close'); onClose(); }}
            className="px-8 py-3 bg-[#8c6b4a] hover:bg-[#7a421e] text-[#fff5d1] font-black uppercase tracking-widest text-sm rounded-xl border-[4px] border-[#4a2f1d] shadow-[0_5px_0_#4a2f1d] hover:translate-y-0.5 hover:shadow-[0_3px_0_#4a2f1d] active:translate-y-1.2 active:shadow-none transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            Close Board
          </button>
        </div>

      </div>

      {/* REWARD REVEAL POPUP MODAL */}
      {showRewardPopup && rewardResult && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9500] backdrop-blur-xl pointer-events-auto p-4 animate-[fadeIn_0.2s_ease-out]">
          
          <div className="relative max-w-sm w-full bg-[#e4d6a7] border-[6px] border-[#8c6b4a] rounded-3xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.8),inset_0_-8px_0_rgba(140,107,74,0.3)] text-center animate-[popOut_0.4s_cubic-bezier(0.175,0.885,0.32,1.25)] flex flex-col items-center">
            
            {/* Top banner flash effect */}
            <div className="absolute inset-x-0 -top-8 flex justify-center">
              <div className="bg-gradient-to-r from-yellow-500 via-[#ffd700] to-yellow-500 border-4 border-[#4a2f1d] text-[#4a2f1d] px-6 py-1.5 font-black text-sm uppercase tracking-widest shadow-[0_6px_0_#4a2f1d] rounded-xl whitespace-nowrap animate-bounce">
                🎉 REWARD REVEALED!
              </div>
            </div>

            {/* Glowing sparkle shine particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_10%,transparent_70%)] animate-[spin_20s_linear_infinite]" />
            </div>

            {/* Reward Card Display */}
            <div className="mt-4 mb-5 flex flex-col items-center relative z-10">
              
              <div className="w-28 h-28 bg-[#c4b687] border-[4px] border-[#8c6b4a] shadow-[inset_0_0_0_2px_#fff5d1,0_6px_0_rgba(0,0,0,0.15)] rounded-2xl flex items-center justify-center relative overflow-hidden transform rotate-2 animate-pulse p-1 mb-4">
                
                {/* Rarity color glow backing */}
                <div 
                  className="absolute inset-1 rounded-xl opacity-35 animate-ping" 
                  style={{ backgroundColor: rewardResult.type === 'coins' ? 'rgba(251,191,36,0.5)' : PETS.find(p => p.id === rewardResult.id)?.glowColor }}
                />

                {rewardResult.type === 'coins' ? (
                  <NutCoinsSVG className="w-20 h-20 relative z-10" pulse={false} />
                ) : (
                  <div className="relative z-10 scale-125">
                    <PetIcon id={rewardResult.id} className="w-16 h-16" />
                  </div>
                )}
              </div>

              <h2 
                className="text-2xl font-black uppercase tracking-wider leading-tight drop-shadow-sm text-center"
                style={{ color: rewardResult.color }}
              >
                {rewardResult.name}
              </h2>
              
              <span 
                className="mt-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow text-white leading-none"
                style={{
                  backgroundColor: rewardResult.rarity === 'Common' ? '#6b7280' : rewardResult.rarity === 'Uncommon' ? '#16a34a' : rewardResult.rarity === 'Rare' ? '#0891b2' : rewardResult.rarity === 'Epic' ? '#7c3aed' : rewardResult.rarity === 'Legendary' ? '#d97706' : '#dc2626'
                }}
              >
                {rewardResult.type === 'coins' ? 'BONUS SLICE' : rewardResult.rarity}
              </span>
            </div>

            {/* Description details card */}
            <div className="bg-[#c4b687] p-4 border-[3px] border-[#8c6b4a] shadow-[inset_0_0_0_2px_#d4c697] w-full text-left rounded-xl space-y-2.5 text-xs text-[#4a2f1d] font-bold leading-relaxed relative z-10">
              
              {rewardResult.type === 'coins' ? (
                <p className="text-center font-black">{rewardResult.skillEffect}</p>
              ) : (
                <>
                  <p><span className="text-[#7a421e] font-black">Companion Role:</span> <span className="opacity-80 italic">{rewardResult.role}</span></p>
                  <p><span className="text-[#7a421e] font-black">Active Skill:</span> <span className="text-purple-950 font-black">{rewardResult.skillName}</span> — {rewardResult.skillEffect}</p>
                  <p><span className="text-[#7a421e] font-black">Passive Buff:</span> {rewardResult.passiveDesc}</p>
                  {rewardResult.tradeoff && (
                    <p className="text-[10px] text-amber-800 italic leading-tight font-black">⚠️ Tradeoff: {rewardResult.tradeoff}</p>
                  )}
                </>
              )}

              {/* DUPLICATE CONVERSION INFORMATION BANNER */}
              {rewardResult.isDuplicate && (
                <div className="bg-[#2b1c11] border-2 border-purple-500 p-2.5 rounded-lg text-[10px] font-black text-center text-white space-y-1">
                  <div className="text-purple-400 uppercase tracking-widest text-xs">✨ Duplicate Companion! ✨</div>
                  <div className="leading-normal text-yellow-300">Converted into +{rewardResult.refundCoins} Nut Coins & +1 Upgrade Shard!</div>
                  {rewardResult.leveledUp ? (
                    <div className="text-emerald-400 font-extrabold text-xs uppercase animate-bounce mt-1">📈 LEVEL UP! Upgraded to Level {rewardResult.levelAfter}!</div>
                  ) : (
                    <div className="text-white/60">Shard Progress: {rewardResult.shardsBefore + 1}/3 (Need 3 to Level Up)</div>
                  )}
                </div>
              )}
            </div>

            {/* Popup Buttons */}
            <div className="mt-6 flex flex-col gap-2.5 w-full relative z-10">
              
              {rewardResult.type === 'pet' && !rewardResult.isDuplicate && !equippedPetId && (
                <button
                  onClick={() => {
                    handleEquipClick(rewardResult.id);
                    audioManager.playSfx('click');
                    setShowRewardPopup(false);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl border-[4px] border-emerald-800 shadow-[0_4px_0_#064e3b] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-widest text-xs hover:scale-103"
                >
                  Equip Companion Now
                </button>
              )}

              <button
                onClick={() => {
                  audioManager.playSfx('close');
                  setShowRewardPopup(false);
                }}
                className="w-full py-3 bg-[#8c6b4a] hover:bg-[#7a421e] text-[#fff5d1] font-black rounded-xl border-[4px] border-[#4a2f1d] shadow-[0_4px_0_#4a2f1d] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-widest text-xs hover:scale-103"
              >
                Close Reward Board
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Embedded Bobbing keyframe styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .rendering-pixelated {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(43, 28, 17, 0.1);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #8c6b4a;
          border: 2px solid #e4d6a7;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7a421e;
        }
      `}} />

      {/* In-Game Error Toast — replaces browser alert() */}
      {errorToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-[popOut_0.3s_ease-out] pointer-events-none">
          <div className="bg-[#2b1c11] border-[3px] border-[#b91c1c] text-[#fff5d1] px-5 py-3 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center gap-3 max-w-sm">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-xs font-black leading-tight">{errorToast}</p>
          </div>
        </div>
      )}

      {/* In-Game Confirm Reset Modal — replaces browser confirm() */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9800] backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#e4d6a7] border-[5px] border-[#8c6b4a] rounded-3xl p-6 max-w-xs w-full mx-4 shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-[popOut_0.3s_cubic-bezier(0.175,0.885,0.32,1.2)] text-center">
            {/* Corner brass accents */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-[3px] border-l-[3px] border-[#ffd700]/60 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-[3px] border-r-[3px] border-[#ffd700]/60 rounded-tr-lg pointer-events-none" />
            <span className="text-4xl block mb-3">🗑️</span>
            <h3 className="text-lg font-black text-[#4a2f1d] uppercase tracking-wider mb-2">Reset Progress?</h3>
            <p className="text-xs font-bold text-[#7a421e] mb-5 leading-relaxed">
              This will remove all unlocked pets, levels, shards, equipped status, and reset your coins to <span className="font-black text-[#4a2f1d]">200</span>. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { audioManager.playSfx('hover'); setShowConfirmReset(false); }}
                className="flex-1 py-2.5 bg-[#c4b687] hover:bg-[#d4c697] border-[3px] border-[#8c6b4a] text-[#4a2f1d] font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_3px_0_#8c6b4a] hover:shadow-none hover:translate-y-0.5"
              >
                Cancel
              </button>
              <button
                onClick={doReset}
                className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 border-[3px] border-red-900 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_3px_0_#7f1d1d] hover:shadow-none hover:translate-y-0.5"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
