// Отримуємо елементи
const changeDataBtn = document.getElementById('changeDataBtn');
const changeDataModal = document.getElementById('changeDataModal');
const saveButton = document.getElementById('saveButton');
const closeButton = document.getElementById('closeModal');

// Функція для відкриття модального вікна
function openModal() {
    if (changeDataModal) {
        changeDataModal.style.display = 'flex';
        changeDataModal.style.opacity = '1';
        changeDataModal.style.visibility = 'visible';
        document.body.classList.add('modal-open');
        console.log("Modal opened");
    }
}

function closeModal() {
    if (changeDataModal) {
        changeDataModal.style.opacity = '0';
        changeDataModal.style.visibility = 'hidden';
        setTimeout(() => {
            changeDataModal.style.display = 'none';
        }, 300);
        document.body.classList.remove('modal-open');
        console.log("Modal closed");
    }
}

// Додаємо обробники подій
if (changeDataBtn) {
    changeDataBtn.addEventListener('click', openModal);
}
if (saveButton) {
    saveButton.addEventListener('click', function() {
        saveData();
        alert('Data saved successfully!');
        closeModal();
    });
}
if (closeButton) {
    closeButton.addEventListener('click', closeModal);
}

// Закриття модального вікна при кліку поза ним
window.addEventListener('click', function(event) {
    if (event.target === changeDataModal) {
        closeModal();
    }
});

// Отримуємо елементи з полями введення
const positionInput = document.getElementById('position');
const teamRoleInput = document.getElementById('teamRole');
const companyInput = document.getElementById('company');
const locationInput = document.getElementById('location');
const workExperienceInput = document.getElementById('workExperience');
const keyTechnologiesInput = document.getElementById('keyTechnologies');
const contactsInput = document.getElementById('contacts');

// Елементи для відображення основної інформації профілю
const positionDisplay = document.querySelector('.Position');
const teamRoleDisplay = document.querySelector('.TeamRole');
const companyDisplay = document.querySelector('.Company');
const locationDisplay = document.querySelector('.UserLocation');
const workExperienceDisplay = document.querySelector('.WorkExperience');
const keyTechnologiesDisplay = document.querySelector('.KeyTechnologies');
const contactsDisplay = document.querySelector('.Contacts');

// Функція для збереження даних у localStorage
function saveData() {
    localStorage.setItem('position', positionInput.value);
    localStorage.setItem('teamRole', teamRoleInput.value);
    localStorage.setItem('company', companyInput.value);
    localStorage.setItem('location', locationInput.value);
    localStorage.setItem('workExperience', workExperienceInput.value);
    localStorage.setItem('keyTechnologies', keyTechnologiesInput.value);
    localStorage.setItem('contacts', contactsInput.value);
    updateDisplay();
}

// Функція для оновлення відображення на сторінці
function updateDisplay() {
    positionDisplay.textContent = `Position: ${localStorage.getItem('position') || 'Not specified'}`;
    teamRoleDisplay.textContent = `Team Role: ${localStorage.getItem('teamRole') || 'Not specified'}`;
    companyDisplay.textContent = `Company: ${localStorage.getItem('company') || 'Not specified'}`;
    locationDisplay.textContent = `📍Location: ${localStorage.getItem('location') || 'Not specified'}`;
    workExperienceDisplay.textContent = `Work experience: ${localStorage.getItem('workExperience') || 'Not specified'}`;
    keyTechnologiesDisplay.textContent = `Key technologies: ${localStorage.getItem('keyTechnologies') || 'Not specified'}`;
    contactsDisplay.textContent = `Contacts: ${localStorage.getItem('contacts') || 'Not specified'}`;
}

// Завантаження збережених даних при відкритті сторінки
window.onload = function() {
    if (positionInput) positionInput.value = localStorage.getItem('position') || '';
    if (teamRoleInput) teamRoleInput.value = localStorage.getItem('teamRole') || '';
    if (companyInput) companyInput.value = localStorage.getItem('company') || '';
    if (locationInput) locationInput.value = localStorage.getItem('location') || '';
    if (workExperienceInput) workExperienceInput.value = localStorage.getItem('workExperience') || '';
    if (keyTechnologiesInput) keyTechnologiesInput.value = localStorage.getItem('keyTechnologies') || '';
    if (contactsInput) contactsInput.value = localStorage.getItem('contacts') || '';
    updateDisplay();
};

// Функціонал зміни аватарки
const changeAvatarBtn = document.getElementById('changeAvatarBtn');
const uploadAvatar = document.getElementById('uploadAvatar');
const avatarImage = document.getElementById('avatarImage');

if (changeAvatarBtn && uploadAvatar && avatarImage) {
    changeAvatarBtn.addEventListener('click', function() {
        uploadAvatar.click();
    });

    uploadAvatar.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

console.log("Checking button:", changeDataBtn);
changeDataBtn.addEventListener('click', function() {
    console.log("Change Data button clicked!");
    openModal();
});

