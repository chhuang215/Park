/*jshint esversion: 6*/
import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import { Blaze } from 'meteor/blaze';
import "./searchBox.html";

import "./parkMapGlobalFunctions.js";

Template.searchBox.events({
  "click .js-cancelSearch"(event){
    $(".opened").addClass("closed").removeClass("opened");
    $(".btnSearchOpened").addClass("btnSearchClosed").removeClass("btnSearchOpened");
    $(".js-cancelSearch").toggle();
    ClearSearchResults();
    $("input").val("");
  },
  "click .btnSearchClosed"(event){
    $(".closed").addClass("opened").removeClass("closed");
    $(".btnSearchClosed").addClass("btnSearchOpened").removeClass("btnSearchClosed");
    $(".js-cancelSearch").toggle();
  },
  "click .btnSearchOpened"(event){
    // var e = jQuery.Event("keypress");
    // e.which = 13; //choose the one you want
    // e.keyCode = 13;
    // $(".tbSearch").trigger(e);
    google.maps.event.trigger( $(".tbSearch")[0], 'focus');
    google.maps.event.trigger( $(".tbSearch")[0], 'keydown', {keyCode:13});
  },
});
Template.searchBox.onCreated(function(){
});
Template.searchBox.onRendered(function(){

});
