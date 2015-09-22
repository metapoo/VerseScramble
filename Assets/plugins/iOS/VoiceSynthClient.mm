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

static AVSpeechSynthesizer *_synthesizer = nil;
static NSMutableArray *_queue = nil;

@implementation VoiceSynthClient

- (void)speakUtterance:(NSString*)languageString text:(NSString*)textString {
    self.languageString = languageString;
    self.textString = textString;
    [self speakUtterance];
}

- (void)speakUtterance {
    @synchronized(_queue) {
        if (_queue == nil) {
            _queue = [[NSMutableArray alloc] initWithCapacity:10];
        }
        
        [_queue addObject:self];
        
        if ([_queue objectAtIndex:0] != self) {
            [self performSelector:@selector(speakUtterance) withObject:nil afterDelay:0.1f];
            return;
        }
        
    }

    if ([NSThread isMainThread]) {
        [self performSelectorInBackground:@selector(speakUtterance) withObject:nil];
        return;
    }
    
    @synchronized(_synthesizer) {
        if (_synthesizer == nil) {
            _synthesizer = [[AVSpeechSynthesizer alloc] init];
        }
    
    
        NSArray *speechVoices = [AVSpeechSynthesisVoice speechVoices];
        AVSpeechSynthesisVoice* voice = [AVSpeechSynthesisVoice voiceWithLanguage:_languageString];
    
        if (![speechVoices containsObject:voice]) {
            NSLog(@"speech voice not found for: %@", _languageString);
            // don't play speech if language not available
            return;
        }

        AVSpeechUtterance *utterance = [AVSpeechUtterance speechUtteranceWithString:_textString];
    
        utterance.voice = voice;
    
        float rate = 0.2f;
    
        float version = [[[UIDevice currentDevice] systemVersion] floatValue];
        
        if (version >= 9.0) {
            rate = 0.5f;
        } else if (version >= 8.0) {
            rate = 0.12f;
        }
    
        [utterance setRate:rate];
    
        [_synthesizer speakUtterance:utterance];

        //NSLog(@"synthesizer speakUtterance: %@", utterance);
    }
    
    @synchronized(_queue) {
        [_queue removeObject:self];
    }

}

- (void)dealloc {
    self.languageString = nil;
    self.textString = nil;
}
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
        NSString *textString = CreateNSString(text);
        VoiceSynthClient *client = [[VoiceSynthClient alloc] init];
        [client speakUtterance:languageString text:textString];
        
        
	}
}
