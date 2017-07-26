
var attacker = true;

$(function(){
  drawFirstFloor();
  drawSecondFloor();
  drawBasementFloor();
  updateThreat();
  setInterval(ajaxd, 2000);

  $('#firstFloorBtn').click();

  $('.coverage-area').popover({
    'html': true,
    //container: 'body',
    trigger: 'focus'
  });

  // view camera button
  $(document).on('click', '.view-cam-btn', function(){
    var roomId = $(this).data('roomId');
    var polygon = d3.select('polygon#'+roomId);
    var points = polygon.attr('points').split(",");
    //calculate midX
    var midX = (Number(points[0]) + Number(points[6])) / 2;
    //calculate midY
    var midY = (Number(points[1]) + Number(points[3])) / 2;
    // do you stuff here with polygon
    //polygon.style('fill','red'); //test
    //select the svg that the polygon is in
    var polygonParent = polygon.select(function() { return this.parentNode; });
    //clean the last selection
      //select the parent and grand parent!
    var svgParent = polygonParent.select(function() { return this.parentNode; });
    var svgGrandParent = svgParent.select(function() { return this.parentNode; });
      //delete icon element from all children
    svgGrandParent.selectAll('.view').remove();
    //add icon
    polygonParent.append('text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr("x", midX)
                .attr("y", midY)
                .attr("class", "view")
                .style('font-family','FontAwesome')
                .style('font-size','20px')
                .style('fill', function(d){
                  if(attacker===false) {return "blue"}
                  else {return "red"}
                  ;})
                .text(function (d) {
                if(attacker===false){return '\uf2be'}
                else {return '\uf183'}
                ;})
    var object = {
    location: roomId,
    }
    //var params = JSON.stringify( { "t2": roomId } )
    $.ajax({
        type: 'POST',
        data: {params:object},
        url: '/static/ppaths/location.json',
        success: function (data) {
            console.log(data);
        },
        error: function () {
            alert('error');
        }
    });
});

  // set dest button
  $(document).on('click', '.set-dest-btn', function(){
      var roomId = $(this).data('roomId');
      var polygon = d3.select('#'+roomId);
      var points = polygon.attr('points').split(",");
      //calculate midX
      var midX = (Number(points[0]) + Number(points[6])) / 2;
      //calculate midY
      var midY = (Number(points[1]) + Number(points[3])) / 2;
      // do you stuff here with polygon
      //select the svg that the polygon is in
      var polygonParent = polygon.select(function() { return this.parentNode; });
      //clean the last selection
        //select the parent
      var svgParent = polygonParent.select(function() { return this.parentNode; });
        //delete icons
      svgParent.selectAll('.dest').remove();
      polygonParent.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr("x", midX)
                    .attr("y", midY)
                    .attr("class", "dest")
                    .style('font-family','FontAwesome')
                    .style('font-size','25px')
                    .style('fill', 'green')
                    .text(function (d) {
                    return '\uf041'
                  });
});

$(document).one('click', '.set-dest-btn', function(){
  var roomId = $(this).data('roomId');
  var polygon = d3.select('#'+roomId);
  var polygonParent = polygon.select(function() { return this.parentNode; });
  var svgParent = polygonParent.select(function() { return this.parentNode; });

  drawPath();
  setInterval(drawPath, 4000);
  });

  $('.coverage-area').click(function(){
    console.log('the ID of this coverage area is: '+$(this).attr('id'));
  });
});

function drawDefs (floor){
  d3.selectAll("."+floor+'Defs').remove();
  var defs = d3.select("#"+floor).append("defs")
                                      .attr("class", floor+'Defs')
  defs.append("marker")
      .attr("id", floor+"Arrowhead")
      .attr("refX", 10)
      .attr("refY", 6)
      .attr("markerWidth", 20)
      .attr("markerHeight", 20)
      .attr("orient", "auto")
      .attr("markerUnits", "userSpaceOnUse")
      .append("path")
          .attr("d", "M0,0 L0,12 L20,7 z") //this is actual shape for arrowhead
          .attr("fill", "#FF6009");

  defs.append("marker")
      .attr("id", floor+"Square")
      .attr("refX", 7)
      .attr("refY", 6)
      .attr("markerWidth", 12)
      .attr("markerHeight", 12)
      .attr("orient", "auto")
      .attr("markerUnits", "userSpaceOnUse")
      .append("rect")
          .attr("x", 1)
          .attr("y", 1)
          .attr("width", 12)
          .attr("height", 12)
          .attr("stroke", "none")
          .attr("fill", "#FF6009");
};

function drawPath(floor){
  var floorArray = []
  $(path[floor]).each(function(i, val){ //this is where I need to select.
        var roomIdPath = path[floor][i];
        //console.log(roomIdPath);
        var points = d3.select('#'+roomIdPath).attr('points').split(",");
        var midX = (Number(points[0]) + Number(points[6])) / 2;
        var midY = (Number(points[1]) + Number(points[3])) / 2;
        floorArray.push({"x": midX, "y": midY});
      });
  console.log(floorArray);
  var lineFunction = d3.line()
                        .x(function(d) { return d.x; })
                        .y(function(d) { return d.y; });
  d3.selectAll("."+floor+'Path').remove();
  //var gContainer = svgParent.append("g");
  var lineGraph = d3.select("#"+floor).append("path")
                                          .attr("class", floor+'Path')
                                          //.attr("id" , "firstPath")
                                          .attr("d", lineFunction(floorArray))
                                          .attr("stroke", "#191970")
                                          .attr("stroke-width", 3)
                                          .attr("fill", "none")
                                          .attr("marker-start", "url(#"+floor+"Square)")
                                          .attr("marker-mid", "url(#"+floor+"Square)")
                                          .attr("marker-end", "url(#"+floor+"Arrowhead)")
                                          .attr("stroke-linecap","round")

  var totalLength = lineGraph.node().getTotalLength();
  lineGraph.attr("stroke-dasharray", totalLength + " " + totalLength)
           .attr("stroke-dashoffset", totalLength)
           .transition()
              .duration(2500)
              .attr("stroke-dashoffset", 0);
};

function drawPath (){
  drawDefs("firstFloor");
  drawDefs("secondFloor");
  drawDefs("basementFloor");
  drawPath("firstFloor");
  drawPath("secondFloor");
  drawPath("basementFloor");
};

var badGuys = [];
var path =[]
function ajaxd(){
  $.ajax({
  dataType: "json",
  async: false,
  url: "/static/ppaths/JSON.json",
  cache: false,  //do not cache
  success: function(data){
    badGuys = data.badGuys;
    path = data.path;
    attacker = data.attacker;
  }
  });
};
console.log(badGuys);
console.log(path);

// var JSONdata = $.parseJSON($.ajax({
//     url:  '/static/ppaths/JSON.json',
//     dataType: "json",
//     cache: false,  //do not cach
//     async: false
// }).responseText);

var canvas;

//button functions
$('#firstFloorBtn').click(function(){
    $(this).siblings().removeClass('active');
    $(this).toggleClass('active');
    //canvas.remove();
    hideFloors();
    $('#firstFloor').show();

    $('.coverage-area').popover({
      'html': true,
      //container: 'body',
      trigger: 'focus'
    });
});

$('#secondFloorBtn').click(function(){
    $(this).siblings().removeClass('active');
    $(this).toggleClass('active');
    //canvas.remove();
    //secondFloor();
    hideFloors();
    $('#secondFloor').show();

    $('.coverage-area').popover({
      'html': true,
      //container: 'body',
      trigger: 'focus'
    });
});

$('#basementFloorBtn').click(function(){
    $(this).siblings().removeClass('active');
    $(this).toggleClass('active');
    //canvas.remove();
    //basementFloor();
    hideFloors();
    $('#basementFloor').show();

    $('.coverage-area').popover({
      'html': true,
      //container: 'body',
      trigger: 'focus'
    });
});

function drawThreat (roomId){
  var polygon = d3.select('polygon#'+roomId);
  var points = polygon.attr('points').split(",");
  var midX = (Number(points[0]) + Number(points[6])) / 2;
  var midY = (Number(points[1]) + Number(points[3])) / 2;
  polygonParent = polygon.select(function() { return this.parentNode; });
  polygonParent
    .append('text')
    .attr("class", "threat")
    .attr("x", midX)  // first element of each set
    .attr("y", midY)  // second element of each set
    .text('\uf21b');
 };

function updateThreat(){
     setInterval(function(){
       d3.selectAll('.threat').remove();         // makes sure we don't have old icons
         $.each(badGuys, function(i, val) {
           //console.log(val);
           drawThreat(val);
         });
     }, 5000);
 };

function createPopover(roomId) {
     var content = '<button id="view" data-room-id="'+roomId+'" class="btn btn-sm btn-primary view-cam-btn">View Camera</button>'+
                   '<button id="set" data-room-id="'+roomId+'" class="btn btn-sm btn-primary set-dest-btn">Set Destination</button> ';
     return content;
}

function hideFloors() {
  $('#firstFloor').hide();
  $('#secondFloor').hide();
  $('#basementFloor').hide();
}

function createRoom(number,polygon){
  var roomId = 'room'+number;
  var content = createPopover(roomId);
  var room  = canvas.append("g")
    .append("polygon")
    .attr("points", polygon)
    .attr("class", "coverage-area")
    .attr("id", roomId)
    .attr("data-toggle", "popover")
    .attr('data-placement', 'top')
    .attr("data-content", content)
    .attr("tabindex", "0")
    .attr("data-trigger", "focus");
    return room;
}

function drawFirstFloor() {
  $("#firstFloorBtn").siblings().removeClass('active')
  $("#firstFloorBtn").addClass("active");
  // create an svg element and append it
  canvas = d3.select("#map")
    .append("svg")
      .attr("width", 500)
      .attr("height", 500)
      .attr("id", "firstFloor")
      .attr("class", "canvas-selector");

  // draw Polygons
  var roomA1 = createRoom('A1',[[65, 215], [65, 250], [140, 250], [140, 215]]); //[102.5, 232.5]
  var roomA2 = createRoom('A2',[[140, 215], [140, 278], [230, 278], [230, 215]]);
  var roomA3 = createRoom('A3',[[230, 215], [230, 278], [320, 278], [320, 215]]);
  var roomA4 = createRoom('A4',[[320, 215], [320, 278], [400, 278], [400, 215]]);
  var roomA5 = createRoom('A5',[[65, 250], [65, 278], [140, 278], [140, 250]]);
  var roomA6 = createRoom('A6',[[42, 215], [42, 278], [65, 278], [65, 215]]);
  var roomA7 = createRoom('A7',[[332, 120], [332, 215], [355, 215], [355, 120]]);
  var roomA8 = createRoom('A8',[[302, 120], [302, 215], [332, 215], [332, 120]]);
  var roomA9 = createRoom('A9',[[302, 99], [302, 120], [355, 120], [355, 99]]);
  var roomA9 = createRoom('A10',[[408, 215], [408, 278], [462, 278], [462, 215]]);
 };

function drawSecondFloor(){
  $("#secondFloorBtn").siblings().removeClass('active')
  $("#secondFloorBtn").addClass("active");
  canvas = d3.select("#map")
    .append("svg")
      .attr("width", 500)
      .attr("height", 500)
      .attr("id", "secondFloor")
      .attr("class", "canvas-selector");

  var roomB1 = createRoom('B1', [[362, 218], [362, 282], [490, 282], [490, 218]]);
  var roomB2 = createRoom('B2', [[280, 218], [280, 282], [362, 282], [362, 218]]);
  var roomB3 = createRoom('B3', [[200, 218], [200, 282], [280, 282], [280, 218]]);
  var roomB4 = createRoom('B4', [[143, 218], [143, 282], [200, 282], [200, 218]]);
  var roomB5 = createRoom('B5', [[106, 253], [106, 282], [143, 282], [143, 253]]);
  var roomB6 = createRoom('B6', [[22, 253], [22, 282], [106, 282], [106, 253]]);
  var roomB7 = createRoom('B7', [[22, 218], [22, 253], [110, 253], [110, 218]]);
  var roomB8 = createRoom('B8', [[334, 70], [334, 218], [363, 218], [363, 70]]);
  var roomB9 = createRoom('B9', [[306, 70], [306, 218], [334, 218], [334, 70]]);
  var roomB10 = createRoom('B10', [[368, 80], [368, 211], [400, 211], [400, 80]]);
  var roomB11 = createRoom('B11', [[368, 12], [368, 80], [490, 80], [490, 12]]);
  var roomB12 = createRoom('B12', [[23, 70], [23, 215], [176, 215], [176, 70]]);
}

function drawBasementFloor(){
  $("#basementFloorBtn").siblings().removeClass('active')
  $("#basementFloorBtn").addClass("active");
  canvas = d3.select("#map")
    .append("svg")
      .attr("width", 500)
      .attr("height", 500)
      .attr("id", "basementFloor")
      .attr("class", "canvas-selector");

  var roomC1 = createRoom('C1', [[79, 219], [79, 247], [139, 247], [139, 219]]);
  var roomC2 = createRoom('C2', [[139, 219], [139, 282], [176, 282], [176, 219]]);
};

$('#attackerButton').click(function (){
    $(this).addClass("active");
    $('#question').text("You have identified this person as an attacker.");
    $('body').css('background', '#ff0000');
    $('body').css('color', '#fff');
    $('#identifier').text("Attacker");
    $('#map').css('border', '0');
    attacker = true;
});

$('#civilianButton').click(function (){
    $(this).addClass("active");
    $('#question').text("You have identified this person as a civilian.");
    $('body').css('background', 'white');
    $('body').css('color', 'black');
    $('#identifier').text("Civilian");
    $('#map').css('border', '1px solid #ccc');
    attacker = false;
  });
