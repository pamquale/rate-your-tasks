// Об'єкт для зберігання всіх проєктів
let projects = {};
let currentProject = null;

// Обробники подій для кнопок
document.getElementById("createProjectBtn").addEventListener("click", () => openModal('projectModal'));
document.getElementById("createTaskBtn").addEventListener("click", () => openModal('taskModal'));
document.getElementById("saveProject").addEventListener("click", createProject);
document.getElementById("projectSelect").addEventListener("change", loadProject);

// Запобігання повторному виклику createTask()
document.getElementById("taskForm").addEventListener("submit", function(event) {
    event.preventDefault();
    createTask();
});

document.getElementById('infoModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal('infoModal');
    }
});

// Функція відкриття модального вікна
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block'; // Відкриваємо модальне вікно
        document.body.classList.add('modal-open'); // Додаємо затемнення фону
    }
}

// Функція закриття модального вікна
function closeModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// Функція форматування дати у формат "ДД.ММ.РРРР"
function formatDate(date) {
    if (!(date instanceof Date)) {
        try {
            date = new Date(date);
        } catch (error) {
            console.error("Помилка у форматуванні дати:", error);
            return "Invalid Date";
        }
    }
    return date.getDate().toString().padStart(2, '0') + '.' +
           (date.getMonth() + 1).toString().padStart(2, '0') + '.' +
           date.getFullYear();
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.addEventListener("DOMContentLoaded", function () {
    fetchProjects();
});

function fetchProjects(callback) {
    fetch("/api/projects/")
        .then(response => response.json())
        .then(data => {
            if (data.projects) {
                projects = {};
                let select = document.getElementById("projectSelect");
                select.innerHTML = "";

                data.projects.forEach(project => {
                    projects[project.title] = {
                        id: project.id,
                        startDate: new Date(project.start_date),
                        tasks: project.tasks
                    };

                    let option = document.createElement("option");
                    option.value = project.title;
                    option.textContent = project.title;
                    select.appendChild(option);
                });

                if (data.projects.length > 0) {
                    let selectedProject = select.value || data.projects[0].title;
                    select.value = selectedProject;
                    
                    if (!currentProject || currentProject.id !== projects[selectedProject].id) {
                        console.log("Завантажуємо проєкт:", selectedProject);
                        loadProject();
                    }
                }

                toggleCreateTaskButton();
                if (callback) callback(); // Викликаємо колбек після завантаження
            }
        })
        .catch(error => console.error("Помилка завантаження проєктів:", error));
}


function createProject() {
    let name = document.getElementById("projectName").value.trim();
    let startDate = document.getElementById("projectStartDate").value;

    if (!name || !startDate) {
        alert("Please fill in all fields!");
        return;
    }

    let projectData = {
        title: name,
        start_date: startDate
    };

    fetch("/api/save-project/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") // CSRF-токен для безпеки
        },
        body: JSON.stringify(projectData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.project) {
            // Додаємо проєкт до списку на сторінці
            projects[data.project.title] = {
                id: data.project.id,
                startDate: new Date(data.project.start_date),
                tasks: []
            };

            let select = document.getElementById("projectSelect");
            let option = document.createElement("option");
            option.value = data.project.title;
            option.textContent = data.project.title;
            select.appendChild(option);

            select.value = data.project.title;
            loadProject();
            closeModal('projectModal'); // Закриваємо модальне вікно
            toggleCreateTaskButton();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Error saving project:", error));
}

function toggleCreateTaskButton() {
    let createTaskBtn = document.getElementById("createTaskBtn");
    let select = document.getElementById("projectSelect");

    if (select.options.length > 0) {
        createTaskBtn.style.display = "block";  // Показати кнопку
    } else {
        createTaskBtn.style.display = "none";   // Сховати кнопку
    }
}
document.addEventListener("DOMContentLoaded", function () {
    toggleCreateTaskButton();
});

// Функція завантаження вибраного проєкту
function loadProject() {
    let projectName = document.getElementById("projectSelect").value;
    currentProject = projects[projectName] || null;

    if (currentProject) {
        drawTable();
        currentProject.tasks.forEach(task => renderTaskRow(task));
    } else {
        document.querySelector(".table-container").style.display = "none";
    }
    
    toggleCreateTaskButton(); // Переконуємось, що кнопка не зникне
}

document.addEventListener("DOMContentLoaded", function () {
    let taskForm = document.getElementById("taskForm");

    if (!taskForm.dataset.listenerAdded) {
        taskForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            if (this.dataset.submitted === "true") {
                console.warn("Форма вже була відправлена");
                return;
            }

            this.dataset.submitted = "true"; // Запобігаємо повторному відправленню

            await createTask();

            this.dataset.submitted = ""; // Скидаємо блокування після завершення
        });

        taskForm.dataset.listenerAdded = "true"; // Запобігаємо повторному додаванню обробника
    }
});

