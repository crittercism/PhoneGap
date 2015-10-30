//  Copyright 2014 Crittercism
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

#import <Foundation/Foundation.h>
#import "Crittercism.h"
#import <Cordova/CDV.h>

@interface CDVCrittercism : CDVPlugin

- (void) crittercismLeaveBreadcrumb:(CDVInvokedUrlCommand *)command;

- (void) crittercismLogHandledException:(CDVInvokedUrlCommand *)command;

- (void) crittercismLogUnhandledException:(CDVInvokedUrlCommand *)command;

- (void) crittercismSetUsername:(CDVInvokedUrlCommand *)command;

- (void) crittercismSetValueForKey:(CDVInvokedUrlCommand *)command;

- (void) crittercismLogNetworkRequest:(CDVInvokedUrlCommand *)command;

- (void) crittercismBeginTransaction:(CDVInvokedUrlCommand *)command;

- (void) crittercismEndTransaction:(CDVInvokedUrlCommand *)command;

- (void) crittercismFailTransaction:(CDVInvokedUrlCommand *)command;

- (void) crittercismSetTransactionValue:(CDVInvokedUrlCommand *)command;

- (void) crittercismGetTransactionValue:(CDVInvokedUrlCommand *)command;

@end
