const MovieCard3 = ({ movie, rank, onSelect }) => {
    return (
        <div className="movie-card" onClick={() => onSelect(movie)}>
            <div className="card-poster-wrapper">
                <img src={movie.poster} alt={movie.title} loading="lazy" className="card-poster" />
                {rank && <div className="card-rank">{rank}</div>}
                <div className="card-overlay">
                    <button className="view-details-btn">View Details</button>
                </div>
            </div>
            <div className="card-info">
                <h3 className="card-title">{movie.title}</h3>
                <div className="card-meta">
                    <span>{movie.year}</span>
                    <span className="card-rating"><span className="star-icon">★</span>{movie.rating}</span>
                </div>
                <div className="card-genres">{movie.genre.slice(0, 2).join(' · ')}</div>
            </div>
        </div>
    );
};

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
                    <span>{movie.genre.join(', ')}</span>
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

const SectionTitle3 = ({ title, showViewAll }) => (
    <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {showViewAll && (
            <button className="view-all-btn">View All <span className="arrow">›</span></button>
        )}
    </div>
);

const CategoryTabs3 = ({ categories, activeCategory, onChange, label }) => (
    <div className="category-tabs-container">
        {label && <div className="tabs-label">{label}</div>}
        <div className="category-tabs">
            {categories.map(cat => (
                <button
                    key={cat}
                    className={activeCategory === cat ? 'tab-item active' : 'tab-item'}
                    onClick={() => onChange(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    </div>
);

const MovieSection3 = ({ title, movies, onSelectMovie, showViewAll, showRanks }) => (
    <section className="movie-section">
        <SectionTitle3 title={title} showViewAll={showViewAll} />
        <div className="movie-grid">
            {movies.map((movie, index) => (
                <MovieCard3
                    key={movie.id}
                    movie={movie}
                    rank={showRanks ? index + 1 : null}
                    onSelect={onSelectMovie}
                />
            ))}
        </div>
    </section>
);

const PageHeader3 = ({ title, subtitle }) => (
    <div className="page-header">
        <div>
            <div className="page-header-subtitle">{subtitle}</div>
            <h1 className="page-header-title">{title}</h1>
        </div>
        <div className="page-header-divider"></div>
    </div>
);

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

const GoldDivider3 = () => <div className="gold-divider"></div>;

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
                            {movie.genre.map((g, i) => <span key={i} className="genre-pill">{g}</span>)}
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

window.MovieCard3       = MovieCard3;
window.HeroMovie3       = HeroMovie3;
window.SectionTitle3    = SectionTitle3;
window.CategoryTabs3    = CategoryTabs3;
window.MovieSection3    = MovieSection3;
window.MovieDetailsModal3 = MovieDetailsModal3;
window.PageHeader3      = PageHeader3;
window.StatsBar3        = StatsBar3;
window.GoldDivider3     = GoldDivider3;
