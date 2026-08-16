import { useState, useEffect, useRef } from 'react'
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  
  const inputRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const delayDebounce = setTimeout(() => {
      fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          const mapped = data.map(item => ({
            id: item.show.id.toString(),
            title: item.show.name,
            year: item.show.premiered ? item.show.premiered.substring(0, 4) : '2023',
            rating: item.show.rating?.average || null,
            image: item.show.image ? item.show.image.medium : null
          }))
          setSearchResults(mapped)
          setIsSearching(false)
        })
        .catch(err => {
          console.error(err)
          setIsSearching(false)
        })
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (e) => {
      // If the clicked target is no longer in the DOM, ignore it (prevents closures on re-renders)
      if (!document.body.contains(e.target)) return

      // Find the parent element with searchContainer class
      if (!e.target.closest(`.${styles.searchContainer}`)) {
        setSearchResults([])
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
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
        <div className={styles.searchContainer}>
          <input
            ref={inputRef}
            type="text"
            className={`${styles.searchInput} ${searchOpen ? styles.searchInputActive : ''}`}
            placeholder="Search movies & shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button 
            className={styles.iconBtn} 
            onClick={() => setSearchOpen(!searchOpen)} 
            aria-label="Search"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          
          {searchOpen && searchQuery && (
            <div className={styles.searchResults}>
              {isSearching ? (
                <div className={styles.searchNoResults}>Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(show => (
                  <NavLink 
                    key={show.id} 
                    to={`/movie/${show.id}`} 
                    className={styles.searchResultItem}
                    onClick={() => {
                      setSearchResults([])
                      setSearchOpen(false)
                      setSearchQuery('')
                    }}
                  >
                    <img 
                      src={show.image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&q=80&auto=format&fit=crop'} 
                      alt={show.title} 
                      className={styles.searchResultImage} 
                    />
                    <div className={styles.searchResultInfo}>
                      <span className={styles.searchResultTitle}>{show.title}</span>
                      <span className={styles.searchResultMeta}>
                        {show.year} {show.rating ? `• ★ ${show.rating}` : ''}
                      </span>
                    </div>
                  </NavLink>
                ))
              ) : (
                <div className={styles.searchNoResults}>No results found</div>
              )}
            </div>
          )}
        </div>
        
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

