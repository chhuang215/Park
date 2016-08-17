import { Meteor } from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';

// Meteor.startup(function() {
//   GoogleMaps.load({key: 'AIzaSyCd-5haHDEEa8HjyaRaLq8aczxuwkP5ZMs'});
// });

FlowRouter.route('/', {
    action: function(params) {
        BlazeLayout.render("layout", {main: "main"});
    }
});
