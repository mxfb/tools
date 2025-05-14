import { ComposeOperationParams } from "node/images/transform/compose";
import sharp from "sharp";

/* @todo */
export async function compose (
  imageSharp: sharp.Sharp,
  params: ComposeOperationParams
): Promise<sharp.Sharp> {
    const imageMetadata = await imageSharp.metadata();
    const imageDimensions = {
        widthPx: imageMetadata.width || 0,
        heightPx: imageMetadata.height || 0,
    }

    /* Create a new Sharp */
    const backgroundColor = params.background || { r: 0, g: 0, b: 0, alpha: 0 };
    const newComposedSharp = sharp({
        create: {
            background: backgroundColor,
            width: imageDimensions.widthPx,
            height:  imageDimensions.heightPx,
            channels: 4,
        }
    }).toFormat('png').composite([
        {
          input:  await imageSharp.toFormat('png').toBuffer(),
          left: 0,
          top: 0
        },
        ...params.images.map((image) => {
          if ('overlay' in image.input) {
            switch(image.input.overlay.mode) {
              case 'fill':
                return {
                  ...image,
                  input: {
                    create: {
                      background: image.input.overlay.background,
                      channels: image.input.overlay.channels || 4,
                      width: image.input.overlay.width || imageDimensions.widthPx,
                      height: image.input.overlay.height || imageDimensions.heightPx,
                    }
                  }
                }
              case 'gradient':
                return {
                  left: 0,
                  top: 0,
                  ...image,
                  input: Buffer.from(`<svg viewBox="0 0 ${imageDimensions.widthPx} ${imageDimensions.heightPx}" xmlns="http://www.w3.org/2000/svg"  xmlns:xlink="http://www.w3.org/1999/xlink" width="${imageDimensions.width}" height="${imageDimensions.heightPx}">
                    <defs>
                      <linearGradient id="myGradient" gradientTransform="rotate(${image.input.overlay.angle})">
                      ${image.input.overlay.stops.map((stop) => `<stop offset="${stop.offset}%" stop-color="${stop.color}" />`).join(' ')}
                      </linearGradient>
                    </defs>
                    <rect  x="0" y="0" width="100%" height="100%" fill="url('#myGradient')"></rect>
                  </svg>`
                  )
                }
            }
          } 
          return {
            ...image,
            input: image.input
          }
        })
    ]).toFormat('png').flatten({
        background: backgroundColor
    })

    return newComposedSharp
}