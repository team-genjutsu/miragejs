// onmessage = function(event) {
// 	var disjointSet = event.data[1];
// 	//console.log("this should be an object", disjointSet);
// 	disjointSet.find = function (i) {
// 		if (this.parent[i]===i) {
// 			return i;
// 		}else {
// 			return this.parent[i] = this.find(this.parent[i]);
// 		}
// 	};

// 	var rects = event.data[0];
// 	console.log(rects);
// 	var intersectRect = function(x0, y0, x1, y1, x2, y2, x3, y3) {
//     	return !(x2 > x1 || x3 < x0 || y2 > y1 || y3 < y0);
//   	};
//     // console.log("inside of merge rectangles disjointedSet", disjointSet);
//     for (var i = 0; i < rects.length; i++) {
//       var r1 = rects[i];
//       for (var j = 0; j < rects.length; j++) {
//         var r2 = rects[j];
//         if (intersectRect(r1.x, r1.y, r1.x + r1.width, r1.y + r1.height, r2.x, r2.y, r2.x + r2.width, r2.y + r2.height)) {
//           var x1 = Math.max(r1.x, r2.x);
//           var y1 = Math.max(r1.y, r2.y);
//           var x2 = Math.min(r1.x + r1.width, r2.x + r2.width);
//           var y2 = Math.min(r1.y + r1.height, r2.y + r2.height);
//           var overlap = (x1 - x2) * (y1 - y2);
//           var area1 = (r1.width * r1.height);
//           var area2 = (r2.width * r2.height);

//           if ((overlap / (area1 * (area1 / area2)) >= this.REGIONS_OVERLAP) &&
//             (overlap / (area2 * (area1 / area2)) >= this.REGIONS_OVERLAP)) {
//             disjointSet.union(i, j);
//           }
//         }
//       }
//     }

//     var map = {};
//     for (var k = 0; k < disjointSet.length; k++) {
//     	console.log(disjointSet.length);
//       var rep = disjointSet.find(k);
//       if (!map[rep]) {
//         map[rep] = {
//           total: 1,
//           width: rects[k].width,
//           height: rects[k].height,
//           x: rects[k].x,
//           y: rects[k].y
//         };
//         continue;
//       }
//       map[rep].total++;
//       map[rep].width += rects[k].width;
//       map[rep].height += rects[k].height;
//       map[rep].x += rects[k].x;
//       map[rep].y += rects[k].y;
//     }
 
//     var result = [];
//     Object.keys(map).forEach(function(key) {
//       var rect = map[key];
//       result.push({
//         total: rect.total,
//         width: (rect.width / rect.total + 0.5) | 0,
//         height: (rect.height / rect.total + 0.5) | 0,
//         x: (rect.x / rect.total + 0.5) | 0,
//         y: (rect.y / rect.total + 0.5) | 0
//       });
//     });
//     console.log("rectangle array", result);
//     // console.log("merge rectangle results", result);
//     postMessage({
//     	rectangle: result
//     });
// }



