(function($) {
  function bytesFormatter(bytes, axis, ratio) {
    var sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) {
      return bytes;
    }
    var val = ratio ? ratio * bytes : bytes;
    var i = parseInt(Math.floor(Math.log(val) / Math.log(1024)));
    if (i === 0) {
      return val + " " + sizes[i];
    }
    return (val / Math.pow(1024, i)).toFixed(axis.tickDecimals) + " " + sizes[i];
  }

  function init(plot) {
    plot.hooks.processDatapoints.push(function(plot) {
      var axis = plot.getAxes().yaxis;
      var opts = axis.options;

      if (opts.type === "memory") {
        axis.tickFormatter = function(v, axis) {
          return bytesFormatter(v, axis, plot.getOptions().yaxis.ratio);
        };

        axis.tickGenerator = function (axis) {
          var returnTicks = [],
              tickSize = 2,
              delta = axis.delta,
              steps = 0,
              tickMin = 0,
              tickVal,
              tickCount = 0;

          while (Math.abs(delta) >= 1024) {
            steps++;
            delta /= 1024;
          }

          while (tickSize <= 1024) {
            if (delta <= tickSize) {
              break;
            }
            tickSize *= 2;
          }

          axis.tickSize = tickSize * Math.pow(1024, steps);

          tickMin = axis.tickSize * Math.floor(axis.min / axis.tickSize);

          do {
            tickVal = tickMin + (tickCount++) * axis.tickSize;
            returnTicks.push(tickVal);
          } while (tickVal < axis.max);

          return returnTicks;
        };
      }
    });
  }

  $.plot.plugins.push({
    init: init,
    options: {}
  });
})(jQuery);
