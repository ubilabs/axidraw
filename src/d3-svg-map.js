d3
  .require('d3-geo@1', 'd3-selection@1', 'd3-fetch@1', 'd3-tile@0.0')
  .then(d3 => {
    const key = 'fApLQBTwQbaIclmV0CoOQA';
    const height = 100;
    const width = 200;
    const zoom = 18;
    const center = [9.995, 53.565];

    // project the map for the given position, zoom and dimensions
    const projection = d3
      .geoMercator()
      .center(center)
      .scale((1 << zoom) / (2 * Math.PI))
      .translate([width / 2, height / 2])
      .precision(0);

    const path = d3.geoPath(projection);

    // compute the quadtree tiles
    const tile = d3
      .tile()
      .size([width, height])
      .scale(projection.scale() * 2 * Math.PI)
      .translate(projection([0, 0]));

    // load the vector tiles
    const requests = Promise.all(
      tile().map(async d => {
        console.log(`loading ${d.z}/${d.x}/${d.y}`);
        d.data = await d3.json(
          `https://tile.nextzen.org/tilezen/vector/v1/256/all/${d.z}/${d.x}/${
            d.y
          }.json?api_key=${key}`
        );
        return d;
      })
    );

    requests.then(tiles => {
      const features = [];

      tiles.forEach(tile => {
        features.push(
          ...tile.data.roads.features.filter(
            feature => feature.properties.kind != 'ferry'
          ),
          ...tile.data.water.features.filter(
            feature =>
              feature.properties.boundary && feature.geometry.type != 'Point'
          )
        );
      });

      const svg = `
      <svg
        viewBox="0 0 ${width} ${height}"
        style="width:800px;width:400px"
      >
      ${features.map(
        f => `
        <path
          fill="none"
          stroke="#000"
          vector-effect="non-scaling-stroke"
          d="${path(f)}">
        </path>
      `
      )}
    </svg>`;

      document.body.innerHTML += svg;

      const paths = path({type: 'FeatureCollection', features: features})
        // find segments
        .split('M')
        // remove empty elements
        .filter(l => l.length)
        // parse coordinate pairs
        .map(l =>
          l.split('L').map(
            // split coordinate pairs into [lng,lat]
            c =>
              c.split(',').map(
                // convert pairs to numbers
                s => {
                  const value = Number(s.replace(/Z/g, ''));
                  if (isNaN(value)) {
                    console.log(s);
                  }
                  return value;
                }
              )
          )
        );

      // sort paths to speed up movement

      const sortedPaths = [];

      let current = paths[0];

      function findNearest() {
        let position = 0;
        let minDistance = Number.MAX_VALUE;

        paths.forEach((path, index) => {
          const [x1, y1] = current[current.length - 1];
          const [x2, y2] = path[0];

          // TODO: Also check end point of path and
          // reverse array if that is closes

          const distance = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);

          if (distance < minDistance) {
            minDistance = distance;
            position = index;
          }
        });

        return position;
      }

      // get closest path
      while (paths.length) {
        const position = findNearest();
        current = paths.splice(position, 1)[0];
        sortedPaths.push(current);
      }

      // convert data to flat array of coordinates
      const points = [];

      sortedPaths.forEach(path => {
        path.forEach(coords => {
          const [x, y] = coords;
          points.push([x / 2 + 10, y / 2 + 10]);
        });

        // TODO: do not release pen (up + down)
        // if distance is small
        points.push(null);
      });

      // TODO: Ignore paths outside of drawing area

      // quick hack to simulate drawing order
      function animateSVG() {
        const path = [];
        let penUp = false;

        points.forEach((p, index) => {
          if (p == null) {
            penUp = true;
            return;
          }

          const [x, y] = p;
          const instruction = index == 0 || penUp == true ? 'M' : 'L';

          path.push(`${instruction} ${x} ${y}`);
          penUp = false;
        });

        let index = 0;

        function next() {
          index++;
          const subPath = path.slice(0, index * 10);

          animation.innerHTML = `
          <path d="${subPath.join(' ')}" fill="transparent" stroke="black"/>
        `;

          setTimeout(next, 10);
        }

        next();
      }

      animateSVG(points);
    });
  });
