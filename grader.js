#!/usr/bin/env node

var fs=require('fs');
var program=require('commander');
var cheerio=require('cheerio');
var sys=require('util');
var rest=require('restler');
var HTMLFILE_DEFAULT="index.html";
var CHECKSFILE_DEFAULT="checks.json";

var assertFileExists = function(infile) {
    var instr=infile.toString();
    if (!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);

    }	
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks=function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var buildfn = function(urlfilename) {
    console.log("buildfn");
    var response2file = function (result, response)  {
	if (result instanceof Error) {
	    sys.puts("Error");
	} else {
	    fs.writeFileSync(urlfilename, result);
	}
    }
    return response2file;
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
	var present=$(checks[ii]).length>0;
        out[checks[ii]] = present;
    }
    return out;	
};

var clone = function(fn) {
    return fn.bind({});
};

if (require.main == module) {
    program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url_input>', 'Url', "")
    .parse(process.argv);
    
    var urlfilename="";

    if (program.url.length>0) {
	var apiurl= program.url;
	urlfilename="url.html";
	var response2file = buildfn(urlfilename);
	rest.get(apiurl).on('complete', response2file);
    }	

	
    var filename;
    if (urlfilename.length>0) {
	filename=urlfilename;
    } else {
	filename=program.file;
    }
    
    console.log("Filename "+urlfilename);
    var checkJson = checkHtmlFile(filename, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);

} else {
    exports.checkHtmlFile = checkHtmlFile;
}    

