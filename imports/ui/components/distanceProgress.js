import { Template } from 'meteor/templating';
import './distanceProgress.html';

Template.distanceProgress.helpers({
  displayProgress(){
    let direction = Session.get('direction');
    if(!direction) return null;

    let driveVal = direction['driveVal'];
    let walkVal = direction['walkVal'];

    if((!driveVal || driveVal <= 0) && (!walkVal || walkVal <= 0)){

      return;
    }
    else if(driveVal > 0 && (!walkVal || walkVal <= 0)){
      walkVal = 0;
    }
    else if(walkVal > 0 && (!driveVal || driveVal <= 0)){
      driveVal = 0;
    }

    let totalDuration = driveVal + walkVal;

    let drivePercentage = (driveVal/totalDuration) * 100;
    let walkPercentage = 100 - drivePercentage;

    if(walkPercentage < 17 && walkPercentage > 0){
      walkPercentage = 17;
      drivePercentage = 83;
    }else if(drivePercentage < 17 && drivePercentage > 0){
      walkPercentage = 83;
      drivePercentage = 17;
    }

    direction['drivePercentage'] = drivePercentage;
    direction['walkPercentage'] = walkPercentage;

    return direction;
  }
});

Template.distanceProgress.onCreated(function(){
  Session.set("direction", null);
});
