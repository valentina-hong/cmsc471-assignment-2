const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const t = 1000;

let allData = []

let xVar = 'TMIN', yVar = 'TMAX', targetDate = 20170101
let xScale, yScale

const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

function init(){
    d3.csv("./data/weather.csv", 
    function(d){
        return {  
            station: d.station,
            state: d.state, 
            latitude: +d.latitude,
            longitude: +d.longitude,
            elevation: +d.elevation,
            date: +d.date,
            TMIN: +d.TMIN,
            TMAX: +d.TMAX,
            TAVG: +d.TAVG,
            AWND: +d.AWND,
            WDF5: +d.WDF5,
            WSF5: +d.WSF5,
            SNOW: +d.SNOW,
            SNWD: +d.SNWD,
            PRCP: +d.PRCP
        }
    })
    .then(data => {
            allData = data

            setupSelector()
            updateAxes()
            updateVis()
            addLegend()
        })
    .catch(error => console.error('Error loading data:', error));
}

function setupSelector(){
    let slider = d3
        .sliderHorizontal()
        .min(d3.min(allData.map(d => d.date)))
        .max(d3.max(allData.map(d => d.date)))
        .step(1)
        .width(width)
        .displayValue(false)
        .default(targetDate)
        .on('onchange', (val) => {
            d3.select('#value').text(val);
            targetDate = +val
            updateVis()
        });

    d3.select('#slider')
        .append('svg')
        .attr('width', width)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);
}

function updateAxes(){
    xScale = d3.scaleLinear()
        .domain([0, d3.max(allData, d => d[xVar])])
        .range([0, width]);

    const xAxis = d3.axisBottom(xScale)

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    yScale = d3.scaleLinear()
        .domain([0, d3.max(allData, d => d[yVar])])
        .range([height, 0]);

    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .text(xVar)
        .attr('class', 'labels')

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 40)
        .attr("text-anchor", "middle")
        .text(yVar)
        .attr('class', 'labels')
}

function updateVis(){ 
    let currentData = allData.filter(d => d.date === targetDate)

    svg.selectAll('.points')
    .data(currentData, d => d.date)
    .join(
        // Enter: When new bubbles are added
            function (enter) {
                return enter
                    .append('circle')
                    .attr('class', 'points')
                    .attr('cx', d => xScale(d[xVar]))
                    .attr('cy', d => yScale(d[yVar]))
                    .style('opacity', .5)
                    .on('mouseover', function (event, d) {
                        // console.log(d) // See the data point in the console for debugging
                        d3.select('#tooltip')
                            .style("display", 'block')
                            .html(
                            `<strong>${d.station},${d.state}</strong><br/>`
                            )
                            .style("left", (event.pageX + 20) + "px")
                            .style("top", (event.pageY - 28) + "px");
                        d3.select(this)
                            .style('stroke', 'black')
                            .style('stroke-width', '4px')
                    })
                    .on("mouseout", function (event, d) {
                        d3.select('#tooltip')
                            .style('display', 'none')
                        d3.select(this)
                            .style('stroke', 'none')
                            .style('stroke-width', 'none')
                    })
                    .transition(t)
                    .attr('r', 5) 
            },
            // Update: When existing bubbles need to move or resize
            function (update) {
                return update
                    .transition(t)
                    .attr('cx', d => xScale(d[xVar]))
                    .attr('cy', d => yScale(d[yVar]))
                    .attr('r', 5)
            },
            // Exit: When bubbles need to be removed
            function (exit) {
                exit
                .transition(t)
                .attr('r', 0)
                .remove()
            }
        )
        .attr('r', 5)
        .style('opacity', .5)
}

function addLegend(){

}

window.addEventListener('load', init);