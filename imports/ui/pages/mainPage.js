import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Geolocation} from 'meteor/mdg:geolocation';
import { Weather } from 'meteor/selaias:meteor-simpleweather';
import './mainPage.html';
import '../components/parkMap.js';
import '../components/distanceProgressUI.js';
Template.mainPage.events({
  "click .btnCurr"(event){
    console.log('click');
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

Template.mainPage.onCreated(function(){  
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
