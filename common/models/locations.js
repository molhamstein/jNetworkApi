'use strict';

module.exports = function(Locations) {
  Locations.validatesInclusionOf('type', {in: ['free', 'automatic','manual']});

};
