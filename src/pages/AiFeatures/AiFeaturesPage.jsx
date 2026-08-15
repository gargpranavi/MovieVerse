import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import styles from './AiFeaturesPage.module.css'

const VIBES = ['Mind-bending', 'Feel-good', 'Dark & Gritty', 'Action-packed', 'Romantic', 'Scary', 'Inspiring']
const RUNTIMES = ['Any', 'Under 1.5 hours', 'Under 2 hours', 'Under 2.5 hours', 'Epic (3+ hours)']
const RATINGS = ['Any', 'Highly Rated (8+)', 'Masterpiece (9+)']

const QUIZ_QUESTIONS = [
  {
    question: "How was your day today?",
    options: ["Stressful, I need an escape", "Amazing, keep the good vibes going", "Boring, give me some action", "Long, I just want to relax"]
  },
  {
    question: "What kind of pacing are you looking for?",
    options: ["Slow burn and thoughtful", "Fast and explosive", "Steady and engaging"]
  },
  {
    question: "Pick a setting...",
    options: ["Deep space", "A bustling city", "A quiet cabin in the woods", "A magical fantasy realm"]
  }
]

function MoodMatch() {
  const [activeVibes, setActiveVibes] = useState(['Mind-bending'])
  const [activeRuntime, setActiveRuntime] = useState('Under 2.5 hours')
  const [activeRating, setActiveRating] = useState('Highly Rated (8+)')
  
  // Quiz state
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const toggleVibe = (vibe) => {
    setActiveVibes(prev => 
      prev.includes(vibe) 
        ? prev.filter(v => v !== vibe)
        : [...prev, vibe]
    )
  }

  const handleQuizAnswer = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // Finish quiz - mock setting vibes based on answers
      setActiveVibes(['Dark & Gritty', 'Action-packed'])
      setIsQuizMode(false)
      setCurrentQuestion(0)
    }
  }

  if (isQuizMode) {
    const q = QUIZ_QUESTIONS[currentQuestion]
    return (
      <div className={styles.moodMatchContainer}>
        <div className={styles.quizCard}>
          <div className={styles.quizQuestion}>{q.question}</div>
          <div className={styles.quizOptions}>
            {q.options.map((opt, idx) => (
              <button 
                key={idx} 
                className={styles.quizOptionBtn}
                onClick={handleQuizAnswer}
              >
                {opt}
              </button>
            ))}
          </div>
          <p style={{ color: '#666', fontSize: '14px' }}>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.moodMatchContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className={styles.sectionTitle} style={{ margin: 0 }}>What's your vibe today?</div>
        <button className={styles.secondaryBtn} onClick={() => setIsQuizMode(true)}>
          Not sure? Take the AI Mood Quiz 🔮
        </button>
      </div>
      
      <div className={styles.pillGroup}>
        {VIBES.map(vibe => (
          <button 
            key={vibe}
            className={`${styles.pill} ${activeVibes.includes(vibe) ? styles.activePill : ''}`}
            onClick={() => toggleVibe(vibe)}
          >
            {vibe}
          </button>
        ))}
      </div>

      <div className={styles.selectors}>
        <div style={{ flex: 1 }}>
          <div className={styles.sectionTitle}>Runtime Limit</div>
          <select 
            className={styles.selectBox} 
            value={activeRuntime} 
            onChange={(e) => setActiveRuntime(e.target.value)}
          >
            {RUNTIMES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div className={styles.sectionTitle}>Minimum Rating</div>
          <select 
            className={styles.selectBox} 
            value={activeRating} 
            onChange={(e) => setActiveRating(e.target.value)}
          >
            {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <button className={styles.actionBtn}>
        Find My MoodMatch
      </button>

      {/* Mock Results Area */}
      <div style={{ marginTop: '40px', textAlign: 'center', color: '#a3a3a3' }}>
        <p>AI Recommendations will appear here...</p>
      </div>
    </div>
  )
}

function Compare() {
  const [isComparing, setIsComparing] = useState(false)

  return (
    <div className={styles.compareContainer}>
      <div className={styles.sectionTitle} style={{ textAlign: 'center', fontSize: '28px', marginBottom: '40px' }}>
        Which movies do you want to compare?
      </div>

      <div className={styles.compareInputs}>
        <div className={styles.compareInputCol}>
          <input type="text" className={styles.selectBox} placeholder="Enter Movie 1 (e.g. Dune)" />
        </div>
        <div className={styles.vsBadge}>VS</div>
        <div className={styles.compareInputCol}>
          <input type="text" className={styles.selectBox} placeholder="Enter Movie 2 (e.g. Interstellar)" />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <button 
          className={styles.actionBtn} 
          style={{ maxWidth: '300px' }}
          onClick={() => setIsComparing(true)}
        >
          Compare with AI
        </button>
      </div>

      {isComparing && (
        <div className={styles.comparisonTable}>
          {/* Mock Data for Dune vs Interstellar */}
          <div className={styles.tableRow} style={{ padding: '20px 0', borderBottom: '1px solid rgba(212, 160, 23, 0.3)' }}>
            <div className={styles.tableHeader}></div>
            <div className={styles.tableCell}>
              <img src="https://static.tvmaze.com/uploads/images/medium_portrait/347/869502.jpg" alt="Movie 1" className={styles.moviePoster} />
              <div className={styles.movieTitle}>Dune: Part One</div>
            </div>
            <div className={styles.tableCell}>
              <img src="https://static.tvmaze.com/uploads/images/medium_portrait/408/1022051.jpg" alt="Movie 2" className={styles.moviePoster} />
              <div className={styles.movieTitle}>Interstellar</div>
            </div>
          </div>

          <div className={styles.tableRow}>
            <div className={styles.tableHeader}>Rating</div>
            <div className={styles.tableCell}>⭐ 8.0/10</div>
            <div className={styles.tableCell}>⭐ 8.6/10</div>
          </div>
          <div className={styles.tableRow}>
            <div className={styles.tableHeader}>Runtime</div>
            <div className={styles.tableCell}>2h 35m</div>
            <div className={styles.tableCell}>2h 49m</div>
          </div>
          <div className={styles.tableRow}>
            <div className={styles.tableHeader}>Genre</div>
            <div className={styles.tableCell}>Sci-Fi, Adventure</div>
            <div className={styles.tableCell}>Sci-Fi, Drama</div>
          </div>
          <div className={styles.tableRow}>
            <div className={styles.tableHeader}>Release Year</div>
            <div className={styles.tableCell}>2021</div>
            <div className={styles.tableCell}>2014</div>
          </div>
          <div className={styles.tableRow}>
            <div className={styles.tableHeader}>Director</div>
            <div className={styles.tableCell}>Denis Villeneuve</div>
            <div className={styles.tableCell}>Christopher Nolan</div>
          </div>
          <div className={styles.tableRow}>
            <div className={styles.tableHeader}>Cast</div>
            <div className={styles.tableCell} style={{ fontSize: '14px', color: '#a3a3a3' }}>Timothée Chalamet, Rebecca Ferguson, Oscar Isaac</div>
            <div className={styles.tableCell} style={{ fontSize: '14px', color: '#a3a3a3' }}>Matthew McConaughey, Anne Hathaway, Jessica Chastain</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AiFeaturesPage() {
  const [activeTab, setActiveTab] = useState('mood') // 'mood' | 'compare'

  return (
    <DashboardLayout>
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>MovieVerse Smart Tools</h1>
          <p className={styles.subtitle}>Powered by AI. Discover exactly what you want to watch.</p>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'mood' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('mood')}
          >
            🧠 MoodMatch
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'compare' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            ⚔️ Compare Movies
          </button>
        </div>

        {activeTab === 'mood' ? <MoodMatch /> : <Compare />}
      </div>
    </DashboardLayout>
  )
}
