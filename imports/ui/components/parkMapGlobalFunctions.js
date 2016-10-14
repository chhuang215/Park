/*jshint esversion: 6*/ /* jshint loopfunc:true */
import { ParkingSpot } from '/imports/api/ParkingSpot/ParkingSpot.js';
MarkerToSearchNearby = new ReactiveVar(null);
ChangeInMarkerList = new ReactiveVar(0);

DRIVE_ONLY = 1;
WALK_ONLY = 2;
DRIVE_AND_WALK = 3;
DirectionsService = null;
DirectionsDisplayDrive = null;
DirectionsDisplayWalk = null;

currentLocationMarker = null;
currentDestinationMarker = null;
radiusCircle = null;

currentVisibleSpotMarkers = {};

OpenedInfoWindow = null;

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

/**
 * Find near parking spot with provided center location
 */
FindNearSpots = function(){
  let map = GoogleMaps.maps.parkMap;
  let mapInstance = map.instance;
  let marker = MarkerToSearchNearby.get();
  let latLng = marker.getPosition();
  let lat = latLng.lat();
  let lng = latLng.lng();

  // Get near parking spots within the radius
  let nearSpots = ParkingSpot.find({
    loc: {
      $near: {
        $geometry: {
          type: "Point" ,
          coordinates: [ lng , lat ]
        },
        $maxDistance: radiusCircle.getRadius()
      }
    }
  }).fetch();

  // Clear visible markers if not at nearby
  if(nearSpots.length === 0){
  //  CurrentVisibleSpotMarkerId.remove({});
    for(let i in currentVisibleSpotMarkers){
      currentVisibleSpotMarkers[i].setMap(null);
    }
    currentVisibleSpotMarkers = {};
    ChangeInMarkerList.set(0);
    resetDirectionsDisplay();
    return;
  }

  let tempVisibleMarker = {};
  // Display near parking spot markers
  for (let i = 0; i < nearSpots.length; i++) {
    let nearSpot = nearSpots[i];
    let contentInfo = Blaze.toHTMLWithData(Template.parkingSpotInfoWindow, {
      id: "p"+i,
      info: nearSpot.info,
      spotId: nearSpot._id,
      name : nearSpot.name,
    });

    let locationInfoWindow = new google.maps.InfoWindow({
     content: contentInfo,
     disableAutoPan: true
    });
    locationInfoWindow.addListener('closeclick', function() {
      CloseInfo();
    });
    let existedMarker = currentVisibleSpotMarkers[nearSpot._id];
    if (!existedMarker){
       // Initialize new markers
      let marker = new google.maps.Marker({
        position: nearSpot.position,
        label: (i+1).toString(),
        infowindow: locationInfoWindow,
        id: nearSpot._id,
        title: nearSpot.name,
        map: mapInstance
      });
      marker.addListener('click', function () {
         OpenInfo(this);
      });
      // CurrentVisibleSpotMarkerId.insert({_id:nearSpot._id});
      tempVisibleMarker[nearSpot._id] = marker;
    }
    else{
      existedMarker.setLabel((i+1).toString());
      if(existedMarker.map != mapInstance) existedMarker.setMap(mapInstance);
      tempVisibleMarker[nearSpot._id] = existedMarker;
    }
  }
  for(var j in currentVisibleSpotMarkers){
    if(!tempVisibleMarker[j]){
      currentVisibleSpotMarkers[j].setMap(null);
      if(currentVisibleSpotMarkers[j].infowindow == OpenedInfoWindow) CloseInfo();
      delete currentVisibleSpotMarkers[j];
    }
  }
  if(currentVisibleSpotMarkers != tempVisibleMarker){
    currentVisibleSpotMarkers = tempVisibleMarker;
    ChangeInMarkerList.set(-1);
  }
  ChangeInMarkerList.set(Object.keys(currentVisibleSpotMarkers).length);
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
