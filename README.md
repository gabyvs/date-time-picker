Date Time Picker
================

Another angular directive for selecting date and time ranges for analytics and data queries. There is a pretty good
number of date pickers and range date pickers out there, but none of them was solving our use case:

* Set a collection of presets for time ranges to improve usability
* Show more information about the selected range in a way it can be easily styled
* Handle time units for window sizing
* Use time units to set star time and end time in a way it can produce ranges for cached optimized systems.

This directive can be used with Webpack in modern projects or included as a regular dependency for legacy setups.

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
