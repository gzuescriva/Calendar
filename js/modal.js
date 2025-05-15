import { config, formatDate, generateBookingReference, copyToClipboard, sendEmail } from './utils.js';
import { getSelectedDates, getSelectedTime } from './calendar.js';
import { bookingState } from './booking-steps.js';

export function initModal() {
    renderModalContent();
    setupModalEvents();
}

function renderModalContent() {
    const modalHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div class="p-6">
                <div class="text-center mb-6">
                    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <i class="fas fa-check text-green-600 text-xl"></i>
                    </div>
                    <h3 id="modalTitle" class="text-lg font-medium text-gray-900 mb-2">Réservation confirmée !</h3>
                    <div id="modalMessage" class="text-sm text-gray-500">
                        Votre rendez-vous a été enregistré avec succès.
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-md mb-6">
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">Référence:</span>
                        <span id="bookingReference" class="font-mono font-medium">${generateBookingReference()}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">Garage:</span>
                        <span id="modalGarage" class="font-medium">${bookingState.garageInfo?.name || ''}</span>
                    </div>
                    <div class="mb-2">
                        <span class="text-gray-600">Dates:</span>
                        <div id="modalDates" class="font-medium mt-1 space-y-1"></div>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Horaire:</span>
                        <span id="modalTime" class="font-medium">${getSelectedTime() || ''}</span>
                    </div>
                </div>

                <div class="mb-6">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Lien de paiement sécurisé:</h4>
                    <div class="flex">
                        <input type="text" id="paymentLink" readonly 
                            value="${config.paymentLink}" 
                            class="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <button id="copyPaymentLink" 
                            class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                            <i class="fas fa-copy mr-1"></i> Copier
                        </button>
                    </div>
                    <p class="mt-2 text-xs text-gray-500">Valable 7 jours</p>
                </div>

                <div class="bg-blue-50 p-4 rounded-md mb-6">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-blue-600 mt-1 mr-2"></i>
                        <div>
                            <p class="text-sm text-gray-700">
                                Un email de confirmation avec le lien de paiement a été envoyé à <span class="font-medium">${bookingState.garageInfo?.email || ''}</span>.
                            </p>
                            <button id="resendEmail" class="text-blue-600 hover:text-blue-800 text-sm mt-2">
                                <i class="fas fa-paper-plane mr-1"></i> Renvoyer l'email
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end space-x-3">
                    <button id="closeSuccessModal" type="button" 
                        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Fermer
                    </button>
                    <a href="${config.paymentLink}" target="_blank" 
                        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Payer maintenant
                    </a>
                </div>
            </div>
        </div>
    `;
    document.getElementById('successModal').innerHTML = modalHTML;
    updateModalDetails();
}

function setupModalEvents() {
    document.getElementById('confirmBooking')?.addEventListener('click', confirmBooking);
    document.getElementById('resendEmail')?.addEventListener('click', resendEmail);
    document.getElementById('copyPaymentLink')?.addEventListener('click', copyPaymentLink);
    document.getElementById('closeSuccessModal')?.addEventListener('click', closeSuccessModal);
}

function updateModalDetails() {
    // Mise à jour des dates dans la modal
    const datesContainer = document.getElementById('modalDates');
    if (datesContainer) {
        let datesHTML = '';
        getSelectedDates().forEach(date => {
            datesHTML += `<div>• ${formatDate(date)}</div>`;
        });
        datesContainer.innerHTML = datesHTML;
    }
}

async function confirmBooking() {
    try {
        // Ici vous pourriez ajouter un appel API pour enregistrer la réservation
        // Pour l'exemple, nous simulons juste l'affichage de la modal
        
        // Afficher la modal
        document.getElementById('successModal').classList.remove('hidden');
        
        // Vous pourriez aussi envoyer un email de confirmation ici
        if (bookingState.garageInfo?.email) {
            await sendConfirmationEmail();
        }
    } catch (error) {
        console.error('Erreur lors de la confirmation:', error);
        alert('Une erreur est survenue lors de la confirmation du rendez-vous.');
    }
}

async function sendConfirmationEmail() {
    const emailSent = await sendEmail(
        bookingState.garageInfo.email,
        'Confirmation de votre rendez-vous AutoMech Pro',
        generateEmailContent()
    );
    
    if (!emailSent) {
        console.warn("L'email de confirmation n'a pas pu être envoyé");
    }
}

function generateEmailContent() {
    let datesList = '';
    getSelectedDates().forEach(date => {
        datesList += `- ${formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}\n`;
    });
    
    return `Bonjour ${bookingState.garageInfo.manager},

Votre rendez-vous avec AutoMech Pro a été confirmé avec succès.

Détails du rendez-vous:
- Garage: ${bookingState.garageInfo.name}
- Dates: 
${datesList}
- Horaire: ${getSelectedTime()}
- Référence: ${document.getElementById('bookingReference').textContent}

Pour effectuer le paiement, veuillez cliquer sur le lien suivant:
${config.paymentLink}

Cordialement,
L'équipe AutoMech Pro`;
}

async function resendEmail() {
    const resendBtn = document.getElementById('resendEmail');
    const originalText = resendBtn.innerHTML;
    
    try {
        resendBtn.disabled = true;
        resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Envoi...';
        
        const emailSent = await sendConfirmationEmail();
        
        if (emailSent) {
            // Animation de succès
            resendBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Envoyé !';
            setTimeout(() => {
                resendBtn.innerHTML = originalText;
                resendBtn.disabled = false;
            }, 2000);
        } else {
            throw new Error("Échec de l'envoi");
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
        resendBtn.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i> Erreur';
        setTimeout(() => {
            resendBtn.innerHTML = originalText;
            resendBtn.disabled = false;
        }, 2000);
    }
}

async function copyPaymentLink() {
    const copyBtn = document.getElementById('copyPaymentLink');
    const originalText = copyBtn.innerHTML;
    
    try {
        const success = await copyToClipboard(config.paymentLink);
        
        if (success) {
            copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Copié !';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }
    } catch (error) {
        console.error("Erreur lors de la copie:", error);
        copyBtn.innerHTML = '<i class="fas fa-times mr-1"></i> Erreur';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
}