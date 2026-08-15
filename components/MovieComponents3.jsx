// Reusable React Components for MovieVerse Member 3 Pages
// Babel standalone — JSX compiled in-browser

/* ── MOVIE CARD ───────────────────────────────── */
const MovieCard3 = ({ movie, rank, onSelect }) => {
    return (
        <div className="movie-card" onClick={() => onSelect && onSelect(movie)}>
            <div className="card-poster-wrapper">
                <img src={movie.poster} alt={movie.title} loading="lazy" className="card-poster" />
                {rank && <div className="card-rank">{rank}</div>}
                <div className="card-overlay">
                    <button className="view-details-btn">View Details</button>
                </div>
            </div>
            <div className="card-info">
                <h3 className="card-title" title={movie.title}>{movie.title}</h3>
                <div className="card-meta">
                    <span>{movie.year}</span>
                    <span className="card-rating"><span className="star-icon">★</span>{movie.rating}</span>
                </div>
                <div className="card-genres">{(movie.genre || []).slice(0, 2).join(' · ')}</div>
            </div>
        </div>
    );
};

/* ── HERO ─────────────────────────────────────── */
const HeroMovie3 = ({ movie, badgeText }) => {
    if (!movie) return null;
    return (
        <section className="hero-container">
            <div className="hero-backdrop-wrapper">
                <img src={movie.backdrop || movie.poster} alt={movie.title} className="hero-backdrop" />
                <div className="hero-gradient-overlay"></div>
            </div>
            <div className="hero-content">
                {badgeText && <span className="hero-badge">{badgeText}</span>}
                <h1 className="hero-title">{movie.title}</h1>
                <div className="hero-meta">
                    <span>{movie.year}</span>
                    <span className="meta-dot">•</span>
                    <span>{(Array.isArray(movie.genre) ? movie.genre : [movie.genre]).join(', ')}</span>
                    <span className="meta-dot">•</span>
                    <span>{movie.runtime}</span>
                    <span className="meta-dot">•</span>
                    <span className="hero-rating"><span className="star-icon">★</span>{movie.rating}</span>
                </div>
                <p className="hero-description">{movie.description}</p>
                <div className="hero-actions">
                    <button className="btn btn-primary">
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        Watch Now
                    </button>
                    <button className="btn btn-secondary">
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                        Watchlist
                    </button>
                </div>
            </div>
        </section>
    );
};

/* ── SECTION TITLE ────────────────────────────── */
const SectionTitle3 = ({ title, showViewAll = true, onViewAll }) => (
    <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {showViewAll && (
            <button className="view-all-btn" onClick={onViewAll}>
                View All <span className="arrow">›</span>
            </button>
        )}
    </div>
);

/* ── CATEGORY TABS ────────────────────────────── */
const CategoryTabs3 = ({ categories, activeCategory, onChange, label }) => (
    <div className="category-tabs-container">
        {label && <div className="tabs-label">{label}</div>}
        <div className="category-tabs">
            {categories.map(cat => (
                <button
                    key={cat}
                    className={`tab-item${activeCategory === cat ? ' active' : ''}`}
                    onClick={() => onChange(cat)}
                >{cat}</button>
            ))}
        </div>
    </div>
);

/* ── MOVIE SECTION ────────────────────────────── */
const MovieSection3 = ({ title, movies, onSelectMovie, showViewAll = true, showRanks = false }) => (
    <section className="movie-section">
        <SectionTitle3 title={title} showViewAll={showViewAll} />
        <div className="movie-grid">
            {movies.map((movie, idx) => (
                <MovieCard3
                    key={movie.id}
                    movie={movie}
                    rank={showRanks ? idx + 1 : null}
                    onSelect={onSelectMovie}
                />
            ))}
        </div>
    </section>
);

/* ── PAGE HEADER ──────────────────────────────── */
const PageHeader3 = ({ title, subtitle }) => (
    <div className="page-header">
        <div>
            <div className="page-header-subtitle">{subtitle}</div>
            <h1 className="page-header-title">{title}</h1>
        </div>
        <div className="page-header-divider"></div>
    </div>
);

/* ── STATS STRIP (slim pill version) ────────────── */
const StatsBar3 = ({ stats }) => (
    <div className="stats-strip">
        {stats.map((s, i) => (
            <React.Fragment key={i}>
                <div className="strip-stat">
                    <span className="strip-value">{s.value}</span>
                    <span className="strip-label">{s.label}</span>
                </div>
                {i < stats.length - 1 && <span className="strip-divider">|</span>}
            </React.Fragment>
        ))}
    </div>
);

/* ── GOLD DIVIDER ─────────────────────────────── */
const GoldDivider3 = () => <div className="gold-divider"></div>;

/* ── DETAILS MODAL ────────────────────────────── */
const MovieDetailsModal3 = ({ movie, onClose }) => {
    if (!movie) return null;
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>✕</button>
                <div className="modal-body">
                    <div className="modal-poster-col">
                        <img src={movie.poster} alt={movie.title} className="modal-poster" />
                    </div>
                    <div className="modal-details-col">
                        <h2 className="modal-title">{movie.title}</h2>
                        <div className="modal-meta">
                            <span className="modal-badge">{movie.year}</span>
                            <span className="modal-badge gold-badge">★ {movie.rating}</span>
                            <span className="modal-meta-item">{movie.runtime}</span>
                            <span className="modal-meta-item">{movie.language}</span>
                        </div>
                        <div className="modal-genres">
                            {(movie.genre || []).map((g, i) => <span key={i} className="genre-pill">{g}</span>)}
                        </div>
                        <p className="modal-description">{movie.description}</p>
                        <div className="modal-actions">
                            <button className="btn btn-primary">
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                Watch Now
                            </button>
                            <button className="btn btn-secondary">+ Watchlist</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Expose to window
Object.assign(window, {
    MovieCard3, HeroMovie3, SectionTitle3, CategoryTabs3,
    MovieSection3, MovieDetailsModal3, PageHeader3, StatsBar3, GoldDivider3
});
