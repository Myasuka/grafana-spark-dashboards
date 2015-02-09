#!/usr/bin/env node

var moment = require('moment');

var args = process.argv.slice(2);
var app_id = args[0];
var max_executor_id = 20;

var start_time = moment().subtract(10, 'minutes');
var end_time = moment();
if (args.length > 1) {
  start_time = moment(new Date(args[1]));
  end_time = moment(new Date(args[2]));
}

var id = 1;
function renderString(str, vars, strict) {
  var regex = /\$\{([a-zA-Z_0-9]+)\}/g;
  var ret = '';
  var lastIndex = 0;
  while (true) {
    var m = regex.exec(str);
    if (!m) {
      return ret + str.slice(lastIndex);
    }

    var varname = m[1];
    if (varname == 'id' || (varname in vars)) {
      var value = (varname == 'id') ? id : vars[varname];

      ret += str.slice(lastIndex, m.index) + value;

      if (varname == 'id') {
        id++;
      }
    } else if (strict) {
      throw new Error(
            "Bad key in JSON template: " + varname + ". Available keys:\n" + JSON.stringify(vars, null, 4)
      );
    } else {
      ret += str.slice(lastIndex, m.index + m[0].length);
    }
    lastIndex = regex.lastIndex;
  }
}

function render(json, vars, strict) {
  var tpe = typeof(json);
  if (tpe == 'string') {
    return renderString(json, vars, strict);
  } else if (json instanceof Array) {
    return json.map(function(elem) {
      return render(elem, vars, strict);
    });
  } else if (tpe == 'number' || tpe == 'undefined' || json == null) {
    return json;
  } else {
    var obj = {};
    for (k in json) {
      obj[k] = render(json[k], vars, strict);
    }
    return obj;
  }
}

var executor_panel =     {
        "title": "${executor_id}: GC tiers / generations",
        "error": false,
        "span": 3,
        "editable": true,
        "type": "graph",
        "id": "${id}",
        "datasource": null,
        "renderer": "flot",
        "x-axis": true,
        "y-axis": true,
        "y_formats": [
          "short",
          "short"
        ],
        "grid": {
          "leftMax": null,
          "rightMax": null,
          "leftMin": null,
          "rightMin": null,
          "threshold1": null,
          "threshold2": null,
          "threshold1Color": "rgba(216, 200, 27, 0.27)",
          "threshold2Color": "rgba(234, 112, 112, 0.22)"
        },
        "lines": true,
        "fill": 0,
        "linewidth": 1,
        "points": false,
        "pointradius": 5,
        "bars": false,
        "stack": false,
        "percentage": false,
        "legend": {
          "show": true,
          "values": false,
          "min": false,
          "max": false,
          "current": false,
          "total": false,
          "avg": false
        },
        "nullPointMode": "null",
        "steppedLine": false,
        "tooltip": {
          "value_type": "cumulative",
          "shared": true
        },
        "targets": [
          {
            "target": "aliasSub(movingAverage(${app_id}.${executor_id}.jvm.pools.*.usage, 10), '^.*\\.([^.]*)\\.usage.*', '\\1')"
          }
        ],
        "aliasColors": {},
        "seriesOverrides": [
          {
            "alias": "Code-Cache"
          }
        ],
        "links": []
      }

var executor_row = {
  "title": "Executor JVMs",
  "height": "350px",
  "editable": true,
  "collapse": false,
  "panels": []
}

for (var executor_id = 1; executor_id <= max_executor_id; ++executor_id) {
  executor_row.panels.push(
        render(
              executor_panel,
              {
                "executor_id": executor_id
              },
              false
        )
  );
}

