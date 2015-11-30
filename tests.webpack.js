import 'angular';
import 'angular-mocks/angular-mocks';
import './app/pickerService';

var context = require.context('./', true, /app\/(?!datepick|custom-bootstrap).+\.js$/);
context.keys().forEach(context);
