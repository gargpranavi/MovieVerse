// ═══════════════════════════════════════════════════════════
//  MovieVerse – Shared Navbar for Static Pages
//  Works with CDN React + Babel — no build step, no CSS modules
//  Dimensions exactly match React TopNavbar (TopNavbar.module.css)
// ═══════════════════════════════════════════════════════════

const NAV_LINKS = [
    { label: 'Home',      href: '/home',             external: false },
    { label: 'Movies',    href: '/pages/movies3.html', external: true  },
    { label: 'TV Series', href: '/pages/drama3.html',  external: true  },
    { label: 'Anime',     href: null,                  disabled: true  },
    { label: 'Watchlist', href: '/watchlist',          external: false },
    { label: 'Watched',   href: '/watched',            external: false },
];

// Detect which page is currently active
function getActiveLabel() {
    const path = window.location.pathname;
    if (path.includes('movies3'))   return 'Movies';
    if (path.includes('drama3'))    return 'TV Series';
    if (path.includes('kids3'))     return 'Kids';
    if (path.endsWith('/home'))     return 'Home';
    if (path.includes('watchlist')) return 'Watchlist';
    if (path.includes('watched'))   return 'Watched';
    return '';
}

// ─── Inline Styles — matched exactly to TopNavbar.module.css ─
const S = {
    nav: {
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '30px',
        padding: '24px 4%',
        height: '90px',
        background: 'var(--bg-base, #0a0a0a)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        boxSizing: 'border-box',
        transition: 'padding 0.3s ease, background-color 0.3s ease, height 0.3s ease',
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
    },
    navScrolled: {
        padding: '16px 4%',
        height: '75px',
        backgroundColor: '#030304',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: '50px',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        cursor: 'pointer',
        color: '#D4A017',
    },
    brandName: {
        fontFamily: "'Outfit', 'Inter', sans-serif",
        fontSize: '28px',
        fontWeight: 800,
        letterSpacing: '2px',
        color: '#D4A017',
        userSelect: 'none',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
    },
    link: {
        fontFamily: "'Outfit', 'Inter', sans-serif",
        fontSize: '18px',
        fontWeight: 500,
        color: '#e5e5e5',
        textDecoration: 'none',
        transition: 'color 0.3s ease',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        padding: 0,
        display: 'inline-block',
    },
    linkHover: {
        color: '#F0C040',
    },
    linkActive: {
        color: '#ffffff',
        fontWeight: 700,
        borderBottom: '2px solid #D4A017',
        paddingBottom: '4px',
    },
    linkDisabled: {
        color: 'rgba(255,255,255,0.35)',
        cursor: 'default',
        pointerEvents: 'none',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        fontSize: '18px',
        fontWeight: 500,
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
    },
    iconBtn: {
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.75)',
        cursor: 'pointer',
        padding: '6px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s',
        position: 'relative',
    },
    notifBadge: {
        position: 'absolute',
        top: '2px', right: '2px',
        background: '#e53e3e',
        color: '#fff',
        fontSize: '9px',
        fontWeight: 700,
        borderRadius: '50%',
        width: '16px', height: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        lineHeight: 1,
    },
    profileBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 10px',
        borderRadius: '8px',
        color: '#fff',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        fontSize: '16px',
        fontWeight: 500,
        transition: 'background 0.2s',
    },
    avatar: {
        width: '36px', height: '36px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid rgba(212,160,23,0.6)',
    },
};

// ─── FilmReelIcon ─────────────────────────────────────────
function FilmReelIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#D4A017"
             strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
             style={{ width: '36px', height: '36px' }}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="6"  cy="6"  r="1.2" fill="#D4A017" stroke="none" />
            <circle cx="18" cy="6"  r="1.2" fill="#D4A017" stroke="none" />
            <circle cx="18" cy="18" r="1.2" fill="#D4A017" stroke="none" />
            <circle cx="6"  cy="18" r="1.2" fill="#D4A017" stroke="none" />
            <circle cx="12" cy="3"  r="1.2" fill="#D4A017" stroke="none" />
            <circle cx="12" cy="21" r="1.2" fill="#D4A017" stroke="none" />
        </svg>
    );
}

