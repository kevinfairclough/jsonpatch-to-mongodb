var toDot = require('jsonpath-to-dot');

module.exports = function (patches) {
  var update = {};
  var cache = {};
  var APPEND_OP = '-'

  function isNumber(s) {
    return !isNaN(parseInt(s, 10));
  }

  function isArrayAppendOp(parts) {
    return (parts[parts.length - 1] === APPEND_OP);
  }

  function isArrayOp(parts) {
    return (isNumber(parts[parts.length - 1]));
  }

  function addHandler(p) {
    var $position;
    var mongoPath;
    var path = toDot(p.path),
      parts = path.split('.');

    if (parts.length > 0) {
      if (isArrayAppendOp(parts)) {

        update.$push = update.$push || {};
        parts.splice(-1, 1);

        mongoPath = parts.join('.');

        if (update.$push[mongoPath]) {
          update.$push[mongoPath].$each = update.$push[mongoPath].$each.concat([p.value]);
        } else {
          update.$push[mongoPath] = { $each: [p.value] };
        }

      } else if (isArrayOp(parts)) {

        $position = parseInt(parts[parts.length - 1], 10);
        update.$set = update.$set || {};
        mongoPath = parts.join('.');
        update.$set[mongoPath] = p.value;
      } else {

        update.$set = update.$set || {};
        mongoPath = parts.join('.');
        update.$set[mongoPath] = p.value;
      }
    } else {

      update.$set = update.$set || {};
      mongoPath = parts.join('.');
      update.$set[mongoPath] = p.value;
    }

  }

  function removeHandler(p) {
    if (!update.$unset) update.$unset = {};
    var path = toDot(p.path),
      parts = path.split('.');

    if (isArrayOp(parts)) {
      var $position = parseInt(parts[parts.length - 1], 10);
      parts.splice(-1, 1);
      mongoPath = parts.join('.');
      cachePath = parts.join('.') + '.$pos';

      if (cache[cachePath]) {
        if (update.$unset[path]) {
          update.$unset[mongoPath + '.' + (cache[cachePath] + $position)] = 1;
          cache[cachePath] = cache[cachePath] + 1;
        } else {
          update.$unset[path] = 1;
        }
      } else {
        update.$unset[path] = 1;
        cache[cachePath] = 1;
      }

    } else {
      update.$unset[path] = 1;
    }
  }

  function replaceHandler(p) {
    if (!update.$set) { update.$set = {} }
    update.$set[toDot(p.path)] = p.value;
  }
  patches.map(function (p) {
    if (p.op === 'add') {
      addHandler(p);
    } else if (p.op === 'remove') {
      removeHandler(p);
    } else if (p.op === 'replace') {
      replaceHandler(p);
    } else if (p.op !== 'test') {
      throw new Error('Unsupported Operation! op = ' + p.op);
    }
  });
  return update;
};

