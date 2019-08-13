const videoElement = document.getElementById('videoElement');
const outputElement = document.getElementById('outputElement');
const classifier = knnClassifier.create();

async function app() {
  net = await mobilenet.load();
  await setupWebcam();

  document.getElementById('class-1').addEventListener('click', () => addExample(1));
  document.getElementById('class-2').addEventListener('click', () => addExample(2));
  document.getElementById('class-3').addEventListener('click', () => addExample(3));

  const addExample = classId => {
    const activation = net.infer(videoElement, 'conv_preds');
    classifier.addExample(activation, classId);
  }

  while (true) {
    if (classifier.getNumClasses() > 0) {
      const activation = net.infer(videoElement, 'conv_preds');
      const result = await classifier.predictClass(activation);

      outputElement.innerHTML = `Class #${result.label}`;
    }
    await tf.nextFrame();
  }
}

async function setupWebcam() {
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function(stream) {
        videoElement.srcObject = stream;
        videoElement.play();
    });
  }
}

app();