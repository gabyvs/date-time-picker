import 'angular';
import 'angular-mocks/angular-mocks';

var context = require.context('./app', true, /Spec\.js$/);
context.keys().forEach(context);
