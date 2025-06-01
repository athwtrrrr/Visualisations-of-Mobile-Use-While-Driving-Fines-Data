const drawBarChart = (data) => {
    // Get the selected enforcement type
    const enforcementType = document.getElementById("enforcement-type-bars").value;
    const enforcementLabel = document.getElementById("enforcement-type-bars").options[document.getElementById("enforcement-type-bars").selectedIndex].text;

    // Reset the chart
    d3.select("#barchart").select("svg").remove();

    const margin = {top: 60, right: 120, bottom: 50, left: 45};
    const width = 800;
    const height = 600;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

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

        const tooltip = d3.select("#barchart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "8px")
        .style("border", "1px solid #ddd")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)");


    // Draw bars with enhanced tooltips
    jurisdictions.forEach(jurisdiction => {
        const jurGroup = innerChart.append("g")
            .attr("transform", `translate(${xScaleL(jurisdiction)}, 0)`);

        ageGroups.forEach(ageGroup => {
            const datum = data.find(d => d.jurisdiction === jurisdiction && d.age_group === ageGroup);
            const value = datum ? +datum[enforcementType] : 0;

            const bar = jurGroup.append("rect")
                .attr("x", xScaleH(ageGroup))
                .attr("y", yScaleL(value))
                .attr("width", xScaleH.bandwidth())
                .attr("height", innerHeight - yScaleL(value))
                .attr("fill", colorScaleL(ageGroup))
                .attr("stroke", "#fff")
                .attr("stroke-width", 1)
            

            // Mouseover event for tooltip
            bar.on("mouseover", function(event) {
                d3.select(this).attr("opacity", 0.8);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                
                tooltip.html(`
                    <strong>${jurisdiction}</strong><br/>
                    Age Group: ${ageGroup}<br/>
                    ${enforcementLabel}: ${value.toLocaleString()}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).attr("opacity", 1);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
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
    svg
        .append("text")
        .text("Jurisdiction")
            .attr("text-anchor", "end")
            .attr("x", width/2)
            .attr("y", height - 7)
            .attr("class", "axis-label");

    // Update y-axis label based on enforcement type
    svg.append("text")
        .text(enforcementLabel)
        .attr("x", 0)
        .attr("y", 40)
        .attr("class", "axis-label");


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

