const { useState, useEffect } = React;

const CATEGORIES = ['All', 'Animation', 'Adventure', 'Comedy', 'Family'];

function App() {

    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [filteredMovies, setFilteredMovies] = useState([]);

    useEffect(() => {
        if (activeCategory === 'All') {
            setFilteredMovies(kidsMovies);
        } else {
            const result = kidsMovies.filter(m => m.category.includes(activeCategory));
            setFilteredMovies(result);
        }
    }, [activeCategory]);

    const heroMovie  = kidsMovies[0];
    const favorites  = kidsMovies.filter(m => m.rating >= 8.0).slice(0, 10);
    const animated   = kidsMovies.filter(m => m.category.includes('Animation')).slice(0, 10);
    const familyList = kidsMovies.filter(m => m.category.includes('Family')).slice(0, 10);
    const adventure  = kidsMovies.filter(m => m.category.includes('Adventure')).slice(0, 10);

    const stats = [
        { value: animated.length + '+',   label: 'Animated Films' },
        { value: familyList.length + '+', label: 'Family Picks'   },
        { value: '8.0+',                  label: 'Top Rated'      },
        { value: '5+',                    label: 'Genres'         },
    ];

    return (
        <div>
            <PageHeader3 title="Kids & Family" subtitle="Magical movies for everyone" />
            <StatsBar3 stats={stats} />
            <HeroMovie3 movie={heroMovie} badgeText="KIDS & FAMILY" />
            <CategoryTabs3
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onChange={setActiveCategory}
                label="BROWSE BY"
            />

            {activeCategory === 'All' ? (
                <>
                    <MovieSection3 title="Kids Favorites"      movies={favorites}  onSelectMovie={setSelectedMovie} showRanks={true} showViewAll={true} />
                    <GoldDivider3 />
                    <MovieSection3 title="Animated Adventures" movies={animated}   onSelectMovie={setSelectedMovie} showViewAll={true} />
                    <GoldDivider3 />
                    <MovieSection3 title="Family Movies"       movies={familyList} onSelectMovie={setSelectedMovie} showViewAll={true} />
                    <GoldDivider3 />
                    <MovieSection3 title="Fun & Adventure"     movies={adventure}  onSelectMovie={setSelectedMovie} showViewAll={true} />
                </>
            ) : (
                <MovieSection3
                    title={activeCategory + ' — ' + filteredMovies.length + ' titles'}
                    movies={filteredMovies}
                    onSelectMovie={setSelectedMovie}
                    showViewAll={true}
                />
            )}

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
