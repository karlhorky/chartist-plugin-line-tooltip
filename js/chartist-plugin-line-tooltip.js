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

  Chartist.plugins.lineTooltip = function (options) {
    options = Chartist.extend({}, defaultOptions, options);

    return function plugin (chart) {
      if (!(chart instanceof Chartist.Line)) { return; }

      var
        points   = [],
        tooltips = [],
        hoverEls = [],
        tooltipStyles;

      tooltipStyles =
        '.ct-tooltip-hover {' +
        'position: absolute;' +
        'z-index: 10000;' +
        '}' +
        '.ct-tooltip {' +
        'position: absolute;' +
        'display: inline-block;' +
        'min-width: 5em;' +
        'padding: .4em .75em;' +
        'background: #f4c63d;' +
        'color: #453d3f;' +
        'z-index: 1;' +
        'opacity: 0;' +
        '-webkit-transition: opacity .15s;' +
        '-o-transition: opacity .15s;' +
        'transition: opacity .15s;' +
        '}' +
        '.ct-tooltip-hover:hover + .ct-tooltip {' +
        'opacity: 1;' +
        '}' +
        '.ct-tooltip:after {' +
        'content: "";' +
        'position: absolute;' +
        'top: 100%;' +
        'left: 50%;' +
        'width: 0;' +
        'height: 0;' +
        'margin-left: -15px;' +
        'border: 15px solid transparent;' +
        'border-top-color: #f4c63d;' +
        '}' +
        '.ct-tooltip-legend,' +
        '.ct-tooltip-caption-value {' +
        'vertical-align: middle;' +
        '}' +
        '.ct-tooltip-legend {' +
        'display: inline-block;' +
        'width: 6px;' +
        'height: 6px;' +
        'margin-right: 4px;' +
        'border: 1px solid #453d3f;' +
        'border-radius: 2px;' +
        '}' +
        '.ct-tooltip-legend-a {' +
        'background: #d70206;' +
        '}' +
        '.ct-tooltip-legend-b {' +
        'background: #f05b4f;' +
        '}';

      var addStyles = function (css) {
        var stylesheet = document.createElement('style');

        if (stylesheet.styleSheet){
          // IE
          stylesheet.styleSheet.cssText = css;
        } else {
          // W3C Standard
          stylesheet.appendChild(document.createTextNode(css));
        }

        var head = document.querySelector('head');

        return head.insertBefore(stylesheet, head.firstChild);
      };

      var getOffset = function (el) {
        var docEl = document.documentElement;
        var boundingRect = el.getBoundingClientRect();
        var top = boundingRect.top + window.pageYOffset - docEl.clientTop;
        var left = boundingRect.left + window.pageXOffset - docEl.clientLeft;

        return {
          top: top,
          left: left
        };
      };

      var getPointOffset = function (point) {
        return getOffset(point.element._node);
      };

      var getTooltip = function (options) {
        var tooltipEl = document.createElement('div');
        tooltipEl.innerHTML = options.content;

        tooltipEl.setAttribute('class', 'ct-tooltip');
        tooltipEl.setAttribute('id', 'ct-tooltip-' + options.id);

        return tooltipEl;
      };

      var getTooltipContents = function (seriesArray) {
        var
          contents = [],
          legends = [],
          series;

        if (seriesArray.length > 1) {
          legends = seriesArray.map(function (series, i) {
            return '<span class="ct-tooltip-legend ct-tooltip-legend-' + String.fromCharCode(97 + i) + '"></span>';
          });
        }

        seriesArray.forEach(function(series, s) {
          var legend = legends[s] || '';

          series.data.forEach(function (value, i) {
            contents[i] = (contents[i] || '') +
              '<div class="ct-tooltip-caption-line ct-tooltip-caption-line-' + i + '">' +
                legend +
                '<span class="ct-tooltip-caption-value">' +
                  value +
                '</span>' +
              '</div>';
          });
        });

        return contents;
      };

      var getHoverEl = function (options) {
        var hoverEl = document.createElement('div');

        hoverEl.setAttribute('class', 'ct-tooltip-hover');
        hoverEl.setAttribute('id', 'ct-tooltip-hover-' + options.id);

        return hoverEl;
      };

      var createTooltips = function (data) {
        var container = document.createElement('div');
        container.setAttribute('class', 'ct-tooltips');

        var
          hoverEl,
          tooltip,
          tooltipContents = getTooltipContents(data.data.series);

        tooltipContents.forEach(function (content, i) {
          hoverEls[i] = hoverEl = getHoverEl({
            id: i
          });

          container.appendChild(hoverEl);

          tooltips[i] = tooltip = getTooltip({
            id     : i,
            content: content
          });

          container.appendChild(tooltip);
        });

        document.querySelector('body').appendChild(container);
      };

      var positionHoverEl = function (hoverEl, point, width) {
        var
          pointPosition = getPointOffset(point),
          chartPosition = getOffset(chart.container),
          height        = chart.container.offsetHeight,
          left          = Math.floor(pointPosition.left - (width / 2));

        width = Math.ceil(width);

        if (left < chartPosition.left) {
          width += (left - chartPosition.left);
          left = chartPosition.left;
        }

        hoverEl.style.left   = left + 'px';
        hoverEl.style.top    = chartPosition.top + 'px';
        hoverEl.style.width  = width + 'px';
        hoverEl.style.height = height + 'px';
      };

      var positionTooltip = function (tooltip, point) {
        var
          pointPosition = getPointOffset(point),
          tooltipSize   = {
            width : tooltip.offsetWidth,
            height: tooltip.offsetHeight
          };

        // Arrow
        tooltipSize.height += 21;

        tooltip.style.left = (pointPosition.left - tooltipSize.width / 2) + 'px';
        tooltip.style.top  = (pointPosition.top - tooltipSize.height) + 'px';
      };

      addStyles(tooltipStyles);

      chart.on('data', function (data) {
        createTooltips(data);
      });

      chart.on('draw', function (data) {
        if (data.type === 'point') {
          points[data.index] = points[data.index] || [];
          points[data.index].push(data);
          console.log(data);
        }
      });

      chart.on('created', function () {
        var width;

        if (points.length < 2) {
          width = '100%';
        } else {
          width = points[1][0].x - points[0][0].x;
        }

        var tooltipPositions = [];

        points.forEach(function (pointSet) {
          var point = pointSet.sort(function (a, b) {
            return b.y - a.y;
          }).pop();

          positionHoverEl(hoverEls[point.index], point, width);
          positionTooltip(tooltips[point.index], point);
        });
      });
    };
  };

}(window, document, Chartist));
