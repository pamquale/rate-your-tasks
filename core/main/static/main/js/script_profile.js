// Отримуємо елементи
const changeDataBtn = document.getElementById('changeDataBtn'); // Кнопка для зміни даних
const changeDataModal = document.getElementById('changeDataModal'); // Модальне вікно
const saveButton = document.getElementById('saveButton'); // Кнопка збереження

// Функція для відкриття модального вікна
changeDataBtn.addEventListener('click', function() {
  changeDataModal.style.display = 'block'; // Показуємо модальне вікно
});

// Функція для закриття модального вікна після натискання кнопки Save
saveButton.addEventListener('click', function() {
  // Тут ви можете додати логіку збереження змін
  // Наприклад, отримання даних з полів і відправка їх на сервер

  alert('Data saved successfully!'); // Показуємо повідомлення після збереження
  changeDataModal.style.display = 'none'; // Закриваємо модальне вікно
});

// Закриття модального вікна при натисканні за межами вікна
window.addEventListener('click', function(event) {
  if (event.target === changeDataModal) {
    changeDataModal.style.display = 'none'; // Закриваємо модальне вікно
  }
});

// Отримуємо елементи з полями для введення і додаткової інформації
const positionInput = document.getElementById('position');
const teamRoleInput = document.getElementById('teamRole');
const companyInput = document.getElementById('company');
const locationInput = document.getElementById('location');
const workExperienceInput = document.getElementById('workExperience');
const keyTechnologiesInput = document.getElementById('keyTechnologies');
const contactsInput = document.getElementById('contacts');

// Елементи для відображення основної інформації профілю
const positionDisplay = document.querySelector('.PositionFrontend');
const teamRoleDisplay = document.querySelector('.TeamRole');
const companyDisplay = document.querySelector('.Company');
const locationDisplay = document.querySelector('.London');

// Елементи для відображення додаткової інформації
const workExperienceDisplay = document.querySelector('.WorkExperience');
const keyTechnologiesDisplay = document.querySelector('.KeyTechnologies');
const contactsDisplay = document.querySelector('.Contacts');

// Функція для збереження даних в localStorage
function saveData() {
    // Зберігаємо введені значення в localStorage
    localStorage.setItem('position', positionInput.value);
    localStorage.setItem('teamRole', teamRoleInput.value);
    localStorage.setItem('company', companyInput.value);
    localStorage.setItem('location', locationInput.value);
    localStorage.setItem('workExperience', workExperienceInput.value);
    localStorage.setItem('keyTechnologies', keyTechnologiesInput.value);
    localStorage.setItem('contacts', contactsInput.value);

    // Оновлюємо відображення на сторінці
    updateDisplay();
}

// Функція для оновлення відображення на сторінці
function updateDisplay() {
    // Встановлюємо значення з localStorage у відповідні елементи основної інформації
    positionDisplay.textContent = `Position: ${localStorage.getItem('position') || 'not set'}`;
    teamRoleDisplay.textContent = `Team Role: ${localStorage.getItem('teamRole') || 'not set'}`;
    companyDisplay.textContent = `Company: ${localStorage.getItem('company') || 'not set'}`;
    locationDisplay.textContent = `📍${localStorage.getItem('location') || 'not set'}`;

    // Встановлюємо значення з localStorage у відповідні елементи додаткової інформації
    workExperienceDisplay.textContent = `Work experience: ${localStorage.getItem('workExperience') || 'not set'}`;
    keyTechnologiesDisplay.textContent = `Key technologies: ${localStorage.getItem('keyTechnologies') || 'not set'}`;
    contactsDisplay.textContent = `Contacts: ${localStorage.getItem('contacts') || 'not set'}`;
}

// При завантаженні сторінки, перевіряємо, чи є збережені дані
window.onload = function() {
    // Якщо дані збережені в localStorage, відображаємо їх на сторінці
    if (localStorage.getItem('position')) {
        positionInput.value = localStorage.getItem('position');
    }
    if (localStorage.getItem('teamRole')) {
        teamRoleInput.value = localStorage.getItem('teamRole');
    }
    if (localStorage.getItem('company')) {
        companyInput.value = localStorage.getItem('company');
    }
    if (localStorage.getItem('location')) {
        locationInput.value = localStorage.getItem('location');
    }
    if (localStorage.getItem('workExperience')) {
        workExperienceInput.value = localStorage.getItem('workExperience');
    }
    if (localStorage.getItem('keyTechnologies')) {
        keyTechnologiesInput.value = localStorage.getItem('keyTechnologies');
    }
    if (localStorage.getItem('contacts')) {
        contactsInput.value = localStorage.getItem('contacts');
    }

    // Оновлюємо відображення на сторінці
    updateDisplay();
}

// Додаємо обробник події для кнопки збереження
document.getElementById('saveButton').addEventListener('click', function() {
    saveData();
    document.getElementById('changeDataModal').style.display = 'none'; // Закриваємо модальне вікно
});

// Аватар
const changeAvatarBtn = document.getElementById('changeAvatarBtn');
const uploadAvatar = document.getElementById('uploadAvatar');
const avatarImage = document.getElementById('avatarImage');

// Відкриваємо діалог вибору файлу при натисканні на кнопку
changeAvatarBtn.addEventListener('click', function() {
    uploadAvatar.click();
});

// Заміна аватарки після вибору файлу
uploadAvatar.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            avatarImage.src = e.target.result; // Встановлюємо нове зображення аватарки
        };
        reader.readAsDataURL(file);
    }
});
