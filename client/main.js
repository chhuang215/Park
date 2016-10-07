import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import {Geolocation} from 'meteor/mdg:geolocation';
import './main.html';

// Template.main.helpers({
//
// });

Template.main.events({
  "click .btnCurr"(event){

  },
  "click .btnSearch"(event){
      $('.tbSearch').css('display','inline');
  }
});


// Template.main.onRendered(function() {
//
//
//
// });
