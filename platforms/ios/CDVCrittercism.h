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
