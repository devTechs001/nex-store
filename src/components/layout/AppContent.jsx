import { useAppStore } from '../../context/AppContext'
import { HomePage } from '../../pages/Home'
import { ExplorePage } from '../../pages/Explore'
import { DownloadsPage } from '../../pages/Downloads'
import { ProfilePage } from '../../pages/Profile'
import { SettingsPage } from '../../pages/Settings'

const AppContent = ({ activePage, setSelectedApp, filters, setFilters }) => {
  const { apps } = useAppStore()

  const handleAppClick = (app) => {
    setSelectedApp(app)
  }

  switch (activePage) {
    case 'home':
      return <HomePage apps={apps} onAppClick={handleAppClick} />
    case 'explore':
      return <ExplorePage apps={apps} onAppClick={handleAppClick} filters={filters} setFilters={setFilters} />
    case 'downloads':
      return <DownloadsPage onAppClick={handleAppClick} />
    case 'profile':
      return <ProfilePage />
    case 'settings':
      return <SettingsPage />
    default:
      return <HomePage apps={apps} onAppClick={handleAppClick} />
  }
}

export default AppContent
