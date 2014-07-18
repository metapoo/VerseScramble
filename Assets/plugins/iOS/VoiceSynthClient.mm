//
//  VoiceSynthClient.m
//  voicesynth
//
//  Created by Samuel Hsiung on 6/24/14.
//  Copyright (c) 2014 thesixtyone, Inc. All rights reserved.
//

#import "VoiceSynthClient.h"
#import <AVFoundation/AVFoundation.h>

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
        NSString *languageString = CreateNSString(language);
        AVSpeechSynthesizer *synthesizer = [[AVSpeechSynthesizer alloc] init];
        
        AVSpeechUtterance *utterance = [AVSpeechUtterance speechUtteranceWithString:CreateNSString(text)];

        utterance.voice = [AVSpeechSynthesisVoice voiceWithLanguage:languageString];
        [utterance setRate:0.2f];
        [synthesizer speakUtterance:utterance];
        [synthesizer release];
	}
}
