import { Template } from 'meteor/templating';

import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Geolocation} from 'meteor/mdg:geolocation';
import { Session } from 'meteor/session';
import './parkMap.html';

var parkingSpot = [
    // Test Marker: Northland Walmart parking
    {position:{lat:51.0982289, lng:-114.1450605}, info:"Hello fker, This is ghetto Walmart."},
    {position:{lat:51.13661, lng:-114.160626}, info:"You sick fk, This is poor people SuperStore."}
//    {lat:51.0440916, lng:-114.1900152},
//    {lat:51.1254236, lng:-114.1563701},
//    {lat:51.0913963, lng:-114.0479861},
];

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

Template.parkMap.events({
  'click .btnNavTo'(event) {
    console.log(event.currentTarget.id);

  },
});

Template.parkMap.onRendered(function(){

});

var openedInfoWindow = null;

Template.parkMap.onCreated(function (){
  var self = this;
  GoogleMaps.ready('parkMap', function(map) {
   // TEST: Add a marker to the map once it's ready



   // Put the markers on
   for (var i = 0; i < parkingSpot.length; i++) {


     var locationInfoWindow = new google.maps.InfoWindow({
        content: '<div id=p'+i+'><p>'+ parkingSpot[i].info +'</p> <br /> <button class="btn btn-warning btnNavTo" id="'+i+'">Click here to fking navigate</button></div>'
      });
      // Add event listener for infowindow
      // google.maps.event.addListener(locationInfoWindow, 'domready', function() {
      //     console.log("LISTENER: " + "btnNavTo"+i) ;
      //     document.getElementById("btnNavTo"+i).addListener("click", function(e) {
      //       //  e.stop();
      //         console.log("hi! " + i);
      //     });
      // });


      // Initialize new marker
     var marker = new google.maps.Marker({
       position: parkingSpot[i].position,
       map: map.instance,
       label: (i+1).toString(),
       infowindow: locationInfoWindow
     });

    google.maps.event.addListener(marker, 'click', function () {
        // Close any existing infowindow

        if(openedInfoWindow) openedInfoWindow.close();

        // Open infowindow when marker is clicked
        openedInfoWindow = this.infowindow;
        this.infowindow.open(map, this);
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
    // var centerControlDiv = document.createElement('div');
    // var centerControl = new CenterControl(centerControlDiv, map, chicago);

    // Center and zoom the map view onto the current position.
     map.instance.setCenter(currMarker.getPosition());
     map.instance.setZoom(8);
   });
  });
});

Template.parkMap.onRendered(function() {
  // Load api
  GoogleMaps.load({key: 'AIzaSyCd-5haHDEEa8HjyaRaLq8aczxuwkP5ZMs'});
});
