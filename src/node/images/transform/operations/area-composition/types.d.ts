
type CompositionOptions = { 
    palette: Thumbnails.Colors.Palette, 
    paletteOptions: AreaCompositionParams['palette'],
    innerTransformation: AreaCompositionParams['innerTransformation'], 
    outputDimensions: { w: number, h: number } 
}

type SharpShape = { 
    width: number, 
    height: number, 
    channels: 3 | 4, 
    background: {r: number, g: number, b: number, alpha: number}
}

type SharpInput = { 
    top: number, 
    left: number, 
    input: sharp.Sharp 
};
