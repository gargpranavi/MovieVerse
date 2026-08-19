// ═══════════════════════════════════════════════════════════
//  MovieVerse – Member 3  |  Drama Page
// ═══════════════════════════════════════════════════════════
const { useState } = React;

function App() {
    const [selectedMovie, setSelectedMovie] = useState(null);

    // Hero: fixed to first drama movie
    const heroMovie = dramaMovies[0];

    // Carousel lists
    const topRated = [...dramaMovies]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 12);

    const acclaimed = dramaMovies
        .filter(m => m.category && m.category.includes('Critically Acclaimed'))
        .slice(0, 12);

    const emotional = dramaMovies
        .filter(m => m.category && m.category.includes('Emotional Stories'))
        .slice(0, 12);

    const popular = dramaMovies
        .filter(m => m.category && m.category.includes('Popular'))
        .slice(0, 12);

    const crime = dramaMovies
        .filter(m => m.category && m.category.includes('Crime'))
        .slice(0, 12);

    return (
        <div className="page-container">

            <HeroSection3
                movie={heroMovie}
                genreLabel={heroMovie.genre[0]}
                typeLabel="Drama"
            />

            <CarouselSection3
                title="Top Rated Drama"
                movies={topRated}
                onSelectMovie={setSelectedMovie}
                showRanks={true}
                featuredId={heroMovie.id}
            />

            <GoldDivider3 />

            <CarouselSection3
                title="Critically Acclaimed"
                movies={acclaimed}
                onSelectMovie={setSelectedMovie}
            />

            <GoldDivider3 />

            <CarouselSection3
                title="Emotional Stories"
                movies={emotional}
                onSelectMovie={setSelectedMovie}
            />

            <GoldDivider3 />

            <CarouselSection3
                title="Crime Drama"
                movies={crime}
                onSelectMovie={setSelectedMovie}
            />

            <GoldDivider3 />

            <CarouselSection3
                title="Popular Drama"
                movies={popular}
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
