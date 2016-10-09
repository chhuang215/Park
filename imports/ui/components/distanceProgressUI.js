import { Template } from 'meteor/templating';
import './distanceProgressUI.html';

Template.distanceProgressUI.helpers({
  displayProgress(){
    let direction = Session.get('direction');
    if(!direction) return null;
    return direction;
  }
});

Template.distanceProgressUI.onCreated(function(){
  Session.set("direction", null);
});
