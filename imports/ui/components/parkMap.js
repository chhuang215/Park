import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { GoogleMaps } from 'meteor/dburles:google-maps';

import { Session } from 'meteor/session';
import { ParkingSpot } from '/imports/api/ParkingSpot/ParkingSpot.js';
import './parkMap.html';
import './parkingSpotList.js';
import './parkingSpotDetail.js';
const DEFAULT_RADIUS = 250;
const DRIVE_ONLY = 1;
const WALK_ONLY = 2;
const DRIVE_AND_WALK = 3;

var directionsService = null;
var directionsDisplayDrive = null;
var directionsDisplayWalk = null;

OpenedInfoWindow = null;
var currentDestinationMarker = null;

var radiusCircle = null;
var currentLocationMarker = null;

var markerToSearchNearby = new ReactiveVar(null);
var mouseup = false;
var drag = false;

var changeInMarkerList = new ReactiveVar(0);
var currentVisibleSpotMarkers = {};

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
  getParkingSpotList(){
    markerToSearchNearby.get();
    changeInMarkerList.get();

    let arryLst = [];

    for (var key in currentVisibleSpotMarkers) arryLst.push(currentVisibleSpotMarkers[key]);

    return arryLst;
  }
});

Template.parkMap.events({
  'click .btnNavToParkingSpot'(event) {

    let spot = ParkingSpot.findOne({_id: event.currentTarget.id});
    beginDirection(spot , DRIVE_ONLY);
  },
  'click .btnNavToSpotAndWalk'(event){

    let spot = ParkingSpot.findOne({_id: event.currentTarget.id});
    beginDirection(spot,  DRIVE_AND_WALK);
  }
});

Template.parkMap.onCreated(function (){
  // Load api
  GoogleMaps.load({key: 'AIzaSyCd-5haHDEEa8HjyaRaLq8aczxuwkP5ZMs', libraries: 'geometry,places' });

  var self = this;

  GoogleMaps.ready('parkMap', function(map) {
    let mapInstance = map.instance;

    // INITIALIZE Create the search box and link it to the UI element.
    var input = document.getElementsByClassName('tbSearch')[0];

    var searchBox = new google.maps.places.SearchBox(input);
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      console.log(places);
      if (places.length == 0) {
        return;
      }
      places.forEach(function(place) {
        //console.log(place.geometry);
      });
      // let markers = [];
      // // For each place, get the icon, name and location.
      // var bounds = new google.maps.LatLngBounds();
      // places.forEach(function(place) {
      //  if (!place.geometry) {
      //    console.log("Returned place contains no geometry");
      //    return;
      //  }
      //  var icon = {
      //    url: place.icon,
      //    size: new google.maps.Size(71, 71),
      //    origin: new google.maps.Point(0, 0),
      //    anchor: new google.maps.Point(17, 34),
      //    scaledSize: new google.maps.Size(25, 25)
      //  };
      //
      //  // Create a marker for each place.
      //  markers.push(new google.maps.Marker({
      //    map: mapInstance,
      //    icon: icon,
      //    title: place.name,
      //    position: place.geometry.location
      //  }));
      //
      //  if (place.geometry.viewport) {
      //    // Only geocodes have viewport.
      //    bounds.union(place.geometry.viewport);
      //  } else {
      //    bounds.extend(place.geometry.location);
      //  }
      // });
      // mapInstance.fitBounds(bounds);
    });


    //-----------Initialize direction service--------------
    directionsService = new google.maps.DirectionsService();
    directionsDisplayDrive = new google.maps.DirectionsRenderer();
    directionsDisplayDrive.setOptions( { suppressMarkers: true } );
    directionsDisplayWalk = new google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: "green",
      }
    });
    directionsDisplayWalk.setOptions( { suppressMarkers: true } );
    //-----------FINISH Initialize direction service--------------


    //-----------Initialize map's listener--------------
    // Close any window if user click on anywhere on the map
    mapInstance.addListener('click', function(e) {
      if(OpenedInfoWindow) CloseInfo();
    });

    mapInstance.addListener('mousedown', function(e) {
      mousedUp = false;
      // If the user long press a location, adds a new marker as new destination
      setTimeout(function(){
          if(mousedUp === false && !drag){
            markerToSearchNearby.set(null);
            setNewDestination(e.latLng);
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

    mapInstance.addListener('bounds_changed', function() {
      searchBox.setBounds(mapInstance.getBounds());
    });

    //-----------FINISH Initialize map's listener--------------

    //Initialize display of current location and location to search spots near by
    let latLng = null;

    radiusCircle = createCircleRadius(map.instance, DEFAULT_RADIUS);

    // Create and move the marker when latLng changes.
    self.autorun(function() {
      //Initialize display of current location and location to search spots near by
      let latLng = Session.get('currentLocation');
      if (latLng == null) return;

      // Mark current location
      if (!currentLocationMarker) {
        currentLocationMarker = new google.maps.Marker({
          position: new google.maps.LatLng(latLng.lat, latLng.lng),
          map: map.instance,
          label: "U"
        });

        // Center and zoom the map view onto the current position.
        map.instance.setZoom(14);
        map.instance.setCenter(currentLocationMarker.getPosition());
      } else {
        currentLocationMarker.setPosition(latLng);
      }

      // Get current marker for searching nearby parking spots
      let markerToSetRadiusAndSearchNear = markerToSearchNearby.get();

      // If no marker is set, default to current location
      if(markerToSetRadiusAndSearchNear == null) {
        markerToSearchNearby.set(currentLocationMarker);
        markerToSetRadiusAndSearchNear = currentLocationMarker;
      }

      // Display radius and search nearby parking spots
      radiusCircle.bindTo('center', markerToSetRadiusAndSearchNear, 'position');
      findNearSpots(markerToSetRadiusAndSearchNear.getPosition());
    });

  });

});

Template.parkMap.onRendered(function() {


});

//-----------------------------------------//
//---------------FUNCTIONS-----------------//
//-----------------------------------------//
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
  //  center: currentLocationMarker.position
  });
  return circle;
}

