/*!
 * express-csv
 * Copyright 2011 Seiya Konno <nulltask@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http')
  , express = require('express')
  , res = express.response || http.ServerResponse.prototype;

/**
 * Import package information.
 */

var package = require('../package');

/**
 * Library version.
 */

exports.version = package.version;

/**
 * CSV separator
 */

exports.separator = ',';

/**
 * Prevent Excel's casting.
 */

exports.preventCast = false;

/**
 * Ignore `null` or `undefined`
 */

exports.ignoreNullOrUndefined = true;

/**
 * Escape CSV field
 *
 * @param {Mixed} field
 * @return {String}
 * @api private
 */

function escape(field) {
  if (exports.ignoreNullOrUndefined && field == undefined) {
    return '';
  }
  if (exports.preventCast) {
    return '="' + String(field).replace(/\"/g, '""') + '"';
  }
  return '"' + String(field).replace(/\"/g, '""') + '"';
}

/**
 * Send CSV response with `data`, optional `headers`, and optional `status`.
 * 
 * @param {Array} data
 * @param {Object|Number} headers or status
 * @param {Number} status
 * @return {ServerResponse}
 * @api public
 */

res.csv = function(data, csvHeaders, headers, status) {
  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'text/csv');

  var body = Object.values(csvHeaders).map(x => x.name).join(",") + '\r\n';

  data.forEach(function(item) {
    let array = []
    Object.keys(csvHeaders).forEach( function(prop) {
      array.push(item.hasOwnProperty(prop) ? (csvHeaders[prop].func ? csvHeaders[prop].func(item[prop]) : item[prop]) : '');
    })
    body += array.map(escape).join(exports.separator) + '\r\n';
  });

  if (this.charset !== 'utf-8') {
    body = iconv.encode(body, this.charset);
  }

  return this.send(body, headers, status);
};

