function initMap() {
  var myLatLng = {lat: 20.59111, lng: -100.39111};
  var parqueqro2000 = {lat: 20.617167, lng:  -100.401361};
  var parqueqro20002 = {lat: 20.617000, lng: -100.396500};
  var cuotacelaya = {lat: 20.576806, lng: -100.408306};
  var surponiente = {lat: 20.550194, lng: -100.374222};
  var zaragoza = {lat: 20.580444, lng: -100.409778};
  
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: myLatLng
  });

  var image = 'img/spectacular.png';
    
  var marker = new google.maps.Marker({
    position: parqueqro2000,
    map: map,
    icon: image,  
    title: 'Parque Querértaro'
  });
    
  var marker2 = new google.maps.Marker({
    position: parqueqro20002,
    map: map,
    icon: image,
    title: 'Parque Querétaro 2'
  });
    
    var marker3 = new google.maps.Marker({
    position: cuotacelaya,
    map: map,
    icon: image,
    title: 'Carretera cuota Celaya'
  });
    
    var marker4 = new google.maps.Marker({
    position: surponiente,
    map: map,
    icon: image,
    title: 'Libramiento surponiente'
  });
    
    var marker5 = new google.maps.Marker({
    position: zaragoza,
    map: map,
    icon: image,
    title: 'Prolongación Zaragoza'
  });
    
}
