import { Template } from 'meteor/templating';

import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Geolocation} from 'meteor/mdg:geolocation';
import './parkMap.html';

Template.parkMap.helpers({
  mapOptions() {
    // check if maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      return {
        disableDefaultUI: true,
        center: new google.maps.LatLng(51.0440916, -114.1900152),
        zoom: 8,
        zoomControl: true,
        rotateControl: true,
        rotateControlOptions:  {
          position: google.maps.ControlPosition.LEFT_BOTTOM
        },
        scaleControl: true,
        panControl : true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL,
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
      };
    }
  },
});


Template.parkMap.onCreated(function (){
  var self = this;
  GoogleMaps.ready('parkMap', function(map) {
   // TEST: Add a marker to the map once it's ready

    var positions = [
        // Test Marker: Northland Walmart parking
        {lat:51.0982289, lng:-114.1450605}
  //    {lat:51.0440916, lng:-114.1900152},
  //    {lat:51.1254236, lng:-114.1563701},
  //    {lat:51.0913963, lng:-114.0479861},
   ];

   // Put the markers on
   for (var i = 0; i < positions.length; i++) {
     // Initialize new marker
     var marker = new google.maps.Marker({
       position: positions[i],
       map: map.instance,
       label: (i+1).toString(),
     });

     var contentString = '<div id=p'+i+'>Hello mofo <button>Click here to fking navigate</button></div>'
    //  var contentString = '<div id="content">'+
    //         '<div id="siteNotice">'+
    //         '</div>'+
    //         '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
    //         '<div id="bodyContent">'+
    //         '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
    //         'sandstone rock formation in the southern part of the '+
    //         'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
    //         'south west of the nearest large town, Alice Springs; 450&#160;km '+
    //         '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
    //         'features of the Uluru - Kata Tjuta National Park. Uluru is '+
    //         'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
    //         'Aboriginal people of the area. It has many springs, waterholes, '+
    //         'rock caves and ancient paintings. Uluru is listed as a World '+
    //         'Heritage Site.</p>'+
    //         '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
    //         'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
    //         '(last visited June 22, 2009).</p>'+
    //         '</div>'+
    //         '</div>';

     var locationInfoWindow = new google.maps.InfoWindow({
        content: contentString
      });

     marker.addListener('click', function() {
       locationInfoWindow.open(map, marker);
     });
   }

   var currMarker;

   // Create and move the marker when latLng changes.
   self.autorun(function() {
     // Get current lat lng
     var latLng = Geolocation.latLng();
     if (! latLng) return;

     // Mark current location
     if (! currMarker) {
       currMarker = new google.maps.Marker({
         position: new google.maps.LatLng(latLng.lat, latLng.lng),
         map: map.instance,
         label: "Yo"
       });
     }
     else {
        currMarker.setPosition(latLng);
    }
    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map, chicago);

    // Center and zoom the map view onto the current position.
     map.instance.setCenter(marker.getPosition());
     map.instance.setZoom(15);
   });
  });
});

Template.parkMap.onRendered(function() {
  // Load api
  GoogleMaps.load({key: 'AIzaSyCd-5haHDEEa8HjyaRaLq8aczxuwkP5ZMs'});
});
