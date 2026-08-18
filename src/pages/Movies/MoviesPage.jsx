import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import MovieCarousel from '../../components/MovieCarousel/MovieCarousel.jsx'
import styles from '../Home/HomePage.module.css'

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reusing tvmaze for dummy data, but filtering or sorting differently
    fetch('https://api.tvmaze.com/search/shows?q=movie')
      .then(res => res.json())
      .then(data => {
        const mappedData = data.map(item => {
          const show = item.show;
          return {
            id: show.id.toString(),
            title: show.name,
            year: show.premiered ? show.premiered.substring(0, 4) : '2023',
            duration: '2h 10m',
            ageRating: 'U/A 16+',
            genres: show.genres.length > 0 ? show.genres : ['Drama'],
            description: show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'A great movie.',
            image: show.image ? show.image.original : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80',
            rating: show.rating?.average || 8.0,
          };
        });
        setMovies(mappedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || movies.length === 0) {
    return (
      <DashboardLayout>
        <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white' }}>
          <h2>Loading Movies...</h2>
        </div>
      </DashboardLayout>
    );
  }

  const featured = movies[0];
  const trendingMovies = movies.slice(1, 6);
  const actionMovies = movies.slice(6, 11);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <section className={styles.hero} style={{ height: '60vh', minHeight: '400px' }}>
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${featured.image})` }}
          />
          <div className={styles.heroGradient} />
          
          <div className={styles.heroContent} style={{ justifyContent: 'center' }}>
            <h1 className={styles.heroTitle}>{featured.title.toUpperCase()}</h1>
            <div className={styles.heroMeta}>
              <span>Movie</span> &bull; 
              <span>{featured.genres[0]}</span> &bull; 
              <span>{featured.year}</span>
            </div>
            <p className={styles.heroDesc} style={{ WebkitLineClamp: 2 }}>
              {featured.description}
            </p>
          </div>
        </section>

        <div className={styles.content} style={{ marginTop: '-100px' }}>
          <MovieCarousel title="Trending Movies" movies={trendingMovies} />
          <MovieCarousel title="Action Packed" movies={actionMovies} />
        </div>
      </div>
    </DashboardLayout>
  )
}
