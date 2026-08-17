// Member 3 — Movies Page Logic
const { useState, useEffect, useMemo } = React;

// ─── Config ───────────────────────────────────────────────────────────────────

const TABS = ['All Movies', 'Trending', 'New Releases', 'Popular'];

const SORT_OPTIONS = [
    { value: 'default',        label: 'Default'       },
    { value: 'rating_desc',    label: 'Highest Rated' },
    { value: 'rating_asc',     label: 'Lowest Rated'  },
    { value: 'year_desc',      label: 'Newest'        },
    { value: 'year_asc',       label: 'Oldest'        },
    { value: 'title_asc',      label: 'A – Z'         },
    { value: 'title_desc',     label: 'Z – A'         },
    { value: 'popularity_desc',label: 'Most Popular'  },
];

const RATING_OPTIONS = [
    { value: '0',   label: 'All Ratings' },
    { value: '9',   label: '9+ ⭐'       },
    { value: '8',   label: '8+ ⭐'       },
    { value: '7',   label: '7+ ⭐'       },
    { value: '6',   label: '6+ ⭐'       },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

function getUnique(arr, key) {
    const set = new Set();
    arr.forEach(m => {
        if (key === 'genre') m.genre.forEach(g => set.add(g));
        else set.add(m[key]);
    });
    return [...set].filter(Boolean).sort();
}

function applyFilters({ movies, tab, genre, year, minRating, language, sort }) {
    let result = [...movies];

    // 1. Category / Tab
    if (tab === 'Trending')      result = result.filter(m => m.trending);
    else if (tab === 'New Releases') result = result.sort((a, b) => b.year - a.year);
    else if (tab === 'Popular')  result = result.sort((a, b) => b.popularity - a.popularity);

    // 2. Genre
    if (genre) result = result.filter(m => m.genre.includes(genre));

    // 3. Year
    if (year) result = result.filter(m => String(m.year) === String(year));

    // 4. Rating
    if (minRating > 0) result = result.filter(m => m.rating >= minRating);

    // 5. Language
    if (language) result = result.filter(m => m.language === language);

    // 6. Sort (overrides tab-level sort for specific options)
    if (sort === 'rating_desc')    result.sort((a, b) => b.rating    - a.rating);
    else if (sort === 'rating_asc')     result.sort((a, b) => a.rating    - b.rating);
    else if (sort === 'year_desc')      result.sort((a, b) => b.year      - a.year);
    else if (sort === 'year_asc')       result.sort((a, b) => a.year      - b.year);
    else if (sort === 'title_asc')      result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'title_desc')     result.sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === 'popularity_desc') result.sort((a, b) => b.popularity - a.popularity);

    return result;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const FilterSelect = ({ id, label, value, onChange, options }) => (
    <div className="filter-group">
        <label className="filter-label" htmlFor={id}>{label}</label>
        <div className="filter-select-wrapper">
            <select id={id} className="filter-select" value={value} onChange={e => onChange(e.target.value)}>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <span className="filter-chevron">▾</span>
        </div>
    </div>
);

const FiltersBar = ({ genres, years, languages, genre, year, minRating, language, sort,
    onGenre, onYear, onRating, onLanguage, onSort, onClear, resultCount }) => (
    <div className="filters-section">
        <div className="filters-row">
            <FilterSelect
                id="filter-genre" label="Genre" value={genre} onChange={onGenre}
                options={[{ value: '', label: 'All Genres' }, ...genres.map(g => ({ value: g, label: g }))]}
            />
            <FilterSelect
                id="filter-year" label="Year" value={year} onChange={onYear}
                options={[{ value: '', label: 'All Years' }, ...years.map(y => ({ value: y, label: y }))]}
            />
            <FilterSelect
                id="filter-rating" label="Rating" value={String(minRating)} onChange={v => onRating(Number(v))}
                options={RATING_OPTIONS}
            />
            <FilterSelect
                id="filter-language" label="Language" value={language} onChange={onLanguage}
                options={[{ value: '', label: 'All Languages' }, ...languages.map(l => ({ value: l, label: l }))]}
            />
            <FilterSelect
                id="filter-sort" label="Sort By" value={sort} onChange={onSort}
                options={SORT_OPTIONS}
            />
            <button className="clear-filters-btn" id="btn-clear-filters" onClick={onClear}>
                <span>✕</span> Clear Filters
            </button>
        </div>
        <div className="result-count">
            Showing <span className="result-count-number">{resultCount}</span>
            {resultCount === 1 ? ' movie' : ' movies'}
        </div>
    </div>
);

const NoResults = ({ onClear }) => (
    <div className="no-results">
        <div className="no-results-icon">🎬</div>
        <h3 className="no-results-title">No movies found</h3>
        <p className="no-results-subtitle">Try adjusting or clearing your filters.</p>
        <button className="btn btn-primary no-results-btn" onClick={onClear}>
            Clear Filters
        </button>
    </div>
);

const MovieGrid = ({ movies, onSelectMovie, showRanks }) => (
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
);

// ─── Main App ─────────────────────────────────────────────────────────────────

function App() {
    const allMovies = moviesData;

    // ── State ──
    const [activeTab,   setActiveTab]   = useState('All Movies');
    const [genre,       setGenre]       = useState('');
    const [year,        setYear]        = useState('');
    const [minRating,   setMinRating]   = useState(0);
    const [language,    setLanguage]    = useState('');
    const [sort,        setSort]        = useState('default');
    const [selectedMovie, setSelectedMovie] = useState(null);

    // ── Derived filter options ──
    const genres    = useMemo(() => getUnique(allMovies, 'genre'),    []);
    const years     = useMemo(() => getUnique(allMovies, 'year').sort((a, b) => b - a), []);
    const languages = useMemo(() => getUnique(allMovies, 'language'), []);

    // ── Filtered + sorted movies ──
    const filteredMovies = useMemo(() => applyFilters({
        movies: allMovies,
        tab: activeTab,
        genre, year, minRating, language, sort
    }), [activeTab, genre, year, minRating, language, sort]);

    // ── Hero: highest rated movie ──
    const heroMovie = useMemo(() =>
        [...allMovies].sort((a, b) => b.popularity - a.popularity)[0],
    []);

    // ── Stats ──
    const trending    = allMovies.filter(m => m.trending);
    const newReleases = allMovies.filter(m => m.year >= 2024);

    const stats = [
        { value: allMovies.length + '+',   label: 'Movies'         },
        { value: trending.length + '+',    label: 'Trending Today' },
        { value: newReleases.length + '+', label: 'New Releases'   },
        { value: '30+',                    label: 'Languages'      },
    ];

    const handleClearFilters = () => {
        setActiveTab('All Movies');
        setGenre('');
        setYear('');
        setMinRating(0);
        setLanguage('');
        setSort('default');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSort('default'); // reset sort when tab changes
    };

    const showRanks = activeTab === 'Trending' && !genre && !year && !minRating && !language;

    return (
        <div>
            {/* Page Header */}
            <PageHeader3 title="Movies" subtitle="Explore movies you'll love." />
            <StatsBar3 stats={stats} />

            {/* Hero */}
            <HeroMovie3 movie={heroMovie} badgeText="MOVIE OF THE DAY" />

            {/* Category Tabs */}
            <CategoryTabs3
                categories={TABS}
                activeCategory={activeTab}
                onChange={handleTabChange}
                label="DISCOVER"
            />

            {/* Filters */}
            <FiltersBar
                genres={genres}
                years={years}
                languages={languages}
                genre={genre}
                year={year}
                minRating={minRating}
                language={language}
                sort={sort}
                onGenre={setGenre}
                onYear={setYear}
                onRating={setMinRating}
                onLanguage={setLanguage}
                onSort={setSort}
                onClear={handleClearFilters}
                resultCount={filteredMovies.length}
            />

            {/* Movie Grid or No Results */}
            <section className="movie-section" id="movies-grid-section">
                {filteredMovies.length === 0 ? (
                    <NoResults onClear={handleClearFilters} />
                ) : (
                    <MovieGrid
                        movies={filteredMovies}
                        onSelectMovie={setSelectedMovie}
                        showRanks={showRanks}
                    />
                )}
            </section>

            {/* Movie Details Modal */}
            {selectedMovie && (
                <MovieDetailsModal3
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
