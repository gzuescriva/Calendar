import { initBookingSteps } from './booking-steps.js';
import { initCalendar } from './calendar.js';
import { initModal } from './modal.js';
import { config } from './utils.js';

// État global de l'application
const appState = {
    currentView: 'booking',
    isLoading: false,
    bookingData: null,
    userPreferences: {
        prefersDarkMode: matchMedia('(prefers-color-scheme: dark)').matches,
        locale: navigator.language || 'fr-FR'
    }
};

// Initialise l'application
export async function initApp() {
    try {
        setLoadingState(true);
        
        // Initialise d'abord les étapes de réservation
        initBookingSteps();
        
        // Puis initialise le calendrier (qui sera utilisé dans l'étape 2)
        initCalendar();
        
        // Enfin initialise la modal
        initModal();
        
        // Configure les écouteurs d'événements globaux
        setupGlobalEventListeners();
        
        // Applique les préférences utilisateur
        applyUserPreferences();
        
        console.log('Application initialisée avec configuration :', config);
    } catch (error) {
        console.error('Erreur lors de l\'initialisation :', error);
        showErrorScreen();
    } finally {
        setLoadingState(false);
    }
}

// Gère les préférences utilisateur
function applyUserPreferences() {
    const { prefersDarkMode } = appState.userPreferences;
    
    if (prefersDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    document.documentElement.lang = appState.userPreferences.locale;
}

// Configure les écouteurs d'événements globaux
function setupGlobalEventListeners() {
    // Détection du changement de mode sombre
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        appState.userPreferences.prefersDarkMode = e.matches;
        applyUserPreferences();
    });
    
    // Gestion de la taille de l'écran
    window.addEventListener('resize', handleWindowResize);
    
    // Gestion des clics en dehors des éléments
    document.addEventListener('click', handleDocumentClick);
}

function handleWindowResize() {
    // Optimisation pour mobile/desktop
    if (window.innerWidth < 768 && appState.currentView !== 'mobile') {
        switchToMobileView();
    } else if (window.innerWidth >= 768 && appState.currentView === 'mobile') {
        switchToDesktopView();
    }
}

function handleDocumentClick(e) {
    // Fermeture des menus déroulants si clic à l'extérieur
    const dropdowns = document.querySelectorAll('.dropdown.open');
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

function switchToMobileView() {
    appState.currentView = 'mobile';
    console.log('Passage en vue mobile');
    // Ici vous pourriez ajouter des adaptations spécifiques mobile
}

function switchToDesktopView() {
    appState.currentView = 'desktop';
    console.log('Passage en vue desktop');
    // Ici vous pourriez annuler les adaptations mobiles
}

function setLoadingState(isLoading) {
    appState.isLoading = isLoading;
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = isLoading ? 'block' : 'none';
    }
}

function showErrorScreen() {
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.innerHTML = `
            <div class="error-container">
                <h2>Une erreur est survenue</h2>
                <p>Nous ne pouvons pas charger l'application pour le moment.</p>
                <button id="retry-button" class="btn-retry">
                    Réessayer
                </button>
            </div>
        `;
        
        document.getElementById('retry-button').addEventListener('click', initApp);
    }
}

// Export pour les tests ou utilisation avancée
export { appState };

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Ajoute un loader global si inexistant
    if (!document.getElementById('global-loader')) {
        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
        loader.innerHTML = `
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        `;
        document.body.appendChild(loader);
    }
    
    initApp();
});