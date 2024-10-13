const csvFilePath = "C:/Users/HP/Downloads/hotel_bookings_1000.csv";

// Load the CSV file using PapaParse
document.addEventListener("DOMContentLoaded", function () {
    Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: function(results) {
            visitorsData = results.data;
            visitorsData.forEach(d => {
                d.arrival_date = new Date(d.arrival_date_year, new Date(Date.parse(d.arrival_date_month +" 1, 2015")).getMonth(), d.arrival_date_day_of_month);
                d.adults = +d.adults;
                d.children = +d.children;
                d.babies = +d.babies;
            });
            createCharts(visitorsData);
        }
    });
});

// Initialize ApexCharts
let timeSeriesChart, columnChart, sparklineAdult, sparklineChildren;
let visitorsData = [];

// Function to filter data and update charts
function updateCharts() {
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);

    const filteredData = visitorsData.filter(d => {
        return (!isNaN(startDate.getTime()) && d.arrival_date >= startDate) &&
            (!isNaN(endDate.getTime()) && d.arrival_date <= endDate);
    });

    // Destroy existing charts before re-creating them
    if (timeSeriesChart) timeSeriesChart.destroy();
    if (columnChart) columnChart.destroy();
    if (sparklineAdult) sparklineAdult.destroy();
    if (sparklineChildren) sparklineChildren.destroy();

    // Re-create charts with filtered data
    createCharts(filteredData);
}

// Create charts
function createCharts(filteredData) {
    // Time Series: Number of visitors per day
    const timeSeriesData = filteredData.map(d => ({
        x: d.arrival_date,
        y: d.adults + d.children + d.babies
    }));
    const timeSeriesOptions = {
        chart: { type: 'line', zoom: { enabled: true } },
        series: [{ name: 'Total Visitors', data: timeSeriesData }],
        xaxis: { type: 'datetime' },
        colors: ['#00E396'] // Vibrant green color
    };
    timeSeriesChart = new ApexCharts(document.querySelector("#timeSeriesChart"), timeSeriesOptions);
    timeSeriesChart.render();

    // Column Chart: Number of visitors per country
    const countryCounts = {};
    filteredData.forEach(d => {
        countryCounts[d.country] = (countryCounts[d.country] || 0) + d.adults + d.children + d.babies;
    });
    const columnChartOptions = {
        chart: { type: 'bar' },
        series: [{ name: 'Visitors', data: Object.values(countryCounts) }],
        xaxis: { categories: Object.keys(countryCounts) },
        colors: ['#FEB019'] // Vibrant yellow color
    };
    columnChart = new ApexCharts(document.querySelector("#columnChart"), columnChartOptions);
    columnChart.render();

    // Sparkline 1: Total adult visitors
    const sparklineAdultData = filteredData.map(d => d.adults);
    const sparklineAdultOptions = {
        chart: { type: 'line', sparkline: { enabled: true } },
        series: [{ name: 'Adults', data: sparklineAdultData }],
        title: { text: 'Total Adults', align: 'center', style: { color: '#FFF' } },
        colors: ['#008FFB'] // Vibrant blue color
    };
    sparklineAdult = new ApexCharts(document.querySelector("#sparklineAdult"), sparklineAdultOptions);
    sparklineAdult.render();

    // Sparkline 2: Total children visitors
    const sparklineChildrenData = filteredData.map(d => d.children);
    const sparklineChildrenOptions = {
        chart: { type: 'line', sparkline: { enabled: true } },
        series: [{ name: 'Children', data: sparklineChildrenData }],
        title: { text: 'Total Children', align: 'center', style: { color: '#FFF' } },
        colors: ['#FF4560'] // Vibrant red color
    };
    sparklineChildren = new ApexCharts(document.querySelector("#sparklineChildren"), sparklineChildrenOptions);
    sparklineChildren.render();
}

// Process CSV file when button is clicked
document.getElementById('processCSV').addEventListener('click', function() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const csvContent = e.target.result;

            // Parse CSV content to an object
            Papa.parse(csvContent, {
                header: true, // Converts first row to keys
                complete: function(results) {
                    visitorsData = results.data;
                    visitorsData.forEach(d => {
                        d.arrival_date = new Date(d.arrival_date_year, new Date(Date.parse(d.arrival_date_month + " 1, 2015")).getMonth(), d.arrival_date_day_of_month);
                        d.adults = +d.adults;
                        d.children = +d.children;
                        d.babies = +d.babies;
                    });
                    createCharts(visitorsData);
                },
                error: function(error) {
                    console.error("Error parsing CSV:", error.message);
                }
            });
        };

        reader.readAsText(file); // Read the file as text
    } else {
        console.log("Please upload a CSV file");
    }
});