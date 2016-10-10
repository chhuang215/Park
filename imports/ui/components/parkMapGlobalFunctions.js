OpenedInfoWindow = null;

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
