//
//  VoiceSynthClient.h
//  voicesynth
//
//  Created by Samuel Hsiung on 6/24/14.
//  Copyright (c) 2014 thesixtyone, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>


@interface VoiceSynthClient : NSObject {
    
}

@property (nonatomic, retain) NSString *languageString;
@property (nonatomic, retain) NSString *textString;

- (void)speakUtterance:(NSString*)languageString text:(NSString*)textString;

@end
