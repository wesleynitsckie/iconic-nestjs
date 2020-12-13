import { Injectable, HttpService } from '@nestjs/common';
import { Console, Command, createSpinner } from 'nestjs-console';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { promises as fsPromises } from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Console() 
export class VideoService {

    constructor(
        private httpService: HttpService,
        private configService: ConfigService
        ) {}

    @Command({
        command: 'videos <numProducts>',
        description: 'Download and decorate video links to products based on the number given'
    })

    /**
     * Main entry point for the console 
     *
     * @param   {number}         numProducts  The number of products to work with
     *
     * @return  {Promise<void>}              
     */
    async runProducts(numProducts: number): Promise<void> {
        try{
            const spin = createSpinner();
            spin.start(`[x] Pulling a list of ${numProducts} products `);
            //const files = await new Promise((done) => setTimeout(() => done(['fileA', 'fileB']), 1000));
            // Get the Vidoe Data from afar
            const products = await this.getProducts(numProducts);
            spin.succeed("[x] Got some product...")
            
            const processedProducts = await this.processProducts(products)
            spin.succeed("[x] Processing completed...")

            await this.writeOutput(processedProducts);
            spin.succeed("[x] Writing to output file...")

            spin.succeed(`[x] ${numProducts} Products done!`);
        }catch(error){
            console.log(error)
        }
    }

    /**
     * Get the list of products
     * 
     * Hard coded the other parameters for now
     *
     * @param   {number}           numProducts  Number of products to pull
     *
     * @return  {Promise<object>}               The products response
     */
    async getProducts(numProducts: number): Promise<object> {
        const productResponse =  await this.call(`catalog/products?gender=female&page=1&page_size=${numProducts}&sort=popularity`);
        return productResponse;
    }

    /**
     * Get the Video link from the API
     *
     * @param   {string}          sku  The product ID
     *
     * @return  {Promise<string}       return the video link
     */
    async getVideoLink(sku: string): Promise<string|boolean> {
        const videoData = await this.call(`catalog/products/${sku}/videos`);
        if(videoData['_embedded']['videos_url'].length > 0){
            return videoData['_embedded']['videos_url'][0]['url']
        }else{
            return false;
        }
    }

    /**
     * Stand method to do API calls
     *
     * @param   {string}          url  The url which we want to get some data from 
     *
     * @return  {Promise<string}       return the data
     */
    async call(url: string): Promise<any>{
        try{
            const response = await this.httpService
                .get(this.configService.get<string>('ICONIC_OPENAPI') + url)
                .toPromise();
            return response.data;
        }catch(error){
            console.log(error)
        }
        
    }
    
    /**
     * Check if there video_count > 0
     * If so the fetch the video link 
     * Once its return, add it to the video data
     * add this vid to the top of the list
     * @param   {string}          products  The products data
     *
     * @return  {Promise<string}       return the data
     */
    async processProducts(products: object):Promise<any>{
        const listWithVideos = [];
        const listWithoutVideos = [];
        const arr = products["_embedded"]["product"];
        await Promise.all(
            arr.map(async (product: object): Promise<any> => {
                if(product['video_count'] > 0){
                    const link = await this.getVideoLink(product['sku']);
                    if (link == false) return;

                    product['video_link'] = link;
                    listWithVideos.push(product);
                }else{
                    listWithoutVideos.push(product);
                }
            })
        );

        return [...listWithVideos, ...listWithoutVideos];
    }

    /**
     * Write the data to the a file
     */
    async writeOutput(products: []): Promise<void>{
        await fsPromises.writeFile ("out.json", JSON.stringify(products),)
    }
    
}