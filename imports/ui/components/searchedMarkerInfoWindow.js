/*jshint esversion: 6*/
import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import "./searchedMarkerInfoWindow.html";

Template.searchedMarkerInfoWindow.events({
  "click .js-setAsDestination"(event){
    console.log('clicky');
  }
});
