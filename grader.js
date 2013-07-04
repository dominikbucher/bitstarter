#!/usr/bin/env node
/*jshint smarttabs:true */
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://www.nowhere.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrl = function(url) {
    return url.toString();
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtml = function(html) {
    return cheerio.load(html);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(html, checksfile) {
    $ = html;
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

if(require.main == module) {
    program
	.option('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
	.option('-f, --file ', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
	.option('-u, --url <u>', 'Path to index.html via an URL', assertUrl, URL_DEFAULT)
	.parse(process.argv);
    var checkJson;
    console.log(program.checks);
    console.log(program.file);
    console.log(program.url);
    console.log(program.args);
    if (program.url) {
	console.log(program.url);
	restler.get(program.url).on('complete', function(result) {
	    checkJson = checkHtmlFile(cheerioHtml(result.toString()), program.checks);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	});
    } else {
	var checkJson = checkHtmlFile(cheerioHtmlFile(program.file), program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
