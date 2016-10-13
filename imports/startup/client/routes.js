import { Meteor } from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import '/imports/ui/layouts/layout.js';
import '/imports/ui/pages/mainPage.js';
import '/imports/ui/pages/adminPage.js';
import '/imports/ui/pages/settingPage.js';
FlowRouter.route('/', {
    action: function(params) {
        BlazeLayout.render("layout", {content: "mainPage"});
    }
});

FlowRouter.route('/admin', {
    action: function(params) {
        BlazeLayout.render("layout", {content: "adminPage"});
    }
});

FlowRouter.route('/setting', {
    action: function(params) {
        BlazeLayout.render("layout", {content: "settingPage"});
    }
});
