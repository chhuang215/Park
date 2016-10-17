/*jshint esversion: 6*/ /* jshint loopfunc:true */
import { ParkingSpot } from '/imports/api/ParkingSpot/ParkingSpot.js';

DRIVE_ONLY = 1;
WALK_ONLY = 2;
DRIVE_AND_WALK = 3;
DirectionsService = null;
DirectionsDisplayDrive = null;
DirectionsDisplayWalk = null;

currentLocationMarker = null;
currentDestinationMarker = null;

OpenedInfoWindow = null;

SearchedMarkers = {};

OpenInfo = function (marker){
  if(marker.infowindow != OpenedInfoWindow){
    CloseInfo();
    let map = GoogleMaps.maps.parkMap;
    OpenedInfoWindow = marker.infowindow;
    marker.infowindow.open(map, marker);
    Session.set("selectedParkingSpot", marker.id);
  }
};

CloseInfo = function(){
  if(OpenedInfoWindow){
    OpenedInfoWindow.close();
  }
  OpenedInfoWindow = null;
  Session.set("selectedParkingSpot", null);
};

ToggleListView = function(){
  let map = GoogleMaps.maps.parkMap;
  let offsetPlusMinusLeft, offsetPlusMinusBottom = null;
  let mapWidthChange, mapHeightChange = 0;
  //let mapWidthChange = null;
  let centerLatLng = map.instance.getCenter();
  let directionSlide = 'left';
  let listWidth = $("#listOfParkingSpots").width();
  let listHeight = $("#listOfParkingSpots").height();

  let heightToChange , widthToChange = 0;
  if($(window).width() >= 768){
    directionSlide = 'left';
    widthToChange = listWidth;
  }else{
    directionSlide = 'down';
    heightToChange = listHeight;
  }

  //if(OpenedInfoWindow) OpenedInfoWindow.close();
  console.log(OpenedInfoWindow);
  if($("#listOfParkingSpots").css('display') == 'none'){
    offsetPlusMinusLeft = "+="+widthToChange+"px";
    offsetPlusMinusBottom ="+="+heightToChange+"px";
    let mapWidth = $(".map-container").width();
    let mapHeight = $(".map-container").height();
    mapWidthChange = mapWidth- widthToChange;
    mapHeightChange = mapHeight - heightToChange;
  }else{

    offsetPlusMinusLeft = "-="+widthToChange+"px";
    offsetPlusMinusBottom ="-="+heightToChange+"px";
    mapWidthChange = '100%';
    mapHeightChange = '100%';
  }

  $("#listOfParkingSpots").toggle('slide', {direction: directionSlide}, 100);
//  $(".leftControls").animate({left:offsetPlusMinusLeft},100);
//  $(".leftControls").animate({bottom:offsetPlusMinusBottom},100);
  $(".map-container").animate({left:offsetPlusMinusLeft},100, function(){
    //console.log(this == $(".map-container"));

    $(this).css('width', mapWidthChange);
    $(this).css('height', mapHeightChange);
    google.maps.event.trigger(map.instance, "resize");
    map.instance.panTo(centerLatLng);
  });
//  if(OpenedInfoWindow) OpenedInfoWindow.open();
};



/*Direction Service Request*/
BeginDirection = function(spot, mode){
  CloseInfo();
  resetDirectionsDisplay();
  Session.set('direction', null);
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
};



resetDirectionsDisplay = function(){
  DirectionsDisplayDrive.setMap(null);
  DirectionsDisplayWalk.setMap(null);
  Session.set('direction', null);
};

function driveToDestination(fromLocation, toLocation){

  let mapInstance = GoogleMaps.maps.parkMap.instance;

  DirectionsDisplayDrive.setMap(mapInstance);

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

  DirectionsService.route(request, function(result, status) {
    if (status == 'OK') {
      DirectionsDisplayDrive.setDirections(result);

      directionDriveDuration = result.routes[0].legs[0].duration;
      let d = Session.get('direction');
      if(!d){
        d = {};
      }
      d.driveVal = directionDriveDuration.value;
      d.driveText = directionDriveDuration.text;
      Session.set('direction', d);

    }
  });
}

function walkToDestination(fromLocation, toLocation){
  let mapInstance = GoogleMaps.maps.parkMap.instance;

  DirectionsDisplayWalk.setMap(mapInstance);

  let request = {
    origin: fromLocation,
    destination: toLocation,
    travelMode: 'WALKING',
  };

  DirectionsService.route(request, function(result, status) {
    if (status == 'OK') {
      DirectionsDisplayWalk.setDirections(result);

      let directionWalkDuration = result.routes[0].legs[0].duration;
      let d = Session.get('direction');
      if(!d){
        d = {};
      }
      d.walkVal = directionWalkDuration.value;
      d.walkText = directionWalkDuration.text;
      Session.set('direction', d);

    }
  });
}

// Clear searched markers on the map
ClearSearchResults = function(){
  _.each(SearchedMarkers, function(marker){
    marker.setMap(null);
  });
  SearchedMarkers = {};
};
