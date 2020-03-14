// This example displays a marker at the center of Australia.
// When the user clicks the marker, an info window opens.

function initMap() {
  var alamos = {lat: 20.6114998, lng: -100.3849255};
  var indereq ={lat:20.617167, lng: -100.401361};
  var indereq2 = {lat:20.617000, lng: -100.396500};
  var celayacuota = {lat:20.576806, lng: -100.408306};
  var surponiente ={lat:20.550194, lng:-100.374222};
  var zaragoza = {lat:20.580444, lng:-100.409778};
  var finsa = {lat:20.5774648, lng:-100.2009594};
  var mexqro = {lat:20.56756, lng:-100.2512922};
  var colorado = {lat:20.5661716, lng:-100.2465773};
  var aeropuertoalv = {lat:20.6068538, lng:-100.1467389};
  var centroperro = { lat: 20.5923748, lng:-100.2832912 };
  var carmen = { lat:20.571844, lng: -100.2728297};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: centroperro,
    scrollwheel: false,
      
  });

  var marker = new google.maps.Marker({
    position: alamos,
    map: map,
    icon: "../../server/static/img/spectacular.png",
    title: 'Alamos'
  });
      var marker2 = new google.maps.Marker({
    position: indereq,
    map: map,
    icon: "../../server/static/img/spectacular.png",          
    title: 'INDEREQ'
  });
      var marker3 = new google.maps.Marker({
    position: indereq2,
    map: map,
    icon: "../../server/static/img/spectacular.png",          
    title: 'INDEREQ2'
  });
      var marker4 = new google.maps.Marker({
    position: celayacuota,
    map: map,
    title: 'Celaya Cuota',
    icon: "../../server/static/img/spectacular.png"
          
  });
      var marker5 = new google.maps.Marker({
    position: surponiente,
    map: map,
    title: 'Surponiente',
    icon: "../../server/static/img/spectacular.png"
          
  });
      var marker6 = new google.maps.Marker({
    position: zaragoza,
    map: map,
    title: 'Zaragoza',
    icon: "../../server/static/img/spectacular.png"
          
  });
      var marker7 = new google.maps.Marker({
    position: finsa,
    map: map,
    title: 'FINSA',
    icon: "../../server/static/img/spectacular.png"
          
  });
      var marker8 = new google.maps.Marker({
    position: mexqro,
    map: map,
    title: 'Carretera MexQro',
    icon: "../../server/static/img/spectacular.png"
          
  });
    
      var marker9 = new google.maps.Marker({
    position: colorado,
    map: map,
    title: 'El Colorado',
    icon: "../../server/static/img/spectacular.png"
          
  });
      var marker10 = new google.maps.Marker({
    position: aeropuertoalv,
    map: map,
    title: 'Aeropuerto',
    icon: "../../server/static/img/spectacular.png"
          
  });    
    
    var marker11 = new google.maps.Marker({
    position: carmen,
    map: map,
    title: 'Carmen',
    icon: "../../server/static/img/spectacular.png"        
    });
    
    
  marker.addListener('click', function() {
    $("#portfolioModal6").modal();
  });
    
  marker2.addListener('click', function() {
    $("#portfolioModal7").modal();
  });
    
  marker3.addListener('click', function() {
    $("#portfolioModal4").modal();
  });
  marker4.addListener('click', function() {
    $("#portfolioModal1").modal();
  });
  marker5.addListener('click', function() {
    $("#portfolioModal5").modal();
  }); 
  marker6.addListener('click', function() {
    $("#portfolioModal3").modal();
  });
  marker7.addListener('click', function() {
    $("#portfolioModal2").modal();
  });
  marker8.addListener('click', function() {
    $("#portfolioModal8").modal();
  });
    
  marker9.addListener('click', function() {
    $("#portfolioModal9").modal();
  });
  marker10.addListener('click', function() {
    $("#portfolioModal10").modal();
  });    
  marker11.addListener('click', function() {
    $("#portfolioModal11").modal();
  });        
    
}
