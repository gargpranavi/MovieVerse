(function() {
    const run = () => {
        const { useState } = React;
        const { HeroMovie3, CategoryTabs3, MovieSection3, MovieDetailsModal3,
                PageHeader3, StatsBar3, GoldDivider3 } = window;

        const CATEGORIES = ['All', 'Animation', 'Adventure', 'Comedy', 'Family'];

        const App = () => {
            const [active, setActive] = useState('All');
            const [selected, setSelected] = useState(null);

            const heroMovie = kidsMovies[0]; // How to Train Your Dragon

            const filter = cat => cat === 'All'
                ? kidsMovies
                : kidsMovies.filter(m => m.category.includes(cat));

            const favorites   = kidsMovies.filter(m => m.rating >= 8.0).slice(0, 10);
            const animated    = kidsMovies.filter(m => m.category.includes('Animation')).slice(0, 10);
            const familyList  = kidsMovies.filter(m => m.category.includes('Family')).slice(0, 10);
            const adventure   = kidsMovies.filter(m => m.category.includes('Adventure')).slice(0, 10);
            const filtered    = filter(active);

            const stats = [
                { icon: '🎠', value: animated.length + '+', label: 'Animated Films' },
                { icon: '👨‍👩‍👧', value: familyList.length + '+', label: 'Family Picks' },
                { icon: '⭐', value: '8.0+', label: 'Top Rated' },
                { icon: '🎭', value: '5+', label: 'Genres' },
            ];

            return (
                <div>
                    <PageHeader3 title="Kids & Family" subtitle="Magical movies for everyone" />
                    <StatsBar3 stats={stats} />
                    <HeroMovie3 movie={heroMovie} badgeText="KIDS & FAMILY" />
                    <CategoryTabs3 categories={CATEGORIES} activeCategory={active} onChange={setActive} label="BROWSE BY" />

                    {active === 'All' ? (
                        <>
                            <MovieSection3 title="Kids Favorites" movies={favorites} onSelectMovie={setSelected} showRanks={true} />
                            <GoldDivider3 />
                            <MovieSection3 title="Animated Adventures" movies={animated} onSelectMovie={setSelected} />
                            <GoldDivider3 />
                            <MovieSection3 title="Family Movies" movies={familyList} onSelectMovie={setSelected} />
                            <GoldDivider3 />
                            <MovieSection3 title="Fun & Adventure" movies={adventure} onSelectMovie={setSelected} />
                        </>
                    ) : (
                        <MovieSection3
                            title={`${active} — ${filtered.length} titles`}
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
