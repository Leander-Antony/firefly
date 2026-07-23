import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Disc, Coffee, Heart, Feather, ExternalLink, Plus, Sparkles } from 'lucide-react';
import { GameEngine } from '../game/GameEngine';
import type { JournalEntry } from '../types/game';
import { SoundEngine } from '../audio/SoundEngine';
import { saveGameState } from '../utils/storage';

interface JournalModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({ engine, onClose }) => {
  const [activeTab, setActiveTab] = useState<'story' | 'letters' | 'tapes' | 'coffee' | 'dreams' | 'whispers'>('story');
  
  const [newDreamPrompt, setNewDreamPrompt] = useState('What made you smile today?');
  const [newDreamText, setNewDreamText] = useState('');

  const unlockedLetters = engine.letters.filter((l) => l.unlocked);
  const unlockedTapes = engine.tapes.filter((t) => t.unlocked);
  const unlockedStories = engine.storyChapters.filter((s) => s.unlocked);

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

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="journal-modal"
      >
        {/* Header */}
        <div className="journal-header">
          <div className="flex items-center gap-2">
            <BookOpen className="text-amber-300" size={24} />
            <h2 className="journal-title">Traveler's Notebook & Story</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="journal-tabs">
          <button
            className={`tab-btn ${activeTab === 'story' ? 'active' : ''}`}
            onClick={() => { setActiveTab('story'); SoundEngine.playPageFlip(); }}
          >
            <Sparkles size={16} /> Story ({unlockedStories.length}/5)
          </button>
          <button
            className={`tab-btn ${activeTab === 'letters' ? 'active' : ''}`}
            onClick={() => { setActiveTab('letters'); SoundEngine.playPageFlip(); }}
          >
            <BookOpen size={16} /> Letters ({unlockedLetters.length}/15)
          </button>
          <button
            className={`tab-btn ${activeTab === 'tapes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tapes'); SoundEngine.playPageFlip(); }}
          >
            <Disc size={16} /> Cassettes ({unlockedTapes.length}/6)
          </button>
          <button
            className={`tab-btn ${activeTab === 'coffee' ? 'active' : ''}`}
            onClick={() => { setActiveTab('coffee'); SoundEngine.playPageFlip(); }}
          >
            <Coffee size={16} /> Coffee Log
          </button>
          <button
            className={`tab-btn ${activeTab === 'dreams' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dreams'); SoundEngine.playPageFlip(); }}
          >
            <Feather size={16} /> Dreams
          </button>
          <button
            className={`tab-btn ${activeTab === 'whispers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('whispers'); SoundEngine.playPageFlip(); }}
          >
            <Heart size={16} /> Whispers
          </button>
        </nav>

        {/* Tab Content */}
        <div className="journal-content custom-scrollbar">
          {/* 0. STORY CHAPTERS TAB */}
          {activeTab === 'story' && (
            <div className="story-chapters-list">
              {engine.storyChapters.map((ch) => (
                <div
                  key={ch.id}
                  className={`story-chapter-card ${ch.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="chapter-header">
                    <span className="chapter-badge">Chapter {ch.chapterNumber}</span>
                    <h3 className="chapter-title">{ch.title}</h3>
                  </div>
                  <div className="chapter-subtitle">{ch.subtitle}</div>
                  {ch.unlocked ? (
                    <p className="chapter-content">"{ch.content}"</p>
                  ) : (
                    <p className="chapter-locked-text">
                      🔒 Collect {ch.requiredFireflies} Fireflies to unlock this story chapter.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 1. LETTERS TAB */}
          {activeTab === 'letters' && (
            <div className="letters-grid">
              {unlockedLetters.length === 0 ? (
                <div className="empty-state">
                  <p>No letters discovered yet. Explore the forest to find warm notes left behind by travelers.</p>
                </div>
              ) : (
                unlockedLetters.map((l) => (
                  <div key={l.id} className="letter-card">
                    <div className="letter-location">{l.locationName}</div>
                    <h3 className="letter-title">{l.title}</h3>
                    <p className="letter-body">"{l.content}"</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. CASSETTE TAPES TAB */}
          {activeTab === 'tapes' && (
            <div className="tapes-grid">
              {unlockedTapes.length === 0 ? (
                <div className="empty-state">
                  <p>No cassette tapes found yet. Listen for soft music in quiet forest corners.</p>
                </div>
              ) : (
                unlockedTapes.map((t) => (
                  <div key={t.id} className="tape-card">
                    <div className="tape-art" style={{ backgroundColor: t.albumArtColor }}>
                      <Disc size={32} className="animate-spin-slow text-white/80" />
                    </div>
                    <div className="tape-info">
                      <h4 className="tape-song">{t.songTitle}</h4>
                      <p className="tape-artist">{t.artist}</p>
                      <p className="tape-desc">{t.description}</p>
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(t.spotifyQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="spotify-search-btn"
                        onClick={() => SoundEngine.playCassetteClick()}
                      >
                        Search on Spotify <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. COFFEE LOG TAB */}
          {activeTab === 'coffee' && (
            <div className="coffee-section">
              <div className="coffee-stats">
                <Coffee size={32} className="text-amber-400" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-200">
                    Collected Coffee Beans: {engine.savedState.coffeeCount}
                  </h3>
                  <p className="text-sm text-slate-300">
                    Visit the Coffee Corner kiosk to exchange beans for cozy notes.
                  </p>
                </div>
              </div>
              <div className="coffee-messages-list">
                <div className="coffee-msg-card font-handwriting">
                  "Someone still owes someone coffee."
                </div>
                <div className="coffee-msg-card font-handwriting">
                  "Today's recommendation: Take a break."
                </div>
                <div className="coffee-msg-card font-handwriting">
                  "Coffee first. Everything else later."
                </div>
              </div>
            </div>
          )}

          {/* 4. DREAM JOURNAL TAB */}
          {activeTab === 'dreams' && (
            <div className="dream-journal-section">
              <div className="write-dream-box">
                <label className="text-xs text-purple-300 font-medium">Select Prompt:</label>
                <select
                  value={newDreamPrompt}
                  onChange={(e) => setNewDreamPrompt(e.target.value)}
                  className="dream-prompt-select"
                >
                  {dreamPrompts.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <textarea
                  value={newDreamText}
                  onChange={(e) => setNewDreamText(e.target.value)}
                  placeholder="Write your reflection here... Stored only on your device."
                  className="dream-textarea"
                  rows={3}
                />

                <button onClick={handleAddDream} className="save-dream-btn">
                  <Plus size={16} /> Save to Journal
                </button>
              </div>

              <div className="saved-dreams-list">
                {engine.savedState.journalEntries.length === 0 ? (
                  <p className="text-center text-slate-400 py-4">No dream entries written yet.</p>
                ) : (
                  engine.savedState.journalEntries.map((entry) => (
                    <div key={entry.id} className="dream-entry-card">
                      <div className="entry-date">{entry.date}</div>
                      <div className="entry-prompt">{entry.prompt}</div>
                      <p className="entry-content">"{entry.content}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 5. WHISPER TREE NOTES TAB */}
          {activeTab === 'whispers' && (
            <div className="whisper-kept-section">
              {engine.savedState.keptWhisperNotes.length === 0 ? (
                <div className="empty-state">
                  <p>No kept whisper notes. When writing at the Whisper Tree, choose "Keep" to store notes here.</p>
                </div>
              ) : (
                engine.savedState.keptWhisperNotes.map((note) => (
                  <div key={note.id} className="whisper-kept-card">
                    <span className="text-xs text-purple-400">{note.date}</span>
                    <p className="italic text-purple-100 mt-1">"{note.content}"</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
