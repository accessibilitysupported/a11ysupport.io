const Ajv = require('ajv');
var ajv = new Ajv;
var valid = ajv.validate(require('./schema/feature.json'), require('./sample_feature.json'));
if (!valid) console.log(ajv.errors);
console.log(valid);
