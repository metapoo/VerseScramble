//
//  VoiceSynthClient.m
//  voicesynth
//
//  Created by Samuel Hsiung on 6/24/14.
//  Copyright (c) 2014 thesixtyone, Inc. All rights reserved.
//

#import "VoiceSynthClient.h"
#import <AVFoundation/AVFoundation.h>


#define SYSTEM_VERSION_EQUAL_TO(v)                  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedSame)
#define SYSTEM_VERSION_GREATER_THAN(v)              ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedDescending)
#define SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(v)  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedAscending)
#define SYSTEM_VERSION_LESS_THAN(v)                 ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedAscending)
#define SYSTEM_VERSION_LESS_THAN_OR_EQUAL_TO(v)     ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedDescending)

static AVSpeechSynthesizer *synthesizer = nil;

@implementation VoiceSynthClient

@end

// Converts C style string to NSString
NSString* CreateNSString (const char* string)
{
	if (string)
		return [NSString stringWithUTF8String: string];
	else
		return [NSString stringWithUTF8String: ""];
}

// Helper method to create C string copy
char* MakeStringCopy (const char* string)
{
	if (string == NULL)
		return NULL;
	
	char* res = (char*)malloc(strlen(string) + 1);
	strcpy(res, string);
	return res;
}

// When native code plugin is implemented in .mm / .cpp file, then functions
// should be surrounded with extern "C" block to conform C function naming rules
extern "C" {
	void _SpeakUtterance (const char* text, const char* language)
	{
        if (SYSTEM_VERSION_LESS_THAN(@"6.0")) {
            return;
        }
        
        NSString *languageString = CreateNSString(language);
        if (synthesizer == nil) {
            synthesizer = [[AVSpeechSynthesizer alloc] init];
//            [NSThread sleepForTimeInterval:2.0f];
        }
        
        
        NSArray *speechVoices = [AVSpeechSynthesisVoice speechVoices];
        AVSpeechSynthesisVoice* voice = [AVSpeechSynthesisVoice voiceWithLanguage:languageString];
        
        if (![speechVoices containsObject:voice]) {
            NSLog(@"speech voice not found for: %@", languageString);
            // don't play speech if language not available
            return;
        }
        AVSpeechUtterance *utterance = [AVSpeechUtterance speechUtteranceWithString:CreateNSString(text)];

        utterance.voice = voice;
        
        float rate = 0.2f;
        
        if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0) {
            rate = 0.12f;
        }
        
        [utterance setRate:rate];
        
        [synthesizer speakUtterance:utterance];
        
	}
}