/**
 * Add marker on the map to set a new destination
 */
function setNewDestination(latLng){

  let map = GoogleMaps.maps.parkMap;

  if(currentDestinationMarker){
    currentDestinationMarker.setPosition(latLng);
  }
  else{

    currentDestinationMarker = new google.maps.Marker({
      position:latLng,
      draggable: true,
      label: 'D',
      map: map.instance,
      title: latLng.lat() + ','+latLng.lng()
    });

    google.maps.event.addListener(currentDestinationMarker,'mousedown', function(e) {
      mousedUp = false;
      // Remove marker if long press on the destination marker
      setTimeout(function(){
          if(mousedUp === false && !drag){
            currentDestinationMarker.setMap(null);
            currentDestinationMarker=null;
            resetDirectionsDisplay();
            markerToSearchNearby.set(null);
          }
      }, 500);
    });

    google.maps.event.addListener(currentDestinationMarker,'mouseup', function(event){
      mousedUp = true;
      drag = false;
    });

    google.maps.event.addListener(currentDestinationMarker,'drag', function(event){
      drag = true;
      markerToSearchNearby.set(currentDestinationMarker);
    });

    google.maps.event.addListener(currentDestinationMarker,'dragend', function(event){
      drag = false;
      markerToSearchNearby.set(currentDestinationMarker);
    });
  }
  markerToSearchNearby.set(currentDestinationMarker);

}

/**
 * Find near parking spot with provided center location
 */
