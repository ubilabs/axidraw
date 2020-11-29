import { mat2d, vec2 } from 'gl-matrix'

export class MatrixStack {

  constructor () {
    this.stack = [{
      type: 'identity',
      matrix: mat2d.create()
    }]

    this.current = mat2d.create();
    this.verbose = true
    this.savedState = undefined
  }

  enableLogging () {
    this.verbose = true
  }
  
  disableLogging () {
    this.verbose = false
  }

  push (matrix, type = 'unknown') {
    this.stack.push({matrix, type})
    this.verbose && console.log(`pushing ${type} (${this.stack.length - 1})`)
    this.updateTransform()
  }

  pop () {
    if (this.stack.length > 1) {
      let out = this.stack.pop()
      this.verbose && console.log(`popping ${out.type} (${this.stack.length - 1})`)
      this.updateTransform()
    }
    else {
      console.warn("Popping too far!")
    }
  }

  computeTransform () {
    let tmp = mat2d.create()
    this.stack.forEach((m) => {
      mat2d.multiply(tmp, tmp, m.matrix)
    })
    return tmp
  }

  updateTransform () {
    this.current = this.computeTransform()
  }

  rotate (radians) {
    let mat = mat2d.create()
    mat2d.fromRotation(mat, radians)
    this.push(mat, `rotate ${radians.toFixed(3)}`)
  }

  translate (vec, y = undefined) {

    // assume it's xy rather than a vector
    if (y !== undefined) {
      vec = vec2.fromValues(vec, y)
    }

    let mat = mat2d.create()
    mat2d.fromTranslation(mat, vec)
    this.push(mat, `translate x: ${vec[0]} y: ${vec[1]}`)
  }

  scale (s) {
    let mat = mat2d.create()
    mat2d.fromScaling(mat, s)
    this.push(mat, `scale ${s}`)
  }

  transform (v) {
    let out = vec2.create();
    vec2.transformMat2d(out, v, this.current)
    return out
  }

  reset () {
    this.stack = [{
      type: 'identity',
      matrix: mat2d.create()
    }]
    this.updateTransform()
  }

  save() {

    let tmp = mat2d.create()

    this.savedState = {
      stack: [...this.stack],
      current: mat2d.cop
    }
  }

  restore() {
    if (this.savedState === undefined) throw new Error("No state to restore")

  }



}