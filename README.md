# Crittercism Cordova plugin v2.0.0

The Cordova Crittercism Plugin is compatible with cordova-3.3.0 and above and requires jquery. For more detailed information, please visit http://docs.crittercism.com/development_platforms/phonegap.html.

## Creating a Cordova project for iOS

Install PhoneGap

```
sudo npm install -g phonegap
```

Install the Cordova module using npm utility of node.js

```
sudo npm install -g cordova
```

Create the app

```
cordova create hello com.example.hello HelloWorld
```

Go into the directory

```
cd hello
```

Add platforms

```
cordova platform add ios
cordova platform add android
```

## Installation

Run the following code in your project:

```
// For iOS only
cordova -d plugin add https://github.com/crittercism/PhoneGap.git --variable IOS_APP_ID="Your Application ID"

// For Android only
cordova -d plugin add https://github.com/crittercism/PhoneGap.git --variable ANDROID_APP_ID="Your Application ID"

// For Android and iOS
cordova -d plugin add https://github.com/crittercism/PhoneGap.git --variable ANDROID_APP_ID="Your Application ID" --variable IOS_APP_ID="Your Application ID"

```

Example:

```
cordova -d plugin add https://github.com/crittercism/PhoneGap.git --variable APP_ID="53e41562b573f14d68000142"

```

## Building the app

```
cordova build // Build for all platforms added
cordova build ios // Build for ios platform added
```

## Usage

After installing the plugin via Cordova CLI and building your project, you're all set!

## Service monitoring

Whenever an app makes a network call, Crittercism monitors and captures certain information. For the PhoneGap plugin, Crittercism monitors network requests for both native iOS/Android as well as for JavaScript.

For JavaScript, Crittercism currently monitors XMLHttpRequests and jQuery Ajax calls and logs the following details for each request:

- HTTP method
- URL
- Bytes in
- Bytes out
- Latency
- Response code
- Time stamp

Current Limitations

- jQuery $.getScript requests and requests with datatype 'jsonp' are not monitored
- Synchronous XMLHttpRequests and jQuery ajax calls are missing latency information
- Information on payload size is not currently collected when sending and receiving FormData and Document data types

## Using the API

API calls avaliable currently include:
- leaveBreadcrumb("Breadcrumb string") // Log step for help in debugging
- setUserName("Username") // Create a username to look up the user
- setValueForKey("Value", "Key") // Persist data
- logHandledException(Error)

Use the API by calling Crittercism, ex:

```
Crittercism.leaveBreadcrumb("I am a breadcrumb");
```

## Sample application

You can find a sample application at https://github.com/crittercism/PhoneGapExampleApp. To use it, delete the the files in your own www/ folder, copy and paste the css, img, js, and index.html over, and then rebuild your project.
