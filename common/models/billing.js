'use strict';

module.exports = function(Billing) {
  Billing.validatesInclusionOf('type', {in: ['automatic','manual']});

};
