(function() {
    const run = () => {
        const { useState } = React;
        const { HeroMovie3, CategoryTabs3, MovieSection3, MovieDetailsModal3,
                PageHeader3, StatsBar3, GoldDivider3 } = window;

        const CATEGORIES = ['All', 'Romance', 'Crime', 'Thriller', 'Historical', 'Popular'];

        const App = () => {
            const [active, setActive] = useState('All');
            const [selected, setSelected] = useState(null);

            const heroMovie = dramaMovies[0]; // Shawshank Redemption

            const filter = cat => cat === 'All'
                ? dramaMovies
                : dramaMovies.filter(m => m.category.includes(cat));

            const top         = dramaMovies.filter(m => m.rating >= 8.8).slice(0, 10);
            const acclaimed   = dramaMovies.filter(m => m.category.includes('Critically Acclaimed')).slice(0, 10);
            const emotional   = dramaMovies.filter(m => m.category.includes('Emotional Stories')).slice(0, 10);
            const popular     = dramaMovies.filter(m => m.category.includes('Popular')).slice(0, 10);
            const filtered    = filter(active);

            const stats = [
                { icon: '🎭', value: dramaMovies.length + '+', label: 'Drama Titles' },
                { icon: '🏆', value: acclaimed.length + '+', label: 'Award Winners' },
                { icon: '💫', value: '9.3', label: 'Highest Rated' },
                { icon: '🌐', value: '3+', label: 'Languages' },
            ];

            return (
                <div>
                    <PageHeader3 title="Drama" subtitle="Stories that move you" />
                    <StatsBar3 stats={stats} />
                    <HeroMovie3 movie={heroMovie} badgeText="DRAMA" />
                    <CategoryTabs3 categories={CATEGORIES} activeCategory={active} onChange={setActive} label="FILTER BY GENRE" />

                    {active === 'All' ? (
                        <>
                            <MovieSection3 title="Top Drama Movies" movies={top} onSelectMovie={setSelected} showRanks={true} />
                            <GoldDivider3 />
                            <MovieSection3 title="Critically Acclaimed" movies={acclaimed} onSelectMovie={setSelected} />
                            <GoldDivider3 />
                            <MovieSection3 title="Emotional Stories" movies={emotional} onSelectMovie={setSelected} />
                            <GoldDivider3 />
                            <MovieSection3 title="Popular Drama" movies={popular} onSelectMovie={setSelected} />
                        </>
                    ) : (
                        <MovieSection3
                            title={`${active} Drama — ${filtered.length} titles`}
                            movies={filtered}
                            onSelectMovie={setSelected}
                        />
                    )}

                    {selected && <MovieDetailsModal3 movie={selected} onClose={() => setSelected(null)} />}
                </div>
            );
        };

        ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    };

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', run)
        : run();
})();
