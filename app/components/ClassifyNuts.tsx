'use client';

import { useState, useCallback } from 'react';
import { getNutByName } from '../data/nutsData';
import { classifyNutAction } from '../actions';
import { audioManager } from '../lib/AudioManager';

// Helper function to generate a quick string hash of optimized image data for client-side caching
function getImageHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return '0';
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
type LoadState = 'idle' | 'classifying' | 'done' | 'error';

export default function ClassifyNuts({ onBack }: { onBack: () => void }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [view, setView] = useState<'upload' | 'result'>('upload');
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const isClassifying = loadState === 'classifying';

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    audioManager.playSfx('click');
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setResult(null);
      setErrorMsg(null);
      setLoadState('idle');
      setView('result');
      audioManager.playSfx('popup');
    };
    reader.readAsDataURL(file);
  };

  const resizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = dataUrl;
    });
  };

  const classify = useCallback(async () => {
    if (isClassifying || !imagePreview) return;

    setResult(null);
    setErrorMsg(null);
    setLoadState('classifying');

    try {
      console.log('[ClassifyNuts] Resizing image for AI...');
      const optimizedImage = await resizeImage(imagePreview);
      const imgHash = getImageHash(optimizedImage);

      // Check if this image has already been classified in local cache
      try {
        const storedCache = localStorage.getItem('sawit_village_ai_classify_cache');
        const cache = storedCache ? JSON.parse(storedCache) : {};
        if (cache[imgHash]) {
          console.log('[ClassifyNuts] Cache Hit! Loading results from local storage cache.');
          const cachedResult = cache[imgHash];
          
          setResult(cachedResult);
          setLoadState('done');
          audioManager.playSfx('discover');
          return;
        }
      } catch (cacheError) {
        console.error('[ClassifyNuts] Failed to read from AI cache:', cacheError);
      }

      console.log('[ClassifyNuts] Cache Miss. Sending image to AI API...');
      const response = await classifyNutAction(optimizedImage);

      if (!response.success) {
        throw new Error(response.error);
      }

      const aiData = response.data;
      console.log(`[ClassifyNuts] AI identification: ${aiData.nutName} (${aiData.confidence}%)`);

      // Try to match with local data for better visuals/translations
      const localNut = getNutByName(aiData.nutName);
      const isNone = aiData.nutName.toLowerCase() === 'none';
      const isNewNut = !localNut && !isNone;

      const finalResult = {
        name: localNut?.name || aiData.nutName,
        latinName: localNut?.latinName || aiData.latinName,
        confidence: aiData.confidence,
        description: localNut?.description || aiData.shortDescription,
        allergy: localNut?.allergyInfo || aiData.allergyInfo,
        alternative: aiData.possibleAlternative,
        image: optimizedImage, // Use the resized optimized image to save storage space
        details: isNone ? 'Analysis complete.' : 'Analysis powered by AI.',
        isNewNut: isNewNut,
        isNone: isNone,
        rawAiData: aiData
      };

      // Write results to local storage cache to prevent duplicate future billing
      try {
        const storedCache = localStorage.getItem('sawit_village_ai_classify_cache');
        const cache = storedCache ? JSON.parse(storedCache) : {};
        cache[imgHash] = finalResult;
        localStorage.setItem('sawit_village_ai_classify_cache', JSON.stringify(cache));
        console.log('[ClassifyNuts] Successfully wrote AI result to local cache.');
      } catch (cacheWriteError) {
        console.warn('[ClassifyNuts] Failed to write result to AI cache (possibly localStorage full).');
      }

      setResult(finalResult);
      setLoadState('done');
      audioManager.playSfx('discover');
    } catch (err: any) {
      console.error('[ClassifyNuts] AI Analysis failed:', err);
      setErrorMsg(err?.message || 'The AI was unable to identify this nut. Please try another photo.');
      setLoadState('error');
      audioManager.playSfx('close');
    }
  }, [isClassifying, imagePreview]);

  const triggerPopup = (msg: string) => {
    setPopupMessage(msg);
    setShowSavePopup(true);
    setTimeout(() => setShowSavePopup(false), 2500);
  };

  const saveToEncyclopedia = () => {
    if (!result) return;

    const storedData = localStorage.getItem('sawit_village_discovered_nuts');
    let discoveredNuts = storedData ? JSON.parse(storedData) : [];

    // Check for duplicates
    const isDuplicate = discoveredNuts.some((n: any) => n.name.toLowerCase() === result.name.toLowerCase());
    
    if (isDuplicate) {
      audioManager.playSfx('close');
      triggerPopup('Already Saved!');
      return;
    }

    const newDiscovery = {
      id: `discovered_${Date.now()}`,
      name: result.name,
      latinName: result.latinName,
      image: result.image, // Use the optimized image stored in result
      confidence: result.confidence,
      description: result.description,
      allergyInfo: result.allergy,
      timestamp: Date.now()
    };

    let saved = false;
    while (!saved) {
      try {
        const newArray = [...discoveredNuts, newDiscovery];
        localStorage.setItem('sawit_village_discovered_nuts', JSON.stringify(newArray));
        saved = true;
        
        audioManager.playSfx('discover');
        triggerPopup('New Nut Saved to Encyclopedia!');
      } catch (e) {
        console.warn('Storage full. Attempting to evict oldest nut...');
        if (discoveredNuts.length === 0) {
          console.warn('Failed to save nut, object too large.');
          audioManager.playSfx('close');
          triggerPopup('Storage is full!');
          break;
        }
        // Remove the oldest entry (first item) and try again
        discoveredNuts.shift();
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const renderStatus = () => {
    if (loadState === 'classifying') return (
      <div className="w-full max-w-sm py-12 flex flex-col items-center justify-center bg-[#d4c697] rounded-xl border-4 border-[#8c6b4a] border-dashed animate-pulse">
        <div className="text-4xl mb-4 animate-spin">✨</div>
        <p className="text-[#4a2f1d] font-black uppercase tracking-widest">Consulting AI...</p>
        <p className="text-[#7a421e] text-xs font-bold mt-1 opacity-60">Analyzing image features</p>
      </div>
    );

    if (loadState === 'error') return (
      <div className="w-full max-w-sm py-8 px-6 flex flex-col items-center bg-[#f5d6d6] rounded-xl border-4 border-[#c94f4f] border-dashed">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-[#8a2222] font-black uppercase tracking-widest text-sm text-center mb-2">Analysis Failed</p>
        <p className="text-[#8a2222] text-xs font-bold text-center opacity-80 mb-4">{errorMsg}</p>
        <button
          onClick={classify}
          className="px-6 py-2 bg-[#c94f4f] text-white font-black rounded-xl border-2 border-[#8a2222] uppercase tracking-widest text-xs shadow-[0_3px_0_#8a2222] hover:brightness-110 active:translate-y-[2px] active:shadow-none transition-all"
        >
          Retry
        </button>
      </div>
    );

    return null;
  };

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------
  return (
    <div className="z-10 bg-[#e4d6a7] border-[6px] border-[#8c6b4a] rounded-3xl p-6 md:p-8 max-w-lg w-full mx-4 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_-8px_0_rgba(140,107,74,0.3)] animate-[slideUp_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)] transition-all max-h-[90vh] flex flex-col overflow-hidden">
      <h1
        className="text-3xl font-black text-[#4a2f1d] text-center mb-6 shrink-0"
        style={{ textShadow: '0 2px 0 #fff5d1' }}
      >
        Identify My Nut
      </h1>

      <div className="flex-1 flex flex-col items-center w-full min-h-0">

        {/* ── UPLOAD VIEW ──────────────────────────────────────────────────── */}
        {view === 'upload' ? (
          <div className="w-full flex flex-col items-center h-full">
            <div className="w-full max-w-sm mx-auto mb-8">
              <div className="bg-[#c4b687] p-8 rounded-xl border-4 border-[#8c6b4a] border-dashed shadow-inner flex flex-col items-center justify-center cursor-pointer hover:bg-[#b5a675] transition-colors relative group min-h-[260px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="text-5xl mb-4 animate-bounce group-hover:scale-110 transition-transform text-[#4a2f1d]">📂</div>
                <p className="text-[#4a2f1d] font-black tracking-widest text-center uppercase text-sm px-4">Upload your file</p>
                <p className="text-[#7a421e] text-xs font-bold mt-2 opacity-70">AI will analyse your nut</p>
              </div>
            </div>

            <div className="flex-1" />

            <button
              onClick={() => {
                audioManager.playSfx('click');
                onBack();
              }}
              onMouseEnter={() => audioManager.playSfx('hover')}
              className="w-full max-w-sm h-12 flex items-center justify-center text-[#7a421e] font-black border-4 border-[#8c6b4a] bg-[#c4b687] hover:bg-[#d4c697] rounded-xl transition-all uppercase tracking-widest text-sm shadow-[0_3px_0_#8c6b4a] active:translate-y-[2px] active:shadow-none hover:scale-105 active:scale-95"
            >
              Back to Menu
            </button>
          </div>

        ) : (
          /* ── RESULT VIEW ───────────────────────────────────────────────── */
          <div className="flex flex-col items-center w-full h-full min-h-0">

            {/* Scrollable content */}
            <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center min-h-0 mb-4">

              {/* Image preview */}
              <div className="w-full max-w-sm flex flex-col items-center shrink-0 mb-6 px-4">
                <div className="w-[220px] aspect-square border-4 border-[#8c6b4a] rounded-2xl overflow-hidden shadow-md relative group bg-[#c4b687]">
                  <img src={imagePreview!} className="w-full h-full object-cover" alt="Selected nut" />
                  <button
                    onClick={() => { 
                      audioManager.playSfx('close');
                      setView('upload'); 
                      setResult(null); 
                      setImagePreview(null); 
                      setLoadState('idle'); 
                    }}
                    onMouseEnter={() => audioManager.playSfx('hover')}
                    className="absolute top-2 right-2 bg-[#c94f4f] p-2 rounded-lg border-2 border-[#8a2222] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-xs shadow-lg hover:scale-110 active:scale-95"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Status */}
              {renderStatus()}

              {/* Discovery Message - Only for valid new nuts */}
              {result?.isNewNut && !result?.isNone && loadState === 'done' && (
                <div className="w-full max-w-sm mb-4 animate-[slideDown_0.4s_ease-out]">
                  <div className="bg-[#7ab84f] py-2 px-4 rounded-lg border-2 border-[#4a7a2a] text-white text-center font-black uppercase tracking-widest text-xs shadow-sm">
                    New Nut Successfully Discovered
                  </div>
                </div>
              )}

              {/* Identify button — shown when idle and no result */}
              {(loadState === 'idle') && !result && (
                <div className="w-full max-w-sm py-6">
                  <button
                    onClick={classify}
                    className="w-full py-2 text-xl font-black text-[#fff5d1] bg-gradient-to-b from-[#7ab84f] to-[#5c8a36] rounded-xl border-4 border-[#4a2f1d] shadow-[0_4px_0_#4a2f1d] transform transition-all uppercase tracking-widest hover:brightness-110 active:translate-y-1 active:shadow-none"
                  >
                    Identify Nut
                  </button>
                </div>
              )}

              {/* Result card */}
              {result && (
                <div className="w-full max-w-sm text-left text-[#4a2f1d] space-y-5 pl-4 pr-2">
                  <div className="bg-[#d4c697] p-6 rounded-xl border-[4px] border-[#8c6b4a] shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)]">
                    <div className="flex gap-4 border-b-4 border-[#8c6b4a]/20 pb-4 mb-6 items-center">
                      <div className="w-16 h-16 bg-[#c4b687] rounded-xl border-2 border-[#8c6b4a] overflow-hidden shrink-0 shadow-inner">
                        <img src={result.image} alt={result.name} className="w-full h-full object-cover rendering-pixelated" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23e3cd96"/><circle cx="16" cy="16" r="8" fill="%238c6b4a"/></svg>' }} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase text-[#4a2f1d] leading-tight mb-1">{result.name}</h3>
                        <p className="italic text-sm text-[#7a421e] font-bold">{result.latinName}</p>
                        {!result.isNone && (
                          <div className="mt-2 inline-block px-3 py-1 bg-[#7ab84f] text-white text-xs font-black rounded border-2 border-[#4a7a2a] uppercase tracking-widest shadow-sm">
                            {result.confidence}% Certainty
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-[#c4b687]/40 p-4 rounded-lg border-2 border-[#8c6b4a]/20">
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-[#7a421e] mb-3 opacity-60 text-left">AI Analysis</h4>
                        <p className="text-sm font-bold leading-relaxed whitespace-pre-line">{result.description}</p>
                      </div>

                      {!result.isNone && (
                        <div className="bg-[#8c6b4a]/10 p-4 rounded-lg border-2 border-[#8c6b4a]/20 border-dashed">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm">⚠️</span>
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-[#7a421e] opacity-60 text-left">Safety & Allergy</h4>
                          </div>
                          <p className="text-sm font-bold leading-tight whitespace-pre-line">{result.allergy}</p>
                        </div>
                      )}

                      {result.alternative !== 'None' && !result.isNone && (
                        <div className="text-xs font-bold text-[#7a421e]/70 italic">
                          May also resemble: {result.alternative}
                        </div>
                      )}

                      <div className="text-xs italic text-[#7a421e]/80 font-bold border-t-2 border-[#8c6b4a]/10 pt-6 pb-2">
                        {result.details}
                      </div>
                    </div>
                  </div>

                  {/* Save to Encyclopedia Button — only for NEW valid nuts */}
                  {result.isNewNut && !result.isNone && (
                    <button
                      onClick={saveToEncyclopedia}
                      className="w-full py-3 text-lg font-black text-white bg-gradient-to-b from-[#8c6b4a] to-[#4a2f1d] rounded-xl border-4 border-[#4a2f1d] shadow-[0_4px_0_#4a2f1d] transform transition-all uppercase tracking-widest hover:brightness-110 active:translate-y-1 active:shadow-none"
                    >
                      Save to Encyclopedia
                    </button>
                  )}

                  {/* Classify again */}
                  <button
                    onClick={() => { 
                      audioManager.playSfx('click');
                      setResult(null); 
                      setLoadState('idle'); 
                    }}
                    onMouseEnter={() => audioManager.playSfx('hover')}
                    className="w-full py-2 text-sm font-black text-[#7a421e] bg-[#c4b687] rounded-xl border-4 border-[#8c6b4a] shadow-[0_3px_0_#8c6b4a] transition-all uppercase tracking-widest hover:bg-[#d4c697] active:translate-y-[2px] active:shadow-none hover:scale-105 active:scale-95"
                  >
                    Analyze New Image
                  </button>
                </div>
              )}
            </div>

            {/* Fixed footer */}
            <div className="w-full max-w-sm shrink-0 flex flex-col gap-3 pt-2 border-t-4 border-[#8c6b4a]/10">
              <button
                onClick={() => {
                  audioManager.playSfx('click');
                  onBack();
                }}
                onMouseEnter={() => audioManager.playSfx('hover')}
                className="w-full h-12 flex items-center justify-center text-[#7a421e] font-black border-4 border-[#8c6b4a] bg-[#c4b687] hover:bg-[#d4c697] rounded-xl transition-all uppercase tracking-widest text-sm shadow-[0_3px_0_#8c6b4a] active:translate-y-[2px] active:shadow-none hover:scale-105 active:scale-95"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {showSavePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none px-4">
          <div className="bg-[#e4d6a7] border-[6px] border-[#8c6b4a] rounded-2xl px-6 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-[popupAnim_2.5s_ease-in-out_forwards] flex items-center gap-4 max-w-xs w-full">
            <span className="text-3xl filter drop-shadow-sm">📖</span>
            <p className="text-[#4a2f1d] font-black uppercase tracking-widest text-[11px] leading-tight">{popupMessage}</p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: styles }} />
    </div>
  );
}

const styles = `
  @keyframes popupAnim {
    0% { opacity: 0; transform: scale(0.8) translateY(20px); }
    10% { opacity: 1; transform: scale(1.1) translateY(0); }
    15% { transform: scale(1); }
    85% { opacity: 1; transform: scale(1) translateY(0); }
    100% { opacity: 0; transform: scale(0.9) translateY(-20px); }
  }
`;
