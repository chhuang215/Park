import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import { ParkingSpot } from '/imports/api/ParkingSpot/ParkingSpot.js';
import './parkMapGlobalFunctions.js';
import './parkingSpotList.html';

Template.parkingSpotList.helpers({
  getName(){
    let p = ParkingSpot.findOne({_id:this.id});
    if(!p) return;
    return p.name;
  },
  ratingStars(){
    let p = ParkingSpot.findOne({_id:this.id});
    if(!p) return;
    let rating = p.rating;
    let stars = [];
    for (var i = 0; i < 5; i ++){
      if(rating >= 1.0){
          rating = rating - 1.0;
          stars.push("fa-star");
      }else if (rating >= 0.5){
          stars.push("fa-star-half-o");
          rating = 0;
      }else{
        stars.push("fa-star-o");
      }
    }
    return stars;
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
    map.instance.panTo(marker.getPosition());
    OpenInfo(marker);
  }
});
