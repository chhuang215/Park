import { Template } from 'meteor/templating';

//import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Weather} from 'meteor/selaias:meteor-simpleweather';
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
Template.main.onRendered(function() {

  var options = {
    location: "Calgary, Alberta",
    unit: 'c',
    success: function(weather) {
      html = '<h3><i class="sw icon-'+weather.code+'"></i> '
      html += weather.temp+'&deg;'+weather.units.temp+'</h3>';
      html += '<ul><li>'+weather.city+', '+weather.region +'</li>';
      //html += '<li class="currently">'+weather.currently+'</li>';

      $("#weather").html(html);
    },
    error: function(error) {
      $("#weather").html('<p>'+error+'</p>');
    }
  }

  Weather.options = options;
  Weather.load();
});
