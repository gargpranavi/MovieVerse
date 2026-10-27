/*
  MovieDetailsTabs.jsx — Member 3
  Accessible tabbed navigation for MovieDetailsPage.
  Tabs: Overview | Cast & Crew | Trailers & Media | User Reviews & Ratings
  Uses useState for active tab, ARIA tablist/tab/tabpanel semantics,
  and keyboard Left/Right arrow navigation.
*/
import { useState, useRef } from 'react'
import styles from './MovieDetailsTabs.module.css'

const TAB_LIST = [
  { id: 'overview',  label: 'Overview' },
  { id: 'cast',      label: 'Cast & Crew' },
  { id: 'trailers',  label: 'Trailers & Media' },
  { id: 'reviews',   label: 'User Reviews & Ratings' },
]

export default function MovieDetailsTabs({ activeTab, onTabChange }) {
  const tabsRef = useRef(null)

  // Handle arrow key navigation between tabs
  const handleKeyDown = (e, currentIndex) => {
    let nextIndex = currentIndex
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % TAB_LIST.length
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + TAB_LIST.length) % TAB_LIST.length
    } else {
      return // Not an arrow key — do nothing
    }
    e.preventDefault()
    // Move focus to the next tab button
    const buttons = tabsRef.current?.querySelectorAll('[role="tab"]')
    if (buttons) buttons[nextIndex]?.focus()
    onTabChange(TAB_LIST[nextIndex].id)
  }

  return (
    <div
      className={styles.tabsBar}
      role="tablist"
      aria-label="Movie detail sections"
      ref={tabsRef}
    >
      {TAB_LIST.map((tab, idx) => (
        <button
          key={tab.id}
          id={`details-tab-${tab.id}`}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`details-panel-${tab.id}`}
          className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
          onClick={() => onTabChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          // Tabindex: only the active tab is in the normal tab order
          tabIndex={activeTab === tab.id ? 0 : -1}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
