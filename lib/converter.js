/**
 * converter.js
 * Main lua conversion logic
 *
 * (C) 2013 Ensequence Inc.
 */

// ### Exports
module.exports = (function () {

    var whitespace = 0;

    // ### convert
    // Converts object to lua representation
    //
    // * `obj`: object to converts
    // * `indentation`: spaces to indent
    function convert (obj, indentation, opts) {
        // Setup whitespace
        if (indentation && typeof indentation === 'number') whitespace = indentation, indentation = '';

        let newline = (opts && !opts.oneline) ? "\n" : (opts && opts.spaced ? " " : "")

        // Get type of obj
        var type = typeof obj;

        // Handle type
        if (~['number', 'boolean'].indexOf(type)) {
            return obj;
        } else if (type === 'string') {
            return '"' + escapeString(obj) + '"';
        } else if (type === 'undefined' || obj === null) {
            // Return 'nil' for null || undefined
            return 'nil';
        } else {
            // Object
            // Increase indentation
            if (!(opts && opts.flat)) for (var i = 0, previous = indentation || '', indentation = indentation || ''; i < whitespace; indentation += ' ', i++);

            // Check if array
            if (Array.isArray(obj)) {
                // Convert each item in array, checking for whitespace
                if (whitespace) return '{' + newline + indentation + obj.map(function (prop) { return convert(prop, indentation); }).join(',' + newline + indentation) + newline + previous + '}';
                else return '{' + obj.map(function (prop) { return convert(prop); }).join(',') + '}';
            } else {
                // Build out each property
                let noquotenums = (opts && opts.noquotenums)
                var props = [];
                for (var key in obj) {
                    let quote = (Number.isInteger(key) && noquotenums) ? "" : "\""
                    props.push('[' + quote + key + quote + ']' + (whitespace ? ' = ' + convert(obj[key], indentation) : '=' + convert(obj[key])));
                }

                // Join properties && return
                if (whitespace) { return '{' + newline + indentation + props.join(',' + newline + indentation) + newline + previous + '}'; }
                else return '{' + indentation + props.join(',') + '}';
            }
        }
    }

    // ### escapeString
    // Escape string for serialization to lua object
    //
    // * `str`: string to escape
    function escapeString(str) {
        return str
            .replace(/\n/g,'\\n')
            .replace(/\r/g,'\\r')
            .replace(/"/g,'\\"')
            .replace(/\\\\/g, '\\\\');
    }

    // Expose methods
    return {
        convert: convert
    };
})();