import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Geolocation} from 'meteor/mdg:geolocation';
import './parkMapGlobalFunctions.js';
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
  "click .btnList"(event){

    ToggleListView();

  }
});

// Template.main.onRendered(function() {
//
//
//
// });
