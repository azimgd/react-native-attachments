
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNAttachmentsSpec.h"

@interface Attachments : NSObject <NativeAttachmentsSpec>
#else
#import <React/RCTBridgeModule.h>

@interface Attachments : NSObject <RCTBridgeModule>
#endif

@end
