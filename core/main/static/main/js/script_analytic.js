document.addEventListener("DOMContentLoaded", function () {
    fetchAnalyticsData();
    document.getElementById("projectSelect").addEventListener("change", function () {
        fetchAnalyticsData();
    });
});

let chartInstances = {}; 

async function fetchAnalyticsData() {
    let projectId = document.getElementById("projectSelect").value;
    if (!projectId) return;

    try {
        let response = await fetch(`/api/analytics/?project_id=${projectId}`);
        let data = await response.json();

        console.log("📊 Отримані аналітичні дані:", data);

        if (!data.length) {
            console.warn("⚠️ Аналітичні дані відсутні або помилка API");
            clearCharts();
            return;
        }

        let labels = data.map(item => item.task__name);
        let completedData = data.map(item => item.completed_on_time ? 1 : 0);
        let workloadData = data.map(item => item.workload);

        clearCharts();
        renderPieChart(completedData);
        renderBarChart(workloadData, labels);
        renderLineChart(workloadData, labels);
    } catch (error) {
        console.error("❌ Помилка отримання аналітичних даних:", error);
    }
}

function clearCharts() {
    Object.keys(chartInstances).forEach(chart => {
        if (chartInstances[chart]) {
            chartInstances[chart].destroy(); 
        }
    });
}

function renderPieChart(completedData) {
    let pieCtx = document.getElementById("pieChart").getContext("2d");
    if (chartInstances["pieChart"]) chartInstances["pieChart"].destroy();

    chartInstances["pieChart"] = new Chart(pieCtx, {
        type: "doughnut",
        data: {
            labels: ["Completed on time", "Not completed on time"],
            datasets: [{
                data: [
                    completedData.filter(v => v === 1).length,
                    completedData.filter(v => v === 0).length
                ],
                backgroundColor: ["green", "red"]
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } }
        }
    });
}

function renderBarChart(workloadData, labels) {
    let barCtx = document.getElementById("barChart1").getContext("2d");
    if (chartInstances["barChart1"]) chartInstances["barChart1"].destroy();

    chartInstances["barChart1"] = new Chart(barCtx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Workload (hours)",
                data: workloadData,
                backgroundColor: "blue"
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function renderLineChart(workloadData, labels) {
    let lineCtx = document.getElementById("lineChart").getContext("2d");
    if (chartInstances["lineChart"]) chartInstances["lineChart"].destroy();

    chartInstances["lineChart"] = new Chart(lineCtx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Hours worked",
                data: workloadData,
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
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Tasks" } },
                y: {
                    title: { display: true, text: "Hours Worked" },
                    suggestedMin: 0,
                    suggestedMax: Math.max(...workloadData) + 2,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}
