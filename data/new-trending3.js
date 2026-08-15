// Member 3 Data - New & Trending Movies

const newTrendingMovies = [
    {
        id: "nt-1",
        title: "Interstellar",
        year: 2014, rating: 8.7,
        genre: ["Sci-Fi", "Drama", "Adventure"],
        category: ["Trending", "This Week"],
        language: "English", runtime: "2h 49m",
        poster:   "https://picsum.photos/id/1036/400/600",
        backdrop: "https://picsum.photos/id/1036/1400/560",
        description: "When Earth becomes uninhabitable, ex-NASA pilot Cooper is tasked to pilot a spacecraft to find a new planet for humans across the galaxy."
    },
    {
        id: "nt-2",
        title: "Dune: Part Two",
        year: 2024, rating: 8.8,
        genre: ["Sci-Fi", "Action", "Adventure"],
        category: ["Trending", "New Releases", "This Week"],
        language: "English", runtime: "2h 46m",
        poster:   "https://picsum.photos/id/27/400/600",
        backdrop: "https://picsum.photos/id/27/1400/560",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family."
    },
    {
        id: "nt-3",
        title: "Oppenheimer",
        year: 2023, rating: 8.9,
        genre: ["Biography", "Drama", "History"],
        category: ["Trending", "This Week"],
        language: "English", runtime: "3h 00m",
        poster:   "https://picsum.photos/id/450/400/600",
        backdrop: "https://picsum.photos/id/450/1400/560",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb."
    },
    {
        id: "nt-4",
        title: "The Dark Knight",
        year: 2008, rating: 9.0,
        genre: ["Action", "Crime", "Drama"],
        category: ["Trending"],
        language: "English", runtime: "2h 32m",
        poster:   "https://picsum.photos/id/1062/400/600",
        backdrop: "https://picsum.photos/id/1062/1400/560",
        description: "When the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests of his ability to fight injustice."
    },
    {
        id: "nt-5",
        title: "John Wick: Chapter 4",
        year: 2023, rating: 7.7,
        genre: ["Action", "Crime", "Thriller"],
        category: ["New Releases", "This Week"],
        language: "English", runtime: "2h 49m",
        poster:   "https://picsum.photos/id/217/400/600",
        backdrop: "https://picsum.photos/id/217/1400/560",
        description: "John Wick uncovers a path to defeating The High Table but must face off against a powerful new enemy with global alliances."
    },
    {
        id: "nt-6",
        title: "Spider-Man: Across the Spider-Verse",
        year: 2023, rating: 8.7,
        genre: ["Animation", "Action", "Adventure"],
        category: ["Trending", "New Releases"],
        language: "English", runtime: "2h 20m",
        poster:   "https://picsum.photos/id/514/400/600",
        backdrop: "https://picsum.photos/id/514/1400/560",
        description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People protecting its very existence."
    },
    {
        id: "nt-7",
        title: "The Batman",
        year: 2022, rating: 7.8,
        genre: ["Action", "Crime", "Drama"],
        category: ["Trending"],
        language: "English", runtime: "2h 56m",
        poster:   "https://picsum.photos/id/823/400/600",
        backdrop: "https://picsum.photos/id/823/1400/560",
        description: "When a sadistic killer targets Gotham's elite, Batman investigates the city's hidden corruption and his family's involvement."
    },
    {
        id: "nt-8",
        title: "Blade Runner 2049",
        year: 2017, rating: 8.0,
        genre: ["Sci-Fi", "Drama", "Mystery"],
        category: ["Trending", "This Week"],
        language: "English", runtime: "2h 44m",
        poster:   "https://picsum.photos/id/1003/400/600",
        backdrop: "https://picsum.photos/id/1003/1400/560",
        description: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard."
    },
    {
        id: "nt-9",
        title: "Alien: Romulus",
        year: 2024, rating: 8.5,
        genre: ["Sci-Fi", "Horror", "Thriller"],
        category: ["New Releases", "This Week"],
        language: "English", runtime: "1h 59m",
        poster:   "https://picsum.photos/id/392/400/600",
        backdrop: "https://picsum.photos/id/392/1400/560",
        description: "Young colonists scavenging a derelict space station come face to face with the most terrifying life form in the universe."
    },
    {
        id: "nt-10",
        title: "Gladiator II",
        year: 2024, rating: 8.2,
        genre: ["Action", "Adventure", "Drama"],
        category: ["New Releases"],
        language: "English", runtime: "2h 28m",
        poster:   "https://picsum.photos/id/674/400/600",
        backdrop: "https://picsum.photos/id/674/1400/560",
        description: "Years after witnessing Maximus's death, Lucius must enter the Colosseum after being captured to save his home and Rome."
    },
    {
        id: "nt-11",
        title: "Twisters",
        year: 2024, rating: 7.9,
        genre: ["Action", "Adventure", "Thriller"],
        category: ["New Releases", "This Week"],
        language: "English", runtime: "2h 02m",
        poster:   "https://picsum.photos/id/167/400/600",
        backdrop: "https://picsum.photos/id/167/1400/560",
        description: "Kate Cooper teams up with storm hunter Tyler Owens as violent tornadoes devastate Oklahoma."
    },
    {
        id: "nt-12",
        title: "The Substance",
        year: 2024, rating: 8.4,
        genre: ["Horror", "Sci-Fi", "Thriller"],
        category: ["Trending"],
        language: "English", runtime: "2h 21m",
        poster:   "https://picsum.photos/id/1084/400/600",
        backdrop: "https://picsum.photos/id/1084/1400/560",
        description: "A fading celebrity takes a black-market drug that creates a better, younger, more perfect version of herself."
    }
];

if (typeof module !== 'undefined' && module.exports) module.exports = { newTrendingMovies };
