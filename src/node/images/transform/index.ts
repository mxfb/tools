import sharp from 'sharp'
import {
  Operation,
  applyOperation
} from './operations'

export { Operation }

export async function transform (
  imageBuffer: Buffer,
  operations: Operation[]
): Promise<Buffer> {
  let sharpInstance = sharp(imageBuffer)
  const imageMetadata = await sharpInstance.metadata()
  const { width = 0, height = 0 } = imageMetadata
  let transformation = { width, height, x: 0, y: 0 }
  for (const operation of operations) {
    const appliedOperation = await applyOperation(sharpInstance, operation, transformation)
    if (appliedOperation.transformation) {
      transformation = { ...transformation, ...appliedOperation.transformation }
    }
  }
  return sharpInstance.toBuffer()
}
