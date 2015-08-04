/**
 * Chartist.js plugin to display a tooltip on points in a line chart.
 *
 */

/* global Chartist */

(function(window, document, Chartist) {
  'use strict';

  var defaultOptions = {
    appendTooltipContent: appendTooltipContent,
    createSeriesLabel   : createSeriesLabel
  };

  function appendTooltipContent (tooltip, data, pluginOptions) {
    var seriesLabel;

    data.series.forEach(function (value, i) {
      seriesLabel = pluginOptions.createSeriesLabel({
        id     : i,
        idAlpha: String.fromCharCode(97 + i),
        label  : value
      }, pluginOptions);

      tooltip.appendChild(seriesLabel);
    });
  };

  function createSeriesLabel (options, pluginOptions) {
    var seriesLabel = document.createElement('div');

    seriesLabel.setAttribute('class', 'ct-tooltip-series-label');
    seriesLabel.innerHTML = '\
      <span class="ct-tooltip-legend ct-tooltip-legend-' + options.idAlpha + '"></span>\
      <span class="ct-tooltip-label">\
        ' + options.label + '\
      </span>';

    return seriesLabel;
  };

  Chartist.plugins = Chartist.plugins || {};

  Chartist.plugins.lineTooltip = function (options) {
    var pluginOptions = Chartist.extend({}, defaultOptions, options);

    return function plugin (chart) {
      if (!(chart instanceof Chartist.Line)) { return; }

      var points      = [],
          tooltips    = [],
          hoverEls    = [],
          tooltipData = [],
          tooltipStyles;

      tooltipStyles =
        '.ct-tooltip-hover {\
          position: absolute;\
          z-index: 10000;\
        }\
        \
        .ct-tooltip {\
          position: absolute;\
          z-index: 1;\
          opacity: 0;\
          background: #ddd;\
          -webkit-transition: opacity .15s;\
          -o-transition: opacity .15s;\
          transition: opacity .15s;\
        }\
        \
        .ct-tooltip-hover:hover + .ct-tooltip {\
          opacity: 1;\
        }';

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
        var parentBoundingRect = chart.container.getBoundingClientRect();
        var elBoundingRect = el.getBoundingClientRect();
        var top = elBoundingRect.top - parentBoundingRect.top;
        var left = elBoundingRect.left - parentBoundingRect.left;

        return {
          top: top,
          left: left
        };
      };

      var getPointOffset = function (point) {
        return getOffset(point.element._node);
      };

      var createTooltip = function (options) {
        var tooltip = document.createElement('div');

        tooltip.innerHTML = '\
          <div class="ct-tooltip-hover" id="ct-tooltip-hover-' + options.id + '"></div>\
          <div class="ct-tooltip" id="ct-tooltip-' + options.id + '"></div>';

        return tooltip;
      };

      var createTooltips = function (data) {
        var tooltipsContainer = chart.container;
        var tooltipsWrapper = document.createElement('div');

        tooltipsContainer.style.position = 'relative';
        tooltipsWrapper.setAttribute('class', 'ct-tooltips');

        var
          tooltipContainer,
          tooltip,
          seriesLabel;

        data.forEach(function (tooltipData, s) {
          tooltipData.id = s;
          tooltipContainer = createTooltip(tooltipData);

          tooltip = tooltipContainer.querySelector('.ct-tooltip');
          pluginOptions.appendTooltipContent(tooltip, tooltipData, pluginOptions);

          hoverEls[s] = tooltipContainer.querySelector('.ct-tooltip-hover');
          tooltips[s] = tooltip;
          tooltipsWrapper.appendChild(tooltipContainer);
        });

        tooltipsContainer.appendChild(tooltipsWrapper);
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

        // Tooltip bottom arrow height
        tooltipSize.height += 21;

        tooltip.style.left = (pointPosition.left - tooltipSize.width / 2) + 'px';
        tooltip.style.top  = (pointPosition.top - tooltipSize.height) + 'px';
      };

      addStyles(tooltipStyles);

      chart.on('data', function (data) {
        data.data.series.forEach(function (series, s) {
          series.forEach(function (value, i) {
            tooltipData[i] = tooltipData[i] || {};
            tooltipData[i].label = data.data.labels[i];
            tooltipData[i].series = tooltipData[i].series || [];
            tooltipData[i].series[s] = value;
          })
        })
      });

      chart.on('draw', function (data) {
        // showPoint needs to be true in chart options
        if (data.type === 'point') {
          points[data.index] = points[data.index] || [];
          points[data.index].push(data);
        }
      });

      chart.on('created', function () {
        var width;

        if (points.length < 2) {
          width = '100%';
        } else {
          width = points[1][0].x - points[0][0].x;
        }

        createTooltips(tooltipData);

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
