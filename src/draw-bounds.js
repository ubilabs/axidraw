import Plotter from './lib/plot-coords';
import { AxiDrawA3Dimensions, A4Portrait } from './paper-sizes'

const width = A4Portrait.width
const height = A4Portrait.height

const plotter  = new Plotter(AxiDrawA3Dimensions, A4Portrait);

const corners = [[0, 0], [width, 0], [width, height], [0, height], [0, 0]]

console.log(corners)

let joinedCorners = [] 
corners.forEach((list) => {
  list.forEach((coords) => {
    joinedCorners.push(coords[0])
    joinedCorners.push(coords[1])
  })
})

console.log(corners)


plotter.coords = [corners];

document.querySelector('.print-button').onclick = function(){
  plotter.print();
}