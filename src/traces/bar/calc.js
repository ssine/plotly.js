/**
* Copyright 2012-2021, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Axes = require('../../plots/cartesian/axes');
var alignPeriod = require('../../plots/cartesian/align_period');
var hasColorscale = require('../../components/colorscale/helpers').hasColorscale;
var colorscaleCalc = require('../../components/colorscale/calc');
var arraysToCalcdata = require('./arrays_to_calcdata');
var calcSelection = require('../scatter/calc_selection');

module.exports = function calc(gd, trace) {
    var xa = Axes.getFromId(gd, trace.xaxis || 'x');
    var ya = Axes.getFromId(gd, trace.yaxis || 'y');
    var size, pos, origPos;

    var sizeOpts = {
        msUTC: !!(trace.base || trace.base === 0)
    };

    var hasPeriod;
    if(trace.orientation === 'h') {
        size = xa.makeCalcdata(trace, 'x', sizeOpts);
        origPos = ya.makeCalcdata(trace, 'y');
        pos = alignPeriod(trace, ya, 'y', origPos);
        hasPeriod = !!trace.yperiodalignment;
    } else {
        size = ya.makeCalcdata(trace, 'y', sizeOpts);
        origPos = xa.makeCalcdata(trace, 'x');
        pos = alignPeriod(trace, xa, 'x', origPos);
        hasPeriod = !!trace.xperiodalignment;
    }

    // create the "calculated data" to plot
    var serieslen = Math.min(pos.length, size.length);
    var cd = new Array(serieslen);

    // set position and size
    for(var i = 0; i < serieslen; i++) {
        cd[i] = { p: pos[i], s: size[i] };

        if(hasPeriod) {
            cd[i].orig_p = origPos[i]; // used by hover
        }

        if(trace.ids) {
            cd[i].id = String(trace.ids[i]);
        }
    }

    // auto-z and autocolorscale if applicable
    if(hasColorscale(trace, 'marker')) {
        colorscaleCalc(gd, trace, {
            vals: trace.marker.color,
            containerStr: 'marker',
            cLetter: 'c'
        });
    }
    if(hasColorscale(trace, 'marker.line')) {
        colorscaleCalc(gd, trace, {
            vals: trace.marker.line.color,
            containerStr: 'marker.line',
            cLetter: 'c'
        });
    }

    arraysToCalcdata(cd, trace);
    calcSelection(cd, trace);

    return cd;
};
