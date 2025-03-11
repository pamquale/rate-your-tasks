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
    return date.getDate().toString().padStart(2, '0') + '.' +
           (date.getMonth() + 1).toString().padStart(2, '0') + '.' +
           date.getFullYear();
}

// Функція створення нового проекту
function createProject() {
    let name = document.getElementById("projectName").value;
    let startDate = document.getElementById("projectStartDate").value;

    if (name && startDate) {
        let startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);

        // Додаємо новий проект до об'єкта projects
        projects[name] = { startDate: startDateObj, tasks: [] };

        // Додаємо проект до випадаючого списку
        let select = document.getElementById("projectSelect");
        let option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);

        // Вибираємо новий проект і завантажуємо його
        select.value = name;
        loadProject();
        closeModal('projectModal'); // Закриваємо модальне вікно після створення проекту
    }
}

// Функція завантаження вибраного проєкту
function loadProject() {
    let projectName = document.getElementById("projectSelect").value;
    currentProject = projects[projectName];

    if (currentProject) {
        drawTable(); // Малюємо таблицю для вибраного проєкту
        currentProject.tasks.forEach(task => renderTaskRow(task)); // Додаємо всі задачі
    } else {
        document.querySelector(".table-container").style.display = "none"; // Ховаємо таблицю, якщо проєкт не вибраний
    }
}

function createTask() {
    console.log("createTask called");
    if (!currentProject) return;

    let taskName = document.getElementById("task-name").value.trim();
    console.log("Task Name:", taskName);
    let start = document.getElementById("start-date").value;
    let deadline = document.getElementById("deadline").value;
    let completion = document.getElementById("end-date").value;
    let members = document.getElementById("members").value;
    let priority = document.getElementById("priority").value;
    let hours = document.getElementById("hours").value;
    let difficulty = document.getElementById("difficulty").value;

    if (!taskName || !start || !deadline || !completion) {
        alert("Fill in all the fields!");
        return;
    }

    start = new Date(start);
    deadline = new Date(deadline);
    completion = new Date(completion);

    let projectStart = new Date(currentProject.startDate);
    projectStart.setHours(0, 0, 0, 0);

    if (start < projectStart || deadline < start || completion < start) {
        alert("Invalid dates!");
        return;
    }

    if (editingTaskId) {
        // Редагування існуючого завдання
        let taskIndex = currentProject.tasks.findIndex(t => t.id == editingTaskId);
        if (taskIndex !== -1) {
            currentProject.tasks[taskIndex] = {
                id: editingTaskId,
                name: taskName,
                start,
                deadline,
                completion,
                members,
                priority,
                hours,
                difficulty
            };
            editingTaskId = null;
        }
    } else {
        let isDuplicate = currentProject.tasks.some(
            task => task.name.trim().toLowerCase() === taskName.toLowerCase()
        );
        if (isDuplicate) return;

        let taskId = Date.now();
        let task = {
            id: taskId,
            name: taskName,
            start,
            deadline,
            completion,
            members,
            priority,
            hours,
            difficulty
        };
        currentProject.tasks.push(task);
    }

    let expanded = updateTableRange();
    if (!expanded) {
        drawTable();
        currentProject.tasks.forEach(task => renderTaskRow(task));
    }

    closeModal('taskModal');
}

function clearTaskForm() {
    document.getElementById("task-name").value = "";
    document.getElementById("start-date").value = "";
    document.getElementById("deadline").value = "";
    document.getElementById("end-date").value = "";
}

// Функція перевірки та оновлення діапазону дат у таблиці
function updateTableRange() {
    let maxEndDate = new Date(currentProject.startDate);
    maxEndDate.setHours(0, 0, 0, 0);

    currentProject.tasks.forEach(task => {
        let taskEnd = new Date(Math.max(task.deadline, task.completion));
        if (taskEnd > maxEndDate) {
            maxEndDate = taskEnd;
        }
    });

    let currentEndDate = new Date(document.querySelector("#dateHeader th:last-child")?.textContent.split('.').reverse().join('-') || currentProject.startDate);
    currentEndDate.setHours(0, 0, 0, 0);

    if (maxEndDate > currentEndDate) {
        drawTable(); // **Очищає таблицю і додає новий діапазон дат**
        currentProject.tasks.forEach(task => renderTaskRow(task)); // **Заново додає всі завдання**
        return true;
    }
    return false;
}

// Функція побудови таблиці з датами
function drawTable() {
    let dateRow = document.getElementById("dateHeader");
    dateRow.innerHTML = "<th>Task</th>";

    let startDate = new Date(currentProject.startDate);
    startDate.setHours(0, 0, 0, 0);

    let maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + 18); // За замовчуванням додаємо 18 днів

    currentProject.tasks.forEach(task => {
        let taskEnd = new Date(Math.max(task.deadline, task.completion));
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
    taskTable.innerHTML = "";

    for (let i = 0; i < 10; i++) {
        let row = document.createElement("tr");
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
        document.getElementById('start-date').value = task.start.toISOString().split('T')[0];
        document.getElementById('deadline').value = task.deadline.toISOString().split('T')[0];
        document.getElementById('end-date').value = task.completion.toISOString().split('T')[0];
        document.getElementById('members').value = task.members;
        document.getElementById('priority').value = task.priority;
        document.getElementById('hours').value = task.hours;
        document.getElementById('difficulty').value = task.difficulty;

        // Закриваємо модальне вікно інформації
        infoModal.style.display = 'none';

        // Відкриваємо модальне вікно редагування
        openModal('taskModal');
    }

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

function deleteTask() {
    let taskId = document.getElementById('infoModal').getAttribute('data-task-id');
    let taskIndex = currentProject.tasks.findIndex(t => t.id == taskId);

    if (taskIndex !== -1) {
        // Видаляємо завдання з масиву
        currentProject.tasks.splice(taskIndex, 1);

        // Оновлюємо інтерфейс (наприклад, видаляємо рядок із таблиці завдань)
        removeTaskRow(taskId);

        // Закриваємо модальне вікно
        hideModal();
    } else {
        console.error('Task not found!');
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