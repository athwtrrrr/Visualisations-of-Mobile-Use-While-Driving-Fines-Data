const margin = {top: 60, right: 30, bottom: 30, left: 50};
const width = 800;
const height = 600;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const cellSize = 90;
let innerCharts;

const tooltipWidth = 350;
const tooltipHeight = 50;


const ageGroups = ["0-16", "17-25", "26-39", "40-64", "65 and over", "Unknown"];

const xScaleL = d3.scaleLinear();
const yScaleL = d3.scaleLinear();
const xScaleH = d3.scaleBand();
const yScaleH = d3.scaleBand();

const colorScaleL = d3.scaleOrdinal();
const colorScaleH = d3.scaleSequential();