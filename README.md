# AxiDrawJS

## Description

AxiDrawJS allows you to use JavaScript to draw on any flat surface with an [AxiDraw](https://www.axidraw.com/).

> The AxiDraw V3 is a simple, modern, and precise pen plotter, capable of writing or drawing on almost any flat surface. It can write with fountain pens, permanent markers, and a variety of other writing implements to handle an endless number of applications.

![](images/drawing.gif)

## Development

Note: This project was build and tested on OSX. Use with care on other platforms.

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

To create your own drawings you should start with the high level `Plotter` class from [/src/lib/plot-coords.js]. 

See [/src/draw-lorenz.js] and [/html/draw-lorenz.html](https://github.com/ubilabs/axidraw/blob/master/html/draw-lorenz.html) for a basic example. _Note:_ This will require some basic HTML tags (such as a preview SVG) and styles. The final paper size is 496x700 pixel and is equal to the DIN A6 paper format. 

Basic JavaScript outline:

```js
import Plotter from './lib/plot-coords';
const plotter = new Plotter();
plotter.coords = [...]; // assign the coords
plotter.print(); // start drawing
```

If you like to build your own, better use the low level API from [/src/lib/axidraw.js]:

```js
const axidraw = await createAxidraw();
const coords = [...]; // a list of lines 

for (let i = 0; i < coords.length; i++) {
  const line = this._coords[i];
  await axidraw.drawPath(line);
}
```

_Note:_ You'll need to pass coords with `[x, y]` pairs that are in the range between `0` and `100`.


### Images

![](images/overview.jpg)
![](images/detail.jpg)
![](images/examples.jpg)
