import { config, formatDate, isSameDate } from './utils.js';

// État du calendrier
const calendarState = {
    currentDate: new Date(),
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDates: [],
    selectedTime: null
};

// Initialisation du calendrier
export function initCalendar() {
    renderCalendar();
    setupCalendarEventListeners();
}

// Rendu complet du calendrier
function renderCalendar() {
    renderCalendarHeader();
    renderCalendarDays();
    setupDayEventListeners();
    updateTimeSlotsVisibility();
}

// En-tête du calendrier (mois + navigation)
function renderCalendarHeader() {
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
                       "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    document.getElementById('currentMonth').textContent = 
        `${monthNames[calendarState.currentMonth]} ${calendarState.currentYear}`;
}

// Rendu des jours du mois
function renderCalendarDays() {
    const firstDay = new Date(calendarState.currentYear, calendarState.currentMonth, 1).getDay();
    const daysInMonth = new Date(calendarState.currentYear, calendarState.currentMonth + 1, 0).getDate();
    
    let daysHTML = '';
    
    // Jours vides en début de mois (alignement)
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
        daysHTML += '<div class="h-10"></div>';
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
        daysHTML += renderCalendarDay(day);
    }
    
    document.getElementById('calendarDays').innerHTML = daysHTML;
}

// Rendu d'un jour individuel
function renderCalendarDay(day) {
    const dayDate = new Date(calendarState.currentYear, calendarState.currentMonth, day);
    const isToday = isSameDate(dayDate, calendarState.currentDate);
    const isPast = dayDate < calendarState.currentDate && !isToday;
    const isHoliday = isHolidayDate(dayDate);
    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
    const isSelected = isDateSelected(dayDate);

    let dayClass = "calendar-day h-10 flex items-center justify-center rounded-md cursor-pointer border";

    // Application des classes CSS en fonction de l'état
    if (isToday) {
        dayClass += " border-blue-500 font-bold";
    } else if (isPast || isHoliday || isWeekend) {
        dayClass += " disabled border-gray-200 cursor-not-allowed";
    } else if (isSelected) {
        dayClass += " selected bg-blue-600 text-white border-blue-700";
    } else {
        dayClass += " border-gray-200 hover:bg-blue-50 hover:border-blue-300";
    }

    return `<div class="${dayClass}" data-day="${day}">${day}</div>`;
}

// Configuration des écouteurs d'événements
function setupCalendarEventListeners() {
    // Navigation entre mois
    document.getElementById('prevMonth').addEventListener('click', goToPreviousMonth);
    document.getElementById('nextMonth').addEventListener('click', goToNextMonth);
}

function setupDayEventListeners() {
    document.querySelectorAll('.calendar-day:not(.disabled)').forEach(dayElement => {
        dayElement.addEventListener('click', handleDayClick);
    });
}

// Gestion du clic sur un jour
function handleDayClick(e) {
    const day = parseInt(e.currentTarget.dataset.day);
    const dayDate = new Date(calendarState.currentYear, calendarState.currentMonth, day);
    
    // Basculer la sélection du jour
    toggleDateSelection(dayDate);
    
    // Re-rendre le calendrier pour afficher les changements
    renderCalendar();
    
    // Afficher/masquer les créneaux horaires
    updateTimeSlotsVisibility();
}

// Navigation entre mois
function goToPreviousMonth() {
    calendarState.currentMonth--;
    if (calendarState.currentMonth < 0) {
        calendarState.currentMonth = 11;
        calendarState.currentYear--;
    }
    renderCalendar();
    hideTimeSlots();
}

function goToNextMonth() {
    calendarState.currentMonth++;
    if (calendarState.currentMonth > 11) {
        calendarState.currentMonth = 0;
        calendarState.currentYear++;
    }
    renderCalendar();
    hideTimeSlots();
}

// Gestion de la sélection des jours
function toggleDateSelection(date) {
    const index = calendarState.selectedDates.findIndex(d => isSameDate(d, date));
    if (index >= 0) {
        // Retirer la date si déjà sélectionnée
        calendarState.selectedDates.splice(index, 1);
    } else {
        // Ajouter la date si non sélectionnée
        calendarState.selectedDates.push(date);
    }
    // Trier les dates par ordre chronologique
    calendarState.selectedDates.sort((a, b) => a - b);
}

// Gestion des créneaux horaires
function showTimeSlots() {
    renderSelectedDatesList();
    renderTimeSlots();
    document.getElementById('timeSlotsContainer').classList.remove('hidden');
    document.getElementById('nextStep2').disabled = true;
}

function hideTimeSlots() {
    document.getElementById('timeSlotsContainer').classList.add('hidden');
}

function updateTimeSlotsVisibility() {
    if (calendarState.selectedDates.length > 0) {
        showTimeSlots();
    } else {
        hideTimeSlots();
    }
}

function renderSelectedDatesList() {
    let datesHTML = '';
    calendarState.selectedDates.forEach(date => {
        datesHTML += `<div class="text-sm">• ${formatDate(date)}</div>`;
    });
    document.getElementById('selectedDatesList').innerHTML = datesHTML;
}

function renderTimeSlots() {
    let slotsHTML = '';
    config.timeSlots.forEach(slot => {
        const isSelected = calendarState.selectedTime === slot;
        const slotClass = isSelected 
            ? 'time-slot selected bg-blue-600 text-white border-blue-700' 
            : 'time-slot bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300';
        
        slotsHTML += `
            <button class="${slotClass} rounded-md py-2 px-4 transition" 
                    data-time="${slot}">
                ${slot}
            </button>
        `;
    });
    
    document.getElementById('timeSlots').innerHTML = slotsHTML;
    
    // Ajouter les écouteurs d'événements aux créneaux
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => selectTimeSlot(slot));
    });
}

function selectTimeSlot(slotElement) {
    // Désélectionner tous les créneaux
    document.querySelectorAll('.time-slot').forEach(s => {
        s.classList.remove('bg-blue-600', 'text-white', 'border-blue-700');
        s.classList.add('bg-white', 'border-gray-300');
    });
    
    // Sélectionner le créneau cliqué
    slotElement.classList.remove('bg-white', 'border-gray-300');
    slotElement.classList.add('bg-blue-600', 'text-white', 'border-blue-700');
    
    // Mettre à jour l'état
    calendarState.selectedTime = slotElement.dataset.time;
    document.getElementById('nextStep2').disabled = false;
}

// Fonctions utilitaires
function isDateSelected(date) {
    return calendarState.selectedDates.some(d => isSameDate(d, date));
}

function isHolidayDate(date) {
    return config.holidays.some(h => 
        h.month === date.getMonth() && h.day === date.getDate());
}

function isDateDisabled(date) {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = isHolidayDate(date);
    const isPast = date < calendarState.currentDate && 
                  !isSameDate(date, calendarState.currentDate);
    
    return isWeekend || isHoliday || isPast;
}

// Export des données
export function getSelectedDates() {
    return [...calendarState.selectedDates];
}

export function getSelectedTime() {
    return calendarState.selectedTime;
}