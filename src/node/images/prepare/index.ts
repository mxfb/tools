import sharp from "sharp";
import { exportZipBuffer, ExportZipSources, OutputFormat, prepareExport } from "../exports";
import { Operations, transformImage } from "../transform";
import { Thumbnails } from "../../@design-edito";

export type Quality = number;
export type Ratio = [number, number];

export type PrepareImageOptions = {
    name?: string | undefined,
    inputOperations?: Operations;
    formats?: OutputFormat[],
    center?: [number, number] // default: [0.5, 0.5]
    qualities?: Quality[] // default: [100]
    ratios?: Ratio[] // default: []. Que le param soit vide ou pas, l'image dans son ration d'origine est toujours retournée
    widths?: number[] // default: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]. Pareil quoi qu'il arrive on retourne aussi le fichier en largeur d'origine pour tous les rations
    heights?: number[] // default: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]. Idem
}

type RequiredPrepareImageOptions = Required<PrepareImageOptions> & {    
    name?: PrepareImageOptions['name'],
    center?: PrepareImageOptions['center'], 
    ratios?: PrepareImageOptions['ratios'], 
};

export const MAX_NB_OUTPUTS = 50;
export const OUTPUT_ZIP_FOLDER = './output-zips';

export async function prepareImage (imageBuffer: Buffer, customOptions?: PrepareImageOptions): Promise<Buffer<ArrayBufferLike> | undefined> {
    const sharpImage = sharp(imageBuffer);
    const sharpImageMetadata = await sharpImage.metadata();
    const imageBufferMetadata = {
        width: sharpImageMetadata.width || 0,
        height: sharpImageMetadata.height || 0,
        format: sharpImageMetadata.format || 'png',
    }
    
    const options = getOptions(imageBufferMetadata, customOptions);
    
    /* Calc nbOutputs OR we could calc pixels instead ? */
    const nbOutputs = options.qualities.length * (options.ratios.length + 1) * (options.widths.length + 1) * (options.heights.length + 1);
    
    if (nbOutputs > MAX_NB_OUTPUTS) {
        throw Error('Nb output exceeds supported max nb output');
    }
    
    
    /* Apply all image operations */
    const transformedBuffer = await transformImage(imageBuffer, options.inputOperations, {
        width: Thumbnails.Common.getArrayMax(options.widths) || 0,
        height: Thumbnails.Common.getArrayMax(options.heights) || 0
    });
    
    
    /* Create exports */
    const exportsBuffers: ExportZipSources = [{
        buffer: imageBuffer,
        name: generateFileName({
            ...imageBufferMetadata,
            quality: 100,
            suffix: 'original',
            preffix: options.name
        })
    }]; /* First add original to the export */
    
    
    for await (const width of options.widths) {
        for await (const height of options.heights) {
            for await (const quality of options.qualities) {
                for await (const format of options.formats) {
                    /* Create all exports for each width/height/quality/format */
                    const exportBuffer = await prepareExport(transformedBuffer, {
                        format,
                        quality,
                        width,
                        height
                    });
                    exportsBuffers.push({
                        buffer: exportBuffer,
                        name:  generateFileName({ width, height, quality, format, preffix: options.name })
                    });
                }
            }
        }
    }
    
    const zipBuffer = exportZipBuffer(exportsBuffers, generateZipName())
    
    /* Zipping images and returning it (use for debug) */
    // const zip = Files.zip(OUTPUT_ZIP_FOLDER, generateZipName(), exportsBuffers);
    
    return zipBuffer;
}


function getOptions(imageBufferMetadata: { width: number, height: number, format: OutputFormat }, options?: PrepareImageOptions): RequiredPrepareImageOptions {
    return {
        center: [0.5, 0.5],
        qualities: [100],
        inputOperations: [],
        ...options,
        name: options?.name || '',
        formats: [imageBufferMetadata.format, ...(options?.formats ? options.formats : []) ],
        ratios: [...(options?.ratios ? options.ratios : []) ],
        widths: [imageBufferMetadata.width, ...(options?.widths ? options.widths : []) ],
        heights: [imageBufferMetadata.height, ...(options?.heights ? options.heights : []) ],
    }
}

function generateZipName() {
    const date = new Date();
    return `image-exports_${date.toLocaleDateString()}_${date.toLocaleTimeString()}_${date.getTime()}`.replace(/\/|:/g, '-').replace(/ /g, '').trim();
}

function generateFileName({ width, height, quality, format, suffix, preffix }: { width: number, height: number, quality: Quality, format: string, suffix?: string, preffix?: string }) {
    const _preffix = preffix ? `${preffix}_` :  'image-formats_';
    const _suffix = `${suffix ? `_${suffix}` :  ''}.${format}`;
    
    return `${_preffix}${width}${height}_Q${quality}${_suffix}`;
}