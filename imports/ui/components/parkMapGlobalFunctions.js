OpenedInfoWindow = null;

OpenInfo = function (marker){
  if(marker.infowindow != OpenedInfoWindow){
    CloseInfo();
    let map = GoogleMaps.maps.parkMap;
    OpenedInfoWindow = marker.infowindow;
    marker.infowindow.open(map, marker);
    Session.set("selectedParkingSpot", marker.id);
  }
}

CloseInfo = function(){
  if(OpenedInfoWindow){
    OpenedInfoWindow.close();
  }
  OpenedInfoWindow = null;
  Session.set("selectedParkingSpot", null);
}

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
    offsetPlusMinusBottom ="+="+heightToChange+"px"
    let mapWidth = $(".map-container").width();
    let mapHeight = $(".map-container").height();
    mapWidthChange = mapWidth- widthToChange;
    mapHeightChange = mapHeight - heightToChange;
  }else{

    offsetPlusMinusLeft = "-="+widthToChange+"px";
    offsetPlusMinusBottom ="-="+heightToChange+"px"
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
}
