import { Template } from 'meteor/templating';

import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Geolocation} from 'meteor/mdg:geolocation';
import { Session } from 'meteor/session';
import { ParkingSpot } from '/lib/collections/ParkingSpot.js';
import './parkMap.html';

const DEFAULT_RADIUS = 500;

var openedInfoWindow = null;
var currentDestinationMarker = null;
var mouseup = false;
var drag = false;
var radiusCircle = null;
var currMarker = null;
var allParkingSpots = [];
var visibleMarker = [];
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

    if(openedInfoWindow) openedInfoWindow.close();
    let spot = ParkingSpot.findOne({_id: event.currentTarget.id});

    let fromLocation = Geolocation.latLng();
    let toLocation = spot.position;

    driveToDestination(fromLocation,toLocation);

  },
  'click .btnNavToSpotAndWalk'(event){
    if(openedInfoWindow) openedInfoWindow.close();
    let spot = ParkingSpot.findOne({_id: event.currentTarget.id});
    let fromLocation = Geolocation.latLng();
    let toLocation = spot.position;

    driveToDestination(fromLocation,toLocation);

    if(!currentDestinationMarker) return;
    fromLocation = toLocation;

    toLocation = currentDestinationMarker.getPosition();


    walkToDestination(fromLocation,toLocation);

  }
});

Template.parkMap.onCreated(function (){
  // Load api
  GoogleMaps.load({key: 'AIzaSyCd-5haHDEEa8HjyaRaLq8aczxuwkP5ZMs'});

  var self = this;

  GoogleMaps.ready('parkMap', function(map) {

    let mapInstance = map.instance;

    // Close any window if user click on anywhere on the map
    mapInstance.addListener('click', function(e) {
      if(openedInfoWindow) openedInfoWindow.close();
    });

    mapInstance.addListener('mousedown', function(e) {
      mousedUp = false;
      // If the user long press a location, adds a new marker as new destination
      setTimeout(function(){
          if(mousedUp === false && !drag){
            setNewDestination(map, e.latLng);
          }
      }, 500);

    });

    mapInstance.addListener('mouseup', function(event){
      mousedUp = true;
      drag = false;
    });

    mapInstance.addListener('drag', function(event){
      drag = true;
    });

    mapInstance.addListener('dragend', function(event){
      drag = false;
    });

   // Put the markers on parking spots
   let parkingSpot = ParkingSpot.find().fetch();
   for (var i = 0; i < parkingSpot.length; i++) {

     let contentInfo =
      '<div id=p'+i+'>'+
        '<p>'+ parkingSpot[i].info +'</p>'+
        '<br />'+
        '<button class="btn btn-sm btn-warning btnNavToParkingSpot" id="'+parkingSpot[i]._id+'">Click here to fking navigate</button>' +
        '<br />'+
        '<button class="btn btn-sm btn-success btnNavToSpotAndWalk" id="'+parkingSpot[i]._id+'">Click here to park and walk</button>'+
      '</div>' ;
     let locationInfoWindow = new google.maps.InfoWindow({
        content: contentInfo
      });

      // Initialize new markers
     let marker = new google.maps.Marker({
       position: parkingSpot[i].position,
       label: (i+1).toString(),
       infowindow: locationInfoWindow,
       id: parkingSpot[i]._id
     });

    marker.addListener('click', function () {
        // Close any existing infowindow
        if(!currentDestinationMarker){
          if(openedInfoWindow) openedInfoWindow.close();
        }
        // Open infowindow when marker is clicked
        openedInfoWindow = this.infowindow;
        this.infowindow.open(map, this);
    });
    allParkingSpots.push(marker);
    console.log(allParkingSpots);
   }

  let latLng = null;

  radiusCircle = createCircleRadius(map.instance, DEFAULT_RADIUS);

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
      map.instance.setZoom(14);
      map.instance.setCenter(currMarker.getPosition());

     }
     else {
       currMarker.setPosition(latLng);
     }
     findNearSpots(currMarker.getPosition(), map);
     // Display radius if the radius if there is no destination set
     if(!currentDestinationMarker)
        radiusCircle.bindTo('center', currMarker, 'position');

   });
  });
});

