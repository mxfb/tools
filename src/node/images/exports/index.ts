import { Writable } from 'node:stream'
import archiver from 'archiver'
import sharp from 'sharp'
import { clamp } from '../../../agnostic/numbers/clamp'
import { Outcome } from 'agnostic/misc/outcome'

export type FormatCommonOptions = {
  width?: number
  height?: number
  fit?: sharp.ResizeOptions['fit']
}
export type FormatJpgOptions = FormatCommonOptions & { quality?: number }
export type FormatPngOptions = FormatCommonOptions & {
  quality?: number
  compressionLevel?: sharp.PngOptions['compressionLevel']
}
export type FormatWebpOptions = FormatCommonOptions & { quality?: number }
export type FormatAvifOptions = FormatCommonOptions & { quality?: number }
export type FormatTiffOptions = FormatCommonOptions & {
  quality?: number
  compression?: sharp.TiffOptions['compression']
}
export type FormatHeifOptions = FormatCommonOptions & { quality?: number }
export type FormatKeepOptions = FormatCommonOptions
export type FormatOptions = FormatJpgOptions | FormatPngOptions | FormatWebpOptions | FormatAvifOptions | FormatTiffOptions | FormatHeifOptions

export async function ffformat (input: Buffer, type: 'jpg' | 'jpeg', options: FormatJpgOptions): Promise<Outcome.Either<Buffer, string>>
export async function ffformat (input: Buffer, type: 'png', options: FormatPngOptions): Promise<Outcome.Either<Buffer, string>>
export async function ffformat (input: Buffer, type: 'webp', options: FormatWebpOptions): Promise<Outcome.Either<Buffer, string>>
export async function ffformat (input: Buffer, type: 'avif', options: FormatAvifOptions): Promise<Outcome.Either<Buffer, string>>
export async function ffformat (input: Buffer, type: 'tiff', options: FormatTiffOptions): Promise<Outcome.Either<Buffer, string>>
export async function ffformat (input: Buffer, type: 'heif', options: FormatHeifOptions): Promise<Outcome.Either<Buffer, string>>
export async function ffformat (input: Buffer, options: FormatKeepOptions): Promise<Outcome.Either<Buffer, string>>
export async function ffformat (
  input: Buffer,
  typeOrOptions: ImageFileType | FormatKeepOptions,
  options?: FormatOptions
): Promise<Outcome.Either<Buffer, string>> {
  const sharpInstance = sharp(input)
  if (typeof typeOrOptions !== 'string') return Outcome.makeSuccess(await sharpInstance.resize(typeOrOptions).toBuffer())
  const type = typeOrOptions
  if (type === 'jpg' || type === 'jpeg') return Outcome.makeSuccess(await sharpInstance.jpeg(options as FormatJpgOptions).toBuffer())
  if (type === 'png') return Outcome.makeSuccess(await sharpInstance.png(options as FormatPngOptions).toBuffer())
  if (type === 'webp') return Outcome.makeSuccess(await sharpInstance.webp(options as FormatWebpOptions).toBuffer())
  if (type === 'avif') return Outcome.makeSuccess(await sharpInstance.avif(options as FormatAvifOptions).toBuffer())
  if (type === 'tiff') return Outcome.makeSuccess(await sharpInstance.tiff(options as FormatTiffOptions).toBuffer())
  if (type === 'heif') return Outcome.makeSuccess(await sharpInstance.heif(options as FormatHeifOptions).toBuffer())
  return Outcome.makeFailure(`Invalid image format: ${type}`)
}

export const toWidth = async (
  input: Buffer,
  width: number
): Promise<Buffer> => sharp(input)
  .resize({ width })
  .toBuffer()

export const toHeight = async (
  input: Buffer,
  height: number
): Promise<Buffer> => sharp(input)
  .resize({ height })
  .toBuffer()

export const toJpg = async (
  input: Buffer,
  quality?: number
): Promise<Buffer> => sharp(input)
  .jpeg({ quality: clamp(quality ?? 100, 1, 100) })
  .toBuffer()

export const toPng = async (
  input: Buffer,
  quality?: number,
  compressionLevel?: sharp.PngOptions['compressionLevel']
): Promise<Buffer> => sharp(input)
  .png({ quality: clamp(quality ?? 100, 1, 100), compressionLevel })
  .toBuffer()

export const toWebp = async (
  input: Buffer,
  quality?: number
): Promise<Buffer> => sharp(input)
  .webp({ quality: clamp(quality ?? 100, 1, 100) })
  .toBuffer()

export const toAvif = async (
  input: Buffer,
  quality?: number
): Promise<Buffer> => sharp(input)
  .avif({ quality: clamp(quality ?? 100, 1, 100) })
  .toBuffer()

export const toTiff = async (
  input: Buffer,
  quality?: number,
  compression?: sharp.TiffOptions['compression']
): Promise<Buffer> => sharp(input)
  .tiff({ quality: clamp(quality ?? 100, 1, 100), compression })
  .toBuffer()

export const toHeif = async (
  input: Buffer,
  quality?: number
): Promise<Buffer> => sharp(input)
  .heif({ quality: clamp(quality ?? 100, 1, 100) })
  .toBuffer()







export type ImageFileType = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff' | 'heif'

export type OutputOptions = {
  format: ImageFileType, 
  width: number, 
  height: number, 
  quality: number
}

export type ExportZipSource = { buffer: Buffer, name: string }
export type ExportZipSources = ExportZipSource[]

export async function formatBuffer (
  imageBuffer: Buffer,
  outputOptions: OutputOptions
): Promise<Buffer> {
  const { width, height, quality, format } = outputOptions
  const sharpInstance = sharp(imageBuffer).resize({
    width,
    height,
    fit: sharp.fit.cover
  })
  let withQuality = sharpInstance
  if (format === 'png') { withQuality = withQuality.png({ quality }) }
  else if (format === 'jpeg') { withQuality = withQuality.jpeg({ quality }) }
  else if (format === 'webp') { withQuality = withQuality.webp({ quality }) }
  else if (format === 'avif') { withQuality = withQuality.avif({ quality }) }
  return await withQuality.toBuffer()
}

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