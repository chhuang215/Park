/*jshint esversion: 6*/
import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Geolocation} from 'meteor/mdg:geolocation';
import { Weather } from 'meteor/selaias:meteor-simpleweather';
import './mainPage.html';
import '../components/menuBar.js';
import '../components/parkMap.js';

// Template.mainPage.events({

// });

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
