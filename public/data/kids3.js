// Member 3 Data - Kids & Family Movies
// Posters: TMDB image CDN (public, no API key needed)

const kidsMovies = [
    {
        id: "k-1",
        title: "How to Train Your Dragon",
        year: 2010, rating: 8.1,
        genre: ["Animation", "Adventure", "Family"],
        category: ["Animation", "Adventure", "Family"],
        language: "English", runtime: "1h 38m",
        poster:   "https://image.tmdb.org/t/p/w500/t9LiqT3QRmeVJhGEXrn2AjFg3FA.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/t9LiqT3QRmeVJhGEXrn2AjFg3FA.jpg",
        description: "A hapless young Viking becomes the unlikely friend of a young dragon and learns there may be more to the creatures than he assumed."
    },
    {
        id: "k-2",
        title: "Toy Story 4",
        year: 2019, rating: 7.7,
        genre: ["Animation", "Adventure", "Comedy"],
        category: ["Animation", "Comedy", "Family"],
        language: "English", runtime: "1h 40m",
        poster:   "https://image.tmdb.org/t/p/w500/m5dULDtIAi0Bz3xTHtkxYXpV1Sw.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/m5dULDtIAi0Bz3xTHtkxYXpV1Sw.jpg",
        description: "When new toy 'Forky' joins Woody and the gang, a road trip reveals how big the world can be for a toy."
    },
    {
        id: "k-3",
        title: "The Incredibles",
        year: 2004, rating: 8.0,
        genre: ["Animation", "Action", "Adventure"],
        category: ["Animation", "Adventure"],
        language: "English", runtime: "1h 55m",
        poster:   "https://image.tmdb.org/t/p/w500/tLcIGje9lDE0J4FyYGJoQShlK7X.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/tLcIGje9lDE0J4FyYGJoQShlK7X.jpg",
        description: "A family of undercover superheroes are forced into action to save the world while trying to lead a quiet suburban life."
    },
    {
        id: "k-4",
        title: "Finding Nemo",
        year: 2003, rating: 8.2,
        genre: ["Animation", "Adventure", "Comedy"],
        category: ["Animation", "Adventure", "Family"],
        language: "English", runtime: "1h 40m",
        poster:   "https://image.tmdb.org/t/p/w500/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg",
        description: "After his son is captured and taken to Sydney, a timid clownfish sets out on a journey to bring him home."
    },
    {
        id: "k-5",
        title: "Paddington 2",
        year: 2017, rating: 7.8,
        genre: ["Adventure", "Comedy", "Family"],
        category: ["Comedy", "Family"],
        language: "English", runtime: "1h 43m",
        poster:   "https://image.tmdb.org/t/p/w500/9kf56KQfitoIZkpA487xlUsIous.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/9kf56KQfitoIZkpA487xlUsIous.jpg",
        description: "Paddington picks up odd jobs to buy the perfect present for his Aunt Lucy's 100th birthday, only for the gift to be stolen."
    },
    {
        id: "k-6",
        title: "Spider-Man: Into the Spider-Verse",
        year: 2018, rating: 8.4,
        genre: ["Animation", "Action", "Adventure"],
        category: ["Animation", "Adventure"],
        language: "English", runtime: "1h 57m",
        poster:   "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
        description: "Teen Miles Morales becomes Spider-Man and must join spider-powered individuals from other dimensions to stop a multiversal threat."
    },
    {
        id: "k-7",
        title: "Zootopia",
        year: 2016, rating: 8.0,
        genre: ["Animation", "Adventure", "Comedy"],
        category: ["Animation", "Comedy", "Family"],
        language: "English", runtime: "1h 48m",
        poster:   "https://image.tmdb.org/t/p/w500/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg",
        description: "In a city of anthropomorphic animals, a rookie bunny cop and a cynical fox must work together to uncover a conspiracy."
    },
    {
        id: "k-8",
        title: "Moana",
        year: 2016, rating: 7.6,
        genre: ["Animation", "Adventure", "Family"],
        category: ["Animation", "Adventure", "Family"],
        language: "English", runtime: "1h 47m",
        poster:   "https://image.tmdb.org/t/p/w500/9tzN8sPbyod2dsa0lwuvrwBDWra.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/9tzN8sPbyod2dsa0lwuvrwBDWra.jpg",
        description: "In Ancient Polynesia, Moana answers the Ocean's call to seek out the Demigod Maui and set things right for her island."
    },
    {
        id: "k-9",
        title: "Kung Fu Panda 4",
        year: 2024, rating: 7.5,
        genre: ["Animation", "Action", "Comedy"],
        category: ["Animation", "Comedy"],
        language: "English", runtime: "1h 34m",
        poster:   "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
        description: "After Po is tapped to become the Spiritual Leader of the Valley of Peace, he needs to find and train a new Dragon Warrior."
    },
    {
        id: "k-10",
        title: "Inside Out 2",
        year: 2024, rating: 8.6,
        genre: ["Animation", "Adventure", "Comedy"],
        category: ["Animation", "Comedy", "Family"],
        language: "English", runtime: "1h 36m",
        poster:   "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
        description: "Riley enters her teenage years as headquarters undergoes a sudden demolition to make room for new Emotions!"
    },
    {
        id: "k-11",
        title: "The Wild Robot",
        year: 2024, rating: 8.5,
        genre: ["Animation", "Sci-Fi", "Family"],
        category: ["Animation", "Family"],
        language: "English", runtime: "1h 42m",
        poster:   "https://image.tmdb.org/t/p/w500/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg",
        description: "After a shipwreck, robot Roz is stranded on an uninhabited island and must learn to adapt to the harsh surroundings."
    },
    {
        id: "k-12",
        title: "Despicable Me 4",
        year: 2024, rating: 7.2,
        genre: ["Animation", "Comedy", "Family"],
        category: ["Animation", "Comedy", "Family"],
        language: "English", runtime: "1h 35m",
        poster:   "https://image.tmdb.org/t/p/w500/TLVC5EaoIx45MMcK6En5cHNaq8.jpg",
        backdrop: "https://image.tmdb.org/t/p/w500/TLVC5EaoIx45MMcK6En5cHNaq8.jpg",
        description: "Gru and Lucy welcome new baby Gru Jr. to the family, who is intent on tormenting his dad."
    }
];

if (typeof module !== 'undefined' && module.exports) module.exports = { kidsMovies };