// ─── Navbar3 Component ────────────────────────────────────
function Navbar3() {
    const [scrolled, setScrolled]   = React.useState(false);
    const [searchOpen, setSearchOpen] = React.useState(false);
    const [query, setQuery]         = React.useState('');
    const [results, setResults]     = React.useState([]);
    const [searching, setSearching] = React.useState(false);
    const [hovered, setHovered]     = React.useState(null);
    const activeLabel               = getActiveLabel();
    const inputRef                  = React.useRef(null);

    React.useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    React.useEffect(() => {
        if (searchOpen && inputRef.current) inputRef.current.focus();
    }, [searchOpen]);

    React.useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setSearching(true);
        const delayDebounce = setTimeout(() => {
            fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    const mapped = data.map(item => ({
                        id: item.show.id.toString(),
                        title: item.show.name,
                        year: item.show.premiered ? item.show.premiered.substring(0, 4) : '2023',
                        rating: item.show.rating?.average || null,
                        image: item.show.image ? item.show.image.medium : null
                    }));
                    setResults(mapped);
                    setSearching(false);
                })
                .catch(err => {
                    console.error(err);
                    setSearching(false);
                });
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const navStyle = scrolled
        ? { ...S.nav, ...S.navScrolled }
        : { ...S.nav };

    return (
        <nav style={navStyle}>
            {/* ── Left: Brand + Nav Links ── */}
            <div style={S.left}>
                <a href="/home" style={S.brand}>
                    <FilmReelIcon />
                    <span style={S.brandName}>MOVIEVERSE</span>
                </a>

                <div style={S.navLinks}>
                    {NAV_LINKS.map(item => {
                        const isActive   = item.label === activeLabel;
                        const isHovered  = hovered === item.label;
                        const isDisabled = item.disabled;

                        if (isDisabled) {
                            return (
                                <span key={item.label} style={S.linkDisabled}>
                                    {item.label}
                                </span>
                            );
                        }

                        const linkStyle = {
                            ...S.link,
                            ...(isActive  ? S.linkActive  : {}),
                            ...(isHovered && !isActive ? S.linkHover : {}),
                        };

                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                style={linkStyle}
                                onMouseEnter={() => setHovered(item.label)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                {item.label}
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* ── Right: Icons + Profile ── */}
            <div style={S.right}>

                {/* Search */}
                <div className="searchContainer">
                    <input
                        ref={inputRef}
                        type="text"
                        className={`searchInput ${searchOpen ? 'searchInputActive' : ''}`}
                        placeholder="Search movies & shows..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />

                    <button
                        style={S.iconBtn}
                        onClick={() => { setSearchOpen(v => !v); if (searchOpen) setQuery(''); }}
                        aria-label="Search"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </button>

                    {searchOpen && query && (
                        <div className="searchResults">
                            {searching ? (
                                <div className="searchNoResults">Searching...</div>
                            ) : results.length > 0 ? (
                                results.map(show => (
                                    <a
                                        key={show.id}
                                        href={`/movie/${show.id}`}
                                        className="searchResultItem"
                                        onClick={() => {
                                            setResults([]);
                                            setSearchOpen(false);
                                            setQuery('');
                                        }}
                                    >
                                        <img
                                            src={show.image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&q=80&auto=format&fit=crop'}
                                            alt={show.title}
                                            className="searchResultImage"
                                        />
                                        <div className="searchResultInfo">
                                            <span className="searchResultTitle">{show.title}</span>
                                            <span className="searchResultMeta">
                                                {show.year} {show.rating ? `• ★ ${show.rating}` : ''}
                                            </span>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="searchNoResults">No results found</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Grid view */}
                <a href="/pages/kids3.html" style={S.iconBtn} aria-label="Kids Area">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3"  y="3"  width="7" height="7"/>
                        <rect x="14" y="3"  width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                        <rect x="3"  y="14" width="7" height="7"/>
                    </svg>
                </a>

                {/* AI Features */}
                <button style={S.iconBtn} aria-label="AI Features"
                        onClick={() => window.location.href = '/ai-features'}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="10" rx="2"/>
                        <circle cx="12" cy="5" r="2"/>
                        <path d="M12 7v4"/>
                        <line x1="8" y1="16" x2="8" y2="16"/>
                        <line x1="16" y1="16" x2="16" y2="16"/>
                    </svg>
                </button>

                {/* Notifications */}
                <button style={S.iconBtn} aria-label="Notifications">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <span style={S.notifBadge}>3</span>
                </button>

                {/* Profile */}
                <button style={S.profileBtn} onClick={() => window.location.href = '/profile'}>
                    <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
                        alt="Piyush"
                        style={S.avatar}
                    />
                    <span>Piyush</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
            </div>

            {/* Push page content below the fixed navbar */}
            <style>{`
                body { padding-top: 90px !important; }
                .hero-section { margin-top: 0 !important; }

                /* ── Search Styles ────────────────────────────────────────── */
                .searchContainer { position: relative; display: flex; align-items: center; gap: 8px; }
                .searchInput { width: 0; opacity: 0; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 24px; padding: 10px 0; color: white; font-family: 'Outfit', 'Inter', sans-serif; font-size: 16px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none; }
                .searchInputActive { width: 260px; opacity: 1; padding: 10px 20px; border-color: #D4A017; box-shadow: 0 0 12px rgba(212, 160, 23, 0.3); }
                .searchResults { position: absolute; top: 50px; right: 0; width: 320px; max-height: 400px; overflow-y: auto; background: rgba(10, 10, 12, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(212, 160, 23, 0.3); border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 160, 23, 0.1); z-index: 1000; display: flex; flex-direction: column; padding: 8px 0; }
                .searchResults::-webkit-scrollbar { width: 6px; }
                .searchResults::-webkit-scrollbar-track { background: transparent; }
                .searchResults::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 3px; }
                .searchResults::-webkit-scrollbar-thumb:hover { background: #D4A017; }
                .searchResultItem { display: flex; align-items: center; gap: 12px; padding: 10px 16px; cursor: pointer; transition: background-color 0.2s; text-decoration: none; color: white; }
                .searchResultItem:hover { background: rgba(212, 160, 23, 0.1); }
                .searchResultImage { width: 40px; height: 55px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1); }
                .searchResultInfo { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
                .searchResultTitle { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Outfit', sans-serif; }
                .searchResultMeta { font-size: 12px; color: rgba(255,255,255,0.5); font-family: 'Inter', sans-serif; }
                .searchNoResults { padding: 20px; text-align: center; color: rgba(255,255,255,0.5); font-size: 14px; font-family: 'Outfit', sans-serif; }
            `}</style>
        </nav>
    );
}

// Mount into #navbar-root
(function mountNavbar() {
    const container = document.getElementById('navbar-root');
    if (!container) return;
    ReactDOM.createRoot(container).render(<Navbar3 />);
})();
