const drawBarChart = (data) => {
    // Get the selected enforcement type
    const enforcementType = document.getElementById("enforcement-type-bars").value;
    const enforcementLabel = document.getElementById("enforcement-type-bars").options[document.getElementById("enforcement-type-bars").selectedIndex].text;

    // Reset the chart
    d3.select("#barchart").select("svg").remove();

    // Set up SVG container
    const svg = d3.select("#barchart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`);

    const innerChart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Get unique values
    const jurisdictions = Array.from(new Set(data.map(d => d.jurisdiction)));
    const ageGroups = Array.from(new Set(data.map(d => d.age_group)));

    // Set up shared scales
    const xScaleL = d3.scaleBand()
        .domain(jurisdictions)
        .range([0, innerWidth])
        .paddingInner(0.1);

    const xScaleH = d3.scaleBand()
        .domain(ageGroups)
        .range([0, xScaleL.bandwidth()])
        .padding(0.05);

    // Use the selected enforcement type for the y-scale
    const yScaleL = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d[enforcementType]) * 1.1])
        .range([innerHeight, 0])
        .nice();

    const colorScaleL = d3.scaleOrdinal()
        .domain(ageGroups)
        .range(d3.schemeTableau10);

    // Draw bars
    jurisdictions.forEach(jurisdiction => {
        const jurGroup = innerChart.append("g")
            .attr("transform", `translate(${xScaleL(jurisdiction)}, 0)`);

        ageGroups.forEach(ageGroup => {
            const datum = data.find(d => d.jurisdiction === jurisdiction && d.age_group === ageGroup);
            const value = datum ? +datum[enforcementType] : 0;

            jurGroup.append("rect")
                .attr("x", xScaleH(ageGroup))
                .attr("y", yScaleL(value))
                .attr("width", xScaleH.bandwidth())
                .attr("height", innerHeight - yScaleL(value))
                .attr("fill", colorScaleL(ageGroup))
                .append("title")
                .text(`Age: ${ageGroup}, ${enforcementLabel}: ${value}`);
        });
    });
    

    // Axes
    const bottomAxis = d3.axisBottom(xScaleL);
    const leftAxis = d3.axisLeft(yScaleL);

    innerChart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(bottomAxis)
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

    innerChart.append("g")
        .attr("class", "y-axis")
        .call(leftAxis);

    // Axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Jurisdiction");

    // Update y-axis label based on enforcement type
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text(enforcementLabel);

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);

    ageGroups.forEach((ageGroup, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendItem.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", colorScaleL(ageGroup));

        legendItem.append("text")
            .attr("x", 24)
            .attr("y", 14)
            .attr("font-size", "12px")
            .text(ageGroup);
    });
// Update chart title
svg.append("text")
.attr("x", width / 2)
.attr("y", 30)
.attr("text-anchor", "middle")
.attr("class", "title")
.text(`${enforcementLabel} by Jurisdiction and Age Group`);
};

// const drawBarChart = (data) => {
//     // Reset the chart
//     d3.select("#barchart").select("svg").remove();

//     // Set up SVG container
//     const svg = d3.select("#barchart")
//         .append("svg")
//         .attr("viewBox", `0 0 ${width} ${height}`);

//     const innerChart = svg.append("g")
//         .attr("transform", `translate(${margin.left}, ${margin.top})`);

//     // Get unique values
//     const jurisdictions = Array.from(new Set(data.map(d => d.jurisdiction)));
//     const ageGroups = Array.from(new Set(data.map(d => d.age_group)));

//     // Set up shared scales
//     const xScaleL = d3.scaleBand();
//     xScaleL
//         .domain(jurisdictions)
//         .range([0, innerWidth])
//         .paddingInner(0.1);

//     xScaleH
//         .domain(ageGroups)
//         .range([0, xScaleL.bandwidth()])
//         .padding(0.05);

//     yScaleL
//         .domain([0, d3.max(data, d => +d.Total_FINES) * 1.1])
//         .range([innerHeight, 0])
//         .nice();

//     colorScaleL
//         .domain(ageGroups)
//         .range(d3.schemeTableau10);

//     // Draw bars
//     jurisdictions.forEach(jurisdiction => {
//         const jurGroup = innerChart.append("g")
//             .attr("transform", `translate(${xScaleL(jurisdiction)}, 0)`);

//         ageGroups.forEach(ageGroup => {
//             const datum = data.find(d => d.jurisdiction === jurisdiction && d.age_group === ageGroup);
//             const value = datum ? +datum.Total_FINES : 0;

//             jurGroup.append("rect")
//                 .attr("x", xScaleH(ageGroup))
//                 .attr("y", yScaleL(value))
//                 .attr("width", xScaleH.bandwidth())
//                 .attr("height", innerHeight - yScaleL(value))
//                 .attr("fill", colorScaleL(ageGroup))
//                 .append("title")
//                 .text(`Age: ${ageGroup}, Fines: ${value}`);
//         });
//     });

//     // Axes
//     const bottomAxis = d3.axisBottom(xScaleL);
//     const leftAxis = d3.axisLeft(yScaleL);

//     innerChart.append("g")
//         .attr("class", "x-axis")
//         .attr("transform", `translate(0, ${innerHeight})`)
//         .call(bottomAxis)
//         .selectAll("text")
//         .attr("transform", "rotate(-40)")
//         .style("text-anchor", "end");

//     innerChart.append("g")
//         .attr("class", "y-axis")
//         .call(leftAxis);

//     // Axis labels
//     svg.append("text")
//         .attr("x", width / 2)
//         .attr("y", height - 10)
//         .attr("text-anchor", "middle")
//         .text("Jurisdiction");

//     svg.append("text")
//         .attr("transform", "rotate(-90)")
//         .attr("x", -height / 2)
//         .attr("y", 20)
//         .attr("text-anchor", "middle")
//         .text("Total Fines");

//     // Legend
//     const legend = svg.append("g")
//     .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);

//     ageGroups.forEach((ageGroup, i) => {
//         const legendItem = legend.append("g")
//             .attr("transform", `translate(0, ${i * 20})`);

//         legendItem.append("rect")
//             .attr("width", 18)
//             .attr("height", 18)
//             .attr("fill", colorScaleL(ageGroup));

//         legendItem.append("text")
//             .attr("x", 24)
//             .attr("y", 14)
//             .attr("font-size", "12px")
//             .text(ageGroup);
//     });

//     // Chart title
//     svg.append("text")
//         .attr("x", width / 2)
//         .attr("y", 30)
//         .attr("text-anchor", "middle")
//         .attr("class", "title")
//         .text("Total Fines by Jurisdiction and Age Group");
// };