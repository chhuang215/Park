import { Template } from 'meteor/templating';

import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Geolocation} from 'meteor/mdg:geolocation';
import { Session } from 'meteor/session';
import { ParkingSpot } from '/lib/collections/ParkingSpot.js';
import './parkMap.html';

var openedInfoWindow = null;
var currentDestinationMarker = null;
var mouseup = false;
var drag = false;

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
  'click .btnNavToParkingSpot'(event) {
    //console.log();
    if(openedInfoWindow) openedInfoWindow.close();
    let spot = ParkingSpot.findOne({_id: event.currentTarget.id});

    var map = GoogleMaps.maps.parkMap.instance;
    let fromLocation = Geolocation.latLng();
    let toLocation = spot.position;


    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    let request = {
      origin: fromLocation,
      destination: toLocation,
      travelMode: 'DRIVING',
      drivingOptions: {
        departureTime: new Date(Date.now()),
        trafficModel: 'optimistic',
      },
      provideRouteAlternatives: true
    }
    directionsService.route(request, function(result, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(result);
      }
    });
  },

  'click .btnNavToDestination'(event){

  },


});

Template.parkMap.onCreated(function (){
  // Load api
  GoogleMaps.load({key: 'AIzaSyCd-5haHDEEa8HjyaRaLq8aczxuwkP5ZMs'});

  var self = this;

  GoogleMaps.ready('parkMap', function(map) {

    map.instance.addListener('click', function(e) {
      if(openedInfoWindow) openedInfoWindow.close();
    });

    // map.instance.addListener('rightclick', function(e) {
    //   setNewDestination(map, e.latLng);
    // });

    map.instance.addListener('mousedown', function(e) {
      mousedUp = false;
      setTimeout(function(){
          if(mousedUp === false && !drag){
            setNewDestination(map, e.latLng);
          }
      }, 500);

    });

    map.instance.addListener('mouseup', function(event){
      mousedUp = true;
      drag = false;
    });

    map.instance.addListener('drag', function(event){
      drag = true;
    });

    map.instance.addListener('dragend', function(event){
      drag = false;
    });

   // Put the markers on
   let parkingSpot = ParkingSpot.find().fetch();
   for (var i = 0; i < parkingSpot.length; i++) {

     let contentInfo = '<div id=p'+i+'><p>'+ parkingSpot[i].info +'</p> <br /> <button class="btn btn-warning btnNavToParkingSpot" id="'+parkingSpot[i]._id+'">Click here to fking navigate</button></div>';
     var locationInfoWindow = new google.maps.InfoWindow({
        content: contentInfo
      });

      // Initialize new markers
     var marker = new google.maps.Marker({
       position: parkingSpot[i].position,
       map: map.instance,
       label: (i+1).toString(),
       infowindow: locationInfoWindow
     });

    google.maps.event.addListener(marker, 'click', function () {
        // Close any existing infowindow
        if(!currentDestinationMarker){
          if(openedInfoWindow) openedInfoWindow.close();

          // Open infowindow when marker is clicked
          openedInfoWindow = this.infowindow;
          this.infowindow.open(map, this);
        }
    });
   }

  let currMarker = null;

  let latLng = null;

  circle = getCircle(map.instance, 500);

  // Create and move the marker when latLng changes.
  self.autorun(function() {
    // Get current lat lng
     latLng = Geolocation.latLng();
     if (! latLng) return;

     // Mark current location
     if (! currMarker) {
       currMarker = new google.maps.Marker({
         position: new google.maps.LatLng(latLng.lat, latLng.lng),
         map: map.instance,
         label: "U"
       });

       // Center and zoom the map view onto the current position.
       map.instance.setCenter(currMarker.getPosition());
       map.instance.setZoom(11);
     }
     else {
       currMarker.setPosition(latLng);
     }

    // Display radius
    circle.bindTo('center', currMarker, 'position');

    // var centerControlDiv = document.createElement('div');
    // var centerControl = new CenterControl(centerControlDiv, map, chicago);
   });
  });
});

Template.parkMap.onRendered(function() {

});

function getCircle(map,radius){
  if(!radius) radius = 500;
  let circle = new google.maps.Circle({
    map: map,
    radius: radius,    // 500 km default
    strokeWeight: .5,
    fillColor: '#7BB2CA',
    fillOpacity: 0.2,
  //  center: currMarker.position
  });;
  return circle;
}

function setNewDestination(map, latLng){
  if(currentDestinationMarker){
    currentDestinationMarker.setPosition(latLng);;
  }
  else{

    let contentInfo = '<div> <button class="btn btn-warning btnNavToDestination">Click here to fking navigate</button></div>';

    let destinationInfoWindow = new google.maps.InfoWindow({
       content: contentInfo
    });

    currentDestinationMarker = new google.maps.Marker({
      position:latLng,
      draggable: true,
      label: 'D',
      map: map.instance,
      infowindow: destinationInfoWindow
    });

    google.maps.event.addListener(currentDestinationMarker, 'click', function () {
        // Close any existing infowindow

        if(openedInfoWindow) openedInfoWindow.close();

          // Open infowindow when marker is clicked
        openedInfoWindow = this.infowindow;
        this.infowindow.open(map, this);

    });

    google.maps.event.addListener(currentDestinationMarker,'mousedown', function(e) {
      mousedUp = false;
      setTimeout(function(){
          if(mousedUp === false){
            currentDestinationMarker.setMap(null);
            currentDestinationMarker=null;
          }
      }, 500);

    });

    google.maps.event.addListener(currentDestinationMarker,'mouseup', function(event){
      mousedUp = true;
    });
  }
}