Template.parkMap.onRendered(function() {

});

//---------------FUNCTIONS-----------------//
/**
 * Generate a new circle overlay with default radius=500
 */
function createCircleRadius(map, radius = DEFAULT_RADIUS, color = '#7BB2CA'){

  let circle = new google.maps.Circle({
    map: map,
    radius: radius,    // 500 km default
    strokeWeight: .5,
    fillColor: '#7BB2CA',
    fillOpacity: 0.2,
    clickable: false,
  //  center: currMarker.position
  });
  return circle;
}

/**
 * Add marker on the map to set a new destination
 */
function setNewDestination(map, latLng){



  if(currentDestinationMarker){
    currentDestinationMarker.setPosition(latLng);
  }
  else{

    currentDestinationMarker = new google.maps.Marker({
      position:latLng,
      draggable: true,
      label: 'D',
      map: map.instance,
    });

    // Display radius
    radiusCircle.bindTo('center', currentDestinationMarker, 'position');

    //radiusCircle.setMap(map.instance);

    google.maps.event.addListener(currentDestinationMarker,'mousedown', function(e) {
      mousedUp = false;
      setTimeout(function(){
          if(mousedUp === false && !drag){

            currentDestinationMarker.setMap(null);
            currentDestinationMarker=null;
            radiusCircle.bindTo('center', currMarker, 'position');
            findNearSpots(currMarker.getPosition(), map);
          }
      }, 500);
    });

    google.maps.event.addListener(currentDestinationMarker,'mouseup', function(event){
      mousedUp = true;
      drag = false;
    });

    google.maps.event.addListener(currentDestinationMarker,'drag', function(event){
      drag = true;
    });

    google.maps.event.addListener(currentDestinationMarker,'dragend', function(event){
      drag = false;
      findNearSpots(currentDestinationMarker.getPosition(), map);
    });
  }
  findNearSpots(latLng, map);

}

/**
 * Find near parking spot with provided center location
 */
function findNearSpots(latLng, map){
  let lat = latLng.lat();
  let lng = latLng.lng();

  let nearSpots = ParkingSpot.find({
    loc: {
      $near: {
        $geometry: {
          type: "Point" ,
          coordinates: [ lng , lat ]
        },
        $maxDistance:DEFAULT_RADIUS
      }
    }
  }).fetch();

  // Clear visible markers if nearby have no parking spot
  if(nearSpots.length === 0){
     for(var i = 0; i < visibleMarker.length;i++){
        visibleMarker[i].setMap(null);
     }
     visibleMarker = [];
     return;
  }

  // Display near parking spot markers
  for (var i = 0; i < nearSpots.length; i++) {
    let nearSpot = nearSpots[i];

    for(var j = 0; j < allParkingSpots.length;j++){
      let spot = allParkingSpots[j];
      // If spot found, display it
      if(spot.id == nearSpot._id){
        spot.setMap(map.instance);
        visibleMarker.push(spot);
      }
      // Else make it invisible if it was visible
      else {
        if(spot.map) spot.setMap(null);
      }
    }
  }
}

function driveToDestination(fromLocation, toLocation){

  let mapInstance = GoogleMaps.maps.parkMap.instance;
  let directionsService = new google.maps.DirectionsService();
  let directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(mapInstance);
  directionsDisplay.setOptions( { suppressMarkers: true } );
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
}

function walkToDestination(fromLocation, toLocation){
  let mapInstance = GoogleMaps.maps.parkMap.instance;
  let directionsService = new google.maps.DirectionsService();
  let directionsDisplay = new google.maps.DirectionsRenderer({
    polylineOptions: {
      strokeColor: "green",
    }
  });
  directionsDisplay.setMap(mapInstance);
  directionsDisplay.setOptions( { suppressMarkers: true } );
  let request = {
    origin: fromLocation,
    destination: toLocation,
    travelMode: 'WALKING',
    // drivingOptions: {
    //   departureTime: new Date(Date.now()),
    //   trafficModel: 'optimistic',
    // },
    //provideRouteAlternatives: true
  }
  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(result);
    }
  });
}
