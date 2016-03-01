// Copyright 2014 Crittercism
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var CRITTERCISM_VERSION = "v2.0.0";

var exec = require("cordova/exec");

// You can add your custom callbacks in the functions below
function success () {}
function fail () {}

var logUnhandledExceptionAsCrash = false;

var	Crittercism = {
    init: function(appID) {
        cordova.exec(success, fail, "CDVCrittercism", "crittercismInit", [appID]);
        return this;
    },
    
    leaveBreadcrumb: function(breadCrumb) {
        cordova.exec(success, fail, "CDVCrittercism", "crittercismLeaveBreadcrumb", [breadCrumb]);
        return this;
    },

    logHandledException: function(exception) {
        cordova.exec(success, fail, "CDVCrittercism", "crittercismLogHandledException", [exception.name, exception.message, exception.stack]);
        return this;
    },

    setUsername: function(username) {
        cordova.exec(success, fail, "CDVCrittercism", "crittercismSetUsername", [username]);
        return this;
    },

    setValueForKey: function(key, value) {
        cordova.exec(success, fail, "CDVCrittercism", "crittercismSetValueForKey", [key, value]);
        return this;
    },

    logNetworkRequest: function(method, url, responseTime, bytesRead, bytesSent, responseCode, error) {
        cordova.exec(success, fail, "CDVCrittercism", "crittercismLogNetworkRequest", [method, url, responseTime, bytesRead, bytesSent, responseCode, error]);
        return this;
    },

    beginTransaction: function(transactionName, transactionValue) {
        var args = [transactionName];
        if (transactionValue) {
            args.push(transactionValue);
        }
        cordova.exec(success, fail, "CDVCrittercism", "crittercismBeginTransaction", args);
        return this;
    },
    endTransaction: function(transactionName) {
        cordova.exec(success, fail, "CDVCrittercism", "crittercismEndTransaction", [transactionName]);
        return this;
    },

    failTransaction: function(transactionName) {
        cordova.exec(success, fail, "CDVCrittercism", "crittercismFailTransaction", [transactionName]);
        return this;
    },

    setTransactionValue: function(transactionName, transactionValue) {
        cordova.exec(success, fail, "CDVCrittercism", "crittercismSetTransactionValue", [transactionName, transactionValue]);
        return this;
    },

    getTransactionValue: function(transactionName, callback) {
        // cordova.exec is asynchronous so executing a callback would be most preferable but
        // should the callback be missing, getTransactionValue will execute synchronously.

        var _cr_transactionValue = null;
        cordova.exec(function (result) {
            _cr_transactionValue = result;
            if (callback && typeof(callback) == "function") {
                try {
                    callback(result);
                } catch (exception) {}
            }
        }, function () {
            // Transaction error!
            console.log("Error getting transaction value for: " + transactionName);
        }, "CDVCrittercism", "crittercismGetTransactionValue", [transactionName]);
    },

    setLogUnhandledExceptionAsCrash: function(value) {
        if ((typeof value) == 'boolean') {
            logUnhandledExceptionAsCrash = value;
        } else {
            console.log("Not a boolean: " + value);
        }
        return this;
    },

    getLogUnhandledExceptionAsCrash: function() {
        return logUnhandledExceptionAsCrash;
    }
};

console.log("Using Crittercism Plugin " + CRITTERCISM_VERSION);

module.exports = Crittercism;

// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)

function printStackTrace(options) {
    options = options || {guess: true};
    var ex = options.e || null, guess = !!options.guess;
    var p = new printStackTrace.implementation(), result = p.run(ex);
    return (guess) ? p.guessAnonymousFunctions(result) : result;
}

printStackTrace.implementation = function() {};

