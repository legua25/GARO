
const latlng = class {
    
    constructor (lat, lng) {
        this.lat = lat;
        this.lng = lng;
    }
    
};

window.latlng = latlng;

function initMap() {
    
    const MARKER_ICON = 'img/spectacular.png';
    const MAP = new google.maps.Map(document.querySelector('#map'), {
        'zoom': 12, 
        'center': new latlng(20.59111, -100.39111), 
        'scrollwheel': false
    });

    function make_marker(ad, click) {

        let marker = new google.maps.Marker({
            'position': ad.location, 
            'map': MAP, 
            'icon': MARKER_ICON, 
            'title': ad.title
        });

        if (click !== undefined)
            marker.addListener('click', click);
    }
    window.make_marker = make_marker;
    
    make_marker({ 'title': 'Parque Querétaro', 'location': new latlng(20.617167, -100.401361) }, () => {
        
        let modal = $('#portfolioModal1');
        console.log(modal);
    });
    make_marker({ 'title': 'Parque Querétaro 2', 'location': new latlng(20.617000, -100.396500) });
    make_marker({ 'title': 'Carretera Celaya - Cuota', 'location': new latlng(20.576806, -100.408306) });
    make_marker({ 'title': 'Libramiento Surponiente', 'location': new latlng(20.550194, -100.374222) });
    make_marker({ 'title': 'Prolongación Zaragoza', 'location': new latlng(20.580444, -100.409778) });
    make_marker({ 'title': 'Finsa', 'location': new latlng(20.5774648, -100.2009594) });
    make_marker({ 'title': 'MexQro197', 'location': new latlng(20.56756, -100.2512922) });     
    make_marker({ 'title': 'Colorado', 'location': new latlng(20.5661716, -100.2465773) });        
}
