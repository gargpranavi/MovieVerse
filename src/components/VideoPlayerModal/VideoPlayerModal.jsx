import { useEffect, useRef, useState } from 'react'
import styles from './VideoPlayerModal.module.css'

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

function PlayBigIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}

function VolumeOnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  )
}

function VolumeMuteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>
  )
}

function FullscreenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    </svg>
  )
}

export default function VideoPlayerModal({ isOpen, onClose, movieTitle }) {
  const videoRef = useRef(null)
  const wrapperRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Reset player state when modal opens/closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsPlaying(false)
      setProgress(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"

  // Toggle play / pause by clicking anywhere on the video wrapper
  const handleWrapperClick = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  // Volume button – does NOT propagate to wrapper
  const handleVolumeToggle = (e) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  // Fullscreen button
  const handleFullscreen = (e) => {
    e.stopPropagation()
    const wrapper = wrapperRef.current
    if (!wrapper) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      wrapper.requestFullscreen().catch(() => {})
    }
  }

  // Progress scrubber click
  const handleProgressClick = (e) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    video.currentTime = ratio * duration
  }

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close Video Player">
          <CloseIcon />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.nowPlaying}>NOW PLAYING</span>
          <h2 className={styles.title}>{movieTitle}</h2>
        </div>

        {/* Video area */}
        <div
          ref={wrapperRef}
          className={styles.videoWrapper}
          onClick={handleWrapperClick}
        >
          <video
            ref={videoRef}
            className={styles.video}
            src={videoUrl}
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={() => {
              const video = videoRef.current
              if (video && video.duration) {
                setProgress((video.currentTime / video.duration) * 100)
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration)
            }}
          />

          {/* Center play/pause overlay — visible only when paused */}
          {!isPlaying && (
            <div className={styles.centerPlay}>
              <PlayBigIcon />
            </div>
          )}

          {/* Custom controls bar — stops click from bubbling to wrapper */}
          <div className={styles.controls} onClick={(e) => e.stopPropagation()}>
            {/* Progress bar */}
            <div className={styles.progressBar} onClick={handleProgressClick}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.controlsRow}>
              <span className={styles.timeLabel}>
                {formatTime(videoRef.current?.currentTime)} / {formatTime(duration)}
              </span>
              <div className={styles.controlsRight}>
                <button
                  className={styles.controlBtn}
                  onClick={handleVolumeToggle}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeMuteIcon /> : <VolumeOnIcon />}
                </button>
                <button
                  className={styles.controlBtn}
                  onClick={handleFullscreen}
                  aria-label="Fullscreen"
                >
                  <FullscreenIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
