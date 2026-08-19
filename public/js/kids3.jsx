// ═══════════════════════════════════════════════════════════
//  MovieVerse – Member 3  |  Kids & Family Page
// ═══════════════════════════════════════════════════════════
const { useState } = React;

function App() {
    const [selectedMovie, setSelectedMovie] = useState(null);

    // Hero: fixed to first kids movie
    const heroMovie = kidsMovies[0];

    // Carousel lists
    const favorites = [...kidsMovies]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 12);

    const animated = kidsMovies
        .filter(m => m.category && m.category.includes('Animation'))
        .slice(0, 12);

    const familyList = kidsMovies
        .filter(m => m.category && m.category.includes('Family'))
        .slice(0, 12);

    const adventure = kidsMovies
        .filter(m => m.category && m.category.includes('Adventure'))
        .slice(0, 12);

    const comedy = kidsMovies
        .filter(m => m.category && m.category.includes('Comedy'))
        .slice(0, 12);

    return (
        <div className="page-container">

            <HeroSection3
                movie={heroMovie}
                genreLabel={heroMovie.genre[0]}
                typeLabel="Kids & Family"
            />

            <CarouselSection3
                title="Kids Favorites"
                movies={favorites}
                onSelectMovie={setSelectedMovie}
                showRanks={true}
                featuredId={heroMovie.id}
            />

            <GoldDivider3 />

            <CarouselSection3
                title="Animated Adventures"
                movies={animated}
                onSelectMovie={setSelectedMovie}
            />

            <GoldDivider3 />

            <CarouselSection3
                title="Family Movies"
                movies={familyList}
                onSelectMovie={setSelectedMovie}
            />

            <GoldDivider3 />

            <CarouselSection3
                title="Fun & Adventure"
                movies={adventure}
                onSelectMovie={setSelectedMovie}
            />

            <GoldDivider3 />

            <CarouselSection3
                title="Comedy For Kids"
                movies={comedy}
                onSelectMovie={setSelectedMovie}
            />

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
