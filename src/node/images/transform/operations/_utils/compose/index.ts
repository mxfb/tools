import { ComposeOperationParams } from "../../../../transform/compose";
import sharp, { OverlayOptions } from "sharp";

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
      const overlay: OverlayOptions = {
        input: Buffer.from([]),
        gravity: image.gravity,
        ...('top' in image ? { top: image.top } : {}),
        ...('left' in image ? { left: image.left } : {}),
        ...('blend' in image ? { blend: image.blend } : {}),
        ...('tile' in image ? { tile: image.tile } : {}),
      }
      if (typeof image.input !== 'object') {
        overlay.input = overlay.input;
        return overlay;
      }
      
      if ('mode' in image.input) {
        switch(image.input.mode) {
          case 'fill':
          overlay.input = {
            create: {
              background: image.input.background,
              channels: image.input.nbChannels || 3,
              width: image.input.widthPx || imageDimensions.widthPx,
              height: image.input.heightPx || imageDimensions.heightPx
            }
          }
          break;
          case 'gradient':
          overlay.input = Buffer.from(`<svg viewBox="0 0 ${imageDimensions.widthPx} ${imageDimensions.heightPx}" xmlns="http://www.w3.org/2000/svg"  xmlns:xlink="http://www.w3.org/1999/xlink" width="${imageDimensions.widthPx}" height="${imageDimensions.heightPx}">
                    <defs>
                      <linearGradient id="myGradient" gradientTransform="rotate(${image.input.angleDeg})">
                      ${image.input.colorStops.map((colorStop) => `<stop offset="${colorStop.offsetPercent}%" stop-color="${colorStop.color}" />`).join(' ')}
                      </linearGradient>
                    </defs>
                    <rect  x="0" y="0" width="100%" height="100%" fill="url('#myGradient')"></rect>
                  </svg>`
            
          )
        }
      }
      return overlay;
    })
  ]).toFormat('png').flatten({
    background: backgroundColor
  })
  
  return newComposedSharp
}