import { Meteor } from 'meteor/meteor';
import { ParkingSpot } from '../../api/ParkingSpot/ParkingSpot.js';

ParkingSpot.remove({});
if(ParkingSpot.find().count() === 0){
  let spots = [
    {
      "name": "Northland Village",
      "loc": {
        "type" : "Point",
        "coordinates" : [
          -114.1450605,
          51.0982289

        ]
      },
      "position":{lat:51.0982289, lng:-114.1450605},
      "info":"Hello fker, This is ghetto Walmart.",
      "rating":3,
    },
    {
      "name": "Edgemont SuperStore",
      "loc": {
        "type" : "Point",
        "coordinates" : [
          -114.160626,51.13661
        ]
      },
      "position":{lat:51.13661, lng:-114.160626},
      "info":"You sick fk, This is poor people SuperStore.",
      "rating":3.5
    },
    {
      "name":"Near the SuperStore",
      "loc": {
        "type" : "Point",
        "coordinates" : [
          -114.160626,51.13763
        ]
      },
      "position":{lat:51.13763, lng:-114.160626},
      "info":"near SuperStore.",
      "rating":4
    },
    {
      "name":"Street",
      "loc": {
        "type" : "Point",
        "coordinates" : [
          -114.15636,51.12577
        ]
      },
      "position":{lat:51.12577, lng:-114.15636},
      "info":"Hi",
      "rating":5
    }
  ];

  _.each(spots, function(spot) {
    ParkingSpot.insert(spot);
  });

}
