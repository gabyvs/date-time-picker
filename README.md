Date Time Picker
================

[![Build Status](https://travis-ci.org/gabyvs/date-time-picker.svg?branch=master)](https://travis-ci.org/gabyvs/date-time-picker)

Another angular directive for selecting date and time ranges for analytics and data queries. There is a pretty good
number of date pickers and range date pickers out there, but none of them was solving our use case:

* Set a collection of presets for time ranges to improve usability
* Show more information about the selected range in a way it can be easily styled
* Handle time units for window sizing
* Use time units to set start and end time in a way it can produce ranges for cached optimized systems.

This directive can be used with Webpack in modern projects or included as a regular dependency for legacy setups.

##Usage

`<dt-picker range="range" options="options" range-dictionary="rangeDictionary" mode="::'absolute'"></dt-picker>`

###range
This object will be used to communicate to the controller the selections made by the user. This includes a starting time, ending time and time unit selected

```javascript
$scope.range = { from: 1449096146118, to: 1449099767600, timeUnit: 'minute' }
```
###options
This is used to set the following custom options:

hideTimeUnit: set to true if you don't want the user to select a time unit

maxRange: use it to set the maximum number of days that the user is allowed to select in a custom range. Default is to 31 days.

###rangeDictionary
Use this if you want to setup your own predefined options for the used to select. Predefined options need to be set as a collection of label/duration pairs. Durations are objects specifying unit, value and an optional offset.

label: whatever you want the user to see as an option.

duration: an object specifying unit, value and an optional offset.

unit: a time unit as hours, minutes, days, weeks...

value: the quantity of units this duration groups e.g. for 2 weeks, value is 2

offset: in case you need an offset from now measured in the same time unit specified. e.g. for yesterday, you need 1 day, but with an offset of one day, so it is not today but one day before.
    
Default is:
```javascript
[{ label: 'Last Hour', duration: { unit: 'hours', value: 1 }},
{ label: 'Last 24 Hours', duration: { unit: 'days', value: 1 }},
{ label: 'Yesterday', duration: { unit: 'days', value: 1, offset: 1 } },
{ label: 'Last 7 Days', duration: { unit: 'weeks', value: 1 }},
{ label: 'Custom Range', custom: true }]
```

###mode: absolute or duration
Duration mode is the default mode and this will round selected ranges using the selected time unit.
For example: if the user selects Last 7 days by hour, ending time will be set to start of current hour (at minute 0) and starting time will be set 7 days before that.

Absolute mode will not take this into consideration, so it will not round ranges.
To use this mode, set the mode attribute to 'absolute' in your controller.

Initial Setup
-----------
For the initial setup of date time picker, use the range attribute on your controller. You can choose between one of the following options:

1. Label: to select one of the predefined options.
   ```javascript
   $scope.range = {
      label: 'Last 24 Hours'
   };
   ```
   
2. Duration + from: to select a period of time and a starting time, e.g. 4 hours starting yesterday at this time.
   ```javascript
   $scope.range = {
     duration: {
       unit: 'hours',
       value: 4,
       label: '4 hours'
     },
     from: moment().subtract(1, 'days').valueOf()
   };
   ```
   
3. Duration only: to select a period of time ending now, e.g. Last 2 weeks
   ```javascript
   $scope.range = { duration: { unit: 'weeks', value: 2 } };
   ```
   
4. From + to: to select a period of time between a starting and ending time. This will only work on absolute mode.
   ```javascript
   $scope.range = {
     from: 1449096146118,
     to: 1449099767600
   };
   ```
   
5. Default (if nothing is provided or if initial setup fails, for example, giving a label that does not match any option.
First option of the dictionary will be selected. Range doesn't need to be provided.

Development
-----------

Running tests:

    npm test
    
Running tests continuously:

    npm run test:cont
    
Running test coverage report:

    npm run test:coverage

Creating a new build is done running:

    npm run build

The sample page is configured to run using a node server and a webpack development server
inside of it.

    npm start

and then go to `http://localhost:3000`
