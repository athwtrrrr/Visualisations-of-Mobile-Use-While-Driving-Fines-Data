const drawLineChart = (data) => {
    //reset the chart
    d3.select("#linechart").select("svg").remove();

    const margin = {top: 60, right: 120, bottom: 30, left: 45};
    const width = 800;
    const height = 600;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select("#linechart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)

    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right + 50}, ${margin.top})`);

    const innerChartL = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

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
        const path = innerChartL
            .append("path")
            .datum(jurisdictionData)
            .attr("fill", "none")
            .attr("class", "line")
            .attr("stroke", colorScaleL(jurisdiction))
            .attr("stroke-width", 1)
            .attr("d", line);

        const length = path.node().getTotalLength();
        path.attr("stroke-dasharray", length)
            .attr("stroke-dashoffset", length)
            .transition()
            .duration(700)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
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
            .attr("y", height )
            .attr("class", "axis-label");

    svg
        .append("text")
        .text("Total Number of Fines")
            .attr("x", 0)
            .attr("y", 40)
            .attr("class", "axis-label");

    const selectOption = document.getElementById("detection-method").value;
    const selectedStartYear = document.getElementById("from-lines").value;
    const selectedEndYear = document.getElementById("end-lines").value;

    //add legend
    const legendItems = colorScaleL.domain();
    legend.selectAll("g")
        .data(legendItems)
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`)
        .call(g => {
            g.append("rect")
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", colorScaleL);

            g.append("text")
                .attr("x", 22)
                .attr("y", 15)
                .attr("font-size", "12px")
                .text(d => d);
        });

    //add title
    svg
        .append("text")
        .text(`Annual Fines trend by Jurisdictions using ${selectOption} Detection Method from ${selectedStartYear} to ${selectedEndYear}`)
            .attr("x", width/2)
            .attr("y", 15)
            .attr("class", "title")
            .attr("text-anchor", "middle");
} 