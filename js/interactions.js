const updateData = (data, chart) => {
    if (chart === "line") {
        const aggregatedByDetectionMethod = aggregateByDetectionMethod(data);
        console.log("Aggregated data for line: ", aggregatedByDetectionMethod);

        return aggregatedByDetectionMethod;
    }
    else if(chart === "heatmap") {
        const aggregatedByLocationAndAgeGroup = aggregateByLocationAndAgeGroup(data);
        console.log("Aggregated data for heatmap: ", aggregatedByLocationAndAgeGroup);

        return aggregatedByLocationAndAgeGroup;
    }
    else if (chart === "bar"){
        //bar goes her
    }
    else if (chart === "grouped_bar"){
        //bar chart goes her
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

const aggregateByLocationAndAgeGroup = (data) => {
    let filteredData;

    selectedMonths = getCheckedValues("#months input");
    selectedJurisdictions = getCheckedValues("#jurisdictions input");
    console.log("Selected months: ", selectedMonths);
    console.log("Selected jurisdictions: ", selectedJurisdictions);

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
                    <input class="form-check-input" type="checkbox" value="${m}" id="${m}" checked>
                    <label class="form-check-label" for="${m}">${m}</label>
                </div>
            `
        )
    });

    jurisdictions.forEach(j => {
        d3.select("#jurisdictions").append("li").html(`
                <div class="form-check dropdown-item">
                    <input class="form-check-input" type="checkbox" value="${j}" id="${j}" checked>
                    <label class="form-check-label" for="${j}">${j}</label>
                </div>
            `
        )
    });
}

function getCheckedValues(selector){
    return Array.from(document.querySelectorAll(selector))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
}