async function createTask() {
    console.log("createTask() викликана");

    if (!currentProject || !currentProject.id) {
        console.error("Помилка: не вибрано проєкт!", currentProject);
        alert("Спочатку виберіть проєкт.");
        return;
    }

    let taskForm = document.getElementById("taskForm");

    if (taskForm.dataset.submitted === "true") {
        console.warn("Завдання вже відправляється...");
        return;
    }

    taskForm.dataset.submitted = "true"; // Запобігаємо повторному сабміту

    let taskData = {
        project_id: currentProject.id,
        name: document.getElementById("task-name").value.trim(),
        start: document.getElementById("start-date").value,
        deadline: document.getElementById("deadline").value,
        completion: document.getElementById("end-date").value,
        priority: document.getElementById("priority").value,
        hours: document.getElementById("hours").value || "0",
        difficulty: document.getElementById("difficulty").value,
        members: document.getElementById("members").value
    };

    console.log("📡 Відправка задачі:", taskData);

    try {
        let response = await fetch("/api/save-task/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify(taskData)
        });

        let data = await response.json();
        console.log("Відповідь від сервера:", data);

        if (data.task_id) {
            fetchProjects(() => {
                closeModal("taskModal");
                loadProject(); // Оновлення відображення задач
                updateTableRange();
            });
        } else {
            alert("Помилка: " + data.error);
        }
    } catch (error) {
        console.error("Помилка запиту:", error);
    } finally {
        taskForm.dataset.submitted = ""; // Скидаємо блокування після завершення
    }
}


function clearTaskForm() {
    document.getElementById("task-name").value = "";
    document.getElementById("start-date").value = "";
    document.getElementById("deadline").value = "";
    document.getElementById("end-date").value = "";
}

// Функція перевірки та оновлення діапазону дат у таблиці
function updateTableRange() {
    if (!currentProject) return;

    let maxEndDate = new Date(currentProject.startDate);
    maxEndDate.setHours(0, 0, 0, 0);

    currentProject.tasks.forEach(task => {
        let taskDeadline = new Date(task.deadline);
        let taskCompletion = task.completion ? new Date(task.completion) : taskDeadline;
        let taskEnd = taskCompletion > taskDeadline ? taskCompletion : taskDeadline;

        if (taskEnd > maxEndDate) {
            maxEndDate = taskEnd;
        }
    });

    let lastDateInTable = document.querySelector("#dateHeader th:last-child")?.textContent;
    if (lastDateInTable) {
        let currentEndDate = new Date(lastDateInTable.split('.').reverse().join('-'));
        currentEndDate.setHours(0, 0, 0, 0);

        if (maxEndDate > currentEndDate) {
            console.log("Оновлюємо таблицю, оскільки новий кінець перевищує поточний діапазон");
            drawTable(); // Очищаємо і малюємо таблицю заново
            currentProject.tasks.forEach(task => renderTaskRow(task)); // Додаємо завдання заново
        }
    }
}

// Функція побудови таблиці з датами
function drawTable() {
    let dateRow = document.getElementById("dateHeader");
    dateRow.innerHTML = "<th>Task</th>";

    let startDate = new Date(currentProject.startDate);
    startDate.setHours(0, 0, 0, 0);

    let maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + 18); // Мінімальний діапазон 18 днів

    currentProject.tasks.forEach(task => {
        let taskDeadline = new Date(task.deadline);
        let taskCompletion = task.completion ? new Date(task.completion) : taskDeadline;
        let taskEnd = taskCompletion > taskDeadline ? taskCompletion : taskDeadline;

        if (taskEnd > maxEndDate) {
            maxEndDate = taskEnd;
        }
    });

    let daysCount = Math.ceil((maxEndDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < daysCount; i++) {
        let date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        let th = document.createElement("th");
        th.textContent = formatDate(date);
        dateRow.appendChild(th);
    }

    let taskTable = document.getElementById("taskTable");
    taskTable.innerHTML = ""; // Очищаємо таблицю

    // **Додаємо 10 порожніх рядків**
    for (let i = 0; i < 10; i++) {
        let row = document.createElement("tr");
        row.setAttribute("data-empty", "true"); // Позначаємо, що це порожній рядок

        let taskNameCell = document.createElement("td");
        taskNameCell.textContent = "";
        row.appendChild(taskNameCell);

        for (let j = 0; j < daysCount; j++) {
            let cell = document.createElement("td");
            row.appendChild(cell);
        }

        taskTable.appendChild(row);
    }

    document.querySelector(".table-container").style.display = "block";
}


