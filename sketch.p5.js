var sketchConfig = {
    width: 1000,
    height: 500,
    maxPoints: 5000,
    scale: 1,
    maxSquareSize: 3,
    density: 6,
    inregularity: 0.7,
    backImgSrc: 'http://localhost:8000/experiment_bg.png'
};

function loadChangedValuesFrom(newConfig) {
    Object.keys(newConfig).forEach(function(key) {
        if (newConfig[key]) sketchConfig[key] = newConfig[key];
    });
}

var backImg, grad, my;

var lastPoint;

var pointData = [];

var lastBgImage;

function preload() {
    loadImage(sketchConfig.backImgSrc, function(img) {
        img.loadPixels();
        lastBgImage = img;
        pointData = collectPointData(sketchConfig, img.pixels, img.width, img.height);
        redraw();
    });

}

function setup() {
    createCanvas(sketchConfig.width, sketchConfig.height).parent('rpd-jb-preview-target');
    noLoop();
    updateSketchConfig(sketchConfig);
}

function draw() {
    clear();

    background(color('#161616'));

    fill(color('white'));
    stroke(color('red'));
    //noStroke();

    //console.log('draw');

    if (pointData && pointData.length) {
        //console.log('pointData', pointData);
        for (var i = 0; i < pointData.length; i++) {
            rect(pointData[i][0], pointData[i][1],
                 10 * (pointData[i][2] / 255),
                 10 * (pointData[i][2] / 255));
        }

        var voronoi = d3.voronoi()
                        .size([sketchConfig.width, sketchConfig.height])
                        (pointData);

        drawPolygons(voronoi);
    }
}

function updateSketchConfig(newConfig) {
    //console.log(sketchConfig.maxPoints, newConfig.maxPoints);
    var recalcPoints = (newConfig.inregularity || newConfig.maxPoints || newConfig.width || newConfig.height) ? true : false;
    loadChangedValuesFrom(newConfig);
    if (recalcPoints && lastBgImage) {
        pointData = collectPointData(sketchConfig, lastBgImage.pixels, lastBgImage.width, lastBgImage.height);
    }
    redraw();
  // w = width+16;
  // var xspacing = (conf.xspacing > 0) ? conf.xspacing : 10,
  //     period = (conf.period > 0) ? conf.period : 500;
  // dx = (TWO_PI / conf.period) * xspacing;
  // yvalues = new Array(floor(w/xspacing));
  // start = conf.startcolor ? color(conf.startcolor.r, conf.startcolor.g, conf.startcolor.b)
  //                         : color(255, 255, 255);
  // end = conf.endcolor ? color(conf.endcolor.r, conf.endcolor.g, conf.endcolor.b)
  //                     : color(255, 255, 255);
  // shapefunc = SHAPE_FUNC[conf.shape || 'circle'];
}

function collectPointData(config, pixels, imgWidth, imgHeight) {
    //console.log(config);
    var step = (config.scale || 1) * 12;
    var maxPoints = config.maxPoints;
    var inregularity = config.inregularity;

    var width = config.width;
    var height = config.height;

    var idx, pxBrightness, r, g, b, a;

    var lastPoint;

    var pointData = [];

    var xpos, ypos;

    //var d = pixelDensity();

    //console.log('maxPoints', maxPoints);

    //console.log('imgWidth', imgWidth, 'imgHeight', imgHeight, 'step', step);

    for (var x = 0; x < imgWidth; x += step) {

        //console.log('x', x, pointData.length >= maxPoints);

        if (pointData.length >= maxPoints) break;

        for (var y = 0; y < imgHeight; y += step) {

            //console.log('y', y, pointData.length >= maxPoints);

            if (pointData.length >= maxPoints) break;

            idx = (x + y * width) * 4;

            r = pixels[idx];
            g = pixels[idx+1];
            b = pixels[idx+2];
            a = pixels[idx+3];

            pxBrightness = brightness(color(r, g, b, a));

            //console.log('x', x, 'y', y, 'r', r, 'g', g, 'b', b, 'a', a, 'brightness', pxBrightness);

            if ((pxBrightness > 3) && (random(0, pxBrightness) < 70)) {

                xpos = ((x / imgWidth) * width) + (random(-step / 2, step / 2) * inregularity);
                ypos = ((y / imgHeight) * height) + (random(-step / 2, step / 2) * inregularity);

                pointData.push([ xpos, ypos, pxBrightness ]);
            }

        }

    }

    //console.log(pointData.length, pointData);

    return pointData;
}

function drawPolygons(voronoi) {
    var polygons = voronoi.polygons();

    var vcolors = [
                   color(197,27,125), color(222,119,174), color(241,182,218),
                   color(253,224,239), color(247,247,247), color(230,245,208),
                   color(184,225,134), color(127,188,65), color(77,146,33)
                  ];

    stroke(255);

    // draw polygons
    for (var j = 0; j < polygons.length; j++) {
        var polygon = polygons[j];

        if (!polygon) continue;

        // pick a random color
        var polyColor = vcolors[j % vcolors.length];
        fill(polyColor);

        beginShape();

        for (var k = 0; k < polygon.length; k++) {

          var v = polygon[k];
          vertex(v[0], v[1]);

        }

        endShape(CLOSE);
    }

    // draw circles.

    var circles = pointData.slice(1);

    stroke(0);
    for (var i = 0 ; i < circles.length; i++) {
        var center = circles[i];
        push();
        translate(center[0], center[1]);
        fill(0);
        ellipse(0, 0, 1.5, 1.5);
        pop();
    }

}