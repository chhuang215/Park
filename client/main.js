import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Geolocation} from 'meteor/mdg:geolocation';
import { Weather } from 'meteor/selaias:meteor-simpleweather';
import './main.html';
import './parkMapListView.html';
// Template.main.helpers({
//
// });

Template.main.events({
  "click .btnCurr"(event){

  },
  "click .btnSearch"(event){
      $('.tbSearch').css('display','inline');
  },
  "click .btnList"(event){
    //$("#listOfParkingSpots").toggle('slide', {direction: 'left'}, 100);
    if($("#listOfParkingSpots").css('display')=='none'){
      $("#listOfParkingSpots").toggle('slide', {direction: 'left'}, 100);
      $(".leftControls").animate({left:"+=300px"},100);
    }else{
      $("#listOfParkingSpots").toggle('slide', {direction: 'left'}, 100);
      $(".leftControls").animate({left:"-=300px"},100);
    }

    //console.log($("#listOfParkingSpots").css('display'));

  }
});

Template.main.onCreated(function(){
  this.autorun(function(){
    let latLng = Geolocation.latLng();
    if(!latLng) {Session.set('currentLocation',null); return;}
    Session.set('currentLocation', latLng);
    Weather.options.location = latLng.lat+ ',' + latLng.lng;

  });
});


// Template.main.onRendered(function() {
//
//
//
// });
