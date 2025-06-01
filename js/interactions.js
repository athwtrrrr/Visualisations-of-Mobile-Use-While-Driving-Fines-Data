const updateData = (data, chart) => {
    if (chart === "line") {
        const viewby = document.getElementById("view-by").value;

        if (viewby === "By Jurisdictions") {
            d3.selectAll(".dropdown-checkbox").style("display", "block");
            const filteredYearData = filterDataByYears(data);
            const filteredJurisdictionData = filterDataByJurisdiction(filteredYearData);
            const aggregatedByDetectionMethod = aggregateByDetectionMethod(filteredJurisdictionData);
            //console.log("Aggregated data for line: ", aggregatedByDetectionMethod);

            return aggregatedByDetectionMethod;
        }
        else if (viewby === "All Australia") {
            d3.selectAll(".dropdown-checkbox").style("display", "none");    //hide the jurisdiction filters
            const filteredYearData = filterDataByYears(data);
            const aggregatedByDetectionMethod = aggregateByDetectionMethod(filteredYearData);
            const aggregatedSumYearsData= aggregatedSumByYears(aggregatedByDetectionMethod);
            
            return aggregatedSumYearsData;
        }
        else {
            console.log("Invalid view by option");
            return;
        }
        
    }
    else if(chart === "heatmap") {
        const aggregatedByLocationAndAgeGroup = aggregateByLocationAndAgeGroup(data);
        console.log("Aggregated data for heatmap: ", aggregatedByLocationAndAgeGroup);

        return aggregatedByLocationAndAgeGroup;
    }
    else if (chart === "grouped_bar"){
        //TODO: FILTER FIRST, AGGREGATE LATER
        d3.selectAll(".dropdown-checkbox").style("display", "block");
    
        // Filter first, then aggregate
        const filteredData = filterDataByJurisdictionBar(data);
        const filteredByAge = filterDataByAgeGroupBar(filteredData);
        const aggregatedData = aggregateByDetectionMethodBar(filteredByAge);
    
        return aggregatedData;
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

const aggregateByDetectionMethodBar = (data) => {
    let filteredData;

    
    //filter data based on the selected option
    let selectOption = document.getElementById("detection-method-bars").value;
    console.log("Selected option bar: ", selectOption);
    if (selectOption === "all") {
        filteredData = data;
    } else {
        filteredData = data.filter(d => d.detection === selectOption);
    }

    //TODO: AGGREGATE DATA BY THE SELECTED ENFORCEMENT TYPE

    const aggregatedData = Array.from(
        d3.rollup(
            filteredData,
            v => d3.sum(v, d => d.Total_FINES),
            d => d.age_group,
            d => d.jurisdiction
        ),
        ([age_group, group]) =>
            Array.from(group, ([jurisdiction, Total_FINES]) => ({
                age_group,
                jurisdiction,
                Total_FINES
            }))
    ).flat();

    

    return aggregatedData;

}

const aggregatedSumByYears = (data) => {
    //aggregate sum of data by year
    const aggregatedData = Array.from(
        d3.rollup(
            data,
            v => d3.sum(v, d => d.fines_total),
            d => d.year
        ),
        ([year, fines_total]) => ({
            year,
            fines_total
        })
    );

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

    const enforcementType = document.getElementById("enforcement-type-heatmap").value;

    //first, filter data based on months and jurisdictions
    filteredData = data.filter(d => selectedMonths.includes(d.month) && selectedJurisdictions.includes(d.jurisdiction));

    let aggregatedData = null;

    //then aggregate selected enforcement method
    if (enforcementType === "fines"){
        aggregatedData = d3.rollups(
        filteredData,
            v => d3.sum(v, d => d.fines),
            d => d.location,
            d => d.age_group,
        );
    }
    else if (enforcementType === "arrests") {
        aggregatedData = d3.rollups(
        filteredData,
            v => d3.sum(v, d => d.arrests),
            d => d.location,
            d => d.age_group,
        );
    }
    else if (enforcementType === "charges") {
        aggregatedData = d3.rollups(
        filteredData,
            v => d3.sum(v, d => d.charges),
            d => d.location,
            d => d.age_group,
        );
    }

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

const populateBarChartFilters = (data) => {
    const ageGroups = Array.from(new Set(data.map(d => d.age_group)));
    const jurisdictions = Array.from(new Set(data.map(d => d.jurisdiction))); // Ensure jurisdictions is initialized

    //TODO: add detection method filter
    //TODO: add jurisdiction filter

    ageGroups.forEach(a => {
        d3.select("#agegroups-bars").append("li").html(`
                <div class="form-check dropdown-item">
                    <input class="form-check-input-2-barchart" type="checkbox" value="${a}" id="${a}" checked>
                    <label class="form-check-label" for="${a}">${a}</label>
                </div>
            `
        );
    });

    // Populate jurisdictions
    jurisdictions.forEach(j => {
        d3.select("#jurisdictions-bars").append("li").html(`
            <div class="form-check dropdown-item">
                <input class="form-check-input-2-barchart" type="checkbox" value="${j}" id="${j}" checked>
                <label class="form-check-label" for="${j}">${j}</label>
            </div>`
        );
    });
}

const filterDataByJurisdictionBar = (data) => {
    selectedJurisdictions = getCheckedValues("#jurisdictions-bars input");
    console.log("Selected jurisdictions for Bars: ", selectedJurisdictions);

    //filter data based on the selected jurisdictions
    return data.filter(d => selectedJurisdictions.includes(d.jurisdiction));
}

const filterDataByAgeGroupBar = (data) => {
    selectedAgeGroups = getCheckedValues("#agegroups-bars input");
    console.log("Selected age groups for Bars: ", selectedAgeGroups);

    //filter data based on the selected age groups
    return data.filter(d => selectedAgeGroups.includes(d.age_group));
}

const populateHeatmapFilters = (data) => {
    const months = Array.from(new Set(data.map(d => d.month)));
    const jurisdictions = Array.from(new Set(data.map(d => d.jurisdiction)));
    const ageGroups = Array.from(new Set(data.map(d => d.age_group)));
    const locations = Array.from(new Set(data.map(d => d.location)));

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

    ageGroups.forEach(a => {
        d3.select("#agegroups").append("li").html(`
                <div class="form-check dropdown-item">
                    <input class="form-check-input-2-heatmap" type="checkbox" value="${a}" id="${a}" checked>
                    <label class="form-check-label" for="${a}">${a}</label>
                </div>
            `
        )
    })

    locations.forEach(l => {
        d3.select("#locations").append("li").html(`
                <div class="form-check dropdown-item">
                    <input class="form-check-input-2-heatmap" type="checkbox" value="${l}" id="${l}" checked>
                    <label class="form-check-label" for="${l}">${l}</label>
                </div>
            `
        )
    })
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


