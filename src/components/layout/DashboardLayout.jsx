import TopNavbar from './TopNavbar.jsx'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.root}>
      <TopNavbar />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
