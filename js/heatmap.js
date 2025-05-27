const drawHeatmap = (data) => {
    //reset the chart
    d3.select("#heatmap").select("svg").remove();

    const marginLeftBuffer = 80;
    const widthBuffer = 100;

    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("viewBox", `0 0 ${width+100} ${height}`);

    const innerChart = svg.append("g")
        .attr("transform", `translate(${margin.left+marginLeftBuffer}, ${margin.top})`);

    //extract age groups and locations
    const selectedAgeGroups = getCheckedValues("#agegroups input");
    const selectedLocations = getCheckedValues("#locations input");

    const ageGroupsChart = Object.keys(data[0])
        .filter(k => k !== "location" && selectedAgeGroups.includes(k));
    const locations = Array.from(new Set(data.map(d => d.location)))
        .filter(l => selectedLocations.includes(l));

    console.log("Age groups: ", ageGroupsChart);
    console.log("Locations: ", locations);

    xScaleH
        .domain(ageGroupsChart)
        .range([0, innerWidth])
        .padding(0.05);

    yScaleH
        .domain(locations)
        .range([0, innerHeight])
        .padding(0.05);

    // Ensure every combination of location and age group is included
    const cells = [];
    locations.forEach(location => {
        ageGroupsChart.forEach(age => {
            const row = data.find(d => d.location === location);
            cells.push({
                location: location,
                ageGroup: age,
                value: row && row[age] !== undefined ? row[age] : 0 // default to 0 if missing
            });
        });
    });

    const maxValue = d3.max(cells, d => d.value);
    const domainStart = maxValue * 0.08;

    colorScaleH
        .interpolator(d3.interpolateRdYlGn)
        .domain([domainStart,0]);

    //draw chart
    innerChart.selectAll("rect")
        .data(cells)
        .enter()
        .append("rect")
        .attr("x", d => xScaleH(d.ageGroup))
        .attr("y", d => yScaleH(d.location))
        .attr("width", xScaleH.bandwidth())
        .attr("height", yScaleH.bandwidth())
        .attr("fill", d => colorScaleH(d.value));

    // Add cells values
    innerChart.selectAll("text.cell-label")
        .data(cells)
        .enter()
        .append("text")
        .attr("class", "cell-label")
        .attr("x", d => xScaleH(d.ageGroup) + xScaleH.bandwidth() / 2)
        .attr("y", d => yScaleH(d.location) + yScaleH.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .text(d => d.value);

    const enforcementType = document.getElementById("enforcement-type-heatmap").value;

    // Add axes
    innerChart.append("g")
        .attr("transform", `translate(0,0)`)
        .call(d3.axisLeft(yScaleH));
    innerChart.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScaleH));

    //add title
    svg
        .append("text")
        .text(`Heatmap of ${enforcementType} enforced by Age Group and Location in 2023`)
        .attr("text-anchor", "middle")
        .attr("x", width/2 + marginLeftBuffer)
        .attr("y", 20)
        .attr("class", "chart-title");

}