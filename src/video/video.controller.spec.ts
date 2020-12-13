import { ConsoleModule } from 'nestjs-console';
import { HttpModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VideoModule } from './video.module';
import { Test } from '@nestjs/testing';
import { VideoService } from './video.service';

describe('VideoService', () => {
    let videoService: VideoService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports:[
                ConfigModule.forRoot(),
                ConfigModule,
                HttpModule,
                ConsoleModule
            ],
            providers: [
                VideoService
            ],
            }).compile();
    
        videoService = moduleRef.get<VideoService>(VideoService);


    });

    describe('Test Products', () => {
        it('should return an array of products', async () => {
            const numProducts = 3;
            const res = await videoService.getProducts(numProducts)
            expect(res["_embedded"]["product"].length).toBe(numProducts);
        });

        it('should Get lot of Products and if there is at least 1 that has a video link', async () => {
            const numProducts = 300;
            const products = await videoService.getProducts(numProducts);
            const processedProducts = await videoService.processProducts(products)
            expect(processedProducts[0]).toHaveProperty('video_link');
        });
    });

    
});