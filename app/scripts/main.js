console.log('\'Allo \'Allo!'); // eslint-disable-line no-console

var margin = {top: 20, right: 280, bottom: 30, left: 80},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%m/%d/%Y").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.dollar); });

var svg = d3.select(".tsp").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("tspgrouped_bmc.csv", function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  var contributions = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, dollar: +d[name]};
      })
    };
  });

//  x.domain(d3.extent(data, function(d) { return d.date; }));
  x.domain([
    d3.min(data, function(d) { return parseDate("1/1/1988") }),
    d3.max(data, function(d) { return parseDate("1/1/2016") })
  ]);

  y.domain([
    d3.min(contributions, function(c) { return d3.min(c.values, function(v) { return v.dollar; }); }),
    d3.max(contributions, function(c) { return 600000 } )
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // grid
  svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis
                   .tickSize(-height, 0, 0)
                   .tickFormat("")
           )

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
//      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", 430)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Accumlated TSP Contributions and Balance ($) As of Nov/2015");

   // grid
  svg.append("g")
      .attr("class", "grid")
      .call(yAxis
                 .tickSize(-width, 0, 0)
                 .tickFormat("")
      )

  var contribution = svg.selectAll(".contribution")
      .data(contributions)
    .enter().append("g")
      .attr("class", "contribution");

  var path = contribution.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });

  var totalLength = path.node().getTotalLength()*2;

  path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(3000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);


      contribution.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.dollar) + ")"; })
      .attr("x", -43)
      .attr("y", -12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name + ' ($' + d.value.dollar.toMoney(0) + ')'; });
});

// From http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
Number.prototype.toMoney = function(decimals, decimal_sep, thousands_sep) {
         var n = this,
         c = isNaN(decimals) ? 2 : Math.abs(decimals),
         d = decimal_sep || '.',
         // http://stackoverflow.com/questions/411352/how-best-to-determine-if-an-argument-is-not-sent-to-the-javascript-function
         t = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
         sign = (n < 0) ? '-' : '',
         // extracting the absolute value of the integer part of the number and converting to string
         i = parseInt(n = Math.abs(n).toFixed(c)) + '',
         j = ((j = i.length) > 3) ? j % 3 : 0;

         return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
}