printStackTrace.implementation.prototype = {
    /**
     * @param {Error} [ex] The error to create a stacktrace from (optional)
     * @param {String} [mode] Forced mode (optional, mostly for unit tests)
     */
    run: function(ex, mode) {
        ex = ex || this.createException();
        mode = mode || this.mode(ex);
        if (mode === 'other') {
            return this.other(arguments.callee);
        } else {
            return this[mode](ex);
        }
    },

    createException: function() {
        try {
            this.undef();
        } catch (e) {
            return e;
        }
    },

    /**
     * Mode could differ for different exception, e.g.
     * exceptions in Chrome may or may not have arguments or stack.
     *
     * @return {String} mode of operation for the exception
     */
    mode: function(e) {
        if (e['arguments'] && e.stack) {
            return 'chrome';
        }

        if (e.stack && e.sourceURL) {
            return 'safari';
        }

        if (e.stack && e.number) {
            return 'ie';
        }

        if (e.stack && e.fileName) {
            return 'firefox';
        }

        if (e.message && e['opera#sourceloc']) {
            // e.message.indexOf("Backtrace:") > -1 -> opera9
            // 'opera#sourceloc' in e -> opera9, opera10a
            // !e.stacktrace -> opera9
            if (!e.stacktrace) {
                return 'opera9'; // use e.message
            }
            if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                // e.message may have more stack entries than e.stacktrace
                return 'opera9'; // use e.message
            }
            return 'opera10a'; // use e.stacktrace
        }

        if (e.message && e.stack && e.stacktrace) {
            // e.stacktrace && e.stack -> opera10b
            if (e.stacktrace.indexOf("called from line") < 0) {
                return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
            }
            // e.stacktrace && e.stack -> opera11
            return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
        }

        if (e.stack && !e.fileName) {
            // Chrome 27 does not have e.arguments as earlier versions,
            // but still does not have e.fileName as Firefox
            return 'chrome';
        }

        return 'other';
    },

    /**
     * Given a context, function name, and callback function, overwrite it so that it calls
     * printStackTrace() first with a callback and then runs the rest of the body.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to instrument
     * @param {Function} callback function to call with a stack trace on invocation
     */
    instrumentFunction: function(context, functionName, callback) {
        context = context || window;
        var original = context[functionName];
        context[functionName] = function instrumented() {
            callback.call(this, printStackTrace().slice(4));
            return context[functionName]._instrumented.apply(this, arguments);
        };
        context[functionName]._instrumented = original;
    },

    /**
     * Given a context and function name of a function that has been
     * instrumented, revert the function to it's original (non-instrumented)
     * state.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to de-instrument
     */
    deinstrumentFunction: function(context, functionName) {
        if (context[functionName].constructor === Function &&
            context[functionName]._instrumented &&
            context[functionName]._instrumented.constructor === Function) {
            context[functionName] = context[functionName]._instrumented;
        }
    },

    /**
     * Given an Error object, return a formatted Array based on Chrome's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    chrome: function(e) {
        return (e.stack + '\n')
            .replace(/^[\s\S]+?\s+at\s+/, ' at ') // remove message
            .replace(/^\s+(at eval )?at\s+/gm, '') // remove 'at' and indentation
            .replace(/^([^\(]+?)([\n$])/gm, '{anonymous}() ($1)$2')
            .replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}() ($1)')
            .replace(/^(.+) \((.+)\)$/gm, '$1@$2')
            .split('\n')
            .slice(0, -1);
    },

    /**
     * Given an Error object, return a formatted Array based on Safari's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    safari: function(e) {
        return e.stack.replace(/\[native code\]\n/m, '')
            .replace(/^(?=\w+Error\:).*$\n/m, '')
            .replace(/^@/gm, '{anonymous}()@')
            .split('\n');
    },

    /**
     * Given an Error object, return a formatted Array based on IE's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    ie: function(e) {
        return e.stack
            .replace(/^\s*at\s+(.*)$/gm, '$1')
            .replace(/^Anonymous function\s+/gm, '{anonymous}() ')
            .replace(/^(.+)\s+\((.+)\)$/gm, '$1@$2')
            .split('\n')
            .slice(1);
    },

    /**
     * Given an Error object, return a formatted Array based on Firefox's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    firefox: function(e) {
        return e.stack.replace(/(?:\n@:0)?\s+$/m, '')
            .replace(/^(?:\((\S*)\))?@/gm, '{anonymous}($1)@')
            .split('\n');
    },

    opera11: function(e) {
        var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var location = match[4] + ':' + match[1] + ':' + match[2];
                var fnName = match[3] || "global code";
                fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    opera10b: function(e) {
        // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
        // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
        // "@file://localhost/G:/js/test/functional/testcase1.html:15"
        var lineRE = /^(.*)@(.+):(\d+)$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i++) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[1] ? (match[1] + '()') : "global code";
                result.push(fnName + '@' + match[2] + ':' + match[3]);
            }
        }

        return result;
    },

    /**
     * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    opera10a: function(e) {
        // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[3] || ANON;
                result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Opera 7.x-9.2x only!
    opera9: function(e) {
        // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        var lines = e.message.split('\n'), result = [];

        for (var i = 2, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Safari 5-, IE 9-, and others
    other: function(curr) {
        var ANON = '{anonymous}', fnRE = /function(?:\s+([\w$]+))?\s*\(/, stack = [], fn, args, maxStackSize = 10;
        var slice = Array.prototype.slice;
        while (curr && stack.length < maxStackSize) {
            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
            try {
                args = slice.call(curr['arguments'] || []);
            } catch (e) {
                args = ['Cannot access arguments: ' + e];
            }
            stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
            try {
                curr = curr.caller;
            } catch (e) {
                stack[stack.length] = 'Cannot access caller: ' + e;
                break;
            }
        }
        return stack;
    },

    /**
     * Given arguments array as a String, substituting type names for non-string types.
     *
     * @param {Arguments,Array} args
     * @return {String} stringified arguments
     */
    stringifyArguments: function(args) {
        var result = [];
        var slice = Array.prototype.slice;
        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            if (arg === undefined) {
                result[i] = 'undefined';
            } else if (arg === null) {
                result[i] = 'null';
            } else if (arg.constructor) {
                // TODO constructor comparison does not work for iframes
                if (arg.constructor === Array) {
                    if (arg.length < 3) {
                        result[i] = '[' + this.stringifyArguments(arg) + ']';
                    } else {
                        result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                    }
                } else if (arg.constructor === Object) {
                    result[i] = '#object';
                } else if (arg.constructor === Function) {
                    result[i] = '#function';
                } else if (arg.constructor === String) {
                    result[i] = '"' + arg + '"';
                } else if (arg.constructor === Number) {
                    result[i] = arg;
                } else {
                    result[i] = '?';
                }
            }
        }
        return result.join(',');
    },

    sourceCache: {},

    /**
     * @return {String} the text from a given URL
     */
    ajax: function(url) {
        var req = this.createXMLHTTPObject();
        if (req) {
            try {
                req.open('GET', url, false);
                //req.overrideMimeType('text/plain');
                //req.overrideMimeType('text/javascript');
                req.send(null);
                //return req.status == 200 ? req.responseText : '';
                return req.responseText;
            } catch (e) {
            }
        }
        return '';
    },

    /**
     * Try XHR methods in order and store XHR factory.
     *
     * @return {XMLHttpRequest} XHR function or equivalent
     */
    createXMLHTTPObject: function() {
        var xmlhttp, XMLHttpFactories = [
            function() {
                return new XMLHttpRequest();
            }, function() {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function() {
                return new ActiveXObject('Msxml3.XMLHTTP');
            }, function() {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        ];
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
                // Use memoization to cache the factory
                this.createXMLHTTPObject = XMLHttpFactories[i];
                return xmlhttp;
            } catch (e) {
            }
        }
    },

    /**
     * Given a URL, check if it is in the same domain (so we can get the source
     * via Ajax).
     *
     * @param url {String} source url
     * @return {Boolean} False if we need a cross-domain request
     */
    isSameDomain: function(url) {
        return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
    },

    /**
     * Get source code from given URL if in the same domain.
     *
     * @param url {String} JS source URL
     * @return {Array} Array of source code lines
     */
    getSource: function(url) {
        // TODO reuse source from script tags?
        if (!(url in this.sourceCache)) {
            this.sourceCache[url] = this.ajax(url).split('\n');
        }
        return this.sourceCache[url];
    },

    guessAnonymousFunctions: function(stack) {
        for (var i = 0; i < stack.length; ++i) {
            var reStack = /\{anonymous\}\(.*\)@(.*)/,
                reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
                frame = stack[i], ref = reStack.exec(frame);

            if (ref) {
                var m = reRef.exec(ref[1]);
                if (m) { // If falsey, we did not get any file/line information
                    var file = m[1], lineno = m[2], charno = m[3] || 0;
                    if (file && this.isSameDomain(file) && lineno) {
                        var functionName = this.guessAnonymousFunction(file, lineno, charno);
                        stack[i] = frame.replace('{anonymous}', functionName);
                    }
                }
            }
        }
        return stack;
    },

    guessAnonymousFunction: function(url, lineNo, charNo) {
        var ret;
        try {
            ret = this.findFunctionName(this.getSource(url), lineNo);
        } catch (e) {
            ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
        }
        return ret;
    },

    findFunctionName: function(source, lineNo) {
        // FIXME findFunctionName fails for compressed source
        // (more than one function on the same line)
        // function {name}({args}) m[1]=name m[2]=args
        var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
        // {name} = function ({args}) TODO args capture
        // /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
        var reFunctionExpression = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/;
        // {name} = eval()
        var reFunctionEvaluation = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
        // Walk backwards in the source lines until we find
        // the line which matches one of the patterns above
        var code = "", line, maxLines = Math.min(lineNo, 20), m, commentPos;
        for (var i = 0; i < maxLines; ++i) {
            // lineNo is 1-based, source[] is 0-based
            line = source[lineNo - i - 1];
            commentPos = line.indexOf('//');
            if (commentPos >= 0) {
                line = line.substr(0, commentPos);
            }
            // TODO check other types of comments? Commented code may lead to false positive
            if (line) {
                code = line + code;
                m = reFunctionExpression.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
                m = reFunctionDeclaration.exec(code);
                if (m && m[1]) {
                    //return m[1] + "(" + (m[2] || "") + ")";
                    return m[1];
                }
                m = reFunctionEvaluation.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
            }
        }
        return '(?)';
    }
};
/****** end public domain *****/

