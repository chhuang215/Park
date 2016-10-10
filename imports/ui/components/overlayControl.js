import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Geolocation} from 'meteor/mdg:geolocation';

import './overlayControl.html';
import './parkMap.js';
import './distanceProgress.js';

Template.overlayControl.events({
  "click .btnCurr"(event){
    console.log('click');
  },
  "click .js-cancelSearch"(event){
    $('#searchDiv .searchInputGroup').css('display','none');
    $('.btnSearch').toggle();
  },
  "click .btnSearch"(event){
    $('#searchDiv .searchInputGroup').css('display','inline');
    $('.btnSearch').toggle();
  },
  "click .btnList"(event){

    if($("#listOfParkingSpots").css('display')=='none'){
      $("#listOfParkingSpots").toggle('slide', {direction: 'left'}, 100);
      $(".leftControls").animate({left:"+=300px"},100);
    }else{
      $("#listOfParkingSpots").toggle('slide', {direction: 'left'}, 100);
      $(".leftControls").animate({left:"-=300px"},100);
    }
  }
});

// Template.main.onRendered(function() {
//
//
//
// });
