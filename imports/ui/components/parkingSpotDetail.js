/*jshint esversion: 6*/
import {Template} from 'meteor/templating';
import { ParkingSpot } from '/imports/api/ParkingSpot/ParkingSpot.js';
import './parkMapGlobalFunctions.js';
import './parkingSpotDetail.html';

Template.parkingSpotDetail.helpers({
  getSelected(){
    let selectedParkingSpotId = Session.get("selectedParkingSpot");
    let spots = this.parkingSpots;

    if(!spots) return{};

    for(let i in spots){
      let s = spots[i];
      if(s.id == selectedParkingSpotId){
        return s;
      }
    }
  
    return{};
  },
  getName(){
    let p = ParkingSpot.findOne({_id:this.id});
    if(!p) return "";
    return p.name;
  },
  getRatingStars(){
    let p = ParkingSpot.findOne({_id:this.id});
    if(!p) return;
    let rating = p.rating;
    let starsAndRating = {};
    starsAndRating.ratingNumber = rating;
    for (var i = 1; i <= 5; i ++){
      if(rating >= 1.0){
        rating = rating - 1.0;
        starsAndRating["s"+i] = "fa-star";
        //stars.push();
      }else if (rating >= 0.5){
        starsAndRating["s"+i] = "fa-star-half-o";
      //  stars.push("fa-star-half-o");
        rating = 0;
      }else{
        starsAndRating["s"+i] = "fa-star-o";
        //stars.push("fa-star-o");
      }
    }
    return starsAndRating;
  }
});

Template.parkingSpotDetail.events({
  'click .js-directionToSpot'(){
    const spot = ParkingSpot.findOne({_id: this.id});
    BeginDirection(spot , DRIVE_ONLY);
  },
  'click .js-directionToSpotAndWalk'(){
    const spot = ParkingSpot.findOne({_id: this.id});
    BeginDirection(spot,  DRIVE_AND_WALK);
  }
});
