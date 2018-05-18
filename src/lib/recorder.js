export default class Recoder {
  constructor() {
    this.lines = [];
    this.isRecording = false;
  }

  record(event) {
    if (event.state === 'up' && this.isRecording) {
      console.log('done recording');
      this.isRecording = false;
      return;
    }

    if (event.state === 'draw' && !this.isRecording) {
      console.log('start recording new line');
      this.lines.push([]);
      this.isRecording = true;
    }

    if (this.isRecording) {
      const currentLine = this.lines[this.lines.length - 1];
      currentLine.push([event.x, event.y]);
    }
  }
}
