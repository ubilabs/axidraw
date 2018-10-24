# AxiDrawJS

## Description

AxiDrawJS allows you to use JavaScript to draw on any flat surface with an [AxiDraw](https://www.axidraw.com/)<sup>[1](#acknowledgment)</sup>.

> The AxiDraw V3 is a simple, modern, and precise pen plotter, capable of writing or drawing on almost any flat surface. It can write with fountain pens, permanent markers, and a variety of other writing implements to handle an endless number of applications.

![Animated Drawing](images/drawing.gif)

## Examples

This repository includes some basic APIs and the following examples:

* Map - choose a city and draw the streets
* Terrain - pseudo 3D map for mountains and hills
* Lorenz - the well known Lorenz attractor
* JSConf - the logo of our favorite conference
* Label Only - to draw it using a different color 
* Bounds - the reference paper size
* Adjust Pen - a guide to calibrate the plotter

## Sample Prints

![](images/examples.jpg)

## Development

Note: This project was built and tested on OSX. Use with care on other platforms.

### Prerequisites

Make sure you have the following tools installed:

* [Node.js](https://nodejs.org/)
* [npm](https://www.npmjs.com/)

Also, you’ll need a USB port.

### Installation

Download or clone the repository, then install all dependencies:

```sh
npm install
```

### Optional: Add API Tokens
This is required if you want to work with the map examples.
Copy the `api-tokens.example.js` to `api-tokens.js` in the root directory and
insert the necessary tokens for the API. Depending on whether you want to use
the Tilezen API or Mapbox API, you need to provide the corresponding key.

```
cp api-tokens.example.js api-tokens.js
```

In the end, it boils down to the decision if you want to work with
`src/lib/load-lines.js` or `src/lib/load-lines-mapbox.js`.
We favor the latter at the moment and probably for the future.

### Develop

Run the following command to start the server on localhost:

```sh
npm start
```

If the AxiDraw is not connected, the server starts in simulator mode. To visit the simulation go to http://localhost:8080. The CNC-Server will start on http://localhost:4242.

### Setup AxiDraw

1. Connect your AxiDraw to power and via USB to your computer.
1. Start the server as explained above. It should log out `CONNECTSERIAL CONNECT!` to show that it found the AxiDraw.
1. Go to http://localhost:8080/adjust-pen.html and follow the instructions.
1. For drawing the reference borders go to http://localhost:8080/draw-bounds.html and press `Print` to draw the bounds of the cards. Note: we’re using cards with the size DIN A6.
1. Place a card on the reference borders and you’re ready to go!
1. On http://localhost:4242 you can see the CNC management board with the progress and further options.


### Brew Your Own

#### `plot-coords.js`

To create your own drawings you should start with the high-level `Plotter` class from [src/lib/plot-coords.js](/src/lib/plot-coords.js). 

See [src/draw-lorenz.js](/src/draw-lorenz.js) and [html/draw-lorenz.html](/html/draw-lorenz.html) for a basic example. _Note:_ This requires some boilerplate HTML tags (such as a `#preview` SVG) and styles. The final paper size is 496x700 pixel and equal to the DIN A6 paper format. 

Basic JavaScript outline:

```js
import Plotter from './lib/plot-coords';
const plotter = new Plotter();
plotter.coords = [...]; // assign the coords
plotter.print(); // start drawing
```

#### `axidraw.js`

If you like to have more control over the robot use the low level API from [src/lib/axidraw.js](/src/lib/axidraw.js):

```js
import createAxidraw from "./lib/axidraw";
const axidraw = await createAxidraw();
const coords = [...]; // a list of lines 

for (let i = 0; i < coords.length; i++) {
  const line = this._coords[i];
  await axidraw.drawPath(line);
}
```

#### `coords`

You'll need to pass coords with `[x, y]` pairs that are in the range between `0` and `100`. 

Examples:

```js
const square = [
  [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]
];

const twoSquares = [
  [[10, 10], [11, 10], [11, 11], [10, 11], [10, 10]],
  [[20, 20], [21, 20], [21, 21], [20, 21], [20, 10]]
];

```

#### `load-svg-as-coords.js`

You can also load SVGs and convert the `<path>` elements to coordinates:

```js
import load from '../lib/load-svg-as-coords.js';
const coords = await load('/assets/my-logo.svg');
```

#### `scale-move.js`


To position and scale elements, use 

```js
import {scaleAndMove} from '../lib/scale-move';
const positionedSquare = [
  ...scaleAndMove(square, {scale: 2, x: 10, y: 10})
]
```

#### `convert-text-to-coords.js`

Here is an example how to draw dynamic text:

```js
import convertTextToCoords from './lib/convert-text-to-coords';
const text = await convertTextToCoords(text, {
  x: 100,
  y: 100,
  fontSize: 40,
  anchor: 'center middle'
});

```

#### `optimize-lines.js``

If you have a lot of random lines it might take some time to draw them. Use this helper to sort the lines by picking the closest start point after finishing a line.

```js
import {optimizeOrder} from './optimize-lines';
const randomLines = [...];
const sortedLines = optimizeOrder(randomLines);
```

#### `merge-lines.js`

A simple way to optimize the speed is to not move the pen up and down for lines that are close together. Note: This will best work with the `optimizeOrder` helper described above.

```js
import {optimizeOrder} from './optimize-lines';
const random = [...];
const sorted = optimizeOrder(randomLines);
const merged = mergeLines(sortedMapPaths);
```

## Images from Setup

![](images/overview.jpg)
![](images/detail.jpg)

## Background

This project started when we were preparing our sponsor booth at JSConf.eu. Instead of just spreading swag, we wanted something individual that people will love to bring home.  And because we are always surrounded by digital products, an analog print could make a difference. 

At Ubilabs we work with all kind of mapping frameworks such as the Google Maps API or Mapbox.gl. It was an obvious next step that our little friendly robot should draw one of these maps for you.

In the end, we were quite overwhelmed by the positive feedback. The robot was drawing non-stop and we produced more than 100 maps in two days. What we like most, was that it was a kind of ice-breaker when talking to strangers. We always asked them where they live to start the conversation. And while watching the robot drawing their personal map we learned from them and had the chance to explain what Ubilabs is doing.

## Links

Visit [ubilabs.net](https://ubilabs.net/) for more projects like this and follow [@ubilabs](https://twitter.com/ubilabs) on Twitter.

## Acknowledgment

1) [AxiDraw](https://axidraw.com/) is a trademark used with permission from [Evil Mad Science](https://www.evilmadscientist.com/) LLC.
