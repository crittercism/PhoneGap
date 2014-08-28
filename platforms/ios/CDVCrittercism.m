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
  [Crittercism enableWithAppID:CritterAppID];
}

- (void) crittercismInit:(CDVInvokedUrlCommand *)command {
  [self.commandDelegate runInBackground:^{
    NSString* appID = [command.arguments objectAtIndex:0];
    [Crittercism enableWithAppID:appID];
  }];
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
  NSMutableString* mutableStack = [stack mutableCopy];
  NSString* prefix = @"file:///var/mobile/Applications/";
  NSString* sampleCrashIdentifier = @"2C5CAC77-9B97-463E-BF93-DC37452E2E13";
  int prefixLength = prefix.length;
  int sampleCrashIdentifierLength = sampleCrashIdentifier.length;
  int fillerLength = prefixLength + sampleCrashIdentifierLength;

  // Look through the stack backwards for instances of matching prefixes
  for (int i = [mutableStack length] - sampleCrashIdentifierLength - 1; i >= 0; i--) {
    int match = 0;
    while ([mutableStack characterAtIndex:i] == [prefix characterAtIndex:(prefixLength - 1 - match)]) {
      match++;
      i--;
    }

    if (match == prefixLength) {
      [mutableStack deleteCharactersInRange:NSMakeRange(i + 1, fillerLength)];
      i = i - sampleCrashIdentifierLength;
    }
  }

  return [NSString stringWithString:mutableStack];
}

@end
