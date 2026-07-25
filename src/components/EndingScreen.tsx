import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCcw,
  Heart,
  Flame,
  Radio,
  BookOpen,
  Compass,
  Volume2,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { clearGameState, saveGameState } from '../utils/storage';
import { GameEngine } from '../game/GameEngine';
import { SoundEngine } from '../audio/SoundEngine';
import { SVG_ASSETS } from '../utils/AssetManager';

interface EndingScreenProps {
  engine: GameEngine;
  onReplay: () => void;
  onContinueExploring: () => void;
}

type EndingTab = 'reflection' | 'radio' | 'cat' | 'journal';

export const EndingScreen: React.FC<EndingScreenProps> = ({
  engine,
  onReplay,
  onContinueExploring,
}) => {
  const [activeTab, setActiveTab] = useState<EndingTab>('reflection');
  const [wishCount, setWishCount] = useState(0);
  const [catPetCount, setCatPetCount] = useState(0);
  const [playingTapeId, setPlayingTapeId] = useState<string | null>(null);

  const collectedFireflies = engine.fireflies.filter((f) => f.collected).length;
  const unlockedLetters = engine.letters.filter((l) => l.unlocked).length;
  const unlockedTapes = engine.tapes.filter((t) => t.unlocked).length;
  const foundEasterEggs = engine.easterEggs.filter((e) => e.found).length;
  const is100 = engine.is100PercentComplete();

  // Trigger firefly golden sparkle confetti on open
  React.useEffect(() => {
    confetti({
      particleCount: is100 ? 120 : 70,
      spread: 120,
      origin: { y: 0.4 },
      colors: ['#fef08a', '#fde047', '#fed7aa', '#c084fc', '#38bdf8', '#f472b6'],
    });
  }, [is100]);

  const handleReleaseWish = () => {
    SoundEngine.playFireflyCollect();
    setWishCount((prev) => prev + 1);

    confetti({
      particleCount: 35,
      spread: 85,
      origin: { y: 0.55 },
      colors: ['#fde047', '#fed7aa', '#f472b6'],
    });
  };

  const handlePetCat = () => {
    SoundEngine.playCatPurr();
    setCatPetCount((prev) => prev + 1);
  };

  const handlePlayTape = (tapeId: string) => {
    SoundEngine.playCassetteClick();
    setPlayingTapeId(tapeId);
  };

  const handleResetGame = () => {
    SoundEngine.playPageFlip();
    clearGameState();
    onReplay();
  };

  const handleContinueExploringClick = () => {
    SoundEngine.playPageFlip();
    // Save golden spirit aura reward state
    engine.savedState.hasReachedEnding = true;
    saveGameState(engine.savedState);
    onContinueExploring();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-hidden">
      {/* Ambient Campfire Firefly Aura Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 65% at 50% 40%, rgba(249,115,22,0.2) 0%, rgba(147,51,234,0.16) 50%, rgba(2,6,23,0.96) 100%)',
        }}
      />

      {/* Floating Ember Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 26 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: `${(i * 17) % 95}%`,
              y: '105%',
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              y: '-10%',
              opacity: [0, 0.95, 0.8, 0],
              x: `${((i * 17) % 95) + Math.sin(i) * 10}%`,
              scale: [0.5, 1.3, 0.6],
            }}
            transition={{
              duration: 3.8 + (i % 4) * 1.4,
              repeat: Infinity,
              delay: (i % 6) * 0.6,
              ease: 'linear',
            }}
            className="absolute rounded-full"
            style={{
              width: `${(i % 3) * 2 + 3}px`,
              height: `${(i % 3) * 2 + 3}px`,
              backgroundColor: i % 2 === 0 ? '#fde047' : '#fb923c',
              boxShadow: '0 0 12px #f97316',
            }}
          />
        ))}
      </div>

      {/* Main Glassmorphic Ending Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative bg-slate-900/95 border border-amber-500/30 rounded-3xl p-6 md:p-7 max-w-2xl w-full shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10"
      >
        {/* Top Header & Location Badge */}
        <div className="text-center mb-3 relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/30 mb-2">
            <MapPin size={13} />
            <span>Final Destination: Old Train Station Campfire</span>
          </div>

          {/* Animated Campfire Header Graphic */}
          <div className="relative my-1 flex justify-center">
            <motion.img
              src={SVG_ASSETS.stationCampfire}
              alt="Old Train Station Campfire"
              animate={{
                scale: [1, 1.03, 0.98, 1.02, 1],
                filter: [
                  'drop-shadow(0 0 15px rgba(249,115,22,0.6))',
                  'drop-shadow(0 0 28px rgba(251,191,36,0.85))',
                  'drop-shadow(0 0 18px rgba(234,88,12,0.7))',
                ],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="h-24 md:h-28 object-contain"
            />
          </div>

          <h1 className="text-xl md:text-2xl font-serif font-bold text-amber-200 tracking-wide flex items-center justify-center gap-2 mt-1">
            <Flame className="text-amber-400 animate-pulse" size={22} />
            <span>The Spaces Between Chapters</span>
            <Flame className="text-amber-400 animate-pulse" size={22} />
          </h1>
          <p className="text-xs font-serif italic text-purple-200/80 mt-0.5">
            "Some people become your biggest chapter. Some become the spaces between chapters."
          </p>
        </div>

        {/* Interactive Navigation Tabs */}
        <div className="flex gap-1.5 justify-center mb-4 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 flex-wrap relative z-10">
          <button
            onClick={() => setActiveTab('reflection')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif transition-all ${
              activeTab === 'reflection'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame size={14} /> Campfire Reflection
          </button>

          <button
            onClick={() => setActiveTab('radio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif transition-all ${
              activeTab === 'radio'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio size={14} /> Station Radio ({unlockedTapes}/6)
          </button>

          <button
            onClick={() => setActiveTab('cat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif transition-all ${
              activeTab === 'cat'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart size={14} /> Station Cat
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif transition-all ${
              activeTab === 'journal'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} /> Full Journey Summary
          </button>
        </div>

        {/* Tab Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {/* TAB 1: CAMPFIRE REFLECTION */}
            {activeTab === 'reflection' && (
              <motion.div
                key="tab-reflection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/20 text-center font-serif leading-relaxed">
                  <p className="text-amber-100 text-sm md:text-base italic mb-1.5">
                    Coffee. Books. Waiting. Learning. Stupid jokes. Fireflies.
                  </p>
                  <p className="text-purple-200 text-xs md:text-sm italic">
                    Maybe memories don't become important because they're big.
                    <br />
                    Maybe they become important because someone remembers them.
                  </p>
                </div>

                {/* Journey Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/20">
                    <span className="text-base font-bold text-amber-300 block">
                      ✨ {collectedFireflies} / 50
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Fireflies</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/20">
                    <span className="text-base font-bold text-purple-300 block">
                      📜 {unlockedLetters} / 10
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Letters</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/20">
                    <span className="text-base font-bold text-sky-300 block">
                      📻 {unlockedTapes} / 6
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Tapes</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/20">
                    <span className="text-base font-bold text-rose-300 block">
                      🔍 {foundEasterEggs} / 12
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Secrets</span>
                  </div>
                </div>

                {/* Interactive Release Firefly Wish Button */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-amber-500/20 text-center flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={handleReleaseWish}
                    className="ui-btn-primary flex items-center gap-2 px-6 py-2 rounded-full font-serif text-xs font-semibold hover:scale-105 transition-transform"
                  >
                    <Sparkles size={15} className="text-amber-200 animate-spin" />
                    <span>Release a Firefly Wish into the Night</span>
                  </button>
                  {wishCount > 0 && (
                    <span className="text-[11px] text-amber-300/80 font-mono">
                      ✨ {wishCount} golden wish{wishCount > 1 ? 'es' : ''} floating above the station campfire.
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: STATION RADIO (CASSETTE SVG JUKEBOX) */}
            {activeTab === 'radio' && (
              <motion.div
                key="tab-radio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <p className="text-xs text-purple-200/80 italic font-serif text-center mb-2">
                  Select any unlocked cassette tape to play cozy lo-fi campfire melodies.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {engine.tapes.map((tape) => (
                    <div
                      key={tape.id}
                      onClick={() => tape.unlocked && handlePlayTape(tape.id)}
                      className={`p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                        tape.unlocked
                          ? playingTapeId === tape.id
                            ? 'bg-purple-900/40 border-amber-400/60 ring-2 ring-amber-400/30 shadow-lg'
                            : 'bg-slate-950/80 border-purple-500/30 hover:border-purple-400/60'
                          : 'bg-slate-950/30 border-slate-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {/* Cassette SVG Graphic */}
                      <motion.div
                        animate={
                          playingTapeId === tape.id
                            ? { rotate: [0, 2, -2, 0], scale: [1, 1.04, 1] }
                            : {}
                        }
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center p-1 border border-white/10"
                      >
                        <img
                          src={SVG_ASSETS.cassette}
                          alt="Cassette Tape"
                          className="w-full h-full object-contain"
                        />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold font-serif text-amber-200 truncate">
                            {tape.songTitle}
                          </span>
                          {playingTapeId === tape.id && (
                            <Volume2 size={12} className="text-amber-400 animate-pulse shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{tape.artist}</p>
                        <p className="text-[10px] text-purple-300/70 font-serif italic truncate">
                          "{tape.description}"
                        </p>
                      </div>

                      {!tape.unlocked && (
                        <span className="text-[10px] text-slate-500 font-mono uppercase border border-slate-700 px-1.5 py-0.5 rounded">
                          Locked
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 3: PET SLEEPING STATION CAT (CAT SVG GRAPHIC) */}
            {activeTab === 'cat' && (
              <motion.div
                key="tab-cat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 rounded-2xl bg-slate-950/80 border border-rose-500/30 text-center flex flex-col items-center justify-center space-y-4"
              >
                {/* Cozy Station Cat SVG Artwork */}
                <div className="relative cursor-pointer group" onClick={handlePetCat}>
                  <motion.div
                    animate={
                      catPetCount > 0
                        ? {
                            scale: [1, 1.06, 0.97, 1.03, 1],
                            rotate: [0, -3, 3, 0],
                          }
                        : { scale: [1, 1.02, 1] }
                    }
                    transition={{ duration: 1.5, repeat: catPetCount > 0 ? 0 : Infinity }}
                    className="w-48 h-36 md:w-56 md:h-40 mx-auto flex items-center justify-center"
                  >
                    <img
                      src={SVG_ASSETS.stationCat}
                      alt="Cozy Station Cat"
                      className="w-full h-full object-contain filter drop-shadow-[0_0_18px_rgba(249,115,22,0.5)]"
                    />
                  </motion.div>

                  {/* Floating Heart Effect on Pet */}
                  {catPetCount > 0 && (
                    <motion.div
                      key={catPetCount}
                      initial={{ scale: 0.5, y: 10, opacity: 1 }}
                      animate={{ scale: 1.5, y: -50, opacity: 0 }}
                      className="absolute top-2 right-8 text-rose-400 pointer-events-none"
                    >
                      <Heart size={28} fill="#f43f5e" />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-rose-200">
                    The Sleeping Station Cat
                  </h3>
                  <p className="text-xs font-serif italic text-slate-300 max-w-sm mx-auto">
                    Curled up on a red cushion beside warm campfire logs on the station platform.
                  </p>
                </div>

                <button
                  onClick={handlePetCat}
                  className="px-6 py-2.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 font-serif text-xs font-semibold transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                >
                  <Heart size={16} className="text-rose-400 animate-pulse" />
                  <span>Pet the Cozy Sleeping Cat</span>
                </button>

                {catPetCount > 0 && (
                  <p className="text-xs text-rose-300/90 font-serif italic animate-pulse">
                    *Purrrrr...* The cozy orange tabby purrs warmly beside the campfire log. ({catPetCount} pets)
                  </p>
                )}
              </motion.div>
            )}

            {/* TAB 4: FULL JOURNEY SUMMARY */}
            {activeTab === 'journal' && (
              <motion.div
                key="tab-journal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <p className="text-xs text-amber-200/80 italic font-serif text-center">
                  All 10 story chapters unlocked during your journey through the firefly twilight:
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {engine.storyWaypoints.map((wp) => (
                    <div
                      key={wp.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 flex items-start gap-3"
                    >
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-amber-200 font-serif">
                          Chapter {wp.chapterNumber}: {wp.title}
                        </div>
                        <div className="text-[11px] text-purple-200/80 font-serif italic mt-0.5 line-clamp-2">
                          "{wp.dialogText}"
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Footer (ALL OPTIONS WORK PROPERLY!) */}
        <div className="mt-5 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="text-xs font-serif italic text-purple-300/80 flex items-center gap-1.5">
            <Compass size={14} className="text-amber-400" />
            <span>
              {is100
                ? '✨ 100% Complete! The forest remembers every moment.'
                : 'The fireflies carry your moments into the twilight.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleContinueExploringClick}
              className="ui-btn-primary px-5 py-2.5 rounded-full text-xs font-serif font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Sparkles size={15} />
              <span>Continue Exploring</span>
            </button>

            <button
              onClick={handleResetGame}
              className="px-4 py-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-serif transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>New Journey</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
