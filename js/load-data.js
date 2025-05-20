//load line chart data
d3.csv("../data/line_chart.csv", d => {
    return{
        year: +d["YEAR"],
        jurisdiction: d["JURISDICTION"],
        detection: d["DETECTION_METHOD"],
        fines_total: +d["Total Number of Fines"],
    }
}).then(data=>{
    console.log(data);
    //draw when first load
    updated_data = updateData(data);
    drawLineChart(updated_data);

    document.getElementById("detection-method").addEventListener("change", function() {
        const updated_data = updateData(data);
        drawLineChart(updated_data);
    });

}).catch(error=> {
    console.log("Error loading csv file: ", error);
});