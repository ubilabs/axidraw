// Sizes for axidraw a3

const AxiDrawA3Dimensions = {
  width: 430,
  height: 297
}

const A3 = {
  width: 420,
  height: 297
}

const A4 = {
  width: 297,
  height: 210
}

const A4Portrait = {
  width: A4.height,
  height: A4.width,
  previewScale: 2.5
}

const A4Landscape = {
  width: A4.width,
  height:A4.height,
  previewScale: 2.5
}

const A3Landscape = {
  width: A3.width,
  height: A3.height,
  previewScale: 2
}

// 

export { A4Portrait, A4Landscape, A3Landscape, AxiDrawA3Dimensions }

