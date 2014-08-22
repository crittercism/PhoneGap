var Crittercism;

function s () {};
function f () {};

if (!window.cordova) {
	// cordova.exec should only be called after "onDeviceReady"

	Crittercism = {
		leaveBreadcrumb: function(breadCrumb) {
				//cordova.exec(s, f, "CDVCrittercism", "crittercismLeaveBreadcrumb", [breadCrumb]);
		},

		logHandledException: function(exception) {
				//cordova.exec(s, f, "CDVCrittercism", "crittercismLogHandledException", [exception]);
		},

		setUsername: function(username) {
				//cordova.exec(s, f, "CDVCrittercism", "crittercismSetUsername", [username]);
		},

		setValueForKey: function(value, key) {
				//cordova.exec(s, f, "CDVCrittercism", "crittercismSetValueForKey", [value, key]);
		}
	};

} else {

	var exec = require("cordova/exec");

	var Crittercism = {
		leaveBreadcrumb: function(breadCrumb) {
			cordova.exec(s, f, "CDVCrittercism", "crittercismLeaveBreadcrumb", [breadCrumb]);
			return this;
		},

		logHandledException: function(exception) {
			cordova.exec(s, f, "CDVCrittercism", "crittercismLogHandledException", [exception.name, exception.message, exception.stack]);
			return this;
		},

		setUsername: function(username) {
			cordova.exec(s, f, "CDVCrittercism", "crittercismSetUsername", [username]);
			return this;
		},

		setValueForKey: function(value, key) {
			cordova.exec(s, f, "CDVCrittercism", "crittercismSetValueForKey", [value, key]);
			return this;
		}
	};

	module.exports = Crittercism;

}

// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)
/**
* Main function giving a function stack trace with a forced or passed in Error
*
* @cfg {Error} e The error to create a stacktrace from (optional)
* @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
* @return {Array} of Strings with functions, lines, files, and arguments where possible
*/
function printStackTrace(options) {
	options = options || {guess: true};
	var ex = options.e || null, guess = !!options.guess;
	var p = new printStackTrace.implementation(), result = p.run(ex);
	return (guess) ? p.guessAnonymousFunctions(result) : result;
}
printStackTrace.implementation=function(){};printStackTrace.implementation.prototype={run:function(ex,mode){ex=ex||this.createException();mode=mode||this.mode(ex);if(mode==='other'){return this.other(arguments.callee);}else{return this[mode](ex);}},createException:function(){try{this.undef();}catch(e){return e;}},mode:function(e){if(e['arguments']&&e.stack){return'chrome';}else if(typeof e.message==='string'&&typeof window!=='undefined'&&window.opera){if(!e.stacktrace){return'opera9';}if(e.message.indexOf('\n')>-1&&e.message.split('\n').length>e.stacktrace.split('\n').length){return'opera9';}if(!e.stack){return'opera10a';}if(e.stacktrace.indexOf("called from line")<0){return'opera10b';}return'opera11';}else if(e.stack){return'firefox';}return'other';},instrumentFunction:function(context,functionName,callback){context=context||window;var original=context[functionName];context[functionName]=function instrumented(){callback.call(this,printStackTrace().slice(4));return context[functionName]._instrumented.apply(this,arguments);};context[functionName]._instrumented=original;},deinstrumentFunction:function(context,functionName){if(context[functionName].constructor===Function&&context[functionName]._instrumented&&context[functionName]._instrumented.constructor===Function){context[functionName]=context[functionName]._instrumented;}},chrome:function(e){var stack=(e.stack+'\n').replace(/^\S[^\(]+?[\n$]/gm,'').replace(/^\s+(at eval )?at\s+/gm,'').replace(/^([^\(]+?)([\n$])/gm,'{anonymous}()@$1$2').replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm,'{anonymous}()@$1').split('\n');stack.pop();return stack;},firefox:function(e){return e.stack.replace(/(?:\n@:0)?\s+$/m,'').replace(/^\(/gm,'{anonymous}(').split('\n');},opera11:function(e){var ANON='{anonymous}',lineRE=/^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;var lines=e.stacktrace.split('\n'),result=[];for(var i=0,len=lines.length;i<len;i+=2){var match=lineRE.exec(lines[i]);if(match){var location=match[4]+':'+match[1]+':'+match[2];var fnName=match[3]||"global code";fnName=fnName.replace(/<anonymous function: (\S+)>/,"$1").replace(/<anonymous function>/,ANON);result.push(fnName+'@'+location+' -- '+lines[i+1].replace(/^\s+/,''));}}return result;},opera10b:function(e){var lineRE=/^(.*)@(.+):(\d+)$/;var lines=e.stacktrace.split('\n'),result=[];for(var i=0,len=lines.length;i<len;i++){var match=lineRE.exec(lines[i]);if(match){var fnName=match[1]?(match[1]+'()'):"global code";result.push(fnName+'@'+match[2]+':'+match[3]);}}return result;},opera10a:function(e){var ANON='{anonymous}',lineRE=/Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;var lines=e.stacktrace.split('\n'),result=[];for(var i=0,len=lines.length;i<len;i+=2){var match=lineRE.exec(lines[i]);if(match){var fnName=match[3]||ANON;result.push(fnName+'()@'+match[2]+':'+match[1]+' -- '+lines[i+1].replace(/^\s+/,''));}}return result;},opera9:function(e){var ANON='{anonymous}',lineRE=/Line (\d+).*script (?:in )?(\S+)/i;var lines=e.message.split('\n'),result=[];for(var i=2,len=lines.length;i<len;i+=2){var match=lineRE.exec(lines[i]);if(match){result.push(ANON+'()@'+match[2]+':'+match[1]+' -- '+lines[i+1].replace(/^\s+/,''));}}return result;},other:function(curr){var ANON='{anonymous}',fnRE=/function\s*([\w\-$]+)?\s*\(/i,stack=[],fn,args,maxStackSize=10;while(curr&&curr['arguments']&&stack.length<maxStackSize){fn=fnRE.test(curr.toString())?RegExp.$1||ANON:ANON;args=Array.prototype.slice.call(curr['arguments']||[]);stack[stack.length]=fn+'('+this.stringifyArguments(args)+')';curr=curr.caller;}return stack;},stringifyArguments:function(args){var result=[];var slice=Array.prototype.slice;for(var i=0;i<args.length;++i){var arg=args[i];if(arg===undefined){result[i]='undefined';}else if(arg===null){result[i]='null';}else if(arg.constructor){if(arg.constructor===Array){if(arg.length<3){result[i]='['+this.stringifyArguments(arg)+']';}else{result[i]='['+this.stringifyArguments(slice.call(arg,0,1))+'...'+this.stringifyArguments(slice.call(arg,-1))+']';}}else if(arg.constructor===Object){result[i]='#object';}else if(arg.constructor===Function){result[i]='#function';}else if(arg.constructor===String){result[i]='"'+arg+'"';}else if(arg.constructor===Number){result[i]=arg;}}}return result.join(',');},sourceCache:{},ajax:function(url){var req=this.createXMLHTTPObject();if(req){try{req.open('GET',url,false);req.send(null);return req.responseText;}catch(e){}}return'';},createXMLHTTPObject:function(){var xmlhttp,XMLHttpFactories=[function(){return new XMLHttpRequest();},function(){return new ActiveXObject('Msxml2.XMLHTTP');},function(){return new ActiveXObject('Msxml3.XMLHTTP');},function(){return new ActiveXObject('Microsoft.XMLHTTP');}];for(var i=0;i<XMLHttpFactories.length;i++){try{xmlhttp=XMLHttpFactories[i]();this.createXMLHTTPObject=XMLHttpFactories[i];return xmlhttp;}catch(e){}}},isSameDomain:function(url){return typeof location!=="undefined"&&url.indexOf(location.hostname)!==-1;},getSource:function(url){if(!(url in this.sourceCache)){this.sourceCache[url]=this.ajax(url).split('\n');}return this.sourceCache[url];},guessAnonymousFunctions:function(stack){for(var i=0;i<stack.length;++i){var reStack=/\{anonymous\}\(.*\)@(.*)/,reRef=/^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,frame=stack[i],ref=reStack.exec(frame);if(ref){var m=reRef.exec(ref[1]);if(m){var file=m[1],lineno=m[2],charno=m[3]||0;if(file&&this.isSameDomain(file)&&lineno){var functionName=this.guessAnonymousFunction(file,lineno,charno);stack[i]=frame.replace('{anonymous}',functionName);}}}}return stack;},guessAnonymousFunction:function(url,lineNo,charNo){var ret;try{ret=this.findFunctionName(this.getSource(url),lineNo);}catch(e){ret='getSource failed with url: '+url+', exception: '+e.toString();}return ret;},findFunctionName:function(source,lineNo){var reFunctionDeclaration=/function\s+([^(]*?)\s*\(([^)]*)\)/;var reFunctionExpression=/['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/;var reFunctionEvaluation=/['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/;var code="",line,maxLines=Math.min(lineNo,20),m,commentPos;for(var i=0;i<maxLines;++i){line=source[lineNo-i-1];commentPos=line.indexOf('//');if(commentPos>=0){line=line.substr(0,commentPos);}if(line){code=line+code;m=reFunctionExpression.exec(code);if(m&&m[1]){return m[1];}m=reFunctionDeclaration.exec(code);if(m&&m[1]){return m[1];}m=reFunctionEvaluation.exec(code);if(m&&m[1]){return m[1];}}}return'(?)';}};
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
}

window.onerror = function(msg, url, line) {
	var stack = cleanStackTrace(printStackTrace({e:msg, guess: true}));
	stack.shift();
	var stackAsString = stack.join("\r\n");

	cordova.exec(s, f, 'CDVCrittercism', 'crittercismLogUnhandledException', [ msg, stackAsString ]);
}
