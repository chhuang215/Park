import { Meteor } from 'meteor/meteor';

import { Weather } from 'meteor/selaias:meteor-simpleweather';

var options = {
  location: "Calgary, Alberta",
  unit: 'c',
  success: function(weather) {
    html = '<i class="sw icon-'+weather.code+' vertical-align-center"></i> '
    html += '<span class="text-temperature">'+weather.temp+'&deg;'+weather.units.temp+'</span>';
    // html += '<ul><li>'+weather.city+', '+weather.region +'</li>';
    //html += '<li class="currently">'+weather.currently+'</li>';

    $("#weather").html(html);
  },
  error: function(error) {
    $("#weather").html('<p>'+error+'</p>');
  }
}

Weather.options = options;
