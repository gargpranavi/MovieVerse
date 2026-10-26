/*
MovieVerse – ProfileCard.jsx
Member 2 | Day 5 — Profile Card Component

Props:
  user        — { username, email, avatar, joined }
  watchedCount  — number
  watchlistCount — number
  reviewCount   — number
  avgRating     — number | null
*/

import styles from './ProfileCard.module.css'

/*Star icon*/
function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4A017" stroke="#D4A017" strokeWidth="0.5" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

/*Camera / avatar fallback icon*/
function UserAvatarIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(212,160,23,0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

/*Single stat item*/
function StatItem({ icon, label, value, highlight }) {
  return (
    <div className={`${styles.statItem} ${highlight ? styles.statHighlight : ''}`}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

/*ProfileCard Component*/
export default function ProfileCard({
  user,
  watchedCount   = 0,
  watchlistCount = 0,
  reviewCount    = 0,
  avgRating      = null,
}) {
  /* Format joined date */
  const joinedDate = user?.joined
    ? new Date(user.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Unknown'

  return (
    <div className={styles.card} role="region" aria-label="User Profile Card">

      {/* Animated background glow */}
      <div className={styles.glowRing} aria-hidden="true" />

      {/* Avatar */}
      <div className={styles.avatarWrapper}>
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={`${user?.username ?? 'User'}'s avatar`}
            className={styles.avatarImg}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        <div className={styles.avatarFallback} style={{ display: user?.avatar ? 'none' : 'flex' }}>
          <UserAvatarIcon />
        </div>
        <div className={styles.avatarBadge} aria-label="Active user">
          <span className={styles.badgeDot} />
        </div>
      </div>

      {/* User info */}
      <div className={styles.userInfo}>
        <h2 className={styles.username}>{user?.username ?? 'Piyush'}</h2>
        <p className={styles.role}>Movie Explorer</p>
        {user?.email && (
          <p className={styles.email}>{user.email}</p>
        )}
        <p className={styles.joined}>Member since {joinedDate}</p>
      </div>

      {/* Divider */}
      <div className={styles.divider} aria-hidden="true" />

      {/* Stats grid */}
      <div className={styles.statsGrid} role="list" aria-label="Profile statistics">

        <div role="listitem">
          <StatItem
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            }
            label="Movies Watched"
            value={watchedCount}
          />
        </div>

        <div role="listitem">
          <StatItem
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            }
            label="Watchlist"
            value={watchlistCount}
          />
        </div>

        <div role="listitem">
          <StatItem
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            }
            label="Reviews"
            value={reviewCount}
          />
        </div>

        <div role="listitem">
          <StatItem
            icon={<StarIcon />}
            label="Avg Rating"
            value={avgRating !== null ? `${avgRating} ⭐` : '—'}
            highlight
          />
        </div>

      </div>
    </div>
  )
}
