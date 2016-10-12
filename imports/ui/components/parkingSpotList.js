import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import { ParkingSpot } from '/imports/api/ParkingSpot/ParkingSpot.js';
import './parkMapGlobalFunctions.js';
import './parkingSpotList.html';

Template.parkingSpotList.helpers({


});

Template.parkingSpotListItem.helpers({
  isSelected(){
    let selectedParkingSpotId = Session.get("selectedParkingSpot");

    if(this.id == selectedParkingSpotId){
      return "active";
    }

    return "";
  },
  getName(){
    let p = ParkingSpot.findOne({_id:this.id});
    if(!p) return;
    return p.name;
  },
  ratingStars(){
    let p = ParkingSpot.findOne({_id:this.id});
    if(!p) return;
    let rating = p.rating;
    let stars = {};
    for (var i = 1; i <= 5; i ++){
      if(rating >= 1.0){
          rating = rating - 1.0;
          stars["s"+i] = "fa-star";
          //stars.push();
      }else if (rating >= 0.5){
          stars["s"+i] = "fa-star-half-o";
        //  stars.push("fa-star-half-o");
          rating = 0;
      }else{
        stars["s"+i] = "fa-star-o";
        //stars.push("fa-star-o");
      }
    }
    return stars;
  }
});

Template.parkingSpotList.events({
  "click .js-closeList"(event){
    ToggleListView();
  },

});

Template.parkingSpotListItem.events({
  "click a.list-group-item"(event){

    let map = GoogleMaps.maps.parkMap;
    let marker = this;
    map.instance.panTo(marker.getPosition());
    OpenInfo(marker);
  }
});

Template.parkingSpotList.onRendered(function(){
  this.autorun(function(){


  });
});
