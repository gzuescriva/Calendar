// Configuration globale
export const config = {
    holidays: [
        { month: 0, day: 1 },   // Nouvel An
        { month: 4, day: 1 },   // Fête du Travail
        { month: 4, day: 8 },   // Victoire 1945
        { month: 6, day: 14 },  // Fête Nationale
        { month: 11, day: 25 }  // Noël
    ],
    timeSlots: [
        "08:00 - 12:00",
        "09:00 - 13:00",
        "10:00 - 14:00", 
        "13:00 - 17:00",
        "14:00 - 18:00"
    ],
    paymentLink: "https://payment.automechpro.fr/pay/RDV-2023-05678",
    monthNames: [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ],
    dayNames: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    verificationCodeExpiry: 15 * 60 * 1000 // 15 minutes en millisecondes
};

/**
 * Formate une date selon les options spécifiées
 * @param {Date} date - Date à formater
 * @param {Object} options - Options de formatage
 * @returns {string} Date formatée
 */
export function formatDate(date, options = { weekday: 'long', day: 'numeric', month: 'long' }) {
    if (!(date instanceof Date)) {
        console.error('formatDate: Paramètre doit être un objet Date');
        return '';
    }
    return date.toLocaleDateString('fr-FR', options);
}

/**
 * Valide un formulaire et marque les champs invalides
 * @param {string} formId - ID du formulaire à valider 
 * @returns {boolean} True si le formulaire est valide
 */
export function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Formulaire ${formId} introuvable`);
        return false;
    }

    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

    inputs.forEach(input => {
        if (!input.value.trim()) {
            markAsInvalid(input);
            isValid = false;
        } else {
            markAsValid(input);
            
            // Validation spécifique pour les types
            if (input.type === 'email' && !isValidEmail(input.value)) {
                markAsInvalid(input);
                isValid = false;
            }
            
            if (input.id === 'siret' && !isValidSiret(input.value)) {
                markAsInvalid(input);
                isValid = false;
            }

            if (input.id === 'phone' && !isValidPhone(input.value)) {
                markAsInvalid(input);
                isValid = false;
            }
        }
    });

    return isValid;
}

/**
 * Valide une adresse email
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valide un numéro SIRET (simplifié)
 * @param {string} siret 
 * @returns {boolean}
 */ 
export function isValidSiret(siret) {
    return /^\d{14}$/.test(siret.replace(/\s/g, ''));
}

/**
 * Valide un numéro de téléphone français
 * @param {string} phone 
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    // Accepte les formats :
    // 0612345678
    // 06 12 34 56 78
    // 06.12.34.56.78
    // +33612345678
    const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return re.test(phone.replace(/[\s.-]/g, ''));
}

/**
 * Marque un champ comme invalide
 * @param {HTMLElement} input 
 */
export function markAsInvalid(input) {
    input.classList.add('border-red-500');
    input.classList.remove('border-gray-300');
    
    // Ajoute un message d'erreur si inexistant
    if (!input.nextElementSibling?.classList.contains('error-message')) {
        const errorMsg = document.createElement('p');
        errorMsg.className = 'error-message text-red-500 text-xs mt-1';
        
        // Message personnalisé selon le champ
        if (input.type === 'email') {
            errorMsg.textContent = 'Adresse email invalide';
        } else if (input.id === 'siret') {
            errorMsg.textContent = 'SIRET doit contenir 14 chiffres';
        } else if (input.id === 'phone') {
            errorMsg.textContent = 'Numéro de téléphone invalide';
        } else {
            errorMsg.textContent = 'Ce champ est obligatoire';
        }
        
        input.after(errorMsg);
    }
}

/**
 * Marque un champ comme valide
 * @param {HTMLElement} input 
 */ 
export function markAsValid(input) {
    input.classList.remove('border-red-500');
    input.classList.add('border-gray-300');
    
    // Supprime le message d'erreur
    if (input.nextElementSibling?.classList.contains('error-message')) {
        input.nextElementSibling.remove();
    }
}

/**
 * Génère une référence de rendez-vous unique
 * @returns {string}
 */
export function generateBookingReference() {
    const now = new Date();
    return `RDV-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
}

/**
 * Copie du texte dans le presse-papiers
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
        return false;
    }
}

/**
 * Vérifie si une date est un jour férié
 * @param {Date} date 
 * @returns {boolean}
 */
export function isHoliday(date) {
    return config.holidays.some(
        h => h.month === date.getMonth() && h.day === date.getDate()
    );
}

/**
 * Compare deux dates (sans l'heure)
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {boolean}
 */
export function isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

/**
 * Ajoute des jours à une date
 * @param {Date} date 
 * @param {number} days 
 * @returns {Date}
 */
export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Formate une durée en heures:minutes
 * @param {number} minutes 
 * @returns {string}
 */
export function formatDuration(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h${mins.toString().padStart(2, '0')}`;
}

/**
 * Envoie un code de vérification par email (simulé pour l'exemple)
 * @param {string} email 
 * @returns {Promise<{success: boolean, code?: string}>}
 */
export async function sendVerificationCode(email) {
    return new Promise(resolve => {
        setTimeout(() => {
            // Génère un code aléatoire à 6 chiffres
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // En production, vous enverriez réellement cet email
            console.log(`Code de vérification envoyé à ${email}: ${verificationCode}`);
            
            // 80% de chance de succès pour la démo
            if (Math.random() < 0.8) {
                resolve({ 
                    success: true, 
                    code: verificationCode,
                    expiresAt: Date.now() + config.verificationCodeExpiry
                });
            } else {
                resolve({ success: false });
            }
        }, 1500);
    });
}

/**
 * Simule l'envoi d'un email (pour démo)
 * @param {string} email 
 * @param {string} subject 
 * @param {string} body 
 * @returns {Promise<boolean>}
 */
export async function sendEmail(email, subject, body) {
    return new Promise(resolve => {
        setTimeout(() => {
            // 80% de chance de succès pour la démo
            resolve(Math.random() < 0.8);
        }, 1500);
    });
}

/**
 * Vérifie si un code de vérification est encore valide
 * @param {string} code 
 * @param {number} expiresAt 
 * @returns {boolean}
 */
export function isVerificationCodeValid(code, expiresAt) {
    return code && expiresAt && Date.now() < expiresAt;
}

/**
 * Génère le contenu d'un email de confirmation
 * @param {Object} bookingInfo 
 * @returns {string}
 */
export function generateConfirmationEmailContent(bookingInfo) {
    let datesList = '';
    bookingInfo.dates.forEach(date => {
        datesList += `- ${formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}\n`;
    });
    
    return `Bonjour ${bookingInfo.manager},

Votre rendez-vous avec AutoMech Pro a été confirmé avec succès.

Détails du rendez-vous:
- Garage: ${bookingInfo.garageName}
- Dates: 
${datesList}
- Horaire: ${bookingInfo.time}
- Référence: ${bookingInfo.reference}

Pour effectuer le paiement, veuillez cliquer sur le lien suivant:
${config.paymentLink}

Cordialement,
L'équipe AutoMech Pro`;
}