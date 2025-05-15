import { initCalendar, getSelectedDates, getSelectedTime } from './calendar.js';
import { config, formatDate, validateForm, isValidEmail, sendVerificationCode, markAsInvalid, markAsValid } from './utils.js';

// État global des étapes de réservation
const bookingState = {
    currentStep: 1,
    garageInfo: null,
    selectedDates: [],
    selectedTime: null
};

// État de vérification email
const verificationState = {
    emailVerified: false,
    verificationCode: null,
    attempts: 0,
    lastSent: null
};

// Initialise toutes les étapes de réservation
export function initBookingSteps() {
    renderAllSteps();
    setupStepNavigation();
    setupFormValidation();
    initCalendar();
    setupCalendarEventListeners();
}

// Rendu des trois étapes
function renderAllSteps() {
    const bookingSteps = document.getElementById('bookingSteps');
    bookingSteps.innerHTML = `
        ${renderStep1()}
        ${renderStep2()}
        ${renderStep3()}
    `;
    
    // Masquer toutes les étapes sauf la première
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('step1').classList.remove('hidden');
}

/* ===== RENDU DES ÉTAPES ===== */

function renderStep1() {
    return `
     <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto md:mx-0" id="step1">
        <div class="flex items-center mb-4">
            <div class="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span class="font-bold">1</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800">Informations garage</h3>
        </div>
        
        <form id="garageForm">
            ${renderFormField('garageName', 'Nom du garage*', 'text')}
            ${renderFormField('managerName', 'Responsable*', 'text')}
            ${renderFormField('address', 'Adresse*', 'text')}
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                ${renderFormField('postalCode', 'Code postal*', 'text', 'half')}
                ${renderFormField('city', 'Ville*', 'text', 'half')}
            </div>
            
            ${renderFormField('phone', 'Téléphone*', 'tel')}
            ${renderFormField('siret', 'N° SIRET*', 'text')}
            
            <!-- Champ email avec vérification -->
            <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                <div class="flex">
                    <input type="email" id="email" required 
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500">
                    <button type="button" id="verifyEmailBtn" 
                        class="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Vérifier
                    </button>
                </div>
                <p id="emailError" class="text-red-500 text-xs mt-1 hidden"></p>
            </div>
            
            <!-- Champ de code de vérification -->
            <div id="verificationCodeContainer" class="hidden mb-4">
                <label for="verificationCode" class="block text-sm font-medium text-gray-700 mb-1">Code de vérification</label>
                <div class="flex">
                    <input type="text" id="verificationCode" maxlength="6"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Entrez le code reçu par email">
                    <button type="button" id="submitVerificationBtn" 
                        class="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Valider
                    </button>
                </div>
                <p id="verificationStatus" class="text-sm mt-1"></p>
                <p id="verificationTimer" class="text-xs text-gray-500 mt-1 hidden"></p>
            </div>
            
            <div class="flex justify-end">
                <button type="button" id="nextStep1" class="btn-primary" disabled>
                    Suivant <i class="fas fa-arrow-right ml-2"></i>
                </button>
            </div>
        </form>
    </div>
    `;
}

function renderStep2() {
    return `
    <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto md:mx-0 hidden" id="step2">
        <div class="flex items-center mb-4">
            <div class="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span class="font-bold">2</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800">Sélectionnez vos créneaux</h3>
        </div>
        
        ${renderCalendarLegend()}
        ${renderCalendarHeader()}
        <div id="calendarDays" class="grid grid-cols-7 gap-2"></div>
        
        <div id="timeSlotsContainer" class="hidden">
            <h4 class="text-md font-semibold text-gray-800 mb-3">Créneaux disponibles</h4>
            <div id="selectedDatesList" class="mb-4"></div>
            <div id="timeSlots" class="grid grid-cols-2 gap-3 mb-6"></div>
            
            <div class="flex justify-between">
                <button type="button" id="prevStep2" class="btn-secondary">
                    <i class="fas fa-arrow-left mr-2"></i> Retour
                </button>
                <button type="button" id="nextStep2" class="btn-primary" disabled>
                    Suivant <i class="fas fa-arrow-right ml-2"></i>
                </button>
            </div>
        </div>
    </div>
    `;
}

