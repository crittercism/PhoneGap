//
//  CDVCrittercism.m
//  Crittercism PhoneGap
//
//  Created by Crittercism on 7/6/14.
//  Copyright (c) 2014 Crittercism. All rights reserved.

#import "CDVCrittercism.h"
#import "Crittercism.h"

void Crittercism_LogHandledException(const char* name,
                                     const char* reason,
                                     const char *stack,
                                     int platformId);

void Crittercism_LogUnhandledException(const char* name,
                                       const char* reason,
                                       const char *stack,
                                       int platformId);

static NSString *const CRJavascriptXMLHttpRequest = @"JavascriptXMLHttpRequest";

@implementation CDVCrittercism

- (void)pluginInitialize
{
  NSString *CritterAppID = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CritterAppID"];
  NSLog(@"Initializing Crittercism for application with app id %@", CritterAppID);
  [Crittercism enableWithAppID:CritterAppID];
}

- (void) crittercismLeaveBreadcrumb:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* breadcrumb = command.arguments[0];
    [Crittercism leaveBreadcrumb:breadcrumb];
  }];
}

- (void) crittercismLogHandledException:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* name = command.arguments[0];
    NSString* message = command.arguments[1];
    NSString* stack = command.arguments[2];
    stack = [self deleteStackFillerInformation:stack];

    const char *cName= [name UTF8String];
    const char *cMessage= [message UTF8String];
    const char *cStack= [stack UTF8String];

    Crittercism_LogHandledException(cName, cMessage, cStack, 2);
  }];
}

- (void) crittercismLogUnhandledException:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* message = command.arguments[0];
    NSString* stack = command.arguments[1];
    stack = [self deleteStackFillerInformation:stack];

    const char *cName = "Error";
    const char *cMessage= [message UTF8String];
    const char *cStack= [stack UTF8String];

    Crittercism_LogUnhandledException(cName, cMessage, cStack, 2);
  }];
}

- (void) crittercismSetUsername:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* username = command.arguments[0];
    [Crittercism setUsername:username];
  }];
}

- (void) crittercismSetValueForKey:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* key = command.arguments[0];
    NSString* value = command.arguments[1];
    [Crittercism setValue:value
                   forKey:key];
  }];
}

- (void) crittercismLogNetworkRequest:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* method = command.arguments[0];
    NSURL* url = [NSURL URLWithString:command.arguments[1]];
    NSUInteger latencyMillis = [command.arguments[2] unsignedLongValue];
    NSTimeInterval latency = latencyMillis / 1000.0;
    NSUInteger bytesRead = [command.arguments[3] unsignedIntegerValue];
    NSUInteger bytesSent = [command.arguments[4] unsignedIntegerValue];
    NSInteger responseCode = [command.arguments[5] integerValue];
    NSError *error;

	@try {
        NSInteger errorInt = [command.arguments[6] integerValue];
        error = [[NSError alloc] initWithDomain:CRJavascriptXMLHttpRequest
                                               code:errorInt
                                           userInfo:nil];
	} @catch (NSException *exception) {
        error = nil;
	}

    [Crittercism logNetworkRequest:method
                               url:url
                           latency:latency
                         bytesRead:bytesRead
                         bytesSent:bytesSent
                      responseCode:responseCode
                             error:error];
  }];
}

- (void) crittercismBeginTransaction:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate runInBackground:^{
        NSString* transaction = command.arguments[0];
        if ([command.arguments count] >= 2) {
          NSInteger transactionValue = [command.arguments[1] integerValue];
          [Crittercism beginTransaction:transaction
                                withValue:(int)transactionValue];
        } else {
          [Crittercism beginTransaction:transaction];
        }
    }];
}

- (void) crittercismEndTransaction:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate runInBackground:^{
        NSString* transaction = command.arguments[0];
        [Crittercism endTransaction:transaction];
    }];
}

- (void) crittercismFailTransaction:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate runInBackground:^{
        NSString* transaction = command.arguments[0];
        [Crittercism failTransaction:transaction];
    }];
}

- (void) crittercismSetTransactionValue:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate runInBackground:^{
        NSString* transaction = command.arguments[0];
        NSInteger transactionValue = [command.arguments[1] integerValue];
        [Crittercism setValue:(int)transactionValue
               forTransaction:transaction];
    }];
}

- (void) crittercismGetTransactionValue:(CDVInvokedUrlCommand *)command {
        // Executing task in foreground so that call is faster given the user expects a synchronous response
        CDVPluginResult* pluginResult = nil;
        NSString* transaction = command.arguments[0];
        NSInteger transactionValue = [Crittercism valueForTransaction:transaction];
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                            messageAsInt:(int)transactionValue];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

// Examples below
//
// FunctionC@file:///Users/tshi/Library/Application%20Support/iPhone%20Simulator/6.1/Applications/29A502DF-F664-434A-94C6-12AAA20BCF33/HelloWorld.app/www/js/app.js:30
// -> FunctionC@HelloWorld.app/www/js/app.js:30
//
// {anonymous}("Error: Error!","file:///Users/tshi/Library/Application%20Support/iPhone%20Simulator/6.1/Applications/29A502DF-F664-434A-94C6-12AAA20BCF33/HelloWorld.app/www/js/app.js",22)
// -> {anonymous}("Error: Error!","js/app.js",22)

- (NSString*) deleteStackFillerInformation:(NSString *) stack {
  NSString* appName = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleDisplayName"];
  NSString* pattern = [NSString stringWithFormat:@"file:\/\/.*(?=%@)", appName];
  NSError* error = NULL;
  NSRegularExpression* regex = [NSRegularExpression regularExpressionWithPattern:pattern
                                                                         options:NSRegularExpressionCaseInsensitive
                                                                           error:&error];
  return [regex stringByReplacingMatchesInString:stack options:0 range:NSMakeRange(0, [stack length]) withTemplate:@""];
}

@end