// Функція відображення одного рядка завдання у таблиці
function renderTaskRow(task) {
    let taskTable = document.getElementById("taskTable");
    let rows = taskTable.getElementsByTagName("tr");

    let row = Array.from(rows).find(r => r.firstChild.textContent === "");
    if (!row) {
        row = document.createElement("tr");
        taskTable.appendChild(row);
    }

    row.innerHTML = "";
    row.setAttribute('data-task-id', task.id);

    let taskNameCell = document.createElement("td");
    taskNameCell.textContent = task.name;
    row.appendChild(taskNameCell);

    let projectStart = new Date(currentProject.startDate);
    projectStart.setHours(0, 0, 0, 0);

    let taskStart = new Date(task.start);
    taskStart.setHours(0, 0, 0, 0);
    let taskDeadline = new Date(task.deadline);
    taskDeadline.setHours(0, 0, 0, 0);
    let taskCompletion = new Date(task.completion);
    taskCompletion.setHours(0, 0, 0, 0);

    let dateHeaders = document.querySelectorAll("#dateHeader th");
    let daysCount = dateHeaders.length - 1;

    for (let i = 0; i < daysCount; i++) {
        let cell = document.createElement("td");
        let taskBar = document.createElement("div");
        let currentDate = new Date(projectStart);
        currentDate.setDate(projectStart.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);

        // Логіка кольорових смуг (існуючий код)
        if (currentDate.getTime() === taskStart.getTime() ||
            (currentDate.getTime() >= taskStart.getTime() && currentDate.getTime() <= taskDeadline.getTime())) {
            taskBar.classList.add("yellow");
        }
        if (currentDate.getTime() >= taskStart.getTime() && currentDate.getTime() <= taskCompletion.getTime()) {
            let greenBar = document.createElement("div");
            greenBar.classList.add("green");
            taskBar.appendChild(greenBar);
        }
        if (currentDate.getTime() > taskDeadline.getTime() && currentDate.getTime() <= taskCompletion.getTime()) {
            taskBar.classList.add("red");
        }

        // Додаємо обробник подій для смуги
        taskBar.addEventListener('click', function(event) {
            let tr = event.target.closest('tr');
            let taskId = tr.getAttribute('data-task-id');
            let task = currentProject.tasks.find(t => t.id == taskId);
            if (task) {
                openInfoModal(task);
            }
        });

        cell.appendChild(taskBar);
        row.appendChild(cell);
    }
}

document.getElementById("taskForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Запобігає перезавантаженню сторінки
    createTask(); // Викликає функцію створення завдання
});
// Дані завдань (ти будеш додавати їх самостійно або брати з іншого джерела)
const tasks = [
    { name: 'Task 1', startDate: '2025-03-01', deadline: '2025-03-10', endDate: '2025-03-09', members: 'John, Sarah' },
    { name: 'Task 2', startDate: '2025-03-05', deadline: '2025-03-12', endDate: '2025-03-10', members: 'Michael, Emily' },
    // Ти можеш додавати більше завдань
];

// Функція для відображення модального вікна з інформацією про завдання
function openInfoModal(task) {
    document.getElementById('task-name-info').textContent = task.name || 'No value';
    document.getElementById('start-date-info').textContent = formatDate(task.start) || 'No value';
    document.getElementById('deadline-info').textContent = formatDate(task.deadline) || 'No value';
    document.getElementById('end-date-info').textContent = formatDate(task.completion) || 'No value';
    document.getElementById('members-info').textContent = task.members || 'No value';
    document.getElementById('priority-info').textContent = task.priority || 'No value';
    document.getElementById('hours-info').textContent = task.hours || 'No value';
    document.getElementById('difficulty-info').textContent = task.difficulty || 'No value';

    document.getElementById('infoModal').setAttribute('data-task-id', task.id);
    document.getElementById('infoModal').style.display = 'flex';
}

let editingTaskId = null;

function editTask() {
    let infoModal = document.getElementById('infoModal');
    let taskId = infoModal.getAttribute('data-task-id'); // Отримуємо ID завдання

    let task = currentProject.tasks.find(t => t.id == taskId);
    if (task) {
        editingTaskId = taskId;

        // Заповнюємо форму редагування
        document.getElementById('task-name').value = task.name;
        document.getElementById('start-date').value = task.start ? task.start.toISOString().split('T')[0] : "";
        document.getElementById('deadline').value = task.deadline ? task.deadline.toISOString().split('T')[0] : "";
        document.getElementById('end-date').value = task.completion ? task.completion.toISOString().split('T')[0] : "";
        document.getElementById('members').value = task.members.join(", ");
        document.getElementById('priority').value = task.priority;
        document.getElementById('hours').value = task.hours;
        document.getElementById('difficulty').value = task.difficulty;

        // Закриваємо старе модальне вікно та відкриваємо нове
        infoModal.style.display = 'none';
        openModal('taskModal');
    }
}

