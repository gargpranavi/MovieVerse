import { useEffect } from 'react'
import styles from './VideoPlayerModal.module.css'

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

export default function VideoPlayerModal({ isOpen, onClose, movieTitle }) {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  // Sample premium open-source cinematic clips
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close Video Player">
          <CloseIcon />
        </button>
        <div className={styles.header}>
          <span className={styles.nowPlaying}>NOW PLAYING</span>
          <h2 className={styles.title}>{movieTitle}</h2>
        </div>
        <div className={styles.videoWrapper}>
          <video 
            className={styles.video} 
            src={videoUrl} 
            controls 
            autoPlay 
            playsInline
          />
        </div>
      </div>
    </div>
  )
}
