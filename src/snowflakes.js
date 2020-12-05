import Plotter from './lib/plot-coords';
import { optimizeOrder } from './lib/optimize-lines'
import { vec2 } from 'gl-matrix';
import { MatrixStack } from './MatrixStack'
import { AxiDrawA3Dimensions, A4Portrait } from './paper-sizes'

const width = A4Portrait.width
const height = A4Portrait.height
const flakeRadius = width / 8.5;

const addXY = (x, y, ctx, path) => {
  let result = ctx.transform(vec2.fromValues(x, y))
  path.push([result[0], result[1]])
}

const addVec = (x, y, ctx, path) => {
  let result = ctx.transform(vec2.fromValues(x, y))
  path.push(result)
}

const plusMinusRand = (max) => {
  return Math.random() * max - max / 2
}

let MAX_DEPTH = 3

class Branch {

  constructor (ctx, depth = undefined, depthParams = undefined, turnLeft = undefined, isSubBranch = false, subBranchIndex = undefined) {
    this.ctx = ctx
    this.path = []

    if (depth === undefined) {
      
      // Generate the parameters to use at each depth
      this.depthParams = []
      this.depth = 0
      this.turnLeft = false
      this.isSubBranch = false
      this.subBranchIndex = 0

      for (let i = 0; i < MAX_DEPTH; i++) {
        
        const numSubBranches = 3

        this.depthParams.push({
          angle: Math.PI + plusMinusRand(Math.PI) * 2,
          length: (Math.random() / 2 + 0.5) * flakeRadius * (1 / (i + 1)),
          subBranches: []
        })

        for (let j = 0; j < numSubBranches; j++) {
          
          this.depthParams[i].subBranches.push({
            position: (1 / numSubBranches) * (j + 1) * this.depthParams[i].length,
            angle: Math.PI + plusMinusRand(Math.PI / 3),
            length: 0.2 + Math.random() * this.depthParams[i].length

          })
        }

        this.depthParams[0].angle = 0
      }      
      
    }
    else {
      this.depth = depth
      this.depthParams = depthParams
      this.turnLeft = turnLeft
      this.isSubBranch = isSubBranch
      this.subBranchIndex = subBranchIndex
    }
    
  }

  addPolygon (length, ctx, path) {
    let angle = Math.PI * 2 / 6
    for (let i = 0; i < 7; i++) {
      let x = Math.cos(angle * i + Math.PI / 6 + Math.PI) * 1
      let y = Math.sin(angle * i + Math.PI / 6 + Math.PI) * 1 + length + 1
      addVec(x, y, ctx, path)
    }
  }

  createPoints (outputPaths) {
    const { ctx, depth, depthParams, turnLeft, isSubBranch, subBranchIndex } = this

    this.path = []    
    const params = depthParams[depth]
    let { angle, length, subBranches } = params
    if (isSubBranch) {
      angle = depthParams[depth - 1].subBranches[subBranchIndex].angle
      length = depthParams[depth - 1].subBranches[subBranchIndex].length
    }


    ctx.rotate(turnLeft ? angle : -angle)
    
    if (depth !== 0) {
      addVec(0, 0, ctx, this.path)
      addVec(0, length * .8, ctx, this.path)
    }
    else {
      addVec(0, length * .4, ctx, this.path)
      addVec(0, length * 1, ctx, this.path) 
    }
    

    outputPaths.push(this.path)

    if (this.depth === MAX_DEPTH - 1) {
      //this.addPolygon(length, ctx, this.path)
      ctx.pop()
      return
    }
    
    else if (subBranches.length > 0) {
      subBranches.forEach(({position}, index) => {
        ctx.translate(0, position)
        let b1 = new Branch(ctx, this.depth + 1, this.depthParams, true, index !== 0, index)
        let b2 = new Branch(ctx, this.depth + 1, this.depthParams, false, index !== 0, index)
        b1.createPoints(outputPaths)
        b2.createPoints(outputPaths)
        ctx.pop()
      })

    }

    ctx.pop()

  }

}

async function init(){
  // const claim = await renderClaim();
  const plotter = new Plotter(AxiDrawA3Dimensions, A4Portrait);
  const coords = []
  let output = []
  
  const draw = () => {
    output = []
    for (let k = 0; k < 9; k++) {
      let ctx = new MatrixStack()
      ctx.disableLogging()

      let b = new Branch(ctx)
      let lines = []
      b.createPoints(lines)
      // Rescale the result
      let maxDistance = 0
      lines.forEach((line) => {
        if(!line) return
        line.forEach((point) => {
          if (vec2.length(point) > maxDistance) {
            maxDistance = vec2.length(point)
          }
        })
      })
      lines = lines.map((line) => {
        return line.map((point) => {
          return [
            point[0] * flakeRadius / maxDistance,
            point[1] * flakeRadius / maxDistance 
          ]
        })
      })

      
      ctx.reset()

      
      let x = (Math.floor((k % 3) + 1)) * 0.33 * width - width * (.33 / 2)
      let y = (Math.floor((k / 3 % 3) + 1)) * 0.33 * height - height * (.33 /2) 
      // console.log(x, y)

      ctx.translate(x, y)

      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI * 2 / 6)
        lines.forEach((line) => {
          let rotated = []
          line.forEach((p) => {
            addXY(p[0], p[1], ctx, rotated)
          })
          output.push(rotated)
        })
      }

      ctx.pop()
    }

    // Add some guide lines
    output.push([[20, height * .33], [22, height * .33]])
    output.push([[width - 22, height * .33], [width - 20, height * .33]])
    output.push([[20, height * .66], [22, height * .66]])
    output.push([[width - 22, height * .66], [width - 20, height * .66]])

    plotter.coords = optimizeOrder(output);
  }

  document.onclick = (e) => {
    if (e.target.tagName === 'svg') draw()
    
  }
  
  document.querySelector('.print-button').onclick = function () {
    plotter.print();
  };

  draw()
}

init();