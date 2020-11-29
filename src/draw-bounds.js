import Plotter from './lib/plot-coords';

const plotter  = new Plotter();
const width = 100
const height = 100


const corners = [[0, 0], [width, 0], [width, height], [0, height]].map(([x, y]) => {
  return [[[x-2, y], [x+2, y]], [[x, y-2], [x, y + 2]]]
})

let joinedCorners = [] 
corners.forEach((list) => {
  list.forEach((coords) => {
    joinedCorners.push(coords[0])
    joinedCorners.push(coords[1])
  })
})

console.log(joinedCorners)


plotter.coords = [joinedCorners];

document.querySelector('.print-button').onclick = function(){
  plotter.print();
}