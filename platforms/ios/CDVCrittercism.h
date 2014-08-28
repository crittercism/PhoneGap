//
//  CDVCrittercism.h
//  Crittercism PhoneGap
//
//  Created by Crittercism on 7/6/14.
//  Copyright (c) 2014 Crittercism. All rights reserved.

#import <Foundation/Foundation.h>
#import "Crittercism.h"
#import <Cordova/CDV.h>

@interface CDVCrittercism : CDVPlugin

- (void) crittercismInit:(CDVInvokedUrlCommand *)command;

- (void) crittercismLeaveBreadcrumb:(CDVInvokedUrlCommand *)command;

- (void) crittercismLogHandledException:(CDVInvokedUrlCommand *)command;

- (void) crittercismLogUnhandledException:(CDVInvokedUrlCommand *)command;

- (void) crittercismSetUsername:(CDVInvokedUrlCommand *)command;

- (void) crittercismSetValueForKey:(CDVInvokedUrlCommand *)command;

@end
