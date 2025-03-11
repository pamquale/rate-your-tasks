document.addEventListener("DOMContentLoaded", function () {
    // Кругова діаграма (Meeting Deadlines)
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Completed on time', 'Ahead of schedule', 'Overdue task'],
            datasets: [{
                data: [40, 30, 30], // Відсотки
                backgroundColor: ['yellow', 'green', 'red']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '70%' // Зменшуємо розмір внутрішнього кола (можна коригувати)
        }
    });

    // Стовпчикова діаграма (Task Load Distribution)
    const barCtx1 = document.getElementById('barChart1').getContext('2d');
    const taskData = [8, 6, 9, 5, 7];

    const taskColors = taskData.map(task => {
        if (task >= 8 && task <= 10) {
            return "green";
        } else if (task >= 4 && task < 8) {
            return "yellow";
        } else {
            return "red";
        }
    });

    new Chart(barCtx1, {
        type: 'bar',
        data: {
            labels: ['01.01', '02.01', '03.01', '04.01', '05.01'],
            datasets: [{
                label: 'Tasks',
                data: taskData, // Встановлюємо значення для стовпців
                backgroundColor: taskColors // Задаємо кольори стовпців
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 10 }
            }
        }
    });

    // Лінійний графік (Task schedule by number of hours)
    const lineCtx = document.getElementById("lineChart").getContext("2d");
    new Chart(lineCtx, {
        type: "line",
        data: {
            labels: ["01.01", "02.01", "03.01", "04.01", "05.01", "06.01", "07.01", "08.01", "09.01", "10.01"],
            datasets: [{
                label: "Hours worked",
                data: [5, 6, 7, 4, 8, 5, 6, 7, 3, 6], // Дані для графіка
                borderColor: "black",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: "red",
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Date",
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Hours Worked",
                    },
                    suggestedMin: 0,
                    suggestedMax: 8,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // Стовпчикова діаграма для оцінок з обмеженнями по кольору
    const barCtx2 = document.getElementById('barChart2').getContext('2d');
    const scores = [6, 5, 4, 9, 7, 5, 8, 3, 8, 9];
    const colors = scores.map(score => {
        if (score >= 8 && score <= 10) {
            return "green";
        } else if (score >= 4 && score < 8) {
            return "yellow";
        } else {
            return "red";
        }
    });

    new Chart(barCtx2, {
        type: "bar",
        data: {
            labels: ["John", "Sara", "Mike", "Emma", "David", "Alex", "Olivia", "James", "Lily", "Sophia"],
            datasets: [{
                label: "Оцінка",
                data: scores, // Оцінки
                backgroundColor: colors // Використовуємо масив кольорів
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 10 }
            }
        }
    });
});