function renderStep3() {
    return `
    <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto md:mx-0 hidden" id="step3">
        <div class="flex items-center mb-4">
            <div class="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span class="font-bold">3</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800">Confirmation</h3>
        </div>
        
        <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-800 mb-3">Récapitulatif</h4>
            
            <div class="bg-gray-50 p-4 rounded-md mb-4">
                ${renderSummaryItem('Garage:', 'confirmGarage')}
                ${renderSummaryItem('Responsable:', 'confirmManager')}
                <div class="mb-2">
                    <span class="text-gray-600">Dates sélectionnées:</span>
                    <div id="confirmDates" class="font-medium mt-1 space-y-1"></div>
                </div>
                ${renderSummaryItem('Horaire:', 'confirmTime')}
                ${renderSummaryItem('Prestation:', '', 'Forfait journée 7 heures')}
            </div>

            ${renderInfoBox()}
            
            ${renderTermsCheckbox()}
            
            <div class="flex justify-between">
                <button type="button" id="prevStep3" class="btn-secondary">
                    <i class="fas fa-arrow-left mr-2"></i> Retour
                </button>
                <button type="button" id="confirmBooking" class="btn-primary" disabled>
                    Confirmer <i class="fas fa-check ml-2"></i>
                </button>
            </div>
        </div>
    </div>
    `;
}

/* ===== FONCTIONS UTILITAIRES DE RENDU ===== */

function renderFormField(id, label, type, size = 'full') {
    return `
    <div class="${size === 'half' ? '' : 'mb-4'}">
        <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
        <input type="${type}" id="${id}" required 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
    </div>
    `;
}

function renderCalendarLegend() {
    return `
    <div class="mb-4">
        <div class="flex items-center mb-2">
            <div class="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span class="text-sm">Jours sélectionnés</span>
        </div>
        <div class="flex items-center mb-2">
            <div class="w-4 h-4 bg-gray-200 rounded mr-2 border border-gray-300"></div>
            <span class="text-sm">Jours non disponibles</span>
        </div>
        <div class="flex items-center">
            <div class="w-4 h-4 border border-blue-500 rounded mr-2 bg-white"></div>
            <span class="text-sm">Aujourd'hui</span>
        </div>
    </div>
    `;
}

function renderCalendarHeader() {
    return `
    <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
            <button id="prevMonth" class="text-blue-600 hover:text-blue-800">
                <i class="fas fa-chevron-left"></i>
            </button>
            <h4 id="currentMonth" class="text-lg font-semibold text-gray-800">Mois 2023</h4>
            <button id="nextMonth" class="text-blue-600 hover:text-blue-800">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        
        <div class="grid grid-cols-7 gap-2 mb-2">
            ${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
                .map(day => `<div class="text-center font-medium text-sm text-gray-500">${day}</div>`)
                .join('')}
        </div>
    </div>
    `;
}

function renderSummaryItem(label, id, staticValue = '') {
    return `
    <div class="flex justify-between mb-2">
        <span class="text-gray-600">${label}</span>
        <span ${id ? `id="${id}"` : ''} class="font-medium">${staticValue}</span>
    </div>
    `;
}

function renderInfoBox() {
    return `
    <div class="bg-blue-50 p-4 rounded-md mb-4">
        <div class="flex items-start">
            <i class="fas fa-info-circle text-blue-600 mt-1 mr-2"></i>
            <div>
                <p class="text-sm text-gray-700">
                    Un lien de paiement sécurisé vous sera envoyé par email.
                    Paiement requis dans les 7 jours pour confirmer votre réservation.
                </p>
            </div>
        </div>
    </div>
    `;
}

