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


  Chartist.plugins = Chartist.plugins || {};

  Chartist.plugins.lineTooltip = function (options) {
    options = Chartist.extend({}, defaultOptions, options);

    return function plugin (chart) {
      if (!(chart instanceof Chartist.Line)) { return; }

      var
        points   = [],
        tooltips = [],
        css      = '';

      var showTooltip = function (tooltip, e) {
        tooltip.style.opacity = 1;
        // console.log(e.currentTarget.dataset.point);
      };

      var hideTooltip = function (tooltip, e) {
        console.log(e);
        if (e.toElement)
        tooltip.style.opacity = 0;
        // console.log(e.currentTarget);
      };

      var createHoverArea = function (point, width) {



        // TODO: add with HTML (easier hovering with just CSS: .hover-area:hover + .tooltip, .tooltip:hover)




        var x = Math.floor(point.x - (width / 2));
        width = Math.ceil(width);

        if (x < 0) {
          width += x;
          x = 0;
        }

        var hoverArea = point.group.elem('rect', {
          x     : x,
          y     : 0,
          width : width,
          height: '100%',
          fill  : 'transparent',
          index : point.index
        }, 'ct-point-hover-area');

        return hoverArea;
      };

      var createTooltip = function (tooltip, container) {

        var tooltipEl = document.createElement('div');
        tooltipEl.innerHTML = tooltip.content;

        // TODO: Set this CSS in the stylesheet
        tooltipEl.setAttribute('style', 'position:absolute;height:80px;width:120px;background:red;transition:opacity .15s;');
        tooltipEl.setAttribute('class', 'ct-point-tooltip');
        tooltipEl.setAttribute('id', 'ct-point-tooltip-' + tooltip.id);

        container.appendChild(tooltipEl);
        // var tooltip = point.group.elem('rect', {
        //   x     : point.x,
        //   y     : point.y,
        //   width : 100,
        //   height: 50,
        //   fill  : 'red',
        //   index : point.index
        // }, 'ct-point-tooltip');

        return tooltipEl;
      };

      var getTooltipContents = function (seriesArray) {
        var
          contents = [],
          legends = [],
          series;

        if (seriesArray.length > 1) {
          legends = seriesArray.map(function (series, i) {
            return '<span id="' + i + '">' + i + ':</span>';
          });
        }


        seriesArray.forEach(function(series, s) {
          var legend = legends[s] || '';

          series.data.forEach(function (value, i) {
            contents[i] = (contents[i] || '') + '<div>'+legend+value+'</div>';
          });
        });

        return contents;
      };

      var createTooltips = function (data) {
        var container = document.createElement('div');
        container.setAttribute('class', 'ct-tooltips');
        document.querySelector('body').appendChild(container);

        var tooltipContents = getTooltipContents(data.data.series);

        tooltipContents.forEach(function (content, i) {
          tooltips[i] = createTooltip({
            id     : i,
            content: content
          }, container);
        });
      };

      var setTooltipPosition = function (tooltip, point, previousPosition) {
        var position = point.element._node.getBoundingClientRect();
        var left = position.left;
        var top  = position.top;

        if (previousPosition && previousPosition.top && previousPosition.top < top) {
          top = previousPosition.top;
        }

        return {
          id  : tooltip.id,
          left: left,
          top : top
        };
      };

      var tooltipPositionsCSS = function (tooltipPositions) {
        return tooltipPositions.map(function (position) {
          return '#' + position.id + ' { left: ' + position.left + 'px; top: ' + position.top + 'px; }';
        }).join('\n');
      };

      var addCSS = function (css) {
        var stylesheet = document.createElement('style');

        if (stylesheet.styleSheet){
          // IE
          stylesheet.styleSheet.cssText = css;
        } else {
          // W3C Standard
          stylesheet.appendChild(document.createTextNode(css));
        }

        return document.querySelector('head').appendChild(stylesheet);
      };

      var showTooltipOnHover = function (hoverArea, tooltip) {
        var
          show          = showTooltip.bind(null, tooltip),
          hide          = hideTooltip.bind(null, tooltip),
          hoverAreaNode = hoverArea._node;

        hoverAreaNode.addEventListener('mouseenter', show);
        hoverAreaNode.addEventListener('mouseleave', hide);

        tooltip.addEventListener('mouseenter', function(e) {
          console.log('mouseenter tooltip')
          e.preventDefault();
          e.stopPropagation();
        });

        // console.log(i);
        // return '.ct-point-tooltip { opacity: 0; transition: opacity .15s; stroke: 1px solid black; }.ct-point-hover-area:hover + .ct-point-tooltip, .ct-point-tooltip:hover { opacity: 1 }';
      };

      chart.on('data', function (data) {
        createTooltips(data);
      });

      chart.on('draw', function (data) {
        if (data.type === 'point') {
          points.push(data);
        }
      });

      chart.on('created', function () {
        var width;

        if (points.length < 2) {
          width = '100%';
        } else {
          width = points[1].x - points[0].x;
        }

        var tooltipPositions = [];

        css += '.ct-point-tooltip { opacity: 0 } .ct-point-tooltip:hover { opacity: 1 }';

        points.forEach(function (point) {
          var hoverArea = createHoverArea(point, width);
          var tooltip = tooltips[point.index];
          tooltipPositions[point.index] = setTooltipPosition(tooltip, point, tooltipPositions[point.index]);

          // TODO: set this dynamically - not in a stylesheet
          css += tooltipPositionsCSS(tooltipPositions);

          // css += setTooltipLegendColor()
          showTooltipOnHover(hoverArea, tooltip);
        });

        addCSS(css);
      });
    };
  };

}(window, document, Chartist));