var cleanStackTrace = function(stack) {
    var cleanStack = [];
    var regexFilters = [/^crittercismErrorHandler/i, /^printStackTrace/i];
    for (var i = 0, l = stack.length; i < l; i++) {
        var line = stack[i];

        var filter = false;
        // run against regex filters, break if doesnt match
        for (var j = 0, r = regexFilters.length; j < r; j++) {
            if(line.match(regexFilters[j])) {
                filter = true;
                break;
            }
        }

        if(!filter) {
            cleanStack.push(line);
        }
    }

    return cleanStack;
};

window.onerror = function(msg, url, line) {
    var stack = cleanStackTrace(printStackTrace({e:msg, guess: true}));
    stack.shift();
    var stackAsString = stack.join("\r\n");
    if (logUnhandledExceptionAsCrash) {
        cordova.exec(success, fail, 'CDVCrittercism', 'crittercismLogUnhandledException', [msg, stackAsString]);
    } else {
        cordova.exec(success, fail, 'CDVCrittercism', 'crittercismLogHandledException', ["Crash", msg, stackAsString]);
    }
};

// Install service monitoring for XMLHttpRequests
var CR_APM_UTILS=function(){var t={};t.getXMLHttpRequest=function e(){var t,e,r=[function(){return window.XMLHttpRequest},function(){return window.ActiveXObject("Msxml2.XMLHTTP")},function(){return window.ActiveXObject("Msxml3.XMLHTTP")},function(){return window.ActiveXObject("Microsoft.XMLHTTP")}];for(var s=0;s<r.length;s++){try{t=r[s]();e=new t;return t}catch(i){}}console.log("Unknown XMLHttpRequest, Crittercism service monitoring will be disabled");return null};t.dateToISOString=function r(t){function e(t){if(t<10){return"0"+t}return t}return t.getUTCFullYear()+"-"+e(t.getUTCMonth()+1)+"-"+e(t.getUTCDate())+"T"+e(t.getUTCHours())+":"+e(t.getUTCMinutes())+":"+e(t.getUTCSeconds())+"."+(t.getUTCMilliseconds()/1e3).toFixed(3).slice(2,5)+"Z"};t.getByteSize=function s(t){if(!t){return 0}if(t.byteLength){return t.byteLength}else if(t.size){return t.size}else if(t.length&&typeof t==="string"){return t.length}else{if(window.jQuery){return 0}else{return s(t.toString())}}};return t}();function installAPM(t){var e=CR_APM_UTILS.getXMLHttpRequest();e.prototype._cr_logStatsCallback=t;if(!e){window.console.log("Warning: XMLHttpRequest missing. Crittercism service monitoring will not be installed.");return}if(e.prototype._cr_saved_send){window.console.log("Warning: Crittercism service monitoring is already installed.");return}e.prototype._cr_logLatency=function r(){if(this._cr_stats&&this._cr_stats._currentTime){this._cr_stats.latency=(new Date).getTime()-this._cr_stats._currentTime;delete this._cr_stats._currentTime}};e.prototype._cr_logResponse=function s(){if(this._cr_stats){this._cr_stats.response_code=this.status;this._cr_stats.bytes_in=CR_APM_UTILS.getByteSize(this.response);this._cr_stats.time_stamp=CR_APM_UTILS.dateToISOString(new Date);this._cr_logLatency()}};e.prototype._cr_saved_open=e.prototype.open;e.prototype.open=function i(){if(!this._cr_stats){this._cr_stats={}}this._cr_saved_open.apply(this,arguments);this._cr_stats.HTTP_method=arguments[0];this._cr_stats.URL=arguments[1]};e.prototype._cr_saved_send=e.prototype.send;e.prototype.send=function n(t){if(!this._cr_stats){this._cr_stats={}}this._cr_stats._currentTime=(new Date).getTime();if(!this.onreadystatechange||!this.onreadystatechange._cr_wrapped){this._cr_saved_onreadystatechange=this.onreadystatechange;this.onreadystatechange=function e(){if(this.readyState==2||this.readyState==3){this._cr_logLatency()}if(this.readyState==4){this._cr_logResponse()}if(this._cr_saved_onreadystatechange){this._cr_saved_onreadystatechange.apply(this,arguments)}};this.onreadystatechange._cr_wrapped=true}if(!this.onprogress||!this.onprogress._cr_wrapped){this._cr_saved_onprogress=this.onprogress;this.onprogress=function(){this._cr_logLatency();if(this._cr_saved_onprogress){this._cr_saved_onprogress.apply(this,arguments)}};this.onprogress._cr_wrapped=true}if(!this.onloadend||!this.onloadend._cr_wrapped){this._cr_saved_onloadend=this.onloadend;this.onloadend=function(){this._cr_logResponse();if(this._cr_error){this._cr_stats.error=this._cr_error}this._cr_logLatency();if(this._cr_logStatsCallback){this._cr_logStatsCallback(this._cr_stats)}delete this._cr_error;delete this._cr_stats;if(this._cr_saved_onloadend){this._cr_saved_onloadend.apply(this,arguments)}};this.onloadend._cr_wrapped=true}if(!this.onerror||!this.onerror._cr_wrapped){this._cr_saved_onerror=this.onerror;this.onerror=function(t){this._cr_error=601;if(this._cr_saved_onerror){this._cr_saved_onerror.apply(this,arguments)}};this.onerror._cr_wrapped=true}if(!this.onabort||!this.onabort._cr_wrapped){this._cr_saved_onabort=this.onabort;this.onabort=function(){this._cr_error=602;if(this._cr_saved_onabort){this._cr_saved_onabort.apply(this,arguments)}};this.onabort._cr_wrapped=true}if(!this.ontimeout||!this.ontimeout._cr_wrapped){this._cr_saved_ontimeout=this.ontimeout;this.ontimeout=function(){this._cr_error=603;if(this._cr_saved_ontimeout){this._cr_saved_ontimeout.apply(this,arguments)}};this.ontimeout._cr_wrapped=true}this._cr_stats.bytes_out=CR_APM_UTILS.getByteSize(t);this._cr_saved_send.apply(this,arguments)}}

// Install service monitoring callback
installAPM(function(stats) {
    Crittercism.logNetworkRequest(stats.HTTP_method, stats.URL, stats.latency, stats.bytes_in, stats.bytes_out, stats.response_code, stats.error);
});
