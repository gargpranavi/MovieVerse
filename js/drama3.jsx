const { useState, useEffect } = React;

const CATEGORIES = ['All', 'Romance', 'Crime', 'Thriller', 'Historical', 'Popular'];

function App() {

    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [filteredMovies, setFilteredMovies] = useState([]);

    useEffect(() => {
        if (activeCategory === 'All') {
            setFilteredMovies(dramaMovies);
        } else {
            const result = dramaMovies.filter(m => m.category.includes(activeCategory));
            setFilteredMovies(result);
        }
    }, [activeCategory]);

    const heroMovie  = dramaMovies[0];
    const top        = dramaMovies.filter(m => m.rating >= 8.8).slice(0, 10);
    const acclaimed  = dramaMovies.filter(m => m.category.includes('Critically Acclaimed')).slice(0, 10);
    const emotional  = dramaMovies.filter(m => m.category.includes('Emotional Stories')).slice(0, 10);
    const popular    = dramaMovies.filter(m => m.category.includes('Popular')).slice(0, 10);

    const stats = [
        { value: dramaMovies.length + '+', label: 'Drama Titles'  },
        { value: acclaimed.length + '+',   label: 'Award Winners' },
        { value: '9.3',                    label: 'Highest Rated' },
        { value: '3+',                     label: 'Languages'     },
    ];

    return (
        <div>
            <PageHeader3 title="Drama" subtitle="Stories that move you" />
            <StatsBar3 stats={stats} />
            <HeroMovie3 movie={heroMovie} badgeText="DRAMA" />
            <CategoryTabs3
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onChange={setActiveCategory}
                label="FILTER BY GENRE"
            />

            {activeCategory === 'All' ? (
                <>
                    <MovieSection3 title="Top Drama Movies"    movies={top}       onSelectMovie={setSelectedMovie} showRanks={true} showViewAll={true} />
                    <GoldDivider3 />
                    <MovieSection3 title="Critically Acclaimed" movies={acclaimed} onSelectMovie={setSelectedMovie} showViewAll={true} />
                    <GoldDivider3 />
                    <MovieSection3 title="Emotional Stories"   movies={emotional} onSelectMovie={setSelectedMovie} showViewAll={true} />
                    <GoldDivider3 />
                    <MovieSection3 title="Popular Drama"       movies={popular}   onSelectMovie={setSelectedMovie} showViewAll={true} />
                </>
            ) : (
                <MovieSection3
                    title={activeCategory + ' Drama — ' + filteredMovies.length + ' titles'}
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
