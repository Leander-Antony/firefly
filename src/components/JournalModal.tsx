import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  Radio,
  Coffee,
  Heart,
  Feather,
  ExternalLink,
  Plus,
  Sparkles,
  Volume2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { GameEngine } from '../game/GameEngine';
import type { JournalEntry } from '../types/game';
import { SoundEngine } from '../audio/SoundEngine';
import { saveGameState } from '../utils/storage';
import { SVG_ASSETS } from '../utils/AssetManager';

interface JournalModalProps {
  engine: GameEngine;
  onClose: () => void;
}

type JournalTab = 'story' | 'letters' | 'tapes' | 'coffee' | 'dreams' | 'whispers';

export const JournalModal: React.FC<JournalModalProps> = ({ engine, onClose }) => {
  const [activeTab, setActiveTab] = useState<JournalTab>('story');
  const [newDreamPrompt, setNewDreamPrompt] = useState('What made you smile today?');
  const [newDreamText, setNewDreamText] = useState('');
  const [playingTapeId, setPlayingTapeId] = useState<string | null>(null);

  const lettersList = engine?.letters || [];
  const tapesList = engine?.tapes || [];
  const storyChaptersList = engine?.storyChapters || [];
  const journalEntries = engine?.savedState?.journalEntries || [];
  const keptWhisperNotes = engine?.savedState?.keptWhisperNotes || [];

  const unlockedLetters = lettersList.filter((l) => l.unlocked);
  const unlockedTapes = tapesList.filter((t) => t.unlocked);
  const unlockedStories = storyChaptersList.filter((s) => s.unlocked);
  const totalStories = storyChaptersList.length;
  const totalLetters = lettersList.length;
  const totalTapes = tapesList.length;

  const dreamPrompts = [
    'What made you smile today?',
    'What do you wish you could tell someone?',
    'What memory keeps coming back?',
    'What quiet moment are you thankful for?',
  ];

  const handleAddDream = () => {
    if (!newDreamText.trim()) return;
    const entry: JournalEntry = {
      id: `dream_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      prompt: newDreamPrompt,
      content: newDreamText,
    };
    engine.savedState.journalEntries.unshift(entry);
    saveGameState(engine.savedState);
    engine.updateTaskProgress();
    setNewDreamText('');
    SoundEngine.playPageFlip();
  };

  const handlePlayTape = (tapeId: string) => {
    SoundEngine.playCassetteClick();
    setPlayingTapeId(tapeId);
  };

  const handleTabChange = (tab: JournalTab) => {
    setActiveTab(tab);
    SoundEngine.playPageFlip();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-hidden">
      {/* Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 60% at 50% 30%, rgba(88,28,135,0.2) 0%, transparent 75%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        className="relative bg-slate-900/95 border border-purple-500/30 rounded-3xl p-6 md:p-7 max-w-3xl w-full shadow-2xl text-slate-100 flex flex-col max-h-[88vh] overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={SVG_ASSETS.journalCover}
              alt="Journal Cover"
              className="w-10 h-10 object-contain rounded-xl shadow-md border border-amber-500/30 shrink-0"
            />
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-amber-200">
                Traveler's Notebook & Diary
              </h2>
              <p className="text-xs text-purple-200/70 italic font-serif">
                Memories gathered in the firefly twilight
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                engine.activeModal = 'prologue';
                onClose();
              }}
              className="px-3 py-1.5 rounded-full bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/40 text-xs font-serif text-purple-200 transition-all flex items-center gap-1.5"
              title="Replay Prologue Intro Cutscene"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span>Replay Intro</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 justify-start mb-4 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto custom-scrollbar relative z-10">
          <button
            onClick={() => handleTabChange('story')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif shrink-0 transition-all ${
              activeTab === 'story'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} /> Story ({unlockedStories.length}/{totalStories})
          </button>

          <button
            onClick={() => handleTabChange('letters')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif shrink-0 transition-all ${
              activeTab === 'letters'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} /> Letters ({unlockedLetters.length}/{totalLetters})
          </button>

          <button
            onClick={() => handleTabChange('tapes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif shrink-0 transition-all ${
              activeTab === 'tapes'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio size={14} /> Tapes ({unlockedTapes.length}/{totalTapes})
          </button>

          <button
            onClick={() => handleTabChange('coffee')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif shrink-0 transition-all ${
              activeTab === 'coffee'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coffee size={14} /> Coffee ({engine.savedState.coffeeCount})
          </button>

          <button
            onClick={() => handleTabChange('dreams')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif shrink-0 transition-all ${
              activeTab === 'dreams'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Feather size={14} /> Reflections
          </button>

          <button
            onClick={() => handleTabChange('whispers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif shrink-0 transition-all ${
              activeTab === 'whispers'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart size={14} /> Whispers ({keptWhisperNotes.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {/* 0. STORY CHAPTERS TAB */}
            {activeTab === 'story' && (
              <motion.div
                key="journal-story"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {engine.storyChapters.map((ch) => (
                  <div
                    key={ch.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      ch.unlocked
                        ? 'bg-slate-950/80 border-purple-500/30'
                        : 'bg-slate-950/30 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-mono font-bold uppercase">
                        Chapter {ch.chapterNumber}
                      </span>
                      {ch.unlocked ? (
                        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 size={13} /> Unlocked
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Lock size={13} /> Requires {ch.requiredFireflies} Fireflies
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-serif font-bold text-amber-200">{ch.title}</h3>
                    <p className="text-xs text-purple-200/80 italic font-serif mb-2">{ch.subtitle}</p>

                    {ch.unlocked ? (
                      <p className="text-xs md:text-sm font-serif text-slate-200 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5 whitespace-pre-line">
                        "{ch.content}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic font-serif">
                        Explore the forest twilight and collect {ch.requiredFireflies} fireflies to awaken this memory.
                      </p>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* 1. LETTERS TAB */}
            {activeTab === 'letters' && (
              <motion.div
                key="journal-letters"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {unlockedLetters.length === 0 ? (
                  <div className="col-span-2 p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-serif italic">
                      No traveler's letters discovered yet. Walk through the forest paths to uncover hidden letters.
                    </p>
                  </div>
                ) : (
                  unlockedLetters.map((l) => (
                    <div
                      key={l.id}
                      className="p-4 rounded-2xl bg-amber-950/15 border border-amber-500/25 space-y-1.5"
                    >
                      <div className="text-[10px] text-amber-400/80 font-mono uppercase tracking-wider">
                        {l.locationName}
                      </div>
                      <h3 className="text-sm font-serif font-bold text-amber-200">{l.title}</h3>
                      <p className="text-xs font-serif italic text-purple-100/90 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-amber-500/10">
                        "{l.content}"
                      </p>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* 2. CASSETTE TAPES TAB */}
            {activeTab === 'tapes' && (
              <motion.div
                key="journal-tapes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {unlockedTapes.length === 0 ? (
                  <div className="col-span-2 p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-serif italic">
                      No cassette tapes discovered yet. Listen for ambient music in quiet forest biomes.
                    </p>
                  </div>
                ) : (
                  unlockedTapes.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handlePlayTape(t.id)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                        playingTapeId === t.id
                          ? 'bg-purple-900/40 border-amber-400/60 ring-2 ring-amber-400/30'
                          : 'bg-slate-950/80 border-purple-500/30 hover:border-purple-400/60'
                      }`}
                    >
                      <motion.div
                        animate={
                          playingTapeId === t.id
                            ? { rotate: [0, 3, -3, 0], scale: [1, 1.05, 1] }
                            : {}
                        }
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center p-1 border border-white/10 shrink-0"
                      >
                        <img
                          src={SVG_ASSETS.cassette}
                          alt="Cassette Tape"
                          className="w-full h-full object-contain"
                        />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-serif font-bold text-amber-200 truncate">
                            {t.songTitle}
                          </h4>
                          {playingTapeId === t.id && (
                            <Volume2 size={13} className="text-amber-400 animate-pulse shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{t.artist}</p>
                        <p className="text-[10px] text-purple-300/70 font-serif italic truncate">
                          "{t.description}"
                        </p>
                        <a
                          href={`https://open.spotify.com/search/${encodeURIComponent(t.spotifyQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 mt-1 font-mono"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Spotify <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* 3. COFFEE LOG TAB */}
            {activeTab === 'coffee' && (
              <motion.div
                key="journal-coffee"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/25 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                    <Coffee size={28} />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-amber-200">
                      Coffee Beans Traded: {engine.savedState.coffeeCount}
                    </h3>
                    <p className="text-xs text-slate-300 font-serif italic">
                      Gather beans from roasted shrubs across the glade and visit the Coffee Kiosk.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 text-xs font-serif italic text-purple-200">
                    "One coffee became two. Then four. Nobody remembered who owed whom."
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 text-xs font-serif italic text-purple-200">
                    "Today's recommendation: Take a slow breath and walk."
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 text-xs font-serif italic text-purple-200">
                    "Coffee first. Everything else quietly later."
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. PERSONAL REFLECTIONS TAB */}
            {activeTab === 'dreams' && (
              <motion.div
                key="journal-dreams"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 space-y-3">
                  <label className="text-xs text-rose-300 font-serif font-bold block">
                    Write a Personal Reflection:
                  </label>
                  <select
                    value={newDreamPrompt}
                    onChange={(e) => setNewDreamPrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-serif focus:outline-none focus:border-rose-400"
                  >
                    {dreamPrompts.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  <textarea
                    value={newDreamText}
                    onChange={(e) => setNewDreamText(e.target.value)}
                    placeholder="Write whatever is on your heart... Stored privately on your device."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-serif focus:outline-none focus:border-rose-400 custom-scrollbar resize-none"
                    rows={3}
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleAddDream}
                      disabled={!newDreamText.trim()}
                      className="px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 disabled:opacity-50 text-rose-200 border border-rose-400/40 text-xs font-serif font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Plus size={15} /> Save to Personal Journal
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {journalEntries.length === 0 ? (
                    <p className="text-center text-slate-500 text-xs font-serif italic py-3">
                      No personal reflections written yet.
                    </p>
                  ) : (
                    journalEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-purple-500/20 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-purple-400">
                          <span>{entry.date}</span>
                          <span className="italic font-serif text-slate-400">{entry.prompt}</span>
                        </div>
                        <p className="text-xs font-serif italic text-purple-100">"{entry.content}"</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* 5. WHISPER TREE NOTES TAB */}
            {activeTab === 'whispers' && (
              <motion.div
                key="journal-whispers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                {keptWhisperNotes.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-serif italic">
                      No kept whisper notes. When writing at the Whisper Tree, choose "Keep" to store secret notes here.
                    </p>
                  </div>
                ) : (
                  keptWhisperNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/25 space-y-1"
                    >
                      <span className="text-[10px] text-purple-400 font-mono">{note.date}</span>
                      <p className="text-xs font-serif italic text-purple-100">"{note.content}"</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
