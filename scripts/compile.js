'use strict'

var util = require('./util');
var Ajv = require('ajv');
var ajvPack = require('ajv-pack');
var fs = require('fs');

var schemaFiles = fs.readdirSync('./schema');

var schemas = schemaFiles.map(function(file) {
    return util.openFile('schema/' + file, 'schema ' + file);
});

var schemaIds = schemas.map(function(schema) {
    return schema['$id'];
});

var ajv = new Ajv({ sourceCode: true, schemas: schemas })

function compileSchema(id) {
    var validate;
    try {
        validate = ajv.getSchema(id);
        /* istanbul ignore else */
        if (typeof validate == 'function') {
            console.log('schema', id, 'is valid');
            try {
                var moduleCode = ajvPack(ajv, validate);
                try {
                    fs.writeFileSync('./validators/' + id.slice(0, -2), moduleCode);
                } catch(e) {
                    console.error('error saving file:', e);
                }
            } catch(e) {
                console.error('error preparing module:', e);
            }
        } else {
            console.error('schema', id, 'failed to compile to a function');
            console.error(validate);
        }
    } catch (err) {
        console.error('schema', id, 'is invalid');
        console.error('error:', err.message);
    }
}

var success = true;
for (var i = 0; i < schemaIds.length; i++) {
    var id = schemaIds[i];
    success = compileSchema(id);
    if(!success) {
        break;
    }
}

return success;