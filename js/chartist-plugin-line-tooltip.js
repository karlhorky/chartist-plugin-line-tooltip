/**
 * Chartist.js plugin to display a tooltip on points in a line chart.
 *
 */

/* global Chartist */

(function(window, document, Chartist) {
  'use strict';

  var defaultOptions = {
  };

  // var arrayify = function(nodelist) {
  //   return Array.prototype.slice.call(nodelist);
  // };

  // var createHoverArea = function(width) {
  //   // TODO: Don't initialize every time
  //   var hoverAreaWidth, x, hoverArea, hoverAreaNode;

  //   x              = Math.floor(point.x - (width / 2));
  //   hoverAreaWidth = Math.ceil(width);

  //   if (x < 0) {
  //     hoverAreaWidth += x;
  //     x = 0;
  //   }

  //   hoverArea = point.group.elem('rect', {
  //     x     : x,
  //     y     : 0,
  //     width : hoverAreaWidth,
  //     height: '100%',
  //     fill  : 'transparent',
  //     index : point.index
  //   }, 'ct-point-hover-area');

  //   hoverAreaNode = hoverArea._node;

  //   var attach = attachTooltip.bind(null, point);
  //   var detach = detachTooltip.bind(null, point);
  //   hoverAreaNode.addEventListener('mouseenter', attach);
  //   hoverAreaNode.addEventListener('mouseleave', detach);
  // };

  var attachTooltip = function(point, e) {
    console.log(point);
  // console.log(e.currentTarget.dataset.point);
  };

  var detachTooltip = function(point, e) {
    console.log(point);
    // console.log(e.currentTarget);
  };


  Chartist.plugins = Chartist.plugins || {};

  Chartist.plugins.lineTooltip = function(options) {
    options = Chartist.extend({}, defaultOptions, options);

    return function tooltip(chart) {
      if (!(chart instanceof Chartist.Line)) { return; }

      var points = [];

      chart.on('draw', function(data) {
        if (data.type === 'point') {
          points.push(data);
        }
      });

      chart.on('created', function() {
        if (points.length < 2) { return; }

        var width = (points[1].x - points[0].x),
            hoverAreaWidth,
            x,
            hoverArea,
            hoverAreaNode;

        points.forEach(function(point, i) {
          // createHoverArea(width);
          x              = Math.floor(point.x - (width / 2));
          hoverAreaWidth = Math.ceil(width);

          if (x < 0) {
            hoverAreaWidth += x;
            x = 0;
          }

          hoverArea = point.group.elem('rect', {
            x     : x,
            y     : 0,
            width : hoverAreaWidth,
            height: '100%',
            fill  : 'transparent',
            index : point.index
          }, 'ct-point-hover-area');

          hoverAreaNode = hoverArea._node;

          var attach = attachTooltip.bind(null, point);
          var detach = detachTooltip.bind(null, point);
          hoverAreaNode.addEventListener('mouseenter', attach);
          hoverAreaNode.addEventListener('mouseleave', detach);

          // Create tooltips

        });
      });
    };
  };

}(window, document, Chartist));
