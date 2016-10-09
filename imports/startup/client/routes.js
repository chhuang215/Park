import { Meteor } from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import '/imports/ui/layouts/layout.js';
import '/imports/ui/pages/mainPage.js';
FlowRouter.route('/', {
    action: function(params) {
        BlazeLayout.render("layout", {content: "mainPage"});
    }
});
