// src/services/i18n.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.downloads': 'Downloads',
    'nav.favorites': 'Favorites',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.upload': 'Upload App',
    'nav.collections': 'Collections',
    
    // Common
    'common.search': 'Search',
    'common.filter': 'Filters',
    'common.sort': 'Sort',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.loading': 'Loading...',
    'common.noResults': 'No results found',
    'common.seeAll': 'See All',
    'common.install': 'Install',
    'common.installed': 'Installed',
    'common.free': 'Free',
    'common.getApp': 'Get App',
    'common.viewDetails': 'View Details',
    
    // Home
    'home.hero.title': 'Your Universal',
    'home.hero.titleHighlight': 'App Store',
    'home.hero.subtitle': 'Discover and download apps for any platform. From web to desktop, mobile to CLI tools.',
    'home.featured': 'Featured Apps',
    'home.newReleases': 'New Releases',
    'home.topRated': 'Top Rated',
    'home.categories': 'Categories',
    
    // Explore
    'explore.title': 'Explore Apps',
    'explore.searchPlaceholder': 'Search apps, tools, libraries...',
    'explore.appsFound': '{count} apps found',
    'explore.noApps': 'No apps found',
    'explore.adjustFilters': 'Try adjusting your search or filters',
    
    // App Detail
    'app.about': 'About this app',
    'app.features': 'Key Features',
    'app.screenshots': 'Screenshots',
    'app.reviews': 'User Reviews',
    'app.writeReview': 'Write Review',
    'app.requirements': 'System Requirements',
    'app.changelog': 'Changelog',
    'app.relatedApps': 'Related Apps',
    'app.developer': 'Developer',
    'app.version': 'Version',
    'app.size': 'Size',
    'app.rating': 'Rating',
    'app.downloads': 'Downloads',
    'app.platforms': 'Platforms',
    'app.license': 'License',
    'app.lastUpdate': 'Last Updated',
    
    // Downloads
    'downloads.title': 'Downloads',
    'downloads.empty': 'No downloads yet',
    'downloads.emptyDesc': 'Apps you download will appear here',
    'downloads.clearAll': 'Clear All',
    
    // Auth
    'auth.login': 'Sign In',
    'auth.register': 'Sign Up',
    'auth.logout': 'Sign Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.welcomeBack': 'Welcome back',
    'auth.createAccount': 'Create account',
    
    // Settings
    'settings.title': 'Settings',
    'settings.preferences': 'Preferences',
    'settings.notifications': 'Push Notifications',
    'settings.autoUpdate': 'Auto Update',
    'settings.darkMode': 'Dark Mode',
    'settings.language': 'Language',
    'settings.storage': 'Storage',
    'settings.clearCache': 'Clear Cache',
    'settings.about': 'About',
    'settings.dangerZone': 'Danger Zone',
    'settings.deleteAccount': 'Delete Account',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.explore': 'Explorar',
    'nav.downloads': 'Descargas',
    'nav.favorites': 'Favoritos',
    'nav.profile': 'Perfil',
    'nav.settings': 'Ajustes',
    'nav.upload': 'Subir App',
    'nav.collections': 'Colecciones',
    'common.search': 'Buscar',
    'common.filter': 'Filtros',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.close': 'Cerrar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.loading': 'Cargando...',
    'common.noResults': 'Sin resultados',
    'common.seeAll': 'Ver Todo',
    'common.install': 'Instalar',
    'common.installed': 'Instalado',
    'common.free': 'Gratis',
    'common.getApp': 'Obtener',
    'home.hero.title': 'Tu Tienda de',
    'home.hero.titleHighlight': 'Aplicaciones',
    'home.hero.subtitle': 'Descubre y descarga aplicaciones para cualquier plataforma.',
    'home.featured': 'Apps Destacadas',
    'home.newReleases': 'Nuevos Lanzamientos',
    'home.topRated': 'Mejor Valoradas',
    'explore.title': 'Explorar Apps',
    'explore.searchPlaceholder': 'Buscar apps, herramientas...',
    'downloads.title': 'Descargas',
    'downloads.empty': 'Sin descargas aún',
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Registrarse',
    'auth.logout': 'Cerrar Sesión',
    'settings.title': 'Ajustes',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.explore': 'Explorer',
    'nav.downloads': 'Téléchargements',
    'nav.favorites': 'Favoris',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'common.search': 'Rechercher',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.loading': 'Chargement...',
    'common.install': 'Installer',
    'common.free': 'Gratuit',
    'home.hero.title': 'Votre Magasin',
    'home.hero.titleHighlight': "d'Applications",
    'explore.title': 'Explorer les Apps',
    'downloads.title': 'Téléchargements',
    'auth.login': 'Connexion',
    'auth.register': "S'inscrire",
    'settings.title': 'Paramètres',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.explore': 'Entdecken',
    'nav.downloads': 'Downloads',
    'nav.favorites': 'Favoriten',
    'nav.profile': 'Profil',
    'nav.settings': 'Einstellungen',
    'common.search': 'Suchen',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.install': 'Installieren',
    'common.free': 'Kostenlos',
    'home.hero.title': 'Ihr Universeller',
    'home.hero.titleHighlight': 'App Store',
    'explore.title': 'Apps Entdecken',
    'downloads.title': 'Downloads',
    'auth.login': 'Anmelden',
    'auth.register': 'Registrieren',
    'settings.title': 'Einstellungen',
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.explore': '探索',
    'nav.downloads': 'ダウンロード',
    'nav.favorites': 'お気に入り',
    'nav.profile': 'プロフィール',
    'nav.settings': '設定',
    'common.search': '検索',
    'common.install': 'インストール',
    'common.free': '無料',
    'home.hero.title': 'ユニバーサル',
    'home.hero.titleHighlight': 'アプリストア',
    'explore.title': 'アプリを探索',
    'downloads.title': 'ダウンロード',
    'auth.login': 'ログイン',
    'settings.title': '設定',
  },
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
]

export const useI18n = create(
  persist(
    (set, get) => ({
      locale: 'en',
      
      setLocale: (locale) => {
        set({ locale })
        document.documentElement.lang = locale
      },

      t: (key, params = {}) => {
        const { locale } = get()
        let text = translations[locale]?.[key] || translations.en[key] || key

        // Replace params {count} etc.
        Object.entries(params).forEach(([param, value]) => {
          text = text.replace(`{${param}}`, value)
        })

        return text
      },

      getLocale: () => get().locale,
      getSupportedLanguages: () => SUPPORTED_LANGUAGES,
    }),
    { name: 'i18n-storage' }
  )
)

// Hook alias
export const useTranslation = () => {
  const { t, locale, setLocale, getSupportedLanguages } = useI18n()
  return { t, locale, setLocale, languages: getSupportedLanguages() }
}