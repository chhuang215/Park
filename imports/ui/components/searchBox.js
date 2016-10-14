/*jshint esversion: 6*/
import { Template } from 'meteor/templating';
import { GoogleMaps } from 'meteor/dburles:google-maps';
import { Blaze } from 'meteor/blaze';
import "./searchBox.html";
import "./searchedMarkerInfoWindow.html";
import "./parkMapGlobalFunctions.js";
var searchedMarkers = [];

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
  "click .js-setAsDestination"(event){
    //TODO: Actually set destination marker to searched location
    console.log('clicky');
  }
});
Template.searchBox.onCreated(function(){
});
Template.searchBox.onRendered(function(){

  this.autorun(function(){

    if (Session.get("ParkMapInitialized")) {
      let mapInstance = GoogleMaps.maps.parkMap.instance;
      //INITIALIZE Create the search box and link it to the UI element.
      var input = document.getElementsByClassName('tbSearch')[0];

      var searchBox = new google.maps.places.SearchBox(input);
      mapInstance.addListener('bounds_changed', function() {
        searchBox.setBounds(mapInstance.getBounds());
      });
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        //console.log(places);
        if (places.length === 0) {
          return;
        }
        let bounds = new google.maps.LatLngBounds();
        clearSearchResults();
        places.forEach(function(place) {
          //console.log(place.geometry);
          if (!place.geometry) {
            //console.log("Returned place contains no geometry");
            return;
          }

          let contentInfo = Blaze.toHTMLWithData(Template.searchedMarkerInfoWindow, place);

          let locationInfoWindow = new google.maps.InfoWindow({
            content: contentInfo,
            disableAutoPan: true
          });
          locationInfoWindow.addListener('closeclick', function() {
            CloseInfo();
          });
          let m = new google.maps.Marker({
            map: mapInstance,
            icon: {
              url: place.icon,
              size: new google.maps.Size(26, 26),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(0, 13),
              scaledSize: new google.maps.Size(26, 26)
            },
            infowindow: locationInfoWindow,
            title: place.name,
            position: place.geometry.location
          });
          m.addListener('click', function(){
            OpenInfo(this);
          });

          searchedMarkers.push(m);
          if (place.geometry.viewport) {
             // Only geocodes have viewport.
             bounds.union(place.geometry.viewport);
           } else {
             bounds.extend(place.geometry.location);
           }
        });
        mapInstance.fitBounds(bounds);
      });

    }
  });
});

function clearSearchResults(){
  _.each(searchedMarkers, function(marker){
    marker.setMap(null);
  });
  searchedMarkers = [];
}
