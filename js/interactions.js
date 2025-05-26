const updateData = (data, chart) => {
    if (chart === "line") {
        const filteredYearData = filterDataByYears(data);
        const filteredJurisdictionData = filterDataByJurisdiction(filteredYearData);
        const aggregatedByDetectionMethod = aggregateByDetectionMethod(filteredJurisdictionData);
        console.log("Aggregated data for line: ", aggregatedByDetectionMethod);

        return aggregatedByDetectionMethod;
    }
    else if(chart === "heatmap") {
        const aggregatedByLocationAndAgeGroup = aggregateByLocationAndAgeGroup(data);
        console.log("Aggregated data for heatmap: ", aggregatedByLocationAndAgeGroup);

        return aggregatedByLocationAndAgeGroup;
    }
    else {
        console.log("Invalid chart type");
        return;
    }
}

const aggregateByDetectionMethod = (data) => {
    let filteredData;

    //filter data based on the selected option
    let selectOption = document.getElementById("detection-method").value;
    console.log("Selected option: ", selectOption);
    if (selectOption === "all") {
        filteredData = data;
    } else {
        filteredData = data.filter(d => d.detection === selectOption);
    }

    //aggregate data by year and jurisdiction
    const aggregatedData = Array.from(
        d3.rollup(
            filteredData,
            v => d3.sum(v, d => d.fines_total),
            d => d.year,
            d => d.jurisdiction
        ),
        ([year, group]) =>
            Array.from(group, ([jurisdiction, fines_total]) => ({
                year,
                jurisdiction,
                fines_total
            }))
    ).flat();

    //sort by year
    aggregatedData.sort((a, b) => d3.ascending(a.year, b.year));

    return aggregatedData;
}

const filterDataByYears = (data) => {
    const startYear = parseInt(document.getElementById("from-lines").value);
    const endYear = parseInt(document.getElementById("end-lines").value);

    console.log("start year: ", startYear);
    console.log("end year: ", endYear);

    //filter data based on the selected years
    return data.filter(d => d.year >= startYear && d.year <= endYear);
}

const filterDataByJurisdiction = (data) => {
    selectedJurisdictions = getCheckedValues("#jurisdictions-lines input");
    console.log("Selected jurisdictions for Lines: ", selectedJurisdictions);

    //filter data based on the selected jurisdictions
    return data.filter(d => selectedJurisdictions.includes(d.jurisdiction));
}

const aggregateByLocationAndAgeGroup = (data) => {
    let filteredData;

    selectedMonths = getCheckedValues("#months input");
    selectedJurisdictions = getCheckedValues("#jurisdictions input");
    console.log("Selected months: ", selectedMonths);
    console.log("Selected jurisdictions for Heatmap: ", selectedJurisdictions);

    //first, filter data based on months and jurisdictions
    filteredData = data.filter(d => selectedMonths.includes(d.month) && selectedJurisdictions.includes(d.jurisdiction));

    //then aggregate selected enforcement method
    const aggregatedData = d3.rollups(
        filteredData,
        v => d3.sum(v, d => d.fines),
        d => d.location,
        d => d.age_group,
    );

    //convert to array of row-based objects
    const aggregatedDataArray = aggregatedData.map(([location, group]) => {
        const row = { location };
        group.forEach(([age, fine]) => {
            row[age] = fine;
        });
        ageGroups.forEach(a => {
            if (row[a] === undefined) row[a] = 0; //ensure all cases are filled
        });
        return row;
    });
    
    return aggregatedDataArray;
}

const populateHeatmapFilters = (data) => {
    const months = Array.from(new Set(data.map(d => d.month)));
    const jurisdictions = Array.from(new Set(data.map(d => d.jurisdiction)));

    //populate with checkboxes
    months.forEach(m => {
        d3.select("#months").append("li").html(`
                <div class="form-check dropdown-item">
                    <input class="form-check-input-2-heatmap" type="checkbox" value="${m}" id="${m}" checked>
                    <label class="form-check-label" for="${m}">${m}</label>
                </div>
            `
        )
    });

    jurisdictions.forEach(j => {
        d3.select("#jurisdictions").append("li").html(`
                <div class="form-check dropdown-item">
                    <input class="form-check-input-2-heatmap" type="checkbox" value="${j}" id="${j}" checked>
                    <label class="form-check-label" for="${j}">${j}</label>
                </div>
            `
        )
    });
}

const populateLineChartFilters = (data) => {
    const years = Array.from(new Set(data.map(d => d.year)));
    const jurisdictions = Array.from(new Set(data.map(d => d.jurisdiction)));
    const maxYear = d3.max(years);
    const minYear = d3.min(years);
    
    jurisdictions.forEach(j => {
        d3.select("#jurisdictions-lines").append("li").html(`
                <div class="form-check dropdown-item">
                    <input class="form-check-input-2-lines" type="checkbox" value="${j}" id="${j}" checked>
                    <label class="form-check-label" for="${j}">${j}</label>
                </div>
            `
        )
    });

    years.forEach(y =>{
        d3.select('#from-lines').append("option")
            .attr("class", "dropdown-year")
            .attr("value", y)
            .property("selected", y === minYear)
            .text(y);
    })
    years.forEach(y =>{
        d3.select('#end-lines').append("option")
            .attr("class", "dropdown-year")
            .attr("value", y)
            .property("selected", y === maxYear)
            .text(y);
    })
    
}

function getCheckedValues(selector){
    return Array.from(document.querySelectorAll(selector))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
}


