import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Geolocation} from 'meteor/mdg:geolocation';

import './overlayControl.html';
import './parkMap.js';
import './distanceProgress.js';

Template.overlayControl.events({
  "click .btnCurr"(event){
    let currentLatLng = Geolocation.latLng();
    if(!currentLatLng) return;
    let map = GoogleMaps.maps.parkMap;
    map.instance.panTo(currentLatLng);
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
    let map = GoogleMaps.maps.parkMap;

    let centerLatLng = map.instance.getCenter();
    let listWidth = $("#listOfParkingSpots").width();
    if($("#listOfParkingSpots").css('display')=='none'){
      $("#listOfParkingSpots").toggle('slide', {direction: 'left'}, 100);
      let mapWidth = $(".map-container").width();
      $(".map-container").animate({left:"+="+listWidth+"px"},100, function(){
        $(".map-container").css('width', mapWidth-listWidth);
        google.maps.event.trigger(map.instance, "resize");
        map.instance.panTo(centerLatLng);
      });
      $(".leftControls").animate({left:"+="+listWidth+"px"},100);
    }else{
      $("#listOfParkingSpots").toggle('slide', {direction: 'left'}, 100);
      $(".map-container").css('width', '100%');
      $(".map-container").animate({left:"-="+listWidth+"px"},100, function(){
        google.maps.event.trigger(map.instance, "resize");
        map.instance.panTo(centerLatLng);
      });
      $(".leftControls").animate({left:"-="+listWidth+"px"},100);
    }


  }
});

// Template.main.onRendered(function() {
//
//
//
// });
