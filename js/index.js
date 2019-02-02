 /* declare variables */

var width = 1200;
var height = 700;
var margin = { top: 150, right: 20, bottom: 150, left: 20 };
var innerHeight = height - margin.top - margin.bottom;
var innerWidth = width - margin.left - margin.right;


/* draw canvas */

var canvas = d3.select('body').
append('svg').
attr('width', width).
attr('height', height).
attr('id', 'canvas');

var innerCanvas = canvas.append('g').
attr('width', innerWidth).
attr('height', innerHeight).
attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');


/* title */

canvas.append('text').
text('Top 100 Highest Grossing Movies').
attr('id', 'title').
attr('transform', 'translate(' + width / 2 + ', ' + margin.top / 3 + ')');

canvas.append('text').
text('Grouped By Genre (US Gross)').
attr('id', 'description').
attr('transform', 'translate(' + width / 2 + ', ' + margin.top / 1.5 + ')');


/* tooltip */
var tooltip = d3.select('body').
append('div').
attr('id', 'tooltip').
style('white-space', 'pre-line').
text('');


/* colour scale */

var colourScale = d3.scaleOrdinal(d3.schemePastel2);


/* get data */

d3.json('https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json').
then(function (data) {

      //create hierachy from data
      var root = d3.hierarchy(data);

      //define treemap layout
      var treemap = d3.treemap().
      size([innerWidth, innerHeight]);

      //get total values for each sub-category
      root.sum(function (d) {return d.value;});

      //create layout from the root data
      treemap(root);

      //draw rects for each data point
      var cells = innerCanvas.selectAll('g').
      data(root.descendants()).
      enter().
      append('g').
      attr('transform', function (d) {return 'translate(' + d.x0 + ', ' + d.y0 + ')';});

      cells.append('rect').
      attr('class', 'tile').
      attr('data-name', function (d) {return d.data.name;}).
      attr('data-value', function (d) {return d.data.value;}).
      attr('data-category', function (d) {return d.data.category;}).
      attr('width', function (d) {return d.x1 - d.x0;}).
      attr('height', function (d) {return d.y1 - d.y0;}).
      attr('stroke', 'white').
      attr('fill', function (d) {return colourScale(d.data.category);}).
      on('mousemove', function (d) {
            tooltip.style('visibility', 'visible').
            text(getTooltip(d)).
            attr('data-value', d.data.value).
            style('left', d3.event.clientX + 10 + 'px').
            style('top', d3.event.clientY + 10 + 'px');
      }).
      on('mouseout', function () {
            tooltip.style('visibility', 'hidden');
      });

      //add labels to cells

      cells.append('text').
      text(function (d) {return d.data.name.replace(/:\s/g, ':\n');}).
      attr('y', 10).
      attr('x', 5).
      attr('class', 'label').
      style('white-space', 'pre-line').
      attr('transform', function (d) {
            var textLength = this.getComputedTextLength();
            var boundary = this.previousSibling.getBBox();

            return textLength < boundary.width ? 'initial' :
            textLength < boundary.height ? 'translate(' + boundary.width + ',0) rotate(90)' :
            'initial';
      });



      // function to get tooltip text
      function getTooltip(d) {
            return d.data.name + ' (' + d.data.category + ') \n $' + Number(d.data.value).toLocaleString();
      }


      /* legend */

      var legend = canvas.append('g').
      attr('id', 'legend').
      attr('transform', 'translate(' + width / 4 + ', ' + (margin.top + innerHeight + margin.bottom / 3) + ')');

      legend.selectAll('rect').
      data(root.children).
      enter().
      append('rect').
      attr('class', 'legend-item').
      style('stroke', 'white').
      attr('x', function (d, i) {return i * 100;}).
      attr('width', 20).
      attr('height', 20).
      style('fill', function (d) {return colourScale(d.data.name);});

      legend.selectAll('text').
      data(root.children).
      enter().
      append('text').
      attr('x', function (d, i) {return i * 100 + 5;}).
      attr('y', 30).
      attr("transform", function (d) {//get each text's x and y so they rotate around their individual axis
            var xRot = d3.select(this).attr("x");
            var yRot = d3.select(this).attr("y");
            return 'rotate(45, ' + xRot + ',  ' + yRot + ' )';}).
      text(function (d) {return d.data.name;});


}, function (error) {
      throw error;
});