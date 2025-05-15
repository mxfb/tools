import sharp from 'sharp'
import { Writable } from 'node:stream'
import archiver from 'archiver'
import {
  ImageFileType,
  formatImage
} from '../format'
import {
  Operation,
  transform
} from '../transform'

export type Quality = number
export type Ratio = [number, number]

export type PrepareImageOptions = {
  name?: string | undefined
  inputOperations?: Operation[]
  checkValidOperations?: boolean; // TEMPORARY
  formats?: ImageFileType[]
  center?: [number, number] // default: [0.5, 0.5]
  qualities?: Quality[] // default: [100]
  ratios?: Ratio[] // default: []. Que le param soit vide ou pas, l'image dans son ration d'origine est toujours retournée
  widths?: number[] // default: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]. Pareil quoi qu'il arrive on retourne aussi le fichier en largeur d'origine pour tous les rations
  heights?: number[] // default: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]. Idem
}

type RequiredPrepareImageOptions = Required<PrepareImageOptions> & {  
  name?: PrepareImageOptions['name']
  center?: PrepareImageOptions['center']
  ratios?: PrepareImageOptions['ratios']
}

export const MAX_NB_OUTPUTS = 50
export const OUTPUT_ZIP_FOLDER = './output-zips'

export async function prepareImage (
  imageBuffer: Buffer,
  customOptions?: PrepareImageOptions
): Promise<Buffer<ArrayBufferLike> | undefined> {
  const sharpImage = sharp(imageBuffer)
  const sharpImageMetadata = await sharpImage.metadata()
  const imageBufferMetadata = {
    width: sharpImageMetadata.width ?? 0,
    height: sharpImageMetadata.height ?? 0,
    format: sharpImageMetadata.format || 'png'
  }


  const options = getOptions(imageBufferMetadata, customOptions)

  /* Calc nbOutputs OR we could calc pixels instead ? */
  const nbOutputs = options.qualities.length
    * (options.ratios.length + 1)
    * (options.widths.length + 1)
    * (options.heights.length + 1)
  if (nbOutputs > MAX_NB_OUTPUTS) throw Error('Nb output exceeds supported max nb output')
  
  /* Apply all image operations */
  let transformedBuffer = imageBuffer;
  try {
    transformedBuffer = await transform(imageBuffer, options.inputOperations, options.checkValidOperations);
  } catch(e) {
    console.log('Images:Prepare:Transform:Buffer:Error', { e })
  }

  const transformedBufferMetadata = await sharp(transformedBuffer).metadata();

  /* Create exports */
  const exportsBuffers: ExportZipSources = [
    {
      buffer: imageBuffer,
      name: generateFileName({
        ...imageBufferMetadata,
        quality: 100,
        suffix: 'original',
        prefix: options.name
      })
    },
    {
      buffer: transformedBuffer,
      name: generateFileName({
        width: transformedBufferMetadata.width || 0,
        height: transformedBufferMetadata.height || 0,
        format: transformedBufferMetadata.format || 'png',
        quality: 100,
        suffix: 'transformed-unresized',
        prefix: options.name
      })
    }
] /* First add original to the export */

  for (const width of options.widths) {
    for (const height of options.heights) {
      for (const quality of options.qualities) {
        for (const format of options.formats) {

        console.log('Images:Transform:Prepare:FormatImage', `${width}x${height} Q:${quality} F:${format}`);
          const exportBuffer = await formatImage(transformedBuffer, {
            format,
            quality,
            width,
            height
          })
          exportsBuffers.push({
            buffer: exportBuffer,
            name: generateFileName({
              width,
              height,
              quality,
              format,
              prefix: options.name
            })
          })
        }
      }
    }
  }

  /* Temporarily ZIPs buffer */
  console.log('Images:Transform:Export:ZIP', generateZipName(options.name));      
  const zipBuffer = exportZipBuffer(exportsBuffers, generateZipName(options.name))  
  return zipBuffer
}


export type ExportZipSource = { buffer: Buffer, name: string }
export type ExportZipSources = ExportZipSource[]
export function exportZipBuffer (
  zipSources: ExportZipSources,
  zipDirectoryName?: string
): Promise<Buffer<ArrayBufferLike> | undefined> {
  return new Promise(async resolve => {
    const archive = archiver('zip', { zlib: { level: 9 } })
    if (zipDirectoryName) { archive.directory(zipDirectoryName + '/', false) }
    zipSources.forEach((zipSource) => {
      const fileName = zipDirectoryName
        ? `${zipDirectoryName}/${zipSource.name}`
        : zipSource.name
      archive.append(zipSource.buffer, { name: fileName })
    })
    const chunks: Uint8Array[] = []
    const writable = new Writable()
    writable._write = (chunk, _enc, callback) => {
      chunks.push(chunk)
      callback()
    }
    archive.pipe(writable)
    await archive.finalize()
    const bufferZip = Buffer.concat(chunks)
    resolve(bufferZip)
  })
}


function getOptions(
  imageBufferMetadata: {
    width: number,
    height: number,
    format: keyof sharp.FormatEnum
  },
  options?: PrepareImageOptions
): RequiredPrepareImageOptions {
  return {
    center: [0.5, 0.5],
    qualities: [100],
    inputOperations: [],
    ...options,
    checkValidOperations: options?.checkValidOperations ?? false,
    name: options?.name ?? '',
    formats: [imageBufferMetadata.format, ...(options?.formats ? options.formats : []) ],
    ratios: [...(options?.ratios ? options.ratios : []) ],
    widths: [imageBufferMetadata.width, ...(options?.widths ? options.widths : []) ],
    heights: [imageBufferMetadata.height, ...(options?.heights ? options.heights : []) ],
  }
}

function generateZipName (name: string = '') {
  const date = new Date()
  return `${name}_image-exports_${date.toLocaleDateString()}_${date.toLocaleTimeString()}_${date.getTime()}`
    .replace(/\/|:/g, '-')
    .replace(/ /g, '')
    .trim()
}

function generateFileName({
  width,
  height,
  quality,
  format,
  suffix,
  prefix
}: {
  width: number,
  height: number,
  quality: Quality,
  format: string,
  suffix?: string,
  prefix?: string
}) {
  prefix = prefix ? `${prefix}_` :  'image-formats_'
  suffix = `${suffix ? `_${suffix}` :  ''}.${format}`
  return `${prefix}${width}x${height}_Q${quality}${suffix}`
}