function findNearSpots(latLng){
  let map = GoogleMaps.maps.parkMap;
  let mapInstance = map.instance;
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

  // Clear visible markers if not at nearby
  if(nearSpots.length === 0){
  //  CurrentVisibleSpotMarkerId.remove({});
    for(var i in currentVisibleSpotMarkers){
      currentVisibleSpotMarkers[i].setMap(null);
    }
    currentVisibleSpotMarkers = {};
    changeInMarkerList.set(0);
    resetDirectionsDisplay();
    return;
  }

  let tempVisibleMarker = {};
  // Display near parking spot markers
  for (var i = 0; i < nearSpots.length; i++) {
    let nearSpot = nearSpots[i];

    let contentInfo =
     '<div id=p'+i+'>'+
       '<p>'+ nearSpot.info +'</p>'+
       '<br />'+
       '<button class="btn btn-sm btn-warning btnNavToParkingSpot" id="'+nearSpot._id+'">Click here to fking navigate</button>' +
       '<br />'+
       '<button class="btn btn-sm btn-success btnNavToSpotAndWalk" id="'+nearSpot._id+'">Click here to park and walk</button>'+
       '<button class="btn btn-sm" data-toggle="modal" data-target="#test">Show detail</button>'+
     '</div>' ;
     let locationInfoWindow = new google.maps.InfoWindow({
       content: contentInfo
     });

     //let existedMarkerId = CurrentVisibleSpotMarkerId.findOne(nearSpot._id);
     let existedMarker = currentVisibleSpotMarkers[nearSpot._id];
     if(!existedMarker){
       // Initialize new markers
      let marker = new google.maps.Marker({
        position: nearSpot.position,
        label: (i+1).toString(),
        infowindow: locationInfoWindow,
        id: nearSpot._id,
      });
      marker.setMap(mapInstance);
      marker.addListener('click', function () {
         // Close any existing infowindow
         //if(!currentDestinationMarker){
            CloseInfo();
         //}
         // Open infowindow when marker is clicked
         OpenInfo(this);
        //  OpenedInfoWindow = this.infowindow;
        //  this.infowindow.open(map, this);
      });
      // CurrentVisibleSpotMarkerId.insert({_id:nearSpot._id});
      tempVisibleMarker[nearSpot._id] = marker;
     }
     else{
       existedMarker.setLabel((i+1).toString());
       tempVisibleMarker[nearSpot._id] = existedMarker;
     }
  }
  for(var j in currentVisibleSpotMarkers){
    if(!tempVisibleMarker[j]){
      currentVisibleSpotMarkers[j].setMap(null);
      delete currentVisibleSpotMarkers[j];
    }
  }
  if(currentVisibleSpotMarkers != tempVisibleMarker){
    currentVisibleSpotMarkers = tempVisibleMarker;
    changeInMarkerList.set(Object.keys(currentVisibleSpotMarkers).length);
  }
}

function beginDirection(spot, mode){
  CloseInfo();
  Session.set('direction', null)
  let fromLocation = Session.get('currentLocation');
  let toLocation = spot.position;
  if(mode == DRIVE_ONLY){
    driveToDestination(fromLocation,toLocation);
  } else if(mode == DRIVE_AND_WALK){
    driveToDestination(fromLocation,toLocation);
    if(!currentDestinationMarker) {
      return;
    }
    fromLocation = toLocation;
    toLocation = currentDestinationMarker.getPosition();
    walkToDestination(fromLocation, toLocation);
  } else if(mode == WALK_ONLY){

  }


}


function driveToDestination(fromLocation, toLocation){

  let mapInstance = GoogleMaps.maps.parkMap.instance;

  directionsDisplayDrive.setMap(mapInstance);

  let request = {
    origin: fromLocation,
    destination: toLocation,
    travelMode: 'DRIVING',
    drivingOptions: {
      departureTime: new Date(Date.now()),
      trafficModel: 'optimistic',
    },
    provideRouteAlternatives: true
  };

  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsDisplayDrive.setDirections(result);

      directionDriveDuration = result.routes[0].legs[0].duration;
      let d = Session.get('direction');
      if(!d){
        d = {};
      }
      d['driveVal'] = directionDriveDuration.value;
      d['driveText'] = directionDriveDuration.text;
      Session.set('direction', d);

    }
  });
}

function walkToDestination(fromLocation, toLocation){
  let mapInstance = GoogleMaps.maps.parkMap.instance;

  directionsDisplayWalk.setMap(mapInstance);

  let request = {
    origin: fromLocation,
    destination: toLocation,
    travelMode: 'WALKING',
  };

  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsDisplayWalk.setDirections(result);

      let directionWalkDuration = result.routes[0].legs[0].duration;
      let d = Session.get('direction');
      if(!d){
        d = {};
      }
      d['walkVal'] = directionWalkDuration.value;
      d['walkText'] = directionWalkDuration.text;
      Session.set('direction', d);

    }
  });
}

function resetDirectionsDisplay(){
  directionsDisplayDrive.setMap(null);
  directionsDisplayWalk.setMap(null);
  Session.set('direction', null);
}

OpenInfo = function (marker){
  if(marker.infowindow != OpenedInfoWindow){
    CloseInfo();
    let map = GoogleMaps.maps.parkMap;
    OpenedInfoWindow = marker.infowindow;
    marker.infowindow.open(map, marker);
  }
}

CloseInfo = function(){
  if(OpenedInfoWindow){
    OpenedInfoWindow.close();
  }
  OpenedInfoWindow = null;
}
