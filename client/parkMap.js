import { Template } from 'meteor/templating';

import { GoogleMaps } from 'meteor/dburles:google-maps';
import { Geolocation } from 'meteor/mdg:geolocation';
import { Session } from 'meteor/session';
import { ParkingSpot } from '/lib/collections/ParkingSpot.js';
import './parkMap.html';
import './distanceProgressUI.html';

const DEFAULT_RADIUS = 250;
const DRIVE_ONLY = 1;
const WALK_ONLY = 2;
const DRIVE_AND_WALK = 3;

var directionsService = null;
var directionsDisplayDrive = null;
var directionsDisplayWalk = null;
var directionDriveDuration = null;
var directionWalkDuration = null;

var mode = -1;

var openedInfoWindow = null;
var currentDestinationMarker = null;

var radiusCircle = null;
var currentLocationMarker = null;

var mouseup = false;
var drag = false;

var allParkingSpots = [];
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
});

Template.parkMap.events({
  'click .btnNavToParkingSpot'(event) {
    mode = DRIVE_ONLY;
    let spot = ParkingSpot.findOne({_id: event.currentTarget.id});
    beginDirection(spot);
  },
  'click .btnNavToSpotAndWalk'(event){
    mode = DRIVE_AND_WALK;
    let spot = ParkingSpot.findOne({_id: event.currentTarget.id});
    beginDirection(spot);
  }
});

Template.parkMap.onCreated(function (){
  // Load api
  GoogleMaps.load({key: 'AIzaSyCd-5haHDEEa8HjyaRaLq8aczxuwkP5ZMs'});

  var self = this;

  GoogleMaps.ready('parkMap', function(map) {
    let mapInstance = map.instance;


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
    //-----------FINISH Initialize map's listener--------------

   // Put the markers on parking spots

  let latLng = null;

  radiusCircle = createCircleRadius(map.instance, DEFAULT_RADIUS);

  // Create and move the marker when latLng changes.
  self.autorun(function() {
    // Get current lat lng
     latLng = Geolocation.latLng();
     if (! latLng) return;

     // Mark current location
     if (! currentLocationMarker) {
        currentLocationMarker = new google.maps.Marker({
          position: new google.maps.LatLng(latLng.lat, latLng.lng),
          map: map.instance,
          label: "U"
        });

      // Center and zoom the map view onto the current position.
      map.instance.setZoom(14);
      map.instance.setCenter(currentLocationMarker.getPosition());
     }
     else {
       currentLocationMarker.setPosition(latLng);
     }
     findNearSpots(currentLocationMarker.getPosition());
     // Display radius if the radius if there is no destination set
     if(!currentDestinationMarker)
        radiusCircle.bindTo('center', currentLocationMarker, 'position');

   });
   for(var i = 0; i < allParkingSpots.length; i++){
     console.log(allParkingSpots[i]);
    // AllParkingSpotMarker.insert(allParkingSpots[i]);
   }
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

    google.maps.event.addListener(currentDestinationMarker,'mousedown', function(e) {
      mousedUp = false;
      setTimeout(function(){
          if(mousedUp === false && !drag){

            currentDestinationMarker.setMap(null);
            currentDestinationMarker=null;
            resetDirectionsDisplay();
            radiusCircle.bindTo('center', currentLocationMarker, 'position');
            findNearSpots(currentLocationMarker.getPosition());
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
      let result = findNearSpots(currentDestinationMarker.getPosition());
      if(result == -1){
        resetDirectionsDisplay();
      }
    });
  }
  findNearSpots(latLng);

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
        id: nearSpot._id
      });
      marker.setMap(mapInstance);
       marker.addListener('click', function () {
           // Close any existing infowindow
           if(!currentDestinationMarker){
             if(openedInfoWindow) openedInfoWindow.close();
           }
           // Open infowindow when marker is clicked
           openedInfoWindow = this.infowindow;
           this.infowindow.open(map, this);
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
  currentVisibleSpotMarkers = tempVisibleMarker;

  return 0;
}

function beginDirection(spot){
  if(openedInfoWindow) openedInfoWindow.close();


  let fromLocation = Geolocation.latLng();
  let toLocation = spot.position;
  driveToDestination(fromLocation,toLocation);
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

      //console.log(result);
      directionDriveDuration = result.routes[0].legs[0].duration;

      if(mode == DRIVE_AND_WALK){
        if(!currentDestinationMarker) return;
        fromLocation = toLocation;

        toLocation = currentDestinationMarker.getPosition();

        walkToDestination(fromLocation,toLocation);
      }else{
        displayDistanceProgress();
      }
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

      //console.log(result);
      directionWalkDuration = result.routes[0].legs[0].duration;
      if(mode == DRIVE_AND_WALK){
        displayDistanceProgress();
      }
    }
  });
}

function displayDistanceProgress(){
  let totalDuration, walkPercentage, drivePercentage;
  let innerhtml = '<div id="distanceProgressUI">';

  if(mode == DRIVE_ONLY) {
    totalDuration = directionDriveDuration.value;
    innerhtml += '<div class="distanceProgressLine" id="line_drive" style="width:100%"> <div class="distanceTimeText" id="driveMinText">'+directionDriveDuration.text+'</div> </div>';
  }else if(mode == DRIVE_AND_WALK){
    totalDuration = directionDriveDuration.value + directionWalkDuration.value;
    drivePercentage = (directionDriveDuration.value/totalDuration) * 100;
    walkPercentage = 100 - drivePercentage;

    if(walkPercentage < 17){
      walkPercentage = 17;
      drivePercentage = 83;
    }

    innerhtml += '<div class="distanceProgressLine" id="line_drive" style="width:'+drivePercentage+'%"> <div class="distanceTimeText" id="driveMinText">'+directionDriveDuration.text+'</div> </div>'+
    '<div class="distanceProgressLine" id="line_walk" style="width:'+walkPercentage+'%"> <div class="distanceTimeText" id="walkMinText">'+directionWalkDuration.text+'</div> </div>'

  }else{
    totalDuration = directionWalkDuration.value;
    innerhtml +='<div class="distanceProgressLine" id="line_walk" style="width:100%"> <div class="distanceTimeText" id="walkMinText">'+directionWalkDuration.text+'</div> </div>'
  }

  innerhtml += "</div>";

  let disProgressContainer = document.getElementById("distanceProgressUIContainer");

  if(disProgressContainer){
    disProgressContainer.innerHTML = innerhtml;
  }
}

function resetDirectionsDisplay(){
  directionsDisplayDrive.setMap(null);
  directionsDisplayWalk.setMap(null);
  let disProgress = document.getElementById("distanceProgressUI");
  if (disProgress) disProgress.remove();
  mode = -1;
}
