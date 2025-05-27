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

    //view by
     const viewby = document.getElementById("view-by").value;

    // Tooltip setup
    const tooltip = d3.select("#linechart")
        .append("div")
        .attr("class", "tooltip")

    const dashedLine = innerChartL.append("line")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4")
        .style("opacity", 0);

    const circle = innerChartL.selectAll(".circle-hover")
        .data(jurisdictions)
        .enter()
        .append("circle")
        .attr("class", "circle-hover")
        .attr("r", 4)
        .attr("fill", "transparent")
        .attr("stroke", d => colorScaleL(d))
        .attr("stroke-width", 1)
        .style("opacity", 0);

    
    innerChartL
        //listerning rectangles
        .append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mousemove", function(event) {
            const [mx] = d3.pointer(event, this);
            // Find closest year
            const x0 = xScaleL.invert(mx);
            const year = Math.round(x0);
            
            // Get all data points for that year
            const yearData = data.filter(d => d.year === year);
            if (yearData.length === 0) {
                tooltip.style("opacity", 0);
                dashedLine.style("opacity", 0);
                circle.style("opacity", 0);
                return;
            }
            
            //display tooltip accordingly
            if (viewby === "All Australia") {
                tooltip.html(
                    `<strong>Year: ${year}</strong><br>` +
                    yearData.map(d =>
                        `<span style="color:${colorScaleL(d.jurisdiction)}">\u25CF</span> Australia: ${d.fines_total}`
                    ).join("<br>")
                )
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("opacity", 1);
            }
            else{
                tooltip.html(
                    `<strong>Year: ${year}</strong><br>` +
                    yearData.map(d =>
                        `<span style="color:${colorScaleL(d.jurisdiction)}">\u25CF</span> ${d.jurisdiction}: ${d.fines_total}`
                    ).join("<br>")
                )
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("opacity", 1);
            }
            

            //get the x position of the year nearst to the mouse pointer
            const xYear = xScaleL(Math.round(xScaleL.invert(d3.pointer(event, this)[0])));

            dashedLine
                .attr("x1", xYear)
                .attr("y1", 0)
                .attr("x2", xYear)
                .attr("y2", innerHeight)
                .style("opacity", 1);

            circle
                .attr("cx", xYear)
                .attr("cy", d => yScaleL(yearData.find(item => item.jurisdiction === d).fines_total))
                .style("opacity", 1);
        })
        .on("mouseleave", function() {
            tooltip.style("opacity", 0);
            dashedLine.style("opacity", 0);
            circle.style("opacity", 0);
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

            if (viewby === "All Australia") {
                g.append("text")
                    .attr("x", 22)
                    .attr("y", 15)
                    .attr("font-size", "12px")
                    .text("Australia");
            }
            g.append("text")
                .attr("x", 22)
                .attr("y", 15)
                .attr("font-size", "12px")
                .text(d => d);
        });

    //add title
    svg
        .append("text")
        .text(`Annual Fines trend by ${viewby} using ${selectOption} Detection Method from ${selectedStartYear} to ${selectedEndYear}`)
            .attr("x", width/2)
            .attr("y", 15)
            .attr("class", "title")
            .attr("text-anchor", "middle");
} 