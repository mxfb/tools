// Exports individuels sans namespace 

import archiver from "archiver";
import sharp from "sharp";
import { Writable } from "stream";

export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif' | keyof(sharp.FormatEnum) // ...

export type OutputOptions = {
    format: OutputFormat, 
    width: number, 
    height: number, 
    quality: number
}

export type ExportZipSource = { buffer: Buffer, name: string };
export type ExportZipSources = ExportZipSource[];


export async function prepareExport (imageBuffer: Buffer, outputOptions: OutputOptions) {
    const resizedSharp = sharp(imageBuffer)
        .resize({
            width: outputOptions.width,
            height: outputOptions.height,
            fit: sharp.fit.cover,
        });
    
    const qualitiedSharp = setSharpQuality(resizedSharp, outputOptions.quality, outputOptions.format);
    return await qualitiedSharp.toBuffer();
}

export function exportZipBuffer(zipSources: ExportZipSources, zipDirectoryName?: string): Promise<Buffer<ArrayBufferLike> | undefined> {
    return new Promise(async (resolve, reject) => {
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
    
        if (zipDirectoryName) {
            archive.directory(zipDirectoryName + '/', false);
        }
    
        zipSources.forEach((zipSource) => {
            /* Append files to zip while creating a subdirectory */
            const fileName = zipDirectoryName ? `${zipDirectoryName}/${zipSource.name}` : zipSource.name;

            archive.append(zipSource.buffer, { name: fileName });
        });

        const bufferZip = await toBuffer(archive);
        resolve(bufferZip);
    })
}

async function toBuffer(archive: archiver.Archiver) {
    /* Creates a wridable so we can store data */
    const chunks: Uint8Array[] = [];
    const writable = new Writable();

    writable._write = (chunk, encoding, callback) => {
        /* Save chunks to an array */
        chunks.push(chunk);
        callback();
    };

    /* Add Writable to archive pipe so it uses this */

    archive.pipe(writable);

    /* Finalize zip so we don't update it anymore */
    await archive.finalize();

    /* Return a concated buffer of all chunks */
    return Buffer.concat(chunks);
}

function setSharpQuality(sharp: sharp.Sharp, quality: number, format: OutputFormat) {
    switch(format) {
        case 'png':
            return sharp.png({ quality });
        case 'jpeg':
            return sharp.jpeg({ quality });
        case 'webp':
            return sharp.webp({ quality });
        case "avif":
            return sharp.avif({ quality });
        default:
            return sharp;
    }
}