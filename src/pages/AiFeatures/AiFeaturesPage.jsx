import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import {
  vibeSearch,
  compareMoviesAi,
  getGeminiApiKey,
  setGeminiApiKey,
} from '../../services/geminiAi.js'
import { useWatchlist } from '../../context/index.js'
import { useToast } from '../../components/common/Toast/index.js'
import styles from './AiFeaturesPage.module.css'

/* ── Inline SVG Icons ───────────────────────────────────────────────────────── */
function SparklesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v19M5 10l14 4M5 14l14-4" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function EyeIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function MusicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5-3 3 1.5 1.5L9 14l-4 4-2.5-2.5L2 16l4 4 4-4 2 2 4-4-1.5-1.5 3-3 1.5 1.5 2.5-2.5-2-2z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ── Curated Preset Prompts ───────────────────────────────────────────────────
const PRESET_PROMPTS = [
  {
    label: '✨ Uplifting Sci-Fi & Soundtracks (< 2 hrs)',
    prompt:
      'I had a long exhausting day, recommend me 3 uplifting sci-fi films with great soundtracks under 2 hours.',
  },
  {
    label: '🌧️ Rainy Midnight Mind-Benders',
    prompt:
      'Dark psychological thrillers with shocking plot twists, moody rain aesthetics, and philosophical tension.',
  },
  {
    label: '☕ Cozy 90s Autumn Comedy',
    prompt:
      'Comforting feel-good 90s/00s romantic comedies set in autumn with witty banter and zero high-stress drama.',
  },
  {
    label: '⚡ Neon Cyberpunk Adrenaline',
    prompt:
      'Fast-paced futuristic cyberpunk action films with neon cityscapes, synthwave music, and visceral style.',
  },
]

export default function AiFeaturesPage() {
  const [activeTab, setActiveTab] = useState('vibe') // 'vibe' | 'compare'
  const [promptInput, setPromptInput] = useState(
    'I had a long exhausting day, recommend me 3 uplifting sci-fi films with great soundtracks under 2 hours.'
  )
  const [isPromptFocused, setIsPromptFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [vibeResult, setVibeResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  // API Key Modal State
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false)
  const [customKeyInput, setCustomKeyInput] = useState('')
  const [hasCustomKey, setHasCustomKey] = useState(false)

  // Compare Tab State
  const [compareMovie1, setCompareMovie1] = useState('Dune')
  const [compareMovie2, setCompareMovie2] = useState('Interstellar')
  const [isComparing, setIsComparing] = useState(false)
  const [compareResult, setCompareResult] = useState(null)

  // Context & Toast hooks
  const { isInWatchlist, toggleWatchlist, isWatched, toggleWatched } = useWatchlist()
  const { toast } = useToast()

  // Initialize API Key state
  useEffect(() => {
    const key = getGeminiApiKey()
    setHasCustomKey(Boolean(key))
    setCustomKeyInput(key || '')
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGenerate = async (queryToRun) => {
    const q = (queryToRun || promptInput).trim()
    if (!q) return

    setIsLoading(true)
    setErrorMsg(null)

    try {
      const result = await vibeSearch(q)
      setVibeResult(result)
    } catch (err) {
      console.error('[AiFeaturesPage] Error:', err)
      setErrorMsg(err.message || 'Failed to generate recommendations.')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-run default prompt on first mount to show the wow factor
  useEffect(() => {
    handleGenerate(promptInput)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveKey = () => {
    setGeminiApiKey(customKeyInput)
    setHasCustomKey(Boolean(customKeyInput.trim()))
    setIsKeyModalOpen(false)
    toast.success('Gemini API key updated!')
  }

  const handleClearKey = () => {
    setGeminiApiKey('')
    setCustomKeyInput('')
    setHasCustomKey(false)
    setIsKeyModalOpen(false)
    toast.info('Gemini API key removed. Using offline analyzer.')
  }

  const handleRunCompare = async () => {
    if (!compareMovie1.trim() || !compareMovie2.trim()) return
    setIsComparing(true)
    try {
      const res = await compareMoviesAi(compareMovie1.trim(), compareMovie2.trim())
      setCompareResult(res)
    } catch (err) {
      console.error('[AiFeaturesPage] Compare error:', err)
    } finally {
      setIsComparing(false)
    }
  }

  const handleWatchlistCardToggle = (movie) => {
    const inList = isInWatchlist(movie.id)
    toggleWatchlist(movie)
    if (!inList) {
      toast.addedToWatchlist(movie.title)
    } else {
      toast.info(`Removed '${movie.title}' from Watchlist`)
    }
  }

  const handleWatchedCardToggle = (movie) => {
    const watched = isWatched(movie.id)
    toggleWatched(movie)
    if (!watched) {
      toast.markedAsWatched(movie.title)
    } else {
      toast.info(`Removed '${movie.title}' from Watched`)
    }
  }

  return (
    <DashboardLayout>
      <div className={styles.pageContainer}>
        {/* Ambient background glows */}
        <div className={styles.ambientGlowTop} />
        <div className={styles.ambientGlowBottom} />

        {/* ── Hero Header ── */}
        <header className={styles.header}>
          <div className={styles.geminiBadge}>
            <span className={styles.liveDot} />
            <span>✦ Powered by Google Gemini 1.5 Flash</span>
          </div>

          <h1 className={styles.title}>
            MovieVerse <span className={styles.titleAccent}>Cinema Intelligence</span>
          </h1>

          <p className={styles.subtitle}>
            Experience natural language film discovery. Speak your exact mood, constraints, and soundtrack desires — Gemini interprets your cinematic intent with psychological precision.
          </p>
        </header>

        {/* ── Navigation Tabs & API Key Configuration ── */}
        <div className={styles.topActionsRow}>
          <div className={styles.tabs} role="tablist">
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'vibe' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('vibe')}
              role="tab"
              aria-selected={activeTab === 'vibe'}
            >
              <SparklesIcon />
              <span>Natural Language Vibe Search</span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'compare' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('compare')}
              role="tab"
              aria-selected={activeTab === 'compare'}
            >
              <span>⚔️ AI Film Duel & Comparison</span>
            </button>
          </div>

          <button
            type="button"
            className={styles.keyConfigBtn}
            onClick={() => setIsKeyModalOpen(true)}
            aria-label="Configure Gemini API Key"
          >
            <KeyIcon />
            <span>Gemini Key:</span>
            <span className={styles.keyStatusTag}>
              {hasCustomKey ? 'Active Key' : 'Demo / Ready'}
            </span>
          </button>
        </div>

        {/* ── Main Content Area ── */}
        <main className={styles.contentArea}>
          {activeTab === 'vibe' ? (
            <div>
              {/* Prompt Input Box */}
              <div
                className={`${styles.promptBox} ${
                  isPromptFocused ? styles.promptBoxFocus : ''
                }`}
              >
                <div className={styles.promptHeader}>
                  <div className={styles.promptLabel}>
                    <span className={styles.promptLabelIcon}>✦</span>
                    <span>What are you in the mood for tonight?</span>
                  </div>
                  <span className={styles.sparkleTag}>Natural Language Vibe Query</span>
                </div>

                <div className={styles.promptTextareaWrapper}>
                  <textarea
                    className={styles.promptTextarea}
                    rows="3"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onFocus={() => setIsPromptFocused(true)}
                    onBlur={() => setIsPromptFocused(false)}
                    placeholder="Describe your mood, pacing, soundtrack preferences, runtime limit, or specific feelings..."
                  />
                </div>

                {/* Preset Chips */}
                <div className={styles.presetsSection}>
                  <div className={styles.presetsTitle}>
                    <span>Try asking Gemini:</span>
                  </div>
                  <div className={styles.presetsList}>
                    {PRESET_PROMPTS.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`${styles.presetChip} ${
                          promptInput === preset.prompt ? styles.activePresetChip : ''
                        }`}
                        onClick={() => {
                          setPromptInput(preset.prompt)
                          handleGenerate(preset.prompt)
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Row */}
                <div className={styles.promptActionRow}>
                  <div className={styles.helperNote}>
                    <span>⚡ Analyzes tone, runtime constraints & acoustic energy in real-time</span>
                  </div>

                  <button
                    type="button"
                    className={styles.generateBtn}
                    onClick={() => handleGenerate()}
                    disabled={isLoading || !promptInput.trim()}
                  >
                    <SparklesIcon />
                    <span>{isLoading ? 'Gemini is Thinking...' : 'Generate Recommendations'}</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className={styles.analysisBanner} style={{ borderColor: '#ef4444' }}>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>Notice:</span>
                  <p className={styles.analysisText}>{errorMsg}</p>
                </div>
              )}

              {/* Loading State Animation */}
              {isLoading && (
                <div className={styles.loadingBox}>
                  <div className={styles.aiRadarPulse}>
                    <SparklesIcon />
                  </div>
                  <h3 className={styles.loadingTitle}>Querying Gemini 1.5 Flash...</h3>
                  <p className={styles.loadingSub}>
                    Synthesizing emotional tone, matching soundtrack scores, and cross-referencing TMDB catalogs.
                  </p>
                </div>
              )}

              {/* Results Section */}
              {!isLoading && vibeResult && (
                <section className={styles.resultsContainer} aria-label="AI Recommendations">
                  {/* Diagnosis & Intent Analysis */}
                  <div className={styles.analysisBanner}>
                    <div className={styles.analysisHeader}>
                      <SparklesIcon />
                      <span>Gemini's Psychological Vibe Analysis</span>
                    </div>

                    <p className={styles.analysisText}>{vibeResult.analysis}</p>

                    <div className={styles.keywordsRow}>
                      {(vibeResult.vibeKeywords || []).map((keyword, i) => (
                        <span key={i} className={styles.keywordPill}>
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation Cards */}
                  <div className={styles.cardsGrid}>
                    {(vibeResult.recommendations || []).map((film) => {
                      const inWatch = isInWatchlist(film.id)
                      const isWat = isWatched(film.id)

                      return (
                        <article key={film.id} className={styles.filmCard}>
                          {/* Poster / Backdrop */}
                          <div className={styles.cardPosterWrap}>
                            <img
                              src={film.image}
                              alt={film.title}
                              className={styles.cardPoster}
                              loading="lazy"
                            />
                            <div className={styles.cardPosterOverlay} />

                            {film.matchScore && (
                              <div className={styles.matchScoreBadge}>
                                {film.matchScore}% Match
                              </div>
                            )}

                            {film.vibeFit && (
                              <div className={styles.vibeFitTag}>
                                {film.vibeFit}
                              </div>
                            )}
                          </div>

                          {/* Body */}
                          <div className={styles.cardBody}>
                            <div className={styles.cardTitleRow}>
                              <h3 className={styles.cardTitle}>{film.title}</h3>
                              {film.year && <span className={styles.cardYear}>{film.year}</span>}
                            </div>

                            <div className={styles.cardMetaRow}>
                              {film.rating && (
                                <span className={styles.ratingTag}>
                                  <StarIcon /> {film.rating}
                                </span>
                              )}
                              {film.runtime && (
                                <span className={styles.runtimeTag}>{film.runtime}</span>
                              )}
                              {film.genres && (
                                <span className={styles.genreTag}>
                                  {film.genres.slice(0, 2).join(' • ')}
                                </span>
                              )}
                            </div>

                            {/* Custom AI Reasoning Tag: "Why you'll love it" */}
                            <div className={styles.reasoningCallout}>
                              <div className={styles.reasoningHeader}>
                                <span>✦</span>
                                <span>Why You'll Love It:</span>
                              </div>
                              <p className={styles.reasoningText}>
                                {film.whyYoullLoveIt}
                              </p>
                            </div>

                            {/* Soundtrack Highlight */}
                            {film.soundtrackHighlight && (
                              <div className={styles.soundtrackHighlight}>
                                <MusicIcon />
                                <span>
                                  <strong>Soundtrack:</strong> {film.soundtrackHighlight}
                                </span>
                              </div>
                            )}

                            {/* Card Actions */}
                            <div className={styles.cardActions}>
                              <Link
                                to={
                                  film.isTmdb || film.id?.startsWith('tmdb-')
                                    ? `/movie/${film.id}`
                                    : `/home`
                                }
                                className={styles.detailsBtn}
                              >
                                View Details
                              </Link>

                              <button
                                type="button"
                                className={`${styles.cardIconBtn} ${
                                  inWatch ? styles.cardIconBtnActive : ''
                                }`}
                                onClick={() => handleWatchlistCardToggle(film)}
                                title={inWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}
                              >
                                <BookmarkIcon filled={inWatch} />
                              </button>

                              <button
                                type="button"
                                className={`${styles.cardIconBtn} ${
                                  isWat ? styles.cardIconBtnActive : ''
                                }`}
                                onClick={() => handleWatchedCardToggle(film)}
                                title={isWat ? 'Remove from Watched' : 'Mark as Watched'}
                              >
                                <EyeIcon filled={isWat} />
                              </button>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>
          ) : (
            /* ── AI Cinema Duel & Comparison Tab ── */
            <div className={styles.compareBox}>
              <div className={styles.promptHeader}>
                <div className={styles.promptLabel}>
                  <span>⚔️ Head-to-Head AI Cinema Duel</span>
                </div>
                <span className={styles.sparkleTag}>Deep Comparison Engine</span>
              </div>

              <p className={styles.subtitle} style={{ textAlign: 'left', marginBottom: '24px' }}>
                Enter any two movies. Gemini will compare their tone, acoustic soundscapes, pacing, and give a recommendation verdict on which one fits your evening.
              </p>

              <div className={styles.compareInputsRow}>
                <div className={styles.compareInputWrap}>
                  <input
                    type="text"
                    className={styles.compareInput}
                    value={compareMovie1}
                    onChange={(e) => setCompareMovie1(e.target.value)}
                    placeholder="First movie (e.g. Dune)"
                  />
                </div>

                <div className={styles.vsBadge}>VS</div>

                <div className={styles.compareInputWrap}>
                  <input
                    type="text"
                    className={styles.compareInput}
                    value={compareMovie2}
                    onChange={(e) => setCompareMovie2(e.target.value)}
                    placeholder="Second movie (e.g. Interstellar)"
                  />
                </div>
              </div>

              <div className={styles.compareSubmitRow}>
                <button
                  type="button"
                  className={styles.generateBtn}
                  onClick={handleRunCompare}
                  disabled={isComparing}
                >
                  <SparklesIcon />
                  <span>{isComparing ? 'Analyzing Duel...' : 'Compare with Gemini'}</span>
                </button>
              </div>

              {compareResult && (
                <div className={styles.comparisonGrid}>
                  <div className={styles.analysisBanner}>
                    <div className={styles.analysisHeader}>
                      <span>AI Verdict</span>
                    </div>
                    <p className={styles.analysisText}>{compareResult.summary}</p>
                  </div>

                  {(compareResult.categories || []).map((cat, idx) => (
                    <div key={idx} className={styles.comparisonCard}>
                      <div className={styles.comparisonCategoryName}>
                        {cat.name} {cat.winner && `— (Edge: ${cat.winner})`}
                      </div>
                      <div className={styles.comparisonColumns}>
                        <div className={styles.comparisonCol}>
                          <strong>{compareMovie1}:</strong> {cat.movie1}
                        </div>
                        <div className={styles.comparisonCol}>
                          <strong>{compareMovie2}:</strong> {cat.movie2}
                        </div>
                      </div>
                    </div>
                  ))}

                  {compareResult.recommendationVerdict && (
                    <div className={styles.reasoningCallout} style={{ marginTop: '12px' }}>
                      <div className={styles.reasoningHeader}>
                        <span>✦</span>
                        <span>Which should you watch tonight?</span>
                      </div>
                      <p className={styles.reasoningText}>
                        • <strong>{compareMovie1}:</strong>{' '}
                        {compareResult.recommendationVerdict.chooseIf?.movie1}
                      </p>
                      <p className={styles.reasoningText}>
                        • <strong>{compareMovie2}:</strong>{' '}
                        {compareResult.recommendationVerdict.chooseIf?.movie2}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── API Key Configuration Modal ── */}
        {isKeyModalOpen && (
          <div className={styles.modalBackdrop} onClick={() => setIsKeyModalOpen(false)}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  <KeyIcon />
                  <span>Google Gemini API Configuration</span>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setIsKeyModalOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>

              <p className={styles.modalDesc}>
                MovieVerse connects directly to Google Gemini 1.5 Flash for live inference.
                You can obtain a 100% free API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#a855f7', textDecoration: 'underline' }}
                >
                  Google AI Studio
                </a>
                .
              </p>

              <input
                type="password"
                className={styles.keyInput}
                placeholder="AIzaSy..."
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
              />

              <div className={styles.modalActions}>
                {hasCustomKey && (
                  <button type="button" className={styles.modalClearBtn} onClick={handleClearKey}>
                    Remove Key
                  </button>
                )}
                <button type="button" className={styles.modalSaveBtn} onClick={handleSaveKey}>
                  Save & Apply Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
