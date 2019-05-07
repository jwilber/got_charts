// set the dimensions and margins of the graph
let margin = {top: 0, right: 30, bottom: 50, left: 60},
  width = 1200 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;


// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

let size = d3.scaleLinear()
    .domain([1,20])
    .range([5,20]);
// Read dummy data
d3.json("arcData4.json", function( data) {
  console.log(data)
  // List of node names
  let allNodes = data.nodes.map(function(d){return d.name})

  // List of groups
  let allGroups = data.nodes.map(function(d){return d.grp})
  allGroups = [...new Set(allGroups)]

  // A color scale for groups:
  let color = d3.scaleOrdinal()
    .domain(allGroups)
    .range(d3.schemeSet2);

  // A linear scale for node size
  let size = d3.scaleLinear()
    .domain([1,20])
    .range([5,20]);

  // A linear scale to position the nodes on the X axis
  let x = d3.scalePoint()
    .range([0, width])
    .domain(allNodes)

  // In my input data, links are provided between nodes -id-, NOT between node names.
  // So I have to do a link between this id and the name
  let idToNode = {};
  data.nodes.forEach(function (n) {
    idToNode[n.id] = n;
  });

  // Add the links
  let links = svg
    .selectAll('mylinks')
    .data(data.links)
    .enter()
    .append('path')
    .attr('d', function (d) {
      start = x(idToNode[d.source].name)    // X position of start node on the X axis
      end = x(idToNode[d.target].name)      // X position of end node
      return ['M', start, height-30,    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
        'A',                            // This means we're gonna build an elliptical arc
        (start - end)/2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
        (start - end)/2, 0, 0, ',',
        start < end ? 1 : 0, end, ',', height-30] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
        .join(' ');
    })
    // .classed('arcLink', true)
    .attr('class', d => 'arcLink ' + d.source)

  links
    .style("fill", "none")
    .attr("stroke", "#d3d3d3")
    .style("stroke-width", 1)
    .attr('stroke-dashoffset', function() {
      return this.getTotalLength()
    })
    .attr("stroke-dasharray", function() {
      return this.getTotalLength();
    })
    // .transition()
    //   .duration(3000)
    //   .attr("stroke-dashoffset", 0)
    

  // Add the circle for the nodes
  let nodes = svg
    .selectAll("mynodes")
    .data(data.nodes.sort(function(a,b) { return +b.n - +a.n }))
    .enter()
    .append("circle")
      .attr('class', 'arcNode')
      .attr("cx", function(d){ return(x(d.name))})
      .attr("cy", height-30)
      .attr("r", 0)
      .style("fill", function(d){ return color(d.grp)})
      .attr("stroke", "black")
      .attr('stroke-width', 1)

  // show nodes from left to right
  nodes
    .transition()
    .duration(2000)
    .delay((d,i) => i*10)
    .attr('r', 9.5)

  // And give them a label
  let labels = svg
    .selectAll("mylabels")
    .data(data.nodes)
    .enter()
    .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .text(function(d){ return(d.name)} )
      .style('font-family', 'Comfortaa')
      .style("text-anchor", "end")
      .attr("transform", function(d){ return( "translate(" + (x(d.name)) + "," + (height-15) + ")rotate(-45)")})
      .style("font-size", 6)



  // Add the highlighting functionnality
  nodes
    .on('mouseover', function (d) {
      // Highlight the nodes: every node is green except of him
      nodes
        .style('opacity', .2)
      d3.select(this)
        .style('opacity', 1)
      // Highlight the connections
      links
        .style('stroke', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? color(d.grp) : '#b8b8b8';})
        .style('stroke-opacity', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? 1 : .2;})
        .style('stroke-width', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? 4 : 1;})

      labels
        .style("font-size", function(label_d){ return label_d.name === d.name ? 16 : 2 } )
        .attr("y", function(label_d){ return label_d.name === d.name ? 10 : 0 } )

    })
    .on('mouseout', function (d) {
      nodes.style('opacity', 1)
      links
        .style('stroke', 'grey')
        .style('stroke-opacity', .8)
        .style('stroke-width', '1')
      labels
        .style("font-size", 6 )

    })
})


d3.select('#resizeNodes')
  .on('click', function(d) {
    d3.selectAll('circle.arcNode')
      .transition()
      .duration(2000)
      .attr("r", function(d){ return(size(d.n))})
  })

d3.select('#addLinks')
  .on('click', () => {
    d3.selectAll('.arcLink')
    .transition()
      .duration(2000)
      .attr("stroke-dashoffset", 0)
  })


d3.select('#addJonLinks')
  .on('click', () => {
    d3.selectAll('.Jon')
    .transition()
      .duration(2000)
      .attr("stroke-dashoffset", 0)
      .style('stroke', color(d.grp))
        .style('stroke-opacity', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? 1 : .2;})
        .style('stroke-width', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? 4 : 1;})

  })


d3.select('#addTyrionLinks')
  .on('click', () => {
    d3.selectAll('.Tyrion')
    .transition()
      .duration(2000)
      .attr("stroke-dashoffset", 0)
  })