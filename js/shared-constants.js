const margin = {top: 60, right: 30, bottom: 30, left: 50};
const width = 800;
const height = 600;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

let innerCharts;

const tooltipWidth = 350;
const tooltipHeight = 50;

const xScaleL = d3.scaleLinear();
const yScaleL = d3.scaleLinear();
const xScaleH = d3.scaleLinear();
const yScaleH = d3.scaleLinear();
const colorScaleL = d3.scaleOrdinal();