import { Template } from 'meteor/templating';

import { GoogleMaps } from 'meteor/dburles:google-maps';

import './main.html';

// Template.hello.onCreated(function helloOnCreated() {
//
// });

// Template.main.helpers({
//   mapOptions() {
//     // Make sure the maps API has loaded
//     if (GoogleMaps.loaded()) {
//       // Map initialization options
//       return {
//         center: new google.maps.LatLng(51.0440916, -114.1900152),
//         zoom: 8,
//       };
//     }
//   },
// });
//
//
// Template.main.onCreated(function (){
//   GoogleMaps.ready('parkMap', function(map) {
//    // Add a marker to the map once it's ready
//   //  var marker = new google.maps.Marker({
//   //    position: map.options.center,
//   //    map: map.instanc
//   //  });
//  });
// });
//
// Template.main.onRendered(function() {
//   GoogleMaps.load({key: 'AIzaSyCd-5haHDEEa8HjyaRaLq8aczxuwkP5ZMs'});
// });
