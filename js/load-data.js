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
    populateLineChartFilters(data);
    //draw when first load
    updated_data = updateData(data, "line");
    drawLineChart(updated_data);

    d3.selectAll("#from-lines, #end-lines").on("change", function() {
        const updated_data = updateData(data, "line");
        drawLineChart(updated_data);
    });

    document.getElementById("detection-method").addEventListener("change", function() {
        const updated_data = updateData(data, "line");
        drawLineChart(updated_data);
    });

}).catch(error=> {
    console.log("Error loading linechart csv file: ", error);
});

//load heatmap
d3.csv("../data/heatmap.csv", d => {
    return{
        jurisdiction: d["JURISDICTION"],
        age_group: d["AGE_GROUP"],
        month: d["MONTH"],
        location: d["LOCATION"],
        fines: +d["Sum(FINES)"],
        arrests: +d["Sum(ARRESTS)"],
        charges: +d["Sum(CHARGES)"],
    }
}).then(data=>{
    console.log(data);
    populateHeatmapFilters(data);
    updated_data = updateData(data, "heatmap");
    drawHeatmap(updated_data);

    d3.selectAll(".form-check-input").on("change", function() {
        const updated_data = updateData(data, "heatmap");
        drawHeatmap(updated_data);
    });

}).catch(error=> {
    console.log("Error loading heatmap csv file: ", error);
});