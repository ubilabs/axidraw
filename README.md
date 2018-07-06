# AxiDrawJS

## Description

AxiDrawJS allows you to use JavaScript to draw on any flat surface with an [AxiDraw](https://www.axidraw.com/).

> The AxiDraw V3 is a simple, modern, and precise pen plotter, capable of writing or drawing on almost any flat surface. It can write with fountain pens, permanent markers, and a variety of other writing implements to handle an endless number of applications.

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
