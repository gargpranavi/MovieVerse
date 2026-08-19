// ═══════════════════════════════════════════════════════════
//  MovieVerse – Member 3  |  Shared React Components
//  Pixel-matched to teammate's Screenshot 2
// ═══════════════════════════════════════════════════════════

// ─── PosterCard3 ─────────────────────────────────────────
// Pure portrait-poster card — no visible text at rest,
// info + "View Details" only on hover (matches Screenshot 2).
// Props: movie, rank, isFeatured, onSelect
const PosterCard3 = ({ movie, rank, isFeatured, onSelect }) => (
    <div
        className={`poster-card${isFeatured ? ' featured' : ''}`}
        onClick={() => onSelect(movie)}
        title={movie.title}
    >
        {rank && <span className="poster-rank">#{rank}</span>}

        <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
        />

        {/* Hover overlay — hidden at rest via CSS opacity:0 */}
        <div className="poster-card-overlay">
            <div className="poster-card-title">{movie.title}</div>
            <div className="poster-card-meta">
                <span>{movie.year}</span>
                <span>•</span>
                <span className="poster-card-rating">★ {movie.rating}</span>
            </div>
        </div>
    </div>
);

// ─── CarouselSection3 ────────────────────────────────────
// Horizontal scroll row of PosterCard3 cards.
// Props:
//   title        – section heading text
//   movies       – array
//   onSelectMovie – callback(movie)
//   showRanks    – bool, shows #1 #2 … gold badges
//   featuredId   – id of the highlighted card (gold border)
const CarouselSection3 = ({ title, movies, onSelectMovie, showRanks, featuredId }) => {
    const trackRef = React.useRef(null);

    const scrollNext = () => {
        if (trackRef.current) {
            // Scroll by ~5 card widths each click
            const card = trackRef.current.querySelector('.poster-card');
            const scrollAmount = card
                ? (card.offsetWidth + 12) * 5
                : 1000;
            trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!movies || movies.length === 0) return null;

    return (
        <section className="carousel-section">
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
            </div>
            <div className="carousel-track-wrapper">
                <div className="carousel-track" ref={trackRef}>
                    {movies.map((movie, index) => (
                        <PosterCard3
                            key={movie.id}
                            movie={movie}
                            rank={showRanks ? index + 1 : null}
                            isFeatured={featuredId === movie.id}
                            onSelect={onSelectMovie}
                        />
                    ))}
                </div>
                <button
                    className="carousel-next-btn"
                    onClick={scrollNext}
                    aria-label="Scroll right"
                >›</button>
            </div>
        </section>
    );
};

// ─── HeroSection3 ────────────────────────────────────────
// Full-width cinematic hero section.
// Layout: image fills width/height, dark left gradient,
// content anchored bottom-left (matching Screenshot 2).
// Props: movie, genreLabel, typeLabel
const HeroSection3 = ({ movie, genreLabel, typeLabel }) => {
    if (!movie) return null;
    return (
        <section className="hero-section">
            <img
                className="hero-backdrop"
                src={movie.backdrop || movie.poster}
                alt={movie.title}
            />
            <div className="hero-overlay" />
            <div className="hero-content">
                {/* ALL-CAPS title — 60px bold, white */}
                <h1 className="hero-title">{movie.title}</h1>

                {/* "Genre • Type • Year" meta line */}
                <div className="hero-meta">
                    {genreLabel && <span>{genreLabel}</span>}
                    {typeLabel  && (
                        <><span className="hero-meta-dot">•</span><span>{typeLabel}</span></>
                    )}
                    {movie.year && (
                        <><span className="hero-meta-dot">•</span><span>{movie.year}</span></>
                    )}
                </div>

                {/* Description — 2 lines max */}
                {movie.description && (
                    <p className="hero-description">{movie.description}</p>
                )}
            </div>
        </section>
    );
};

// ─── GoldDivider3 ────────────────────────────────────────
const GoldDivider3 = () => <div className="gold-divider" />;

// ─── MovieDetailsModal3 ──────────────────────────────────
// Full-screen modal shown when a card is clicked.
// Props: movie, onClose
const MovieDetailsModal3 = ({ movie, onClose }) => {
    if (!movie) return null;

    React.useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
                <div className="modal-body">
                    <img className="modal-poster" src={movie.poster} alt={movie.title} />
                    <div className="modal-info">
                        <h2 className="modal-title">{movie.title}</h2>
                        <div className="modal-badges">
                            <span className="modal-badge">{movie.year}</span>
                            <span className="modal-badge gold">★ {movie.rating}</span>
                            {movie.runtime  && <span className="modal-badge">{movie.runtime}</span>}
                            {movie.language && <span className="modal-badge">{movie.language}</span>}
                        </div>
                        <div className="modal-genres">
                            {movie.genre.map((g, i) => (
                                <span key={i} className="genre-pill">{g}</span>
                            ))}
                        </div>
                        <p className="modal-description">{movie.description}</p>
                        <div className="modal-actions">
                            <button className="btn btn-primary">
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
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

// ─── Expose to global scope (CDN React, no build step) ───
window.PosterCard3        = PosterCard3;
window.CarouselSection3   = CarouselSection3;
window.HeroSection3       = HeroSection3;
window.GoldDivider3       = GoldDivider3;
window.MovieDetailsModal3 = MovieDetailsModal3;

// Legacy aliases
window.MovieCard3       = PosterCard3;
window.HeroMovie3       = HeroSection3;
window.MovieSection3    = CarouselSection3;
