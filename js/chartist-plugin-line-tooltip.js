/**
 * Chartist.js plugin to display a tooltip on points in a line chart.
 *
 */

/* global Chartist */

(function(window, document, Chartist) {
  'use strict';

  var defaultOptions = {
  };

  Chartist.plugins = Chartist.plugins || {};

  Chartist.plugins.lineTooltip = function(options) {
    options = Chartist.extend({}, defaultOptions, options);

    return function tooltip(chart) {
      if (!(chart instanceof Chartist.Line)) { return; }

      var points = [];

      chart.on('draw', function(data) {
        // console.log('data', data)
        if (data.type === 'point') {
          points.push(data);
        }
      });

      chart.on('created', function() {
        // console.log(arguments)
        if (points.length < 2) { return; }

        var width = (points[1].x - points[0].x),
            rectWidth,
            x;

        points.forEach(function(point) {
          x = point.x - (width / 2);
          rectWidth = width;

          if (x < 0) {
            rectWidth += x;
            x = 0;
          }

          point.group.elem('rect', {
            x     : x,
            y     : 0,
            width : rectWidth,
            height: '100%'
          },'ct-label');
        });
      });
    };
  };

}(window, document, Chartist));
