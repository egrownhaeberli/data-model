/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015, Tidepool Project
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 * 
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

var _ = require('lodash');
var Chance = require('chance');
var chance = new Chance();
var format = require('util').format;
var moment = require('moment');
var uuid = require('node-uuid');

var GLUCOSE_MM = 18.01559;

module.bgUnits = function(units, ingestion) {
  return ingestion ? units : 'mmol/L';
};

module.bgValue = function(units, ingestion) {
  var value = chance.natural({min: 20, max: 600});
  if (units === 'mg/dL') {
    return value;
  }
  else if (units === 'mmol/L' && ingestion) {
    return Number(Number(value/GLUCOSE_MM).toFixed(1));
  }
  else {
    return value/GLUCOSE_MM;
  }
};

module.generate = function(schema, utc, format) {
  if (!schema) {
    console.error('Must provide a datatype schema as first param!');
  }
  if (!utc) {
    console.error('Must provide an ISO-formatted timestamp as second param!');
  }

  function client(obj) {
    var excluded = _.filter(Object.keys(obj), function(key) {
      return key.charAt(0) === '_' || key === 'createdTime';
    });
    return _.omit(obj, excluded);
  }
  function ingestion(obj) {
    var excluded = [
      '_active',
      '_groupId',
      '_schemaVersion',
      '_version',
      'createdTime',
      'id'
    ];
    return _.omit(obj, excluded);
  }
  function storage(obj) {
    return obj;
  }

  var schemaObj = _.mapValues(schema, function(val) {
    if (typeof val === 'function') {
      if (format === 'ingestion') {
        return val('mg/dL', true);
      }
      return val('mmol/L', false);
    }
    else if (Array.isArray(val)) {
      return val[chance.integer({min: 0, max: val.length - 1})];
    }
    else {
      return val;
    }
  });

  var tzOffset = new Date(utc).getTimezoneOffset();

  var commonFields = {
    _active: true,
    _groupId: 'abcdef',
    _schemaVersion: 0,
    _version: 0,
    clockDriftOffset: 0,
    conversionOffset: 0,
    createdTime: new Date(Date.parse(utc) + 5000).toISOString(),
    deviceId: 'DevId0987654321',
    deviceTime: moment.utc(Date.parse(utc))
      .subtract(tzOffset, 'minutes').toISOString().slice(0, -5),
    guid: uuid.v4(),
    id: uuid.v4().replace(/-/g, ''),
    time: utc,
    timezoneOffset: -tzOffset,
    uploadId: 'SampleUploadId'
  };

  switch(format) {
    case 'client':
      commonFields = client(commonFields);
      break;
    case 'ingestion':
      commonFields = ingestion(commonFields);
      break;
    case 'storage':
      commonFields = storage(commonFields);
      break;
  }

  return _.assign({}, schemaObj, commonFields);
};

module.propTypes = {
  bgUnits: function() {
    var ingestion = '[ingestion] One of two string values: `mg/dL` or `mmol/L`.\n\n';
    var elsewhere = '[storage, client] The string `mmol/L`.\n\n';
    var units = 'See [units](../units.md) for further explanation of blood glucose units.';
    return ingestion + elsewhere + units;
  },
  bgValue: function() {
    var ingestion = '[ingestion] Blood glucose value in either mg/dL (integer) or mmol/L (float), with appropriately matching `units` field.\n\n';
    var elsewhere = '[storage, client] Blood glucose value in mmol/L (float, potentially unrounded), with appropriately matching `units` field.';
    return ingestion + elsewhere;
  },
  stringValue: function(str) {
    return format('[ingestion, storage, client] The string `%s`.', str);
  },
  oneOfStringOptions: function(desc, arr) {
    return desc + '\n\n' + 'Must be one of: `' + arr.join('`, `') + '`.';
  },
  OPTIONAL: '> This field is **optional**.\n\n'
};

module.exports = module;