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

      // Positioning of elements is done relative to container
      chart.container.style.position = 'relative';

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
          containerRect = chart.container.getBoundingClientRect(),
          pointRect     = point.element._node.getBoundingClientRect(),
          height        = chart.container.offsetHeight,
          left          = Math.floor(pointRect.left - containerRect.left - width / 2),
          top           = 0;

        hoverEl.style.left   = left + 'px';
        hoverEl.style.top    = top + 'px';
        hoverEl.style.width  = width + 'px';
        hoverEl.style.height = height + 'px';
      };

      var positionTooltip = function (tooltip, point) {
        var
          containerRect = chart.container.getBoundingClientRect(),
          pointRect = point.element._node.getBoundingClientRect(),
          left = pointRect.left - containerRect.left,
          top = pointRect.top - containerRect.top,
          extraHeight = 21; // Tooltip bottom arrow + extra space

        tooltip.style.left = (left - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top  = (top - tooltip.offsetHeight - extraHeight) + 'px';
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
