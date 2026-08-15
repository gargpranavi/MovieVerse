// Member 3 Data - Drama Movies

const dramaMovies = [
    {
        id: "d-1",
        title: "The Shawshank Redemption",
        year: 1994, rating: 9.3,
        genre: ["Drama", "Crime"],
        category: ["Crime", "Popular", "Critically Acclaimed"],
        language: "English", runtime: "2h 22m",
        poster:   "https://picsum.photos/id/17/400/600",
        backdrop: "https://picsum.photos/id/17/1400/560",
        description: "Two convicts form a friendship over several years, seeking consolation and eventual redemption through basic compassion."
    },
    {
        id: "d-2",
        title: "The Godfather",
        year: 1972, rating: 9.2,
        genre: ["Crime", "Drama"],
        category: ["Crime", "Popular", "Critically Acclaimed"],
        language: "English", runtime: "2h 55m",
        poster:   "https://picsum.photos/id/1068/400/600",
        backdrop: "https://picsum.photos/id/1068/1400/560",
        description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
    },
    {
        id: "d-3",
        title: "Schindler's List",
        year: 1993, rating: 9.0,
        genre: ["Biography", "Drama", "History"],
        category: ["Historical", "Critically Acclaimed", "Emotional Stories"],
        language: "English", runtime: "3h 15m",
        poster:   "https://picsum.photos/id/39/400/600",
        backdrop: "https://picsum.photos/id/39/1400/560",
        description: "Industrialist Oskar Schindler becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis in WWII."
    },
    {
        id: "d-4",
        title: "12 Angry Men",
        year: 1957, rating: 9.0,
        genre: ["Crime", "Drama"],
        category: ["Crime", "Critically Acclaimed"],
        language: "English", runtime: "1h 36m",
        poster:   "https://picsum.photos/id/400/400/600",
        backdrop: "https://picsum.photos/id/400/1400/560",
        description: "A jury is frustrated by a single member whose reasonable doubt forces them to carefully reconsider the evidence before a verdict."
    },
    {
        id: "d-5",
        title: "Forrest Gump",
        year: 1994, rating: 8.8,
        genre: ["Drama", "Romance"],
        category: ["Romance", "Emotional Stories", "Popular"],
        language: "English", runtime: "2h 22m",
        poster:   "https://picsum.photos/id/250/400/600",
        backdrop: "https://picsum.photos/id/250/1400/560",
        description: "US history from the 1950s to the '70s unfolds from the perspective of an Alabama man who yearns to be reunited with his childhood sweetheart."
    },
    {
        id: "d-6",
        title: "Fight Club",
        year: 1999, rating: 8.8,
        genre: ["Drama", "Thriller"],
        category: ["Thriller", "Popular"],
        language: "English", runtime: "2h 19m",
        poster:   "https://picsum.photos/id/779/400/600",
        backdrop: "https://picsum.photos/id/779/1400/560",
        description: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something far more dangerous."
    },
    {
        id: "d-7",
        title: "The Prestige",
        year: 2006, rating: 8.5,
        genre: ["Drama", "Mystery", "Sci-Fi"],
        category: ["Thriller", "Critically Acclaimed"],
        language: "English", runtime: "2h 10m",
        poster:   "https://picsum.photos/id/540/400/600",
        backdrop: "https://picsum.photos/id/540/1400/560",
        description: "Two rival magicians in 1890s London engage in a dangerous battle to create the ultimate illusion, sacrificing everything."
    },
    {
        id: "d-8",
        title: "Whiplash",
        year: 2014, rating: 8.5,
        genre: ["Drama", "Music"],
        category: ["Critically Acclaimed", "Popular"],
        language: "English", runtime: "1h 46m",
        poster:   "https://picsum.photos/id/678/400/600",
        backdrop: "https://picsum.photos/id/678/1400/560",
        description: "A promising young drummer enlists at a cut-throat music conservatory where his instructor will stop at nothing to realize his potential."
    },
    {
        id: "d-9",
        title: "La La Land",
        year: 2016, rating: 8.0,
        genre: ["Comedy", "Drama", "Romance"],
        category: ["Romance", "Emotional Stories"],
        language: "English", runtime: "2h 08m",
        poster:   "https://picsum.photos/id/1045/400/600",
        backdrop: "https://picsum.photos/id/1045/1400/560",
        description: "Navigating their careers in Los Angeles, a pianist and an actress fall in love while reconciling their aspirations for the future."
    },
    {
        id: "d-10",
        title: "The Zone of Interest",
        year: 2023, rating: 7.5,
        genre: ["Drama", "History", "War"],
        category: ["Historical", "Critically Acclaimed"],
        language: "German", runtime: "1h 45m",
        poster:   "https://picsum.photos/id/100/400/600",
        backdrop: "https://picsum.photos/id/100/1400/560",
        description: "Auschwitz commandant Rudolf Höss and his wife strive to build a dream life for their family in a house next to the camp."
    },
    {
        id: "d-11",
        title: "Anatomy of a Fall",
        year: 2023, rating: 7.7,
        genre: ["Crime", "Drama", "Thriller"],
        category: ["Crime", "Thriller", "Critically Acclaimed"],
        language: "French", runtime: "2h 31m",
        poster:   "https://picsum.photos/id/191/400/600",
        backdrop: "https://picsum.photos/id/191/1400/560",
        description: "A woman is suspected of murder after her husband's fall; their blind son faces a moral dilemma as the sole witness."
    },
    {
        id: "d-12",
        title: "Past Lives",
        year: 2023, rating: 7.9,
        genre: ["Drama", "Romance"],
        category: ["Romance", "Emotional Stories", "Critically Acclaimed"],
        language: "English / Korean", runtime: "1h 45m",
        poster:   "https://picsum.photos/id/350/400/600",
        backdrop: "https://picsum.photos/id/350/1400/560",
        description: "Two deeply connected childhood friends are separated after one's family emigrates from South Korea. Two decades later, they reunite in New York."
    }
];

if (typeof module !== 'undefined' && module.exports) module.exports = { dramaMovies };
