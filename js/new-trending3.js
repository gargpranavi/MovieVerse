(function() {
    const run = () => {
        const { useState } = React;
        const { HeroMovie3, CategoryTabs3, MovieSection3, MovieDetailsModal3,
                PageHeader3, StatsBar3, GoldDivider3 } = window;

        const CATEGORIES = ['All', 'Trending', 'New Releases', 'This Week'];

        const App = () => {
            const [active, setActive] = useState('All');
            const [selected, setSelected] = useState(null);

            const heroMovie = newTrendingMovies[1]; // Dune Part Two

            const filter = cat => cat === 'All'
                ? newTrendingMovies
                : newTrendingMovies.filter(m => m.category.includes(cat));

            const trending   = newTrendingMovies.filter(m => m.category.includes('Trending')).slice(0, 10);
            const newReleases = newTrendingMovies.filter(m => m.category.includes('New Releases')).slice(0, 10);
            const thisWeek   = newTrendingMovies.filter(m => m.category.includes('This Week')).slice(0, 10);
            const filtered   = filter(active);

            const stats = [
                { icon: '🔥', value: trending.length + '+', label: 'Trending Today' },
                { icon: '🎬', value: newReleases.length + '+', label: 'New Releases' },
                { icon: '⭐', value: '8.5+', label: 'Avg. Rating' },
                { icon: '🌍', value: '12+', label: 'Languages' },
            ];

            return (
                <div>
                    <PageHeader3 title="New & Trending" subtitle="What everyone's watching right now" />
                    <StatsBar3 stats={stats} />
                    <HeroMovie3 movie={heroMovie} badgeText="NEW RELEASE" />
                    <CategoryTabs3 categories={CATEGORIES} activeCategory={active} onChange={setActive} label="BROWSE BY" />

                    {active === 'All' ? (
                        <>
                            <MovieSection3 title="Trending Now" movies={trending} onSelectMovie={setSelected} showRanks={true} />
                            <GoldDivider3 />
                            <MovieSection3 title="New Releases" movies={newReleases} onSelectMovie={setSelected} />
                            <GoldDivider3 />
                            <MovieSection3 title="Popular This Week" movies={thisWeek} onSelectMovie={setSelected} />
                        </>
                    ) : (
                        <MovieSection3
                            title={`${active} — ${filtered.length} titles`}
                            movies={filtered}
                            onSelectMovie={setSelected}
                            showRanks={active === 'Trending'}
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
