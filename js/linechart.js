const svg = d3.select("#linechart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)

const innerChartL = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

const drawLineChart = (data) => {
    xScaleL
    .domain(d3.extent(data, d => d.year))
    .range([0, innerWidth]);

    yScaleL
    .domain([0, d3.max(data, d => d.fines_total)])
    .range([innerHeight, 0])
    .nice();

    //render line chart in the inner chart
    const line = d3.line()
        .x(d => xScaleL(d.year))
        .y(d => yScaleL(d.fines_total));

    const jurisdictions = Array.from(new Set(data.map(d => d.jurisdiction))); //get the unique jurisdictions from the dataset
    colorScaleL
        .domain(jurisdictions)
        .range(d3.schemeCategory10);

    jurisdictions.forEach(jurisdiction => {
        const jurisdictionData = data.filter(d => d.jurisdiction === jurisdiction);
        innerChartL
            .append("path")
            .datum(jurisdictionData)
            .attr("fill", "none")
            .attr("class", "line")
            .attr("stroke", colorScaleL(jurisdiction))
            .attr("stroke-width", 1)
            .attr("d", line);
    });

    //add axes
    const bottomAxisL = d3.axisBottom(xScaleL)
        .tickFormat(d3.format("d"));
    const leftAxisL = d3.axisLeft(yScaleL);

    innerChartL
        .append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(bottomAxisL);

    innerChartL
        .append("g")
        .call(leftAxisL);

    //add the labels to axes
    svg
        .append("text")
        .text("Year")
            .attr("text-anchor", "end")
            .attr("x", width/2)
            .attr("y", height - 5)
            .attr("class", "axis-label");

    svg
        .append("text")
        .text("Total Number of Fines")
            .attr("x", 0)
            .attr("y", 20)
            .attr("class", "axis-label");
} 