function renderTermsCheckbox() {
    return `
    <div class="mb-6">
        <label class="flex items-center">
            <input type="checkbox" id="termsCheck" class="rounded text-blue-600 focus:ring-blue-500">
            <span class="ml-2 text-sm text-gray-700">J'accepte les <a href="#" class="text-blue-600 hover:underline">conditions générales</a></span>
        </label>
    </div>
    `;
}

/* ===== GESTION DE LA VÉRIFICATION EMAIL ===== */

async function verifyEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    const verifyBtn = document.getElementById('verifyEmailBtn');
    const emailError = document.getElementById('emailError');
    
    // Réinitialiser les messages d'erreur
    emailError.classList.add('hidden');
    markAsValid(emailInput);
    
    if (!isValidEmail(email)) {
        emailError.textContent = 'Veuillez entrer une adresse email valide';
        emailError.classList.remove('hidden');
        markAsInvalid(emailInput);
        return;
    }

    // Désactiver le bouton pendant l'envoi
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Envoi...';
    
    try {
        const { success, code } = await sendVerificationCode(email);
        
        if (success) {
            verificationState.verificationCode = code;
            verificationState.lastSent = new Date();
            document.getElementById('verificationCodeContainer').classList.remove('hidden');
            document.getElementById('verificationStatus').textContent = 'Code envoyé à votre adresse email';
            document.getElementById('verificationStatus').className = 'text-sm mt-1 text-green-600';
            
            // Démarrer le compte à rebours pour renvoyer le code
            startResendTimer();
        } else {
            document.getElementById('verificationStatus').textContent = "Échec de l'envoi du code. Veuillez réessayer.";
            document.getElementById('verificationStatus').className = 'text-sm mt-1 text-red-600';
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi du code:", error);
        document.getElementById('verificationStatus').textContent = "Une erreur est survenue. Veuillez réessayer.";
        document.getElementById('verificationStatus').className = 'text-sm mt-1 text-red-600';
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Renvoyer';
    }
}

function startResendTimer() {
    const timerElement = document.getElementById('verificationTimer');
    let timeLeft = 60; // 60 secondes avant de pouvoir renvoyer
    
    timerElement.classList.remove('hidden');
    timerElement.textContent = `Vous pourrez demander un nouveau code dans ${timeLeft} secondes`;
    
    const timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Vous pourrez demander un nouveau code dans ${timeLeft} secondes`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            timerElement.classList.add('hidden');
            document.getElementById('verifyEmailBtn').disabled = false;
        }
    }, 1000);
}
function submitVerificationCode() {
    const userCode = document.getElementById('verificationCode').value.trim();
    const statusElement = document.getElementById('verificationStatus');
    const submitBtn = document.getElementById('submitVerificationBtn');
    
    // Validation basique du code
    if (!userCode || userCode.length !== 6) {
        statusElement.textContent = 'Veuillez entrer un code à 6 chiffres';
        statusElement.className = 'text-sm mt-1 text-red-600';
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Vérification...';
    
    // Simuler un délai de vérification
    setTimeout(() => {
        verificationState.attempts++;
        
        // verificationState.verificationCode)
        if (userCode === verificationState.verificationCode) {
            verificationState.emailVerified = true;
            statusElement.textContent = 'Email vérifié avec succès !';
            statusElement.className = 'text-sm mt-1 text-green-600';
            document.getElementById('nextStep1').disabled = false;
            document.getElementById('email').readOnly = true;
            document.getElementById('verifyEmailBtn').disabled = true;
        } else {
            statusElement.textContent = `Code incorrect. Tentative ${verificationState.attempts}/3`;
            statusElement.className = 'text-sm mt-1 text-red-600';
            
            if (verificationState.attempts >= 3) {
                document.getElementById('verificationCode').disabled = true;
                submitBtn.disabled = true;
                statusElement.textContent += ' - Trop de tentatives, veuillez demander un nouveau code';
            }
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Valider';
    }, 1000);
}

function resetEmailVerification() {
    if (verificationState.emailVerified) return;
    
    verificationState.emailVerified = false;
    verificationState.verificationCode = null;
    verificationState.attempts = 0;
    
    document.getElementById('nextStep1').disabled = true;
    document.getElementById('verificationCodeContainer').classList.add('hidden');
    document.getElementById('verificationCode').value = '';
    document.getElementById('verificationStatus').textContent = '';
    document.getElementById('verifyEmailBtn').textContent = 'Vérifier';
    document.getElementById('verificationTimer').classList.add('hidden');
}

/* ===== GESTION DES ÉVÉNEMENTS ===== */

function setupStepNavigation() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'nextStep1') handleNextStep1();
        if (e.target.id === 'prevStep2') handlePrevStep2();
        if (e.target.id === 'nextStep2') handleNextStep2();
        if (e.target.id === 'prevStep3') handlePrevStep3();
    });
}

function setupFormValidation() {
    // Validation des CGU
    document.getElementById('termsCheck')?.addEventListener('change', (e) => {
        document.getElementById('confirmBooking').disabled = !e.target.checked;
    });

    // Écouteurs pour la vérification email
    document.getElementById('verifyEmailBtn')?.addEventListener('click', verifyEmail);
    document.getElementById('submitVerificationBtn')?.addEventListener('click', submitVerificationCode);
    document.getElementById('email')?.addEventListener('input', resetEmailVerification);
    
    // Validation en temps réel du format email
    document.getElementById('email')?.addEventListener('blur', function() {
        if (!isValidEmail(this.value.trim())) {
            document.getElementById('emailError').textContent = 'Veuillez entrer une adresse email valide';
            document.getElementById('emailError').classList.remove('hidden');
            markAsInvalid(this);
        } else {
            document.getElementById('emailError').classList.add('hidden');
            markAsValid(this);
        }
    });
}

function setupCalendarEventListeners() {
    // Cette fonction serait implémentée dans calendar.js
}

/* ===== GESTION DES ÉTAPES ===== */

function handleNextStep1() {
    if (!verificationState.emailVerified) {
        alert('Veuillez vérifier votre adresse email avant de continuer');
        return;
    }

    if (validateForm('garageForm')) {
        saveGarageInfo();
        switchStep(1, 2);
    }
}

function handlePrevStep2() {
    switchStep(2, 1);
}

function handleNextStep2() {
    const selectedDates = getSelectedDates();
    const selectedTime = getSelectedTime();
    
    if (selectedDates.length > 0 && selectedTime) {
        updateConfirmationDetails();
        switchStep(2, 3);
    } else {
        alert('Veuillez sélectionner au moins une date et un créneau horaire');
    }
}

function handlePrevStep3() {
    switchStep(3, 2);
}

/* ===== FONCTIONS DE GESTION ===== */

function saveGarageInfo() {
    bookingState.garageInfo = {
        name: document.getElementById('garageName').value,
        manager: document.getElementById('managerName').value,
        address: document.getElementById('address').value,
        postalCode: document.getElementById('postalCode').value,
        city: document.getElementById('city').value,
        phone: document.getElementById('phone').value,
        siret: document.getElementById('siret').value,
        email: document.getElementById('email').value,
        emailVerified: verificationState.emailVerified
    };
}

function updateConfirmationDetails() {
    const selectedDates = getSelectedDates();
    const selectedTime = getSelectedTime();

    document.getElementById('confirmGarage').textContent = bookingState.garageInfo.name;
    document.getElementById('confirmManager').textContent = bookingState.garageInfo.manager;
    
    let datesHTML = '';
    selectedDates.forEach(date => {
        datesHTML += `<div>• ${formatDate(date)}</div>`;
    });
    document.getElementById('confirmDates').innerHTML = datesHTML;
    
    document.getElementById('confirmTime').textContent = selectedTime;
}

function switchStep(from, to) {
    document.getElementById(`step${from}`).classList.add('hidden');
    document.getElementById(`step${to}`).classList.remove('hidden');
    bookingState.currentStep = to;
    
    // Scroll vers le haut pour une meilleure expérience utilisateur
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Export pour les autres modules
export { bookingState };