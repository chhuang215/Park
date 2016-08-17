import { Template } from 'meteor/templating';

import { GoogleMaps } from 'meteor/dburles:google-maps';

import './parkMap.html';

Template.parkMap.helpers({
  mapOptions() {
    // Make sure the maps API has loaded
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
  GoogleMaps.ready('parkMap', function(map) {
   // Add a marker to the map once it's ready
   var positions = [
     {lat:51.0440916, lng:-114.1900152},
     {lat:51.1254236, lng:-114.1563701},
     {lat:51.0913963, lng:-114.0479861},
   ];
   for (var i = 0; i < positions.length; i++) {
     var marker = new google.maps.Marker({
       position: positions[i],
       map: map.instance,
       label: (i+1).toString(),
     });
   }

 });
});

Template.parkMap.onRendered(function() {
  GoogleMaps.load({key: 'AIzaSyCd-5haHDEEa8HjyaRaLq8aczxuwkP5ZMs'});
});
