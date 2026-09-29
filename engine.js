/* ClimbMath engine - climbing grade conversion and rigging math, no DOM. */
(function (root) {
  'use strict';

  // One canonical difficulty ladder; each row maps the systems to the same rung.
  // Sources: standard published conversion charts (YDS / French sport / UIAA / Hueco V / Font).
  var LADDER = [
    { yds: '5.5',  fr: '4b',  uiaa: 'IV+',  v: null,   font: null },
    { yds: '5.6',  fr: '4c',  uiaa: 'V',    v: null,   font: null },
    { yds: '5.7',  fr: '5a',  uiaa: 'V+',   v: null,   font: null },
    { yds: '5.8',  fr: '5b',  uiaa: 'VI-',  v: null,   font: null },
    { yds: '5.9',  fr: '5c',  uiaa: 'VI',   v: null,   font: null },
    { yds: '5.10a', fr: '6a', uiaa: 'VI+',  v: 'V0',   font: '4' },
    { yds: '5.10b', fr: '6a+', uiaa: 'VII-', v: 'V0+', font: '4+' },
    { yds: '5.10c', fr: '6b', uiaa: 'VII',  v: 'V1',   font: '5' },
    { yds: '5.10d', fr: '6b+', uiaa: 'VII+', v: 'V2',  font: '5+' },
    { yds: '5.11a', fr: '6c',  uiaa: 'VIII-', v: 'V3', font: '6A' },
    { yds: '5.11b', fr: '6c+', uiaa: 'VIII', v: 'V4',  font: '6B' },
    { yds: '5.11c', fr: '7a',  uiaa: 'VIII+', v: 'V5', font: '6B+' },
    { yds: '5.11d', fr: '7a+', uiaa: 'IX-',  v: 'V6',  font: '6C' },
    { yds: '5.12a', fr: '7b',  uiaa: 'IX',   v: 'V7',  font: '6C+' },
    { yds: '5.12b', fr: '7b+', uiaa: 'IX+',  v: 'V8',  font: '7A' },
    { yds: '5.12c', fr: '7c',  uiaa: 'X-',   v: 'V9',  font: '7A+' },
    { yds: '5.12d', fr: '7c+', uiaa: 'X',    v: 'V10', font: '7B' },
    { yds: '5.13a', fr: '8a',  uiaa: 'X+',   v: 'V11', font: '7B+' },
    { yds: '5.13b', fr: '8a+', uiaa: 'XI-',  v: 'V12', font: '7C' },
    { yds: '5.13c', fr: '8b',  uiaa: 'XI',   v: 'V13', font: '7C+' },
    { yds: '5.13d', fr: '8b+', uiaa: 'XI+',  v: 'V14', font: '8A' },
    { yds: '5.14a', fr: '8c',  uiaa: 'XII-', v: 'V15', font: '8A+' },
    { yds: '5.14b', fr: '8c+', uiaa: 'XII',  v: 'V16', font: '8B' },
    { yds: '5.14c', fr: '9a',  uiaa: 'XII+', v: 'V17', font: '8B+' },
    { yds: '5.14d', fr: '9a+', uiaa: 'XIII-', v: null, font: '8C' },
    { yds: '5.15a', fr: '9b',  uiaa: 'XIII', v: null,  font: '8C+' },
    { yds: '5.15b', fr: '9b+', uiaa: 'XIII+', v: null, font: '9A' }
  ];

  function trim(s) {
    return String(s).trim().replace(/\s+/g, '');
  }

  // Find the ladder rung for a grade in any system. Case is meaningful where the
  // systems collide: French sport grades are lowercase (7a), Font grades uppercase (6C).
  // YDS, UIAA and V-scale are matched case-insensitively (V is unambiguous).
  function findRung(grade) {
    var g = trim(grade);
    if (!g) return null;
    var gl = g.toLowerCase();
    for (var i = 0; i < LADDER.length; i++) {
      var r = LADDER[i];
      if (r.yds.toLowerCase() === gl) return { index: i, rung: r };
      if (r.uiaa && r.uiaa.toLowerCase() === gl) return { index: i, rung: r };
      if (r.v && r.v.toLowerCase() === gl) return { index: i, rung: r };
      if (r.font && r.font === g) return { index: i, rung: r };
      if (r.fr === g) return { index: i, rung: r };
    }
    return null;
  }

  function convertGrade(grade) {
    var hit = findRung(grade);
    if (!hit) return null;
    var r = hit.rung;
    return { yds: r.yds, fr: r.fr, uiaa: r.uiaa, v: r.v || '(rope grade)', font: r.font || '(rope grade)', rung: hit.index };
  }

  // Fall factor = fall distance / rope in service. Classic lead max is 2 (fall past belayer with no pro).
  function fallFactor(fallMeters, ropeOutMeters) {
    if (ropeOutMeters <= 0) return null;
    return Math.round((fallMeters / ropeOutMeters) * 100) / 100;
  }

  function fallVerdict(ff) {
    if (ff === null) return 'no rope out';
    if (ff > 2) return 'impossible in normal lead geometry - check the inputs';
    if (ff >= 1.5) return 'severe - near the maximum a lead fall can be';
    if (ff >= 1) return 'hard - real impact on gear, rope and body';
    if (ff >= 0.5) return 'moderate - a normal working fall';
    return 'soft - rope stretch eats most of it';
  }

  // Rope needed to lower off a pitch: 2x route height + margin for knots and stretch.
  function ropeNeeded(routeMeters, marginMeters) {
    marginMeters = marginMeters === undefined ? 5 : marginMeters;
    return Math.ceil(2 * routeMeters + marginMeters);
  }

  // Quickdraws: one per bolt, plus anchor and spares.
  function drawsNeeded(boltCount, spares) {
    spares = spares === undefined ? 2 : spares;
    return boltCount + 2 + spares;
  }

  // Redpoint pyramid: to have a realistic shot at target rung, you need a base of sends below it.
  // Rule of thumb: 3 sends one rung down, 9 two rungs down (3x per rung).
  function pyramid(targetRungIndex) {
    var out = [];
    var need = 3;
    for (var i = targetRungIndex - 1; i >= 0 && need <= 81; i--) {
      out.push({ rung: i, yds: LADDER[i].yds, sends: need });
      need *= 3;
      if (out.length >= 3) break;
    }
    return out;
  }

  // Energy per move is gym lore, but calories for a session are honest-ish:
  // ~700 kcal/hour moderate roped climbing, ~500 bouldering, scaled by body weight vs 70kg reference.
  function sessionCalories(minutes, bodyweightKg, style) {
    var base = style === 'bouldering' ? 500 : 700;
    return Math.round(base * (bodyweightKg / 70) * (minutes / 60));
  }

  var api = {
    LADDER: LADDER,
    convertGrade: convertGrade,
    findRung: findRung,
    fallFactor: fallFactor,
    fallVerdict: fallVerdict,
    ropeNeeded: ropeNeeded,
    drawsNeeded: drawsNeeded,
    pyramid: pyramid,
    sessionCalories: sessionCalories
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ClimbMath = api;
})(typeof window !== 'undefined' ? window : globalThis);
