import keyboardMappings from '../constants/keyboard-mapping.js';

export default class Controller {
  constructor(map) {
    this.map = map;

    const joystickIsConnected = false;

    if (joystickIsConnected) {
      this.initGamepadControls();
    } else {
      this.initKeyboardControls();
    }
  }

  initGamepadControls() {
    console.log('init gamepad controls');
  }

  initKeyboardControls() {
    const label = document.querySelector('#label');

    window.addEventListener('keyup', event => {
      if (keyboardMappings[event.code]) {
        if (document.activeElement !== label) {
          const action = keyboardMappings[event.code];
          this[action]();
        }
      }
    });
  }

  navigateLeft() {
    console.log('navigate left');
  }

  navigateRight() {
    console.log('navigate right');
  }

  navigateUp() {
    console.log('navigate up');
  }

  navigateDown() {
    console.log('navigate down');
  }

  zoomIn() {
    console.log('zoom in');
  }

  zoomOut() {
    console.log('zoom out');
  }

  preview() {
    const button = document.querySelector(
      '#action-buttons > button.preview-button'
    );

    button.click();
  }

  print() {
    const button = document.querySelector(
      '#action-buttons > button.print-button'
    );

    button.click();
  }
}
