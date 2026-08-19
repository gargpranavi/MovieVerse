// ═══════════════════════════════════════════════════════════
//  MovieVerse – Member 3  |  Movies Page
//  Filter feature excluded per spec
// ═══════════════════════════════════════════════════════════
const { useState } = React;

function App() {
    const allMovies = moviesData;
    const [selectedMovie, setSelectedMovie] = useState(null);

    // Hero: highest-popularity movie, fixed (no rotation)
    const heroMovie = useState(() =>
        [...allMovies].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0]
    )[0];

    // Carousel lists — computed once via useState initializer
    const trending = useState(() =>
        allMovies.filter(m => m.trending).slice(0, 12)
    )[0];

    const newReleases = useState(() =>
        [...allMovies].sort((a, b) => b.year - a.year).slice(0, 12)
    )[0];

    const topRated = useState(() =>
        [...allMovies].sort((a, b) => b.rating - a.rating).slice(0, 12)
    )[0];

    const popular = useState(() =>
        [...allMovies].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 12)
    )[0];

    // Top 3 genres by movie count → one carousel each
    const topGenres = useState(() => {
        const counts = {};
        allMovies.forEach(m => m.genre.forEach(g => {
            counts[g] = (counts[g] || 0) + 1;
        }));
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([g]) => g);
    })[0];

    return (
        <div className="page-container">

            <HeroSection3
                movie={heroMovie}
                genreLabel={heroMovie ? heroMovie.genre[0] : 'Movie'}
                typeLabel="Movie"
            />

            <CarouselSection3
                title="Trending Movies"
                movies={trending}
                onSelectMovie={setSelectedMovie}
                showRanks={true}
                featuredId={heroMovie && heroMovie.id}
            />

            <GoldDivider3 />

            <CarouselSection3
                title="New Releases"
                movies={newReleases}
                onSelectMovie={setSelectedMovie}
            />

            <GoldDivider3 />

            <CarouselSection3
                title="Top Rated"
                movies={topRated}
                onSelectMovie={setSelectedMovie}
            />

            <GoldDivider3 />

            <CarouselSection3
                title="Most Popular"
                movies={popular}
                onSelectMovie={setSelectedMovie}
            />

            {topGenres.map(genre => {
                const genreMovies = allMovies
                    .filter(m => m.genre.includes(genre))
                    .slice(0, 12);
                if (!genreMovies.length) return null;
                return (
                    <React.Fragment key={genre}>
                        <GoldDivider3 />
                        <CarouselSection3
                            title={genre + ' Movies'}
                            movies={genreMovies}
                            onSelectMovie={setSelectedMovie}
                        />
                    </React.Fragment>
                );
            })}

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
