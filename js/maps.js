function initMap() {
  var myLatLng = {lat: 20.59111, lng: -100.39111};
  var myLatLng2 = {lat: 20.614728, lng: -100.3894137};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: myLatLng
  });

  var image = 'img/spectacular.png';
  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    icon: image,  
    title: 'Hello World!'
  });
    
  var marker2 = new google.maps.Marker({
    position: myLatLng2,
    map: map,
    icon: image,
    title: 'Hello World2!'
  });
    
}
