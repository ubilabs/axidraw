const axidraw = {
  ratio: 12000 / 8720, // http://localhost:4242/v1/settings/bot

  init: async () => {
    // release pen and stop motor
    await axidraw.pen("state=up");
    await axidraw.call("DELETE", 'motors');
  },

  drawPath: (coords) => {
    const batch = ['state=up'];
    let penUp = true;

    coords.forEach((coord, index) => {
      if (coord === null) {
        batch.push('state=up');
        penUp = true;
      } else {
        const [x, y] = coord;
        batch.push(`x=${x}&y=${y*axidraw.ratio}`);

        if (penUp) {
          batch.push('state=draw');
          penUp = false;
        }
      }

      if (index == 0) {
        batch.push('state=draw')
      }
    });

    batch.push('state=up');
    axidraw.batch(batch);
  },

  /**
   * Internally used. Calls the RoboPaint API.
   *
   * @param  {String} method the HTTP eg "PUT" or "DELETE"
   * @param  {String} endpoint the API endpoint eg "pen" or "motors"
   * @param  {String} data the data to sent. Must be a form URL encoded format.
   * @param  {Function} callback Optional. The callback to execute. Will return a promise if not provided.
   */
  call: (method, endpoint, data, callback) => {
    if (!callback) {
      return new Promise(function (resolve, reject) {
        axidraw.call(method, endpoint, data, resolve);
      });
    }

    const xhr = new XMLHttpRequest();
    xhr.open(method, `http://localhost:4242/v1/${endpoint}`);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function () {
      if (
        xhr.readyState == XMLHttpRequest.DONE &&
        xhr.status == 200 &&
        callback
      ) {
        setTimeout(callback, 1);
      }
    }

    xhr.send(data);
  },


  /**
   * Simple wrapper to send data to the pen. Internally used.
   * @param  {String} data The pen data eg "x=1&y=2" or "state=up"
   * @param  {Function} callback The callback
   */
  pen: (data, callback) => {
    return axidraw.call("PUT", 'pen', data, callback);
  },


  batch: (batch) => {

    function next() {
      const action = batch.shift();
      console.log(action);
      if (action) {
        axidraw.pen(action, next);
      } else {
        axidraw.init();
      }
    }

    next();
  }
}

axidraw.init();