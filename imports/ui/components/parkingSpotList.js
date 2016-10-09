import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import './parkingSpotList.html';

Template.parkingSpotList.helpers({
  ratingStars(){
    let wtf = ["fa-star","fa-star","fa-star","fa-star-o","fa-star-o"]

    return wtf;
  }
});

Template.parkingSpotList.events({
  "click #listOfParkingSpots a"(event){
    let id = event.currentTarget.id;
    let parkingSpotMarkers = Template.currentData().parkingSpots;
    let marker = null;
    for(var i = 0; i < parkingSpotMarkers.length; i++){
      //console.log(parkingSpotMarkers[i]);
      if(parkingSpotMarkers[i].id == id){
        marker = parkingSpotMarkers[i];
        break;
      }
    }

    let map = GoogleMaps.maps.parkMap;
    map.instance.setCenter(marker.getPosition());
    OpenInfo(marker);
  }
});