var threadpool_row =     {
        "title": "threadpool",
        "height": "300px",
        "editable": true,
        "collapse": false,
        "panels": [
          {
            "title": "active tasks (stacked per executor)",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "short",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 10,
            "linewidth": 1,
            "points": false,
            "pointradius": 5,
            "bars": false,
            "stack": true,
            "percentage": false,
            "legend": {
              "show": false,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "null as zero",
            "steppedLine": false,
            "tooltip": {
              "value_type": "individual",
              "shared": true
            },
            "targets": [
              {
                "target": "aliasByNode(${app_id}.*.executor.threadpool.activeTasks, 1)"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [],
            "links": []
          },
          {
            "title": "Completed tasks per executor",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "short",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": false,
            "pointradius": 5,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": false,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "null",
            "steppedLine": false,
            "tooltip": {
              "value_type": "cumulative",
              "shared": true
            },
            "targets": [
              {
                "target": "aliasByNode(${app_id}.*.executor.threadpool.completeTasks, 1)"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [],
            "links": []
          },
          {
            "title": "Completed tasks per minute per executor",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "short",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": true,
            "pointradius": 1,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": false,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "null",
            "steppedLine": false,
            "tooltip": {
              "value_type": "cumulative",
              "shared": true
            },
            "targets": [
              {
                "target": "aliasByNode(derivative(summarize(${app_id}.*.executor.threadpool.completeTasks, '1m', 'avg', false)), 1)"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [],
            "links": []
          }
        ]
      }

var driver_row =     {
        "title": "Driver JVM / GC",
        "height": "250px",
        "editable": true,
        "collapse": false,
        "panels": [
          {
            "title": "driver scavenge GC",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "short",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": false,
            "pointradius": 5,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": true,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "null",
            "steppedLine": false,
            "tooltip": {
              "value_type": "cumulative",
              "shared": true
            },
            "targets": [
              {
                "target": "alias(${app_id}.<driver>.jvm.PS-Scavenge.count, 'gc count')",
                "hide": false
              },
              {
                "target": "alias(${app_id}.<driver>.jvm.PS-Scavenge.time, 'gc time')",
                "hide": false
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [
              {
                "alias": "${app_id}.<driver>.jvm.PS-Scavenge.time",
                "yaxis": 2
              },
              {
                "alias": "gc time",
                "yaxis": 2
              }
            ],
            "links": []
          },
          {
            "title": "driver heap/non-heap usage",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "short",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": false,
            "pointradius": 5,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": true,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "connected",
            "steppedLine": false,
            "tooltip": {
              "value_type": "cumulative",
              "shared": true
            },
            "targets": [
              {
                "target": "alias(${app_id}.<driver>.jvm.heap.usage, 'heap usage')"
              },
              {
                "target": "alias(${app_id}.<driver>.jvm.non-heap.usage, 'non-heap usage')"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [
              {
                "alias": "non-heap used",
                "yaxis": 2
              },
              {
                "alias": "non-heap usage",
                "yaxis": 1
              }
            ],
            "links": []
          },
          {
            "title": "driver heap/non-heap \"used\"",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "bytes",
              "bytes"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": false,
            "pointradius": 1,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": true,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "connected",
            "steppedLine": false,
            "tooltip": {
              "value_type": "cumulative",
              "shared": true
            },
            "targets": [
              {
                "target": "alias(${app_id}.<driver>.jvm.heap.used, 'heap used')"
              },
              {
                "target": "alias(${app_id}.<driver>.jvm.non-heap.used, 'non-heap used')"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [
              {
                "alias": "${app_id}.<driver>.jvm.non-heap.used",
                "yaxis": 2
              },
              {
                "alias": "non-heap used",
                "yaxis": 2
              }
            ],
            "links": []
          },
          {
            "title": "driver gc time/s",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "ms",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": false,
            "pointradius": 5,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": true,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "connected",
            "steppedLine": false,
            "tooltip": {
              "value_type": "cumulative",
              "shared": true
            },
            "targets": [
              {
                "target": "alias(movingAverage(perSecond(${app_id}.<driver>.jvm.PS-Scavenge.time), 10),'GC time')"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [],
            "links": []
          },
          {
            "title": "driver GC tiers / generations",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "short",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": false,
            "pointradius": 5,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": true,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "null",
            "steppedLine": false,
            "tooltip": {
              "value_type": "cumulative",
              "shared": true
            },
            "targets": [
              {
                "target": "aliasSub(movingAverage(${app_id}.<driver>.jvm.pools.*.usage, 10), '^.*\\.([^.]*)\\.usage.*', '\\1')"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [
              {
                "alias": "Code-Cache"
              }
            ],
            "links": []
          },
          {
            "title": "Driver jvm totals",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "bytes",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": false,
            "pointradius": 5,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": true,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "null",
            "steppedLine": false,
            "tooltip": {
              "value_type": "cumulative",
              "shared": true
            },
            "targets": [
              {
                "target": "aliasSub(movingAverage(${app_id}.<driver>.jvm.total.*, 5), '^.*\\.(total\\.[^.,]*).*', '\\1')"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [],
            "links": []
          },
          {
            "title": "no title (click here)",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "short",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": false,
            "pointradius": 5,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": true,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "connected",
            "steppedLine": false,
            "tooltip": {
              "value_type": "cumulative",
              "shared": false
            },
            "targets": [
              {}
            ],
            "aliasColors": {},
            "seriesOverrides": []
          }
        ]
      }

var hdfs_row =     {
        "title": "HDFS I/O",
        "height": "300px",
        "editable": true,
        "collapse": false,
        "panels": [
          {
            "title": "hdfs reads/s",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "short",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 10,
            "linewidth": 1,
            "points": true,
            "pointradius": 1,
            "bars": false,
            "stack": true,
            "percentage": false,
            "legend": {
              "show": false,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "null as zero",
            "steppedLine": false,
            "tooltip": {
              "value_type": "individual",
              "shared": true
            },
            "targets": [
              {
                "target": "aliasByNode(derivative(summarize(${app_id}.*.executor.filesystem.hdfs.read_ops, '10s', 'avg')), 1)"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [],
            "links": []
          },
          {
            "title": "hdfs reads/executor",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "short",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": false,
            "pointradius": 1,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": false,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "null",
            "steppedLine": false,
            "tooltip": {
              "value_type": "cumulative",
              "shared": true
            },
            "targets": [
              {
                "target": "aliasByNode(summarize(${app_id}.*.executor.filesystem.hdfs.read_ops, '10s', 'avg'), 1)"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [],
            "links": []
          },
          {
            "title": "hdfs reads/s/executor",
            "error": false,
            "span": 4,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "short",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": false,
            "pointradius": 1,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": false,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "null",
            "steppedLine": true,
            "tooltip": {
              "value_type": "cumulative",
              "shared": true
            },
            "targets": [
              {
                "target": "aliasByNode(derivative(summarize(${app_id}.*.executor.filesystem.hdfs.read_ops, '10s', 'avg')), 1)"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [],
            "links": []
          },
          {
            "title": "hdfs bytes read/s/executor",
            "error": false,
            "span": 6,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "bytes",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 0,
            "linewidth": 1,
            "points": false,
            "pointradius": 5,
            "bars": false,
            "stack": false,
            "percentage": false,
            "legend": {
              "show": false,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "null",
            "steppedLine": false,
            "tooltip": {
              "value_type": "cumulative",
              "shared": true
            },
            "targets": [
              {
                "target": "aliasByNode(perSecond(${app_id}.*.executor.filesystem.hdfs.read_bytes), 1)"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [],
            "links": [],
            "cacheTimeout": "60",
            "maxDataPoints": ""
          },
          {
            "title": "hdfs bytes read",
            "error": false,
            "span": 6,
            "editable": true,
            "type": "graph",
            "id": "${id}",
            "datasource": null,
            "renderer": "flot",
            "x-axis": true,
            "y-axis": true,
            "y_formats": [
              "bytes",
              "short"
            ],
            "grid": {
              "leftMax": null,
              "rightMax": null,
              "leftMin": null,
              "rightMin": null,
              "threshold1": null,
              "threshold2": null,
              "threshold1Color": "rgba(216, 200, 27, 0.27)",
              "threshold2Color": "rgba(234, 112, 112, 0.22)"
            },
            "lines": true,
            "fill": 10,
            "linewidth": 1,
            "points": false,
            "pointradius": 5,
            "bars": false,
            "stack": true,
            "percentage": false,
            "legend": {
              "show": false,
              "values": false,
              "min": false,
              "max": false,
              "current": false,
              "total": false,
              "avg": false
            },
            "nullPointMode": "null as zero",
            "steppedLine": false,
            "tooltip": {
              "value_type": "individual",
              "shared": true
            },
            "targets": [
              {
                "target": "aliasByNode(${app_id}.*.executor.filesystem.hdfs.read_bytes, 1)"
              }
            ],
            "aliasColors": {},
            "seriesOverrides": [],
            "links": []
          }
        ]
      }

var carbon_row =     {
  "title": "Carbon row",
  "height": "250px",
  "editable": true,
  "collapse": false,
  "panels": [
    {
      "title": "Carbon Stats - metrics collected, points per update",
      "error": false,
      "span": 4,
      "editable": true,
      "type": "graph",
      "id": "${id}",
      "datasource": null,
      "renderer": "flot",
      "x-axis": true,
      "y-axis": true,
      "y_formats": [
        "short",
        "short"
      ],
      "grid": {
        "leftMax": null,
        "rightMax": null,
        "leftMin": null,
        "rightMin": null,
        "threshold1": null,
        "threshold2": null,
        "threshold1Color": "rgba(216, 200, 27, 0.27)",
        "threshold2Color": "rgba(234, 112, 112, 0.22)"
      },
      "lines": true,
      "fill": 0,
      "linewidth": 1,
      "points": false,
      "pointradius": 5,
      "bars": false,
      "stack": false,
      "percentage": false,
      "legend": {
        "show": true,
        "values": false,
        "min": false,
        "max": false,
        "current": false,
        "total": false,
        "avg": false
      },
      "nullPointMode": "connected",
      "steppedLine": false,
      "tooltip": {
        "value_type": "cumulative",
        "shared": true
      },
      "targets": [
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.metricsReceived, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": false
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.pointsPerUpdate, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": false
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.avgUpdateTime, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": false
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.errors, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": false
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.cache.queues, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": true
        }
      ],
      "aliasColors": {},
      "seriesOverrides": [
        {
          "alias": "memUsage",
          "yaxis": 2
        },
        {
          "alias": "cache.size",
          "yaxis": 2
        },
        {
          "alias": "metricsReceived",
          "yaxis": 2
        }
      ],
      "links": []
    },
    {
      "title": "Carbon Stats - updates, queues",
      "error": false,
      "span": 4,
      "editable": true,
      "type": "graph",
      "id": "${id}",
      "datasource": null,
      "renderer": "flot",
      "x-axis": true,
      "y-axis": true,
      "y_formats": [
        "short",
        "short"
      ],
      "grid": {
        "leftMax": null,
        "rightMax": null,
        "leftMin": null,
        "rightMin": null,
        "threshold1": null,
        "threshold2": null,
        "threshold1Color": "rgba(216, 200, 27, 0.27)",
        "threshold2Color": "rgba(234, 112, 112, 0.22)"
      },
      "lines": true,
      "fill": 0,
      "linewidth": 1,
      "points": false,
      "pointradius": 5,
      "bars": false,
      "stack": false,
      "percentage": false,
      "legend": {
        "show": true,
        "values": false,
        "min": false,
        "max": false,
        "current": false,
        "total": false,
        "avg": false
      },
      "nullPointMode": "connected",
      "steppedLine": false,
      "tooltip": {
        "value_type": "cumulative",
        "shared": true
      },
      "targets": [
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.metricsReceived, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": true
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.pointsPerUpdate, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": true
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.cache.size, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": true
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.updateOperations, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": false
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.cache.queues, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": false
        }
      ],
      "aliasColors": {},
      "seriesOverrides": [
        {
          "alias": "memUsage",
          "yaxis": 2
        },
        {
          "alias": "cache.size",
          "yaxis": 2
        },
        {
          "alias": "metricsReceived",
          "yaxis": 2
        },
        {
          "alias": "updateOperations",
          "yaxis": 2
        }
      ],
      "links": []
    },
    {
      "title": "Carbon Stats - mem usage",
      "error": false,
      "span": 4,
      "editable": true,
      "type": "graph",
      "id": "${id}",
      "datasource": null,
      "renderer": "flot",
      "x-axis": true,
      "y-axis": true,
      "y_formats": [
        "bytes",
        "bytes"
      ],
      "grid": {
        "leftMax": null,
        "rightMax": null,
        "leftMin": null,
        "rightMin": null,
        "threshold1": null,
        "threshold2": null,
        "threshold1Color": "rgba(216, 200, 27, 0.27)",
        "threshold2Color": "rgba(234, 112, 112, 0.22)"
      },
      "lines": true,
      "fill": 0,
      "linewidth": 1,
      "points": false,
      "pointradius": 5,
      "bars": false,
      "stack": false,
      "percentage": false,
      "legend": {
        "show": true,
        "values": false,
        "min": false,
        "max": false,
        "current": false,
        "total": false,
        "avg": false
      },
      "nullPointMode": "connected",
      "steppedLine": false,
      "tooltip": {
        "value_type": "cumulative",
        "shared": true
      },
      "targets": [
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.metricsReceived, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": true
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.pointsPerUpdate, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": true
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.cache.size, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": true
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.cache.size, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": false
        },
        {
          "target": "aliasSub(carbon.agents.demeter-login1-a.memUsage, '.*demeter-login1-a\\.(.*)', '\\1')",
          "hide": false
        }
      ],
      "aliasColors": {},
      "seriesOverrides": [
        {
          "alias": "memUsage",
          "yaxis": 1
        },
        {
          "alias": "cache.size",
          "yaxis": 2
        },
        {
          "alias": "metricsReceived",
          "yaxis": 2
        },
        {
          "alias": "updateOperations",
          "yaxis": 2
        }
      ],
      "links": []
    }
  ]
}

var json =
/*{
  "user": "guest",
  "group": "guest",
  "title": "${app_id}",
  "tags": [],
  "dashboard":*/
  {
    "id": "${app_id}",
    "title": "${app_id}",
    "originalTitle": "${app_id}",
    "tags": [],
    "style": "light",
    "timezone": "browser",
        "editable": true,
    "hideControls": false,
    "sharedCrosshair": false,
    "rows": [],
    "nav": [
      {
        "type": "timepicker",
        "collapse": false,
        "enable": true,
        "status": "Stable",
        "time_options": [
          "5m",
          "15m",
          "1h",
          "6h",
          "12h",
          "24h",
          "2d",
          "7d",
          "30d"
        ],
        "refresh_intervals": [
          "5s",
          "10s",
          "30s",
          "1m",
          "5m",
          "15m",
          "30m",
          "1h",
          "2h",
          "1d"
        ],
        "now": false,
        "notice": false
      }
    ],
    "time": {
      "from": "${start_time}",
      "to": "${end_time}",
      "now": false
    },
    "templating": {
      "list": []
    },
    "annotations": {
      "list": []
    },
    "refresh": false,
    "version": 6,
    "hideAllLegends": false
  }
/*}*/
;

json.rows.push(executor_row);
json.rows.push(threadpool_row);
json.rows.push(driver_row);
json.rows.push(hdfs_row);
json.rows.push(carbon_row);

var rendered = render(
      json,
      {
        "start_time": start_time.toString(),
        "end_time": end_time.toString(),
        "app_id": app_id
      },
      true
);

console.log(JSON.stringify(rendered, null, 4));

