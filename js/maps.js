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
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: centroperro,
    scrollwheel: false,
      
  });

  var marker = new google.maps.Marker({
    position: alamos,
    map: map,
    icon: "img/spectacular.png",
    title: 'Alamos'
  });
      var marker2 = new google.maps.Marker({
    position: indereq,
    map: map,
    icon: "img/spectacular.png",          
    title: 'Alamos'
  });
      var marker3 = new google.maps.Marker({
    position: indereq2,
    map: map,
    icon: "img/spectacular.png",          
    title: 'Alamos'
  });
      var marker4 = new google.maps.Marker({
    position: celayacuota,
    map: map,
    title: 'Alamos',
    icon: "img/spectacular.png"
          
  });
      var marker5 = new google.maps.Marker({
    position: surponiente,
    map: map,
    title: 'Alamos',
    icon: "img/spectacular.png"
          
  });
      var marker6 = new google.maps.Marker({
    position: zaragoza,
    map: map,
    title: 'Alamos',
    icon: "img/spectacular.png"
          
  });
      var marker7 = new google.maps.Marker({
    position: finsa,
    map: map,
    title: 'Alamos',
    icon: "img/spectacular.png"
          
  });
      var marker8 = new google.maps.Marker({
    position: mexqro,
    map: map,
    title: 'Alamos',
    icon: "img/spectacular.png"
          
  });
    
      var marker9 = new google.maps.Marker({
    position: colorado,
    map: map,
    title: 'Alamos',
    icon: "img/spectacular.png"
          
  });
      var marker10 = new google.maps.Marker({
    position: aeropuertoalv,
    map: map,
    title: 'Alamos',
    icon: "img/spectacular.png"
          
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
    
}

/*
    let mark7 = make_marker({ 'title': 'Parque Querétaro', 'location': new latlng(20.617167, -100.401361) }, () => {
        
        console.log('here');
        console.log($('a#modal-1'));
        $('a#modal-1').trigger('click');
    });
    let mark8= make_marker({ 'title': 'Parque Querétaro 2', 'location': new latlng(20.617000, -100.396500) }, () => {
    });
    let mark1 = make_marker({ 'title': 'Carretera Celaya - Cuota', 'location': new latlng(20.576806, -100.408306) });
    let mark2 = make_marker({ 'title': 'Libramiento Surponiente', 'location': new latlng(20.550194, -100.374222) });
    let mark3 = make_marker({ 'title': 'Prolongación Zaragoza', 'location': new latlng(20.580444, -100.409778) });
    let mark4 = make_marker({ 'title': 'Finsa', 'location': new latlng(20.5774648, -100.2009594) });
    let mark5 = make_marker({ 'title': 'MexQro197', 'location': new latlng(20.56756, -100.2512922) });     
    let mark6 = make_marker({ 'title': 'Colorado', 'location': new latlng(20.5661716, -100.2465773) }); */