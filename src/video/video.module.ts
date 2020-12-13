import { Module, HttpModule } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { ConfigModule } from '@nestjs/config';
import { VideoService } from './video.service';
 
@Module({
    imports: [
        ConfigModule.forRoot(),
        ConfigModule,
        HttpModule,
        ConsoleModule // import the ConsoleModule
    ],
    providers: [VideoService],
    exports: [VideoService]
})
export class VideoModule {}