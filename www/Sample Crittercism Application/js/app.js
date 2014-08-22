/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

 var error1 = function ThrowNewError() {
   return function FunctionB() {
     return function FunctionC() {
       throw new Error( "Error!" );
     }
   }
 }

 var error2 = function NonsenseText() {
   return function FunctionB() {
     return function FunctionC() {
       abc123       // ridiculous nonsense that causes a crash
     }
   }
 }

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        $('#crashButton').click(function() {
            error1()()();       // ridiculous nonsense that causes a crash
        });

        $('#breadcrumb_submit').click(function() {
            var bcText = 'breadcrumb';
            Crittercism.leaveBreadcrumb(bcText);
        });

        $('#set_username').click(function() {
            Crittercism.setUsername('MommaCritter');
        });

        $('#set_metadata').click(function() {
            Crittercism.setValueForKey('GameLevel', '5');
        });

        $('#handled_exception').click(function() {
            try {
              error2()()();
            } catch(e) {
                Crittercism.logHandledException(e);
            }
        });
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
