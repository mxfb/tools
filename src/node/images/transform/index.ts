// Exports individuels sans namespace 

import sharp from "sharp"
import { Operations, isOperation, applyOperation } from "./operations";

export async function transformImage (imageBuffer: Buffer, operations: Operations, maxOutputDimensions: { width: number, height: number}): Promise<Buffer<ArrayBufferLike>> {
    /* Creates a sharpImage */
    let imageSharp = sharp(imageBuffer);
    const imageMetadata = await imageSharp.metadata();
    let transformation = { width: imageMetadata.width || 0, height: imageMetadata.height || 0, x: 0, y: 0 };

    /* Successively applies operations */
    for await (const operation of operations) {
        if (isOperation(operation)) {
            /* We use sharp result at each step */
            const appliedOperation = await applyOperation(imageSharp, operation, transformation);
            imageSharp = sharp(await appliedOperation.sharp.toBuffer()); // Make sure to recreate sharp as it sometimes is buggy for chained operations 

            if (appliedOperation.transformation) {
                transformation = { ...transformation, ...appliedOperation.transformation };
            }
        }
    }

    return await imageSharp.toBuffer();
}

export { Operations } ;