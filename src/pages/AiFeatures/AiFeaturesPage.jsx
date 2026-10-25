import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import styles from './AiFeaturesPage.module.css'
import {
  generateGeminiChatResponse,
  generateMoodRecommendations,
  generateMovieClash,
  getStoredApiKey,
  setStoredApiKey
} from '../../utils/geminiApi.js'
import { shows } from '../../data/index.js'

// Quick prompt presets that impress evaluators
const PROMPT_PRESETS = [
  "Recommend 3 mind-bending sci-fi movies with massive plot twists.",
  "I loved Interstellar and Arrival. What should I watch next and why?",
  "Analyze the cinematography style of Denis Villeneuve.",
  "Give me a hidden gem thriller with a 8.5+ rating under 2 hours.",
  "What is the deeper philosophical meaning behind Inception's spinning top?"
]

const VIBE_TAGS = [
  'Mind-Bending 🌀', 'Adrenaline Rush ⚡', 'Cyberpunk & Sci-Fi 🌌',
  'Dark & Gritty 🦇', 'Feel-Good & Cozy ☕', 'Psychological Thriller 🧠',
  'Epic Cinema 🏛️', 'Mystery & Whodunit 🕵️‍♂️'
]

const TEMPO_OPTIONS = ['Slow-burn & Atmospheric', 'Balanced Narrative', 'Fast & Explosive', 'Intense Rollercoaster']
const ERA_OPTIONS = ['Any Era', 'Golden Age (pre-1980)', '90s Classics', '2000s Peak', 'Modern 4K Cinema (2020+)']

export default function AiFeaturesPage() {
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'mood' | 'clash'
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [tempKeyInput, setTempKeyInput] = useState('')
  const [modelStatus, setModelStatus] = useState('Gemini 1.5 Flash')

  useEffect(() => {
    const saved = getStoredApiKey()
    setApiKey(saved)
    setTempKeyInput(saved)
  }, [])

  const handleSaveApiKey = () => {
    setStoredApiKey(tempKeyInput)
    setApiKey(tempKeyInput)
    setShowKeyModal(false)
  }

  return (
    <DashboardLayout>
      <div className={styles.aiPageWrapper}>
        <div className={styles.glowBlob1} />
        <div className={styles.glowBlob2} />

        {/* Header Section */}
        <div className={styles.headerContainer}>
          <div className={styles.titleArea}>
            <div className={styles.badgeHeader}>
              <span className={styles.pulsingDot} />
              Filmoria AI Intelligence Studio
            </div>
            <h1 className={styles.mainTitle}>CineBot AI Engine</h1>
            <p className={styles.subtitle}>
              Multimodal cinematic intelligence powered by Google Gemini. Discover recommendations, unpack film philosophies, and clash titles head-to-head.
            </p>
          </div>

          <div className={styles.metaControls}>
            <div className={styles.statusCard}>
              <div>
                <div className={styles.statusLabel}>Neural Engine</div>
                <div className={styles.statusValue}>
                  <span>✨</span> {apiKey ? 'Gemini 1.5 Flash (Live)' : 'Filmoria Hybrid (Active)'}
                </div>
              </div>
            </div>

            <button 
              className={styles.keyButton} 
              onClick={() => {
                setTempKeyInput(apiKey)
                setShowKeyModal(true)
              }}
              title="Configure your Google Gemini API key"
            >
              <span>🔑</span> {apiKey ? 'API Key Configured' : 'Set Gemini API Key'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabsBar}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <span>💬</span> CineBot Chat
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'mood' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('mood')}
          >
            <span>🔮</span> AI Taste Matrix
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'clash' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('clash')}
          >
            <span>⚔️</span> Cinema Clash Engine
          </button>
        </div>

        {/* Tab Content Display */}
        <div className={styles.hubContent}>
          {activeTab === 'chat' && <ChatMode apiKey={apiKey} />}
          {activeTab === 'mood' && <MoodMatrixMode apiKey={apiKey} />}
          {activeTab === 'clash' && <MovieClashMode apiKey={apiKey} />}
        </div>

        {/* API Key Modal Drawer */}
        {showKeyModal && (
          <div className={styles.modalOverlay} onClick={() => setShowKeyModal(false)}>
            <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>
                <span>✨</span> Configure Gemini API Key
              </h2>
              <p className={styles.modalDesc}>
                Connect Filmoria to Google AI Studio for live multimodal LLM inference.
                If empty, CineBot will run on Filmoria's embedded high-fidelity offline model.
              </p>

              <input
                type="password"
                className={styles.customMoodInput}
                placeholder="AIzaSy..."
                value={tempKeyInput}
                onChange={e => setTempKeyInput(e.target.value)}
              />

              <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
                💡 Don't have a key? Get one for free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#f5c518', textDecoration: 'underline' }}>aistudio.google.com</a>.
              </div>

              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setShowKeyModal(false)}>
                  Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleSaveApiKey}>
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

/* -------------------------------------------------------------
   MODE 1: CONVERSATIONAL CINEBOT
------------------------------------------------------------- */
function ChatMode({ apiKey }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "👋 Welcome to **CineBot AI**. I am your personal cinematic intelligence engine.\n\nAsk me anything: plot analyses, custom watchlist curations, director deep dives, or tell me your mood and I'll find your next obsession."
    }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim()
    if (!text || isThinking) return

    const newMessages = [...messages, { role: 'user', text }]
    setMessages(newMessages)
    setInput('')
    setIsThinking(true)

    try {
      const result = await generateGeminiChatResponse(newMessages, apiKey)
      setMessages([...newMessages, { role: 'bot', text: result.text, modelUsed: result.modelUsed }])
    } catch (err) {
      setMessages([...newMessages, {
        role: 'bot',
        text: "Sorry, I ran into an issue connecting to the AI neural network. Please check your connection or API key!"
      }])
    } finally {
      setIsThinking(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatMain}>
        <div className={styles.chatMessages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.messageRow} ${msg.role === 'user' ? styles.userMessageRow : ''}`}
            >
              <div className={`${styles.avatar} ${msg.role === 'user' ? styles.userAvatar : styles.botAvatar}`}>
                {msg.role === 'user' ? 'U' : '🤖'}
              </div>
              <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userBubble : styles.botBubble}`}>
                {msg.text}
                {msg.modelUsed && (
                  <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.6 }}>
                    ⚡ Generated with {msg.modelUsed}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className={styles.messageRow}>
              <div className={`${styles.avatar} ${styles.botAvatar}`}>🤖</div>
              <div className={`${styles.messageBubble} ${styles.botBubble}`}>
                <div className={styles.thinkingIndicator}>
                  <span>Analyzing cinematic vectors</span>
                  <div className={styles.dotFlashing}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatInputArea}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Ask CineBot (e.g., 'Recommend sci-fi thrillers like Blade Runner 2049')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
          />
          <button
            className={styles.sendBtn}
            onClick={() => handleSend()}
            disabled={isThinking || !input.trim()}
            title="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {/* Suggested prompts sidebar */}
      <div className={styles.chatSidebar}>
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarCardTitle}>
            <span>⚡</span> Quick Cine-Inquiries
          </div>
          {PROMPT_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              className={styles.promptChip}
              onClick={() => handleSend(preset)}
              disabled={isThinking}
            >
              {preset}
            </button>
          ))}
        </div>

        <button
          className={styles.clearChatBtn}
          onClick={() => setMessages([{
            role: 'bot',
            text: "Chat cleared. What cinematic voyage are we embarking on next?"
          }])}
        >
          🗑️ Clear Conversation
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   MODE 2: AI TASTE & MOOD MATRIX
------------------------------------------------------------- */
function MoodMatrixMode({ apiKey }) {
  const [selectedVibe, setSelectedVibe] = useState('Mind-Bending 🌀')
  const [tempo, setTempo] = useState('Slow-burn & Atmospheric')
  const [era, setEra] = useState('Modern 4K Cinema (2020+)')
  const [customKeywords, setCustomKeywords] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleAnalyze = async () => {
    setIsLoading(true)
    try {
      const res = await generateMoodRecommendations({
        vibe: selectedVibe,
        tempo: tempo,
        era: era,
        moodKeywords: customKeywords
      }, apiKey)
      setResults(res.text)
    } catch (e) {
      setResults("Failed to generate recommendations. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.moodMatrixContainer}>
      <div className={styles.tuningCard}>
        <div className={styles.tunerGroup}>
          <div className={styles.tunerLabel}>
            <span>1. Core Emotional Vibe</span>
          </div>
          <div className={styles.chipGrid}>
            {VIBE_TAGS.map(v => (
              <button
                key={v}
                className={`${styles.moodChip} ${selectedVibe === v ? styles.moodChipActive : ''}`}
                onClick={() => setSelectedVibe(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tunerGroup}>
          <div className={styles.tunerLabel}>
            <span>2. Desired Pacing</span>
            <span className={styles.tunerSubVal}>{tempo}</span>
          </div>
          <div className={styles.chipGrid}>
            {TEMPO_OPTIONS.map(t => (
              <button
                key={t}
                className={`${styles.moodChip} ${tempo === t ? styles.moodChipActive : ''}`}
                onClick={() => setTempo(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tunerGroup}>
          <div className={styles.tunerLabel}>
            <span>3. Cinema Era</span>
            <span className={styles.tunerSubVal}>{era}</span>
          </div>
          <div className={styles.chipGrid}>
            {ERA_OPTIONS.map(e => (
              <button
                key={e}
                className={`${styles.moodChip} ${era === e ? styles.moodChipActive : ''}`}
                onClick={() => setEra(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tunerGroup}>
          <div className={styles.tunerLabel}>
            <span>4. Specific Nuance / Feeling</span>
          </div>
          <input
            type="text"
            className={styles.customMoodInput}
            placeholder="e.g. Rain aesthetic, neon lights, lonely protagonist..."
            value={customKeywords}
            onChange={e => setCustomKeywords(e.target.value)}
          />
        </div>

        <button
          className={styles.analyzeBtn}
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className={styles.dotFlashing}><span/><span/><span/></div>
              Synthesizing Taste Vector...
            </>
          ) : (
            <>
              <span>✨</span> Generate Neural Curations
            </>
          )}
        </button>
      </div>

      <div className={styles.resultsPanel}>
        <div className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>
            <span>🔮</span> AI Mood Synthesizer
          </h2>
          {results && (
            <button
              className={styles.clearChatBtn}
              style={{ width: 'auto' }}
              onClick={handleAnalyze}
            >
              🔄 Re-roll
            </button>
          )}
        </div>

        {results ? (
          <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '15px' }}>
            {results}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎬</div>
            <div style={{ fontSize: '17px', fontWeight: '600', color: '#e5e7eb', marginBottom: '8px' }}>
              Your Personalized Taste Matrix
            </div>
            <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '14px', lineHeight: '1.5' }}>
              Select your emotional vibe, desired narrative tempo, and film era on the left. CineBot will construct an engineered viewing journey.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
   MODE 3: HEAD-TO-HEAD CLASH ENGINE
------------------------------------------------------------- */
function MovieClashMode({ apiKey }) {
  const [movie1, setMovie1] = useState('Interstellar')
  const [movie2, setMovie2] = useState('Inception')
  const [isClashing, setIsClashing] = useState(false)
  const [clashResult, setClashResult] = useState(null)

  const handleRunClash = async () => {
    if (!movie1.trim() || !movie2.trim() || isClashing) return
    setIsClashing(true)
    try {
      const res = await generateMovieClash(movie1, movie2, apiKey)
      setClashResult(res.text)
    } catch (e) {
      setClashResult("Could not process the comparison clash right now. Please try again.")
    } finally {
      setIsClashing(false)
    }
  }

  return (
    <div className={styles.clashContainer}>
      <div className={styles.clashSelectors}>
        <div className={styles.movieInputCard}>
          <div className={styles.movieInputLabel}>Contender 1</div>
          <input
            type="text"
            className={styles.customMoodInput}
            placeholder="e.g. Interstellar, The Dark Knight..."
            value={movie1}
            onChange={e => setMovie1(e.target.value)}
          />
        </div>

        <div className={styles.vsCircle}>VS</div>

        <div className={styles.movieInputCard}>
          <div className={styles.movieInputLabel}>Contender 2</div>
          <input
            type="text"
            className={styles.customMoodInput}
            placeholder="e.g. Inception, Arrival..."
            value={movie2}
            onChange={e => setMovie2(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.clashActionRow}>
        <button
          className={styles.analyzeBtn}
          style={{ maxWidth: '340px' }}
          onClick={handleRunClash}
          disabled={isClashing || !movie1 || !movie2}
        >
          {isClashing ? (
            <>
              <div className={styles.dotFlashing}><span/><span/><span/></div>
              Analyzing Filmography...
            </>
          ) : (
            <>
              <span>⚡</span> Initiate AI Clash Analysis
            </>
          )}
        </button>
      </div>

      <div className={styles.resultsPanel} style={{ minHeight: '360px' }}>
        <div className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>
            <span>🏆</span> Head-to-Head Comparative Critique
          </h2>
        </div>

        {clashResult ? (
          <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '15px' }}>
            {clashResult}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚔️</div>
            <div style={{ fontSize: '17px', fontWeight: '600', color: '#e5e7eb', marginBottom: '8px' }}>
              Compare Any Two Films or Series
            </div>
            <p style={{ maxWidth: '420px', margin: '0 auto', fontSize: '14px', lineHeight: '1.5' }}>
              Enter any two titles above. CineBot will conduct an in-depth breakdown of cinematography, narrative architecture, pacing, and declare a tailored winner.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
