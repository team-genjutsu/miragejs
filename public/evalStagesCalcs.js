  onmessage = function(event) {


  var data = event.data[0];
  var integralImage = event.data[1];
  var integralImageSquare = event.data[2];
  var tiltedIntegralImage = event.data[3];
  var i = event.data[4];
  var j = event.data[5];
  var width = event.data[6];
  var blockWidth = event.data[7];
  var blockHeight = event.data[8];
  var scale = event.data[9];
  var inverseArea = 1.0 / (blockWidth * blockHeight);
  var wbA = i * width + j;
  var wbB = wbA + blockWidth;
  var wbD = wbA + blockHeight * width;
  var wbC = wbD + blockWidth;
  var mean = (integralImage[wbA] - integralImage[wbB] - integralImage[wbD] + integralImage[wbC]) * inverseArea;
  var variance = (integralImageSquare[wbA] - integralImageSquare[wbB] - integralImageSquare[wbD] + integralImageSquare[wbC]) * inverseArea - mean * mean;

  var standardDeviation = 1;
  if (variance > 0) {
    standardDeviation = Math.sqrt(variance);
  }

  var length = data.length;

  for (var w = 2; w < length; ) {
    var stageSum = 0;
    var stageThreshold = data[w++];
    var nodeLength = data[w++];

    while (nodeLength--) {
      var rectsSum = 0;
      var tilted = data[w++];
      var rectsLength = data[w++];

      for (var r = 0; r < rectsLength; r++) {
        var rectLeft = (j + data[w++] * scale + 0.5) | 0;
        var rectTop = (i + data[w++] * scale + 0.5) | 0;
        var rectWidth = (data[w++] * scale + 0.5) | 0;
        var rectHeight = (data[w++] * scale + 0.5) | 0;
        var rectWeight = data[w++];

        var w1;
        var w2;
        var w3;
        var w4;
        if (tilted) {
          // RectSum(r) = RSAT(x-h+w, y+w+h-1) + RSAT(x, y-1) - RSAT(x-h, y+h-1) - RSAT(x+w, y+w-1)
          w1 = (rectLeft - rectHeight + rectWidth) + (rectTop + rectWidth + rectHeight - 1) * width;
          w2 = rectLeft + (rectTop - 1) * width;
          w3 = (rectLeft - rectHeight) + (rectTop + rectHeight - 1) * width;
          w4 = (rectLeft + rectWidth) + (rectTop + rectWidth - 1) * width;
          rectsSum += (tiltedIntegralImage[w1] + tiltedIntegralImage[w2] - tiltedIntegralImage[w3] - tiltedIntegralImage[w4]) * rectWeight;
        } else {
          // RectSum(r) = SAT(x-1, y-1) + SAT(x+w-1, y+h-1) - SAT(x-1, y+h-1) - SAT(x+w-1, y-1)
          w1 = rectTop * width + rectLeft;
          w2 = w1 + rectWidth;
          w3 = w1 + rectHeight * width;
          w4 = w3 + rectWidth;
          rectsSum += (integralImage[w1] - integralImage[w2] - integralImage[w3] + integralImage[w4]) * rectWeight;
          // TODO: Review the code below to analyze performance when using it instead.
          // w1 = (rectLeft - 1) + (rectTop - 1) * width;
          // w2 = (rectLeft + rectWidth - 1) + (rectTop + rectHeight - 1) * width;
          // w3 = (rectLeft - 1) + (rectTop + rectHeight - 1) * width;
          // w4 = (rectLeft + rectWidth - 1) + (rectTop - 1) * width;
          // rectsSum += (integralImage[w1] + integralImage[w2] - integralImage[w3] - integralImage[w4]) * rectWeight;
        }
      }

      var nodeThreshold = data[w++];
      var nodeLeft = data[w++];
      var nodeRight = data[w++];

      if (rectsSum * inverseArea < nodeThreshold * standardDeviation) {
        //console.log("plus nodeLeft", stageSum, nodeLeft);
        stageSum += nodeLeft;
      } else {
        //console.log("plus nodeRight", stageSum, nodeRight);
        stageSum += nodeRight;
      }
    }

    if (stageSum < stageThreshold) {
//console.log("eval false", stageSum, stageThreshold);
      postMessage({
        status: false
      });

    }
  }
//console.log("eval true");
  postMessage({
     status: true
   });


};
