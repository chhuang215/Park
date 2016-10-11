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
  let offsetPlusMinus = null;
  let mapWidthChange = null;
  let centerLatLng = map.instance.getCenter();
  let listWidth = $("#listOfParkingSpots").width();

  if($("#listOfParkingSpots").css('display') == 'none'){
    offsetPlusMinus = "+="+listWidth+"px";
    let mapWidth = $(".map-container").width();
    mapWidthChange = mapWidth-listWidth;

  }else{
    offsetPlusMinus = "-="+listWidth+"px";
    mapWidthChange = '100%';
  }

  $("#listOfParkingSpots").toggle('slide', {direction: 'left'}, 100);
  $(".leftControls").animate({left:offsetPlusMinus},100);
  $(".map-container").animate({left:offsetPlusMinus},100, function(){
    //console.log(this == $(".map-container"));
    $(this).css('width', mapWidthChange);
    google.maps.event.trigger(map.instance, "resize");
    map.instance.panTo(centerLatLng);
  });
}
