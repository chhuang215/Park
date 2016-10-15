/*jshint esversion: 6*/
import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import { Blaze } from 'meteor/blaze';
import "./searchBox.html";

import "./parkMapGlobalFunctions.js";


Template.searchBox.events({
  "click .js-cancelSearch"(event){
    $(".show").addClass("hidden").removeClass("show");

    $('#searchDiv .searchInputGroup').css('display','none');

    $('.btnSearch').toggle();
  },
  "click .btnSearch"(event){
    $(".hidden").addClass("show").removeClass("hidden");
    $('#searchDiv .searchInputGroup').css('display','inline');

    $('.btnSearch').toggle();
  },
});
Template.searchBox.onCreated(function(){
});
Template.searchBox.onRendered(function(){

  // this.autorun(function(){
  //
  //   if (Session.get("ParkMapInitialized")) {
  //     let mapInstance = GoogleMaps.maps.parkMap.instance;
  //
  //
  //   }
  // });
});
