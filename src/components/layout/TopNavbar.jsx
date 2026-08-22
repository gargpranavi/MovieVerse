import { useState, useEffect, useRef } from 'react'
import { NavLink, Link } from 'react-router-dom'
import styles from './TopNavbar.module.css'

const NAV_ITEMS = [
  { to: '/home', label: 'Home', external: false },
  { to: '/pages/movies3.html', label: 'Movies', external: true },
  { to: '/pages/drama3.html', label: 'TV Series', external: true },
  { to: null, label: 'Anime', external: false, disabled: true },
  { to: '/watchlist', label: 'Watchlist', external: false },
  { to: '/watched', label: 'Watched', external: false },
]

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'release',
    title: "New Release!",
    message: "Sintel (Premium Cinematic Movie) is now available to stream in 4K.",
    time: "2 hours ago",
    unread: true
  },
  {
    id: 2,
    type: 'trending',
    title: "Trending in Your Region",
    message: "Sherlock Holmes is trending #1 — don't miss out!",
    time: "5 hours ago",
    unread: true
  },
  {
    id: 3,
    type: 'watchlist',
    title: "Watchlist Update",
    message: "\"The Dark Knight\" you saved has a new episode available.",
    time: "1 day ago",
    unread: true
  },
  {
    id: 4,
    type: 'recommendation',
    title: "Recommended For You",
    message: "Based on your watch history, you might enjoy \"Inception\".",
    time: "2 days ago",
    unread: false
  }
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
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  
  const inputRef = useRef(null)

  const unreadCount = notifications.filter(n => n.unread).length

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
      if (!document.body.contains(e.target)) return

      // Handle search outside click
      if (!e.target.closest(`.${styles.searchContainer}`)) {
        setSearchResults([])
        setSearchOpen(false)
        setSearchQuery('')
      }

      // Handle notifications outside click
      if (!e.target.closest(`.${styles.notificationsContainer}`)) {
        setIsNotificationsOpen(false)
      }

      // Handle profile dropdown outside click
      if (!e.target.closest(`.${styles.profileContainer}`)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleNotificationClick = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
  }

  const handleReadNotification = (e, id) => {
    e.stopPropagation()
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  const handleMarkAllRead = (e) => {
    e.stopPropagation()
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const handleClearNotifications = (e) => {
    e.stopPropagation()
    setNotifications([])
  }

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.left}>
        <div className={styles.brand} aria-label="MovieVerse Home">
          <FilmReelIcon />
          <span className={styles.brandName}>MOVIEVERSE</span>
        </div>
        
        <div className={styles.nav}>
          {NAV_ITEMS.map(item =>
            item.disabled ? (
              <span
                key={item.label}
                className={styles.navLink}
                style={{ opacity: 0.5, cursor: 'default', pointerEvents: 'none' }}
              >
                {item.label}
              </span>
            ) : item.external ? (
              <a
                key={item.label}
                href={item.to}
                className={styles.navLink}
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                {item.label}
              </NavLink>
            )
          )}
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
        
        <a href="/pages/kids3.html" className={styles.iconBtn} aria-label="Kids Area">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </a>

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

        <div className={styles.notificationsContainer}>
          <button 
            className={`${styles.iconBtn} ${isNotificationsOpen ? styles.activeIcon : ''}`} 
            aria-label="Notifications" 
            style={{ position: 'relative' }}
            onClick={handleNotificationClick}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className={styles.notificationsDropdown}>
              {/* Header */}
              <div className={styles.notificationsHeader}>
                <div className={styles.notificationsHeaderLeft}>
                  <span className={styles.dropdownTitle}>Notifications</span>
                  {unreadCount > 0 && (
                    <span className={styles.unreadPill}>{unreadCount} new</span>
                  )}
                </div>
                <div className={styles.notificationsHeaderActions}>
                  {unreadCount > 0 && (
                    <button className={styles.markAllBtn} onClick={handleMarkAllRead} title="Mark all as read">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button className={styles.clearBtn} onClick={handleClearNotifications} title="Clear all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className={styles.notificationsList}>
                {notifications.length > 0 ? (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      className={`${styles.notificationItem} ${item.unread ? styles.notificationUnread : ''}`}
                      onClick={(e) => handleReadNotification(e, item.id)}
                    >
                      {/* Type icon */}
                      <div className={`${styles.notifIcon} ${styles[`notifIcon_${item.type}`]}`}>
                        {item.type === 'release' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        )}
                        {item.type === 'trending' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                          </svg>
                        )}
                        {item.type === 'watchlist' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                          </svg>
                        )}
                        {item.type === 'recommendation' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className={styles.notificationContent}>
                        <div className={styles.notificationTopRow}>
                          <span className={styles.notificationItemTitle}>{item.title}</span>
                          {item.unread && <span className={styles.unreadDot}></span>}
                        </div>
                        <p className={styles.notificationMessage}>{item.message}</p>
                        <span className={styles.notificationTime}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyNotifications}>
                    <div className={styles.emptyIconWrapper}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                    </div>
                    <span className={styles.emptyTitle}>All caught up!</span>
                    <span className={styles.emptySubtitle}>No new notifications right now.</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className={styles.notificationsFooter}>
                  <span>Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Profile dropdown ─────────────────── */}
        <div className={styles.profileContainer}>
          <button
            className={`${styles.profileBtn} ${isProfileOpen ? styles.profileBtnActive : ''}`}
            onClick={() => setIsProfileOpen(v => !v)}
            aria-label="Profile menu"
            aria-expanded={isProfileOpen}
            id="navbar-profile-btn"
            type="button"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
              alt="Piyush's avatar"
              className={styles.avatar}
            />
            <span className={styles.profileName}>Piyush</span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className={`${styles.chevron} ${isProfileOpen ? styles.chevronUp : ''}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Profile dropdown panel */}
          {isProfileOpen && (
            <div className={styles.profileDropdown} role="menu" aria-label="Profile menu">

              {/* Header */}
              <div className={styles.profileDropdownHeader}>
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
                  alt="Piyush"
                  className={styles.profileDropdownAvatar}
                />
                <div className={styles.profileDropdownInfo}>
                  <span className={styles.profileDropdownName}>Piyush</span>
                  <span className={styles.profileDropdownRole}>Movie Explorer</span>
                  <span className={styles.profileDropdownEmail}>piyush@movieverse.com</span>
                </div>
              </div>

              <div className={styles.profileDropdownDivider} />

              {/* Menu items */}
              <nav className={styles.profileMenuList} role="none">
                <Link
                  to="/profile"
                  className={styles.profileMenuItem}
                  onClick={() => setIsProfileOpen(false)}
                  role="menuitem"
                  id="navbar-goto-profile"
                >
                  <span className={styles.profileMenuIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  My Profile
                </Link>

                <Link
                  to="/watchlist"
                  className={styles.profileMenuItem}
                  onClick={() => setIsProfileOpen(false)}
                  role="menuitem"
                  id="navbar-goto-watchlist"
                >
                  <span className={styles.profileMenuIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                  </span>
                  My Watchlist
                </Link>

                <Link
                  to="/watched"
                  className={styles.profileMenuItem}
                  onClick={() => setIsProfileOpen(false)}
                  role="menuitem"
                  id="navbar-goto-watched"
                >
                  <span className={styles.profileMenuIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </span>
                  Watched Movies
                </Link>
              </nav>

              <div className={styles.profileDropdownDivider} />

              {/* Footer */}
              <div className={styles.profileDropdownFooter}>
                <Link
                  to="/profile"
                  className={styles.viewProfileBtn}
                  onClick={() => setIsProfileOpen(false)}
                  id="navbar-view-full-profile"
                >
                  View Full Profile →
                </Link>
              </div>

            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

