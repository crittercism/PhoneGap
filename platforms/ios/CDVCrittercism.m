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

@implementation CDVCrittercism

- (void)pluginInitialize
{
  NSString *CritterAppID = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CritterAppID"];
  NSLog(@"Initializing Crittercism for application with app id %@", CritterAppID);
  [Crittercism enableWithAppID:CritterAppID];
}

- (void) crittercismLeaveBreadcrumb:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* breadcrumb = [command.arguments objectAtIndex:0];
    [Crittercism leaveBreadcrumb:breadcrumb];
  }];
}

- (void) crittercismLogHandledException:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* name = [command.arguments objectAtIndex:0];
    NSString* message = [command.arguments objectAtIndex:1];
    NSString* stack = [command.arguments objectAtIndex:2];
    stack = [self deleteStackFillerInformation:stack];

    const char *cName= [name UTF8String];
    const char *cMessage= [message UTF8String];
    const char *cStack= [stack UTF8String];

    Crittercism_LogHandledException(cName, cMessage, cStack, 2);
  }];
}

- (void) crittercismLogUnhandledException:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* message = [command.arguments objectAtIndex:0];
    NSString* stack = [command.arguments objectAtIndex:1];
    stack = [self deleteStackFillerInformation:stack];

    const char *cName = "Error";
    const char *cMessage= [message UTF8String];
    const char *cStack= [stack UTF8String];

    Crittercism_LogUnhandledException(cName, cMessage, cStack, 2);
  }];
}

- (void) crittercismSetUsername:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* username = [command.arguments objectAtIndex:0];
    [Crittercism setUsername:username];
  }];
}

- (void) crittercismSetValueForKey:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* value = [command.arguments objectAtIndex:0];
    NSString* key = [command.arguments objectAtIndex:1];
    [Crittercism setValue:value
                   forKey:key];
  }];
}

- (NSString*) deleteStackFillerInformation:(NSString *) stack {
  // Ghetto way of parsing but I don't know how to get the crash identifier
  NSString* prefix = @"file:///";
  NSString* appName = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleDisplayName"];

  int start;
  int end;
  Boolean startFound = false;
  Boolean endFound = false;
  NSString* fillerInformation;

  // Look through the stack for the fillInformation String
  for (int i = 0; i < [stack length] && !(startFound && endFound); i++) {
    int match = 0;
    if(!startFound) {
      while ([stack characterAtIndex:i] == [prefix characterAtIndex:match]) {
        match++;
        i++;

        if (match == prefix.length) {
          start = i - match;
          startFound = true;
          break;
        }
      }
    } else if(!endFound){
      while ([stack characterAtIndex:i] == [appName characterAtIndex:match]) {
        match++;
        i++;
        if (match == appName.length) {
          end = i - match - appName.length;
          endFound = true;
          break;
        }
      }
    }
  }

  fillerInformation = [stack substringWithRange:NSMakeRange(start, end)];
  stack = [stack stringByReplacingOccurrencesOfString:fillerInformation
                                                         withString:@""];

  return stack;
}

@end
