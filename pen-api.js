const axidraw = {

  ratio: 12000 / 8720, // http://localhost:4242/v1/settings/bot

  init: async () => {
    await axidraw.pen("state=up");
    await axidraw.call("DELETE", 'motors');
  },

  call: (method, endpoint, action, callback) => {

    if (!callback) {
      return new Promise(function (resolve, reject) {
        axidraw.call(method, endpoint, action, resolve);
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

    xhr.send(action);
  },

  pen: (action, callback) => {
    return axidraw.call("PUT", 'pen', action, callback);
  },

  batch: (batch) => {

    function next() {
      const coords = batch.shift();
      if (coords) {
        axidraw.pen(coords, next);
      } else {
        axidraw.init();
      }
    }

    next();
  },

  drawPath: (coords) => {
    const batch = ['state=up'];

    coords.map((coord, index) => {
      const [x, y] = coord;
      batch.push(`x=${x}&y=${y*axidraw.ratio}`);

      if (index == 0) {
        batch.push('state=draw')
      }
    });

    batch.push('state=up');
    axidraw.batch(batch);
  }
}

axidraw.init();