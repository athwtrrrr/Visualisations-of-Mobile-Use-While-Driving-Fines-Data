const updateData = (data) => {
    const aggregatedByDetectionMethod = aggregateByDetectionMethod(data);
    console.log("Aggregated data: ", aggregatedByDetectionMethod);

    return aggregatedByDetectionMethod;
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
