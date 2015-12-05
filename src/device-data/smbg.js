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

var common = require('./common');

var subTypes = ['manual', 'linked'];

var propTypes = {
  type: common.propTypes.stringValue('smbg'),
  subType: common.propTypes.OPTIONAL + common.propTypes.oneOfStringOptions(
    '[ingestion, storage, client] String value encoding additional information about the source of the blood glucose value.',
    subTypes
  ),
  units: common.propTypes.bgUnits(),
  value: common.propTypes.bgValue()
};

var schema = {
  type: 'smbg',
  subType: subTypes,
  units: common.bgUnits,
  value: common.bgValue
};

module.generate = function(utc, format) {
  var smbg = common.generate(schema, utc, format);
  return smbg;
};

module.propTypes = propTypes;

module.exports = module;