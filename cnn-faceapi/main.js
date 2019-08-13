const videoElement = document.getElementById('videoElement');
const canvas = document.getElementById('canvasElement');
const MODEL_URL = 'weights';
let currentExpression = '';

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
]).then(setupWebcam);

async function setupWebcam() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
        videoElement.srcObject = stream;
        videoElement.play();
      });
  }
}

function drawDetections(el) {
  const displaySize = faceapi.matchDimensions(canvas, videoElement, false);

  setInterval(async () => {
    const detections = await faceapi
                              .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
                              .withFaceLandmarks()
                              .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, detections);
    faceapi.draw.drawDetections(canvas, detections);
  }, 100);
}

function drawEmoji(el) {

  const displaySize = faceapi.matchDimensions(canvas, videoElement, false);

  setInterval(async () => {
    const detections = await faceapi
                              .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
                              .withFaceLandmarks()
                              .withFaceExpressions();

    const detection = detections[0];

    if(detection.expressions) {
      const expression = getExpression(detection.expressions);
      const image = new Image();

      image.onload = function() {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        canvas.getContext('2d').drawImage(image,
          detection.alignedRect.box.left,
          detection.alignedRect.box.top,
          detection.landmarks.imageWidth,
          detection.landmarks.imageHeight);
      }
      image.src = `./emojis/${expression}.png`;
      currentExpression = expression;
    }
  }, 500);

}

function getExpression(expressions){
  let expression = "happy";
  let p = 0;
  for (let value in expressions) {
    if (expressions[value] > p) {
      p = expressions[value];
      expression = value;
    }
  }
  return expression;
}