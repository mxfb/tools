import { FrameOperationParams } from "node/images/transform/frame";
import sharp from "sharp";

export async function frame (
  imageSharp: sharp.Sharp,
  params: FrameOperationParams
): Promise<sharp.Sharp> {
    const imageMetadata = await imageSharp.metadata()
    const imageDimensions = {
      widthPx: imageMetadata.width ?? 0,
      heightPx: imageMetadata.height ?? 0
    }

    const background = params.background || { r: 255, g: 255, b: 255, alpha: 0 };
 
    const innerPositions = await getInnerFramePositions(imageDimensions, params.dimensions, params.position);

    const frameSharpInstance =  sharp({
        create: {
            background,
            width: params.dimensions.widthPx,
            height: params.dimensions.heightPx,
            channels: 4 
        }
    }).ensureAlpha(0).composite([{
        input: await imageSharp.toFormat('png').toBuffer(),
        left: innerPositions.x,
        top: innerPositions.y,
    }]);

    return frameSharpInstance;
}

/* @todo: [WIP] Will be used by area-compose too */
export async function getInnerFramePositions(innerDimensions: { widthPx: number, heightPx: number }, frameDimensions: { widthPx: number, heightPx: number }, position: FrameOperationParams['position']) {
    const innerPositions = {
        x: 0,
        y: 0
    };

    if (position.top) {
        innerPositions.y = calcPosition(position.top, frameDimensions.heightPx);
    }

    if (position.bottom) {
        innerPositions.y = frameDimensions.heightPx - (calcPosition(position.bottom, frameDimensions.heightPx) + innerDimensions.heightPx);
    }

    if (position.left) {
        innerPositions.x = calcPosition(position.left, frameDimensions.widthPx);
    }

    if (position.right) {
        innerPositions.x = frameDimensions.widthPx - (calcPosition(position.right, frameDimensions.widthPx) + innerDimensions.widthPx);
    }

    /* This prevent input from going outside of output which would trigger a sharp error */

    const boundX = innerPositions.x + innerDimensions.widthPx;
    if (boundX > frameDimensions.widthPx) {
        innerPositions.x = innerPositions.x - (boundX - frameDimensions.widthPx);
    }

    const boundY = innerPositions.y + innerDimensions.heightPx;
    if (boundY > frameDimensions.heightPx) {
        innerPositions.y = innerPositions.y - (boundY - frameDimensions.heightPx);
    }

    innerPositions.x = Math.max(innerPositions.x, 0);
    innerPositions.y = Math.max(innerPositions.y, 0);

    return innerPositions;
}

function calcPosition(position: FrameOperationParams['position']['left'], frameDimensionPx: number) {
    const interpretedPosition = interpretPosition(position);
    if (interpretedPosition.unit === '%') {
        return Math.round(frameDimensionPx * (interpretedPosition.value / 100));
    }
    return interpretedPosition.value;
}

function interpretPosition(position: FrameOperationParams['position']['left']) {
    const interpretedPosition = {
        value: 0,
        unit: 'px'
    };

    if (typeof position === 'number') {
        interpretedPosition.value = position;
    }

    if (typeof position === 'string') {
        const matchedPosition = position.replace(/\s+/g, '').match(/(\d+)([%]|[px])?/);
        if (matchedPosition) {
            if (matchedPosition[0]) {
                interpretedPosition.value = Number(matchedPosition[0]);
            }
            if (matchedPosition[1]) {
                interpretedPosition.unit = matchedPosition[1];
            }
        }
    }

    return interpretedPosition;
}