import { Thumbnails } from "../../../../@design-edito";
import sharp from "sharp";

export type InnerGravity = 'top-left' | 'top-center' | 'top-right' | 'left-center' | 'center' | 'right-center' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type InnerResizeTransformation = {
    width: number,
    height: number,
    x: number,
    y: number
}

export type InnerResizeParams = {
    outputDimensions?: { width: number, height: number },
    innerRatio?: number,
    innerGravity?: InnerGravity,
    background?: { r: number, g: number, b: number } | string
}


export async function innerResize(imageSharp: sharp.Sharp, params: InnerResizeParams): Promise<{sharp: sharp.Sharp, transformation: InnerResizeTransformation}> {
    const imageMetadata = await imageSharp.metadata();
    const inputDimensions = {
        width: imageMetadata.width || 0,
        height: imageMetadata.height || 0,
    };

    const outputDimensions = params.outputDimensions ? params.outputDimensions  : {
        width: inputDimensions.width,
        height: inputDimensions.height,
    }

    const ratio = (params.innerRatio || 100) / 100;
    const innerDimensions = {
        width: Math.floor(outputDimensions.width * ratio),
        height: Math.floor(outputDimensions.height * ratio)
    };

    const innerContainedDimensions = Thumbnails.Layout.getContainedDimensions(innerDimensions.width, innerDimensions.height, outputDimensions.width, outputDimensions.height, true);
    
    const innerPositions = getInnerPositions(params.innerGravity || 'center', { w: innerDimensions.width, h: innerDimensions.height }, innerContainedDimensions, { w: outputDimensions.width, h: outputDimensions.height });

    // const background = params.background  && typeof params.background === 'object' ? { ...params.background, alpha: 0 } : { r: 255, g: 255, b: 255, alpha: 0 },
    const background = { r: 255, g: 255, b: 255, alpha: 0 };
    const resizedSharp = imageSharp.toFormat('png').resize({
        width: innerDimensions.width,
        height: innerDimensions.height,
        fit: sharp.fit.contain,
        background
    });

    /* Adds image to new image with given background */
    const composedSharp = sharp({
            create: {
                background,
                width: outputDimensions.width,
                height: outputDimensions.height,
                channels: 4,
                
            }
        }).ensureAlpha(0).composite([
            {
                input: await resizedSharp.toFormat('png').toBuffer(),
                left: Math.floor(innerPositions.x),
                top: Math.floor(innerPositions.y),
            }
        ]).toFormat('png');


    return {
        sharp: composedSharp,
        transformation: {
            width: innerContainedDimensions.w,
            height: innerContainedDimensions.h,
            x: Math.ceil(innerPositions.x),
            y: Math.ceil(innerPositions.y)
        }
    }
}

function getInnerPositions( innerGravity: InnerGravity, innerDimensions: { w: number, h: number},  innerContainedDimensions: { w: number, h: number},  outerDimension: { w: number, h: number } ) {
    switch (innerGravity) {
        case 'top-left':
        return Thumbnails.Layout.alignTopLeft(innerDimensions, innerContainedDimensions, outerDimension);
        case 'top-center':
        return Thumbnails.Layout.alignTopCenter(innerDimensions, innerContainedDimensions, outerDimension);
        case 'top-right':
        return Thumbnails.Layout.alignTopRight(innerDimensions, innerContainedDimensions, outerDimension);
        case 'left-center':
        return Thumbnails.Layout.alignLeftCenter(innerDimensions, innerContainedDimensions, outerDimension);
        case 'center':
        return Thumbnails.Layout.alignCenter(innerDimensions, innerContainedDimensions, outerDimension);
        case 'right-center':
        return Thumbnails.Layout.alignRightCenter(innerDimensions, innerContainedDimensions, outerDimension);
        case 'bottom-left':
        return Thumbnails.Layout.alignBottomLeft(innerDimensions, innerContainedDimensions, outerDimension);
        case 'bottom-center':
        return Thumbnails.Layout.alignBottomCenter(innerDimensions, innerContainedDimensions, outerDimension);
        case 'bottom-right':
        return Thumbnails.Layout.alignBottomRight(innerDimensions, innerDimensions, outerDimension);
        default:
        return { x: 0, y: 0 };
    }
}