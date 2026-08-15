import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './TopNavbar.module.css'

const NAV_ITEMS = [
  { to: '/home', label: 'Home' },
  { to: '/tv-series', label: 'TV Series' },
  { to: '/movies', label: 'Movies' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/watched', label: 'Watched' },
]

function FilmReelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true" style={{ width: '36px', height: '36px' }}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="6"  cy="6"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="6"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="6"  cy="18" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="3"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="21" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function TopNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.left}>
        <div className={styles.brand} aria-label="MovieVerse Home">
          <FilmReelIcon />
          <span className={styles.brandName}>MOVIEVERSE</span>
        </div>
        
        <div className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <NavLink 
              key={item.label}
              to={item.to} 
              className={({ isActive }) => 
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Search">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        
        <button className={styles.iconBtn} aria-label="Grid View">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>

        {/* AI Features Robot Icon */}
        <NavLink to="/ai-features" className={({ isActive }) => isActive ? `${styles.iconBtn} ${styles.activeIcon}` : styles.iconBtn} aria-label="AI Features">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"></rect>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v4"></path>
            <line x1="8" y1="16" x2="8" y2="16"></line>
            <line x1="16" y1="16" x2="16" y2="16"></line>
          </svg>
        </NavLink>

        <button className={styles.iconBtn} aria-label="Notifications" style={{ position: 'relative' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className={styles.notificationBadge}></span>
        </button>

        <div className={styles.profileBtn}>
          <img 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80" 
            alt="Profile Avatar" 
            className={styles.avatar} 
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </nav>
  )
}
