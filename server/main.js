import { Meteor } from 'meteor/meteor';

import {ParkingSpot} from '/lib/collections/ParkingSpot.js';

if(ParkingSpot.find().count() === 0){
  let spots = [
    {
      "loc": {
        "type" : "Point",
        "coordinates" : [
          -114.1450605,
          51.0982289

        ]
      },
      "position":{lat:51.0982289, lng:-114.1450605},
      "info":"Hello fker, This is ghetto Walmart."
    },
    {
      "loc": {
        "type" : "Point",
        "coordinates" : [
          -114.160626,51.13661
        ]
      },
      "position":{lat:51.13661, lng:-114.160626},
      "info":"You sick fk, This is poor people SuperStore."
    }
  ];

  _.each(spots, function(spot) {
    ParkingSpot.insert(spot);
  });

}

Meteor.startup(() => {
  // code to run on server at startup
});
