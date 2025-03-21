// Exports individuels sans namespace 

import sharp from "sharp"
import { areaCompose } from "./area-composition"

// Rotate
export type RotateOperationParams = {
    angle: number
}
export type RotateOperation = {
    name: 'rotate'
    params: RotateOperationParams
}

// Resize
export type ResizeOperationParams = {
    width: number
    height: number,
    fit?: keyof sharp.FitEnum,
}
export type ResizeOperation = {
    name: 'resize'
    params: ResizeOperationParams
}

// Area-composition
export type AreaCompositionOperationParams = Partial<{}>; 
export type AreaCompositionOperation = {
    name: 'area-composition'
    params: AreaCompositionOperationParams
}

// Operations
export type Operation = RotateOperation | ResizeOperation | AreaCompositionOperation

export type Operations = Operation[];


export type Dimensions = {
    width: number,
    height: number
}

export async function transformImage (imageBuffer: Buffer, operations: Operations, maxDimensions: Dimensions): Promise<Buffer<ArrayBufferLike>> {
    // Creates a sharpImage 
    const imageSharp = sharp(imageBuffer);
    
    let imageSharped = imageSharp;
    
    /* Successively applies operations */
    for await (const operation of operations) {
        if (isOperation(operation)) {
            /* We use sharp result at each step */
            imageSharped = await applyOperation(imageSharped, operation, maxDimensions);
        }
    }

    return await imageSharped.toBuffer();
}

/* @todo */
export function isOperation(operation: any) {
    return true;
}

async function applyOperation(imageSharp: sharp.Sharp, operation: Operation, maxDimensions: Dimensions): Promise<sharp.Sharp> {
    switch(operation.name) {
        case 'rotate':
            return imageSharp.rotate(operation.params.angle);
        case 'resize':
            return imageSharp
                .resize({
                    width: operation.params.width,
                    height: operation.params.height,
                    fit: operation.params.fit || 'cover',
                    background: {r: 255, g: 255, b: 255, alpha: 0}
                }) /* Adds a transparent background (necessary for png) */
        case 'area-composition':
            const composedImage = await areaCompose(imageSharp, {
                ...operation.params,
                dimensions: {
                    w: maxDimensions.width,
                    h: maxDimensions.height
                }
            });
            return composedImage;
        default:
            return imageSharp;
    }
}