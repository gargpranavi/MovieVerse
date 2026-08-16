const { useState, useEffect } = React;

const CATEGORIES = ['All', 'Trending', 'New Releases', 'This Week'];

function App() {

    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [filteredMovies, setFilteredMovies] = useState([]);

    useEffect(() => {
        if (activeCategory === 'All') {
            setFilteredMovies(newTrendingMovies);
        } else {
            const result = newTrendingMovies.filter(m => m.category.includes(activeCategory));
            setFilteredMovies(result);
        }
    }, [activeCategory]);

    const heroMovie   = newTrendingMovies[1];
    const trending    = newTrendingMovies.filter(m => m.category.includes('Trending')).slice(0, 10);
    const newReleases = newTrendingMovies.filter(m => m.category.includes('New Releases')).slice(0, 10);
    const thisWeek    = newTrendingMovies.filter(m => m.category.includes('This Week')).slice(0, 10);

    const stats = [
        { value: trending.length + '+',    label: 'Trending Today' },
        { value: newReleases.length + '+', label: 'New Releases'   },
        { value: '8.5+',                   label: 'Avg. Rating'    },
        { value: '12+',                    label: 'Languages'      },
    ];

    return (
        <div>
            <PageHeader3 title="New & Trending" subtitle="What everyone's watching right now" />
            <StatsBar3 stats={stats} />
            <HeroMovie3 movie={heroMovie} badgeText="NEW RELEASE" />
            <CategoryTabs3
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onChange={setActiveCategory}
                label="BROWSE BY"
            />

            {activeCategory === 'All' ? (
                <>
                    <MovieSection3 title="Trending Now"      movies={trending}    onSelectMovie={setSelectedMovie} showRanks={true} showViewAll={true} />
                    <GoldDivider3 />
                    <MovieSection3 title="New Releases"      movies={newReleases} onSelectMovie={setSelectedMovie} showViewAll={true} />
                    <GoldDivider3 />
                    <MovieSection3 title="Popular This Week" movies={thisWeek}    onSelectMovie={setSelectedMovie} showViewAll={true} />
                </>
            ) : (
                <MovieSection3
                    title={activeCategory + ' — ' + filteredMovies.length + ' titles'}
                    movies={filteredMovies}
                    onSelectMovie={setSelectedMovie}
                    showRanks={activeCategory === 'Trending'}
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
