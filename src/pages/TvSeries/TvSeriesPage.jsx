import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import MovieCarousel from '../../components/MovieCarousel/MovieCarousel.jsx'
import styles from '../Home/HomePage.module.css'

export default function TvSeriesPage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.tvmaze.com/shows')
      .then(res => res.json())
      .then(data => {
        // Reverse data to make it look different from home
        const reversedData = [...data].reverse();
        const mappedData = reversedData.slice(0, 30).map(show => ({
          id: show.id.toString(),
          title: show.name,
          year: show.premiered ? show.premiered.substring(0, 4) : '2023',
          duration: `${show.averageRuntime || 45}m`,
          ageRating: 'U/A 16+',
          genres: show.genres.length > 0 ? show.genres : ['Drama'],
          description: show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'A great TV series.',
          image: show.image ? show.image.original : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80',
          rating: show.rating?.average || 8.0,
        }));
        setShows(mappedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || shows.length === 0) {
    return (
      <DashboardLayout>
        <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white' }}>
          <h2>Loading TV Series...</h2>
        </div>
      </DashboardLayout>
    );
  }

  const featured = shows[0];
  const dramaSeries = shows.slice(1, 11);
  const comedySeries = shows.slice(11, 21);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <section className={styles.hero} style={{ height: '70vh', minHeight: '500px' }}>
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${featured.image})` }}
          />
          <div className={styles.heroGradient} />
          
          <div className={styles.heroContent}>
            <div className={styles.netflixLogoWrap}>
              <span className={styles.nSeries}>S</span> 
              <span className={styles.seriesText}>S E R I E S</span>
            </div>
            
            <h1 className={styles.heroTitle}>{featured.title.toUpperCase()}</h1>
            
            <div className={styles.heroMeta}>
              <span>Series</span> &bull; 
              <span>{featured.genres[0]}</span> &bull; 
              <span>{featured.year}</span>
            </div>
            <p className={styles.heroDesc} style={{ WebkitLineClamp: 3 }}>
              {featured.description}
            </p>
          </div>
        </section>

        <div className={styles.content} style={{ marginTop: '-120px' }}>
          <MovieCarousel title="Critically Acclaimed Dramas" movies={dramaSeries} />
          <MovieCarousel title="Binge-Worthy Comedies" movies={comedySeries} />
        </div>
      </div>
    </DashboardLayout>
  )
}
