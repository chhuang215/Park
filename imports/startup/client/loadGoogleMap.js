import { GoogleMaps } from 'meteor/dburles:google-maps';
  // Load api
Meteor.startup(function () {
    // The correct way
    GoogleMaps.load({key: 'AIzaSyCd-5haHDEEa8HjyaRaLq8aczxuwkP5ZMs', libraries: 'geometry,places' });
});
