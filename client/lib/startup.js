import { Meteor } from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import { Weather } from 'meteor/selaias:meteor-simpleweather';

Meteor.startup(function() {
  initializeSimpleWeather();

});

FlowRouter.route('/', {
    action: function(params) {
        BlazeLayout.render("layout", {main: "main"});
    }
});

function initializeSimpleWeather(){
  var options = {
      location: "Calgary, Alberta",
      unit: 'c',
      success: function(weather) {
        html = '<i class="sw icon-'+weather.code+'"></i> '
        html += ''+weather.temp+'&deg;'+weather.units.temp+'';
        // html += '<ul><li>'+weather.city+', '+weather.region +'</li>';
        //html += '<li class="currently">'+weather.currently+'</li>';

        $("#weather").html(html);
      },
      error: function(error) {
        $("#weather").html('<p>'+error+'</p>');
      }
    }

    Weather.options = options;
}
