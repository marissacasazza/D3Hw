// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100 
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params  
var chosenXAxis = "age";
var chosenYAxis = "smokes";


// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxeX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating xAxis var upon click on axis label
function renderAxeY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
}

// function for updating the text on the circles
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis])-10)
    .attr("y", d => newYScale(d[chosenYAxis])+7)

  return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {
  var xlabel;
  if (chosenXAxis === "age") {
    xlabel = "Age";
  }
  else if (chosenXAxis === "poverty") {
    xlabel = "Poverty";
  }
  else {
    xlabel = "Income";
  }
  var ylabel;
  if (chosenYAxis === "smokes") {
    ylabel = "Smokes";
  }
  else if (chosenYAxis === "healthcare") {
    ylabel = "Healthcare";
  }
  else {
    ylabel = "Obesity";
  }


  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}` );
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(csvData, err) {
  if (err) throw err;

  // parse data
  csvData.forEach(function(data) {
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.poverty = +data.poverty;
    data.healthcare =+data.healthcare;
    data.obesity = +data.obesity;
    data.income = +data.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(csvData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(csvData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

 // apend y axis
    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    //.attr("transform", `translate(0, ${height})`)
    .call(leftAxis);


  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(csvData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");
  
    // Text on Circles
  var textGroup = chartGroup.selectAll("text.abbr")
    .data(csvData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]) -10)
    .attr("y", d => yLinearScale(d[chosenYAxis]) +7)
    .attr("class", "abbr")
    .attr("stroke", "black")
    .text(d => d.abbr)
    .attr("opacity", "1");

  // Create group for three x-axis labels
  var xLabels = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);


  var ageLabel = xLabels.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Age (Median)");

  var povertyLabel = xLabels.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("Poverty");

  var incomeLabel = xLabels.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income");

  var yLabels = chartGroup.append("g")
    .attr("transform", `translate(${-margin.left}, ${height/2}),rotate(-90)`) 
    

  var smokesLabel = yLabels.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smokes");

  var healthcareLabel = yLabels.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Healthcare");

  var obesityLabel = yLabels.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity");


  //updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);
  var textGroup = updateToolTip(chosenXAxis, textGroup, chosenYAxis);
  // x axis labels event listener
  xLabels.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {  

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(csvData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxeX(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale,chosenYAxis);

        // upades circles with new text values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale,chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);
        textGroup = updateToolTip(chosenXAxis, textGroup, chosenYAxis);
 
        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
  
    yLabels.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {  

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(csvData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderAxeY(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale,chosenYAxis);

        // upades circles with new text values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale,chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);
 
        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true); 
        }
        else if (chosenYAxis === "smokes") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});