async function saveTaskChanges() {
    let taskId = editingTaskId;
    let taskData = {
        task_id: taskId,
        name: document.getElementById('task-name').value,
        start: document.getElementById('start-date').value,
        deadline: document.getElementById('deadline').value,
        completion: document.getElementById('end-date').value,
        members: document.getElementById('members').value.split(",").map(member => member.trim()),
        priority: document.getElementById('priority').value,
        hours: document.getElementById('hours').value,
        difficulty: document.getElementById('difficulty').value
    };

    const response = await fetch('/api/update-task/', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert(`Помилка: ${errorData.error}`);
        return;
    }

    alert("Завдання оновлено!");
    location.reload();
}
// Функція для створення рядків таблиці
function createTaskRows() {
    const taskTableBody = document.querySelector('#taskTable tbody');

    tasks.forEach(task => {
        const row = document.createElement('tr');

        // Створення клітинок для кожного завдання
        const taskCell = document.createElement('td');
        taskCell.classList.add('task-name');
        taskCell.innerText = task.name;

        // Додаємо обробник кліку для відкриття модального вікна
        taskCell.onclick = function() {
            openInfoModal(task);  // Відкривається модальне вікно при натисканні
        };

        const startDateCell = document.createElement('td');
        startDateCell.innerText = task.startDate;

        const deadlineCell = document.createElement('td');
        deadlineCell.innerText = task.deadline;

        const endDateCell = document.createElement('td');
        endDateCell.innerText = task.endDate;

        const membersCell = document.createElement('td');
        membersCell.innerText = task.members;

        // Додаємо клітинки до рядка
        row.appendChild(taskCell);
        row.appendChild(startDateCell);
        row.appendChild(deadlineCell);
        row.appendChild(endDateCell);
        row.appendChild(membersCell);

        // Додаємо рядок до таблиці
        taskTableBody.appendChild(row);
    });
}

// Викликаємо функцію після завантаження сторінки, щоб додати завдання в таблицю
document.addEventListener('DOMContentLoaded', createTaskRows);
// Показати модальне вікно з інформацією про завдання
function showModal(event) {
    const modal = document.getElementById("infoModal");
     const taskItem = event.target;

    // Отримуємо дані про завдання з атрибутів
    const taskName = taskItem.getAttribute("data-task-name");
    const startDate = taskItem.getAttribute("data-start-date");
    const deadline = taskItem.getAttribute("data-deadline");
    const endDate = taskItem.getAttribute("data-end-date");
    const members = taskItem.getAttribute("data-members");

    // Заповнюємо дані в модальному вікні
    document.getElementById("task-name-info").textContent = taskName;
    document.getElementById("start-date-info").textContent = startDate;
    document.getElementById("deadline-info").textContent = deadline;
    document.getElementById("end-date-info").textContent = endDate;
    document.getElementById("members-info").textContent = members;

    // Показуємо модальне вікно
    modal.style.display = "flex";
}

// Приховуємо модальне вікно
function hideModal() {
    const modal = document.getElementById("infoModal");
    modal.style.display = "none";
}


document.querySelectorAll(".task-item").forEach(taskItem => {
    taskItem.addEventListener("click", showModal);
});
// Приховуємо модальне вікно
function hideModal() {
    const modal = document.getElementById("infoModal");
    modal.style.display = "none";
}

document.querySelectorAll(".task-item").forEach(taskItem => {
    taskItem.addEventListener("click", showModal);
});

async function deleteTask() {
    let taskId = document.getElementById('infoModal').getAttribute('data-task-id');

    try {
        let response = await fetch("/api/delete-task/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({ task_id: taskId })
        });

        let data = await response.json();

        if (data.message) {
            fetchProjects(() => {
                closeModal('infoModal');
                loadProject();
            });
        } else {
            alert("Error: " + data.error);
        }
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

// Функція для видалення рядка завдання в таблиці
function removeTaskRow(taskId) {
    const row = document.querySelector(`tr[data-task-id='${taskId}']`);
    if (row) {
        row.remove();
    }
}

function hideModal() {
    document.getElementById('infoModal').style.display = 'none';
}
