import './style.css'
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { model } from './modules/model';
import { postProcessing } from './modules/postProcessing';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/Addons.js';
import { clamp } from 'three/src/math/MathUtils.js';
import { TrackballControls } from 'three/examples/jsm/Addons.js';

const height = window.innerHeight;
const width = window.innerWidth;
let mobileDevice = false;
const clock = new THREE.Clock();

// detect if the device is small
if(width < 800){
  mobileDevice = true;
}

// canvas to be rendered
const canvasElement = document.querySelector<HTMLCanvasElement>("#bg") as HTMLCanvasElement;

// html description
const description = document.querySelector("#description") as HTMLElement;
description.className += ' fade-out';

// progressbar
const progressElement = document.getElementById('progressDiv') as HTMLElement;
progressElement.style.opacity = '1';
progressElement.style.zIndex = '99';
progressElement.style.height = window.innerHeight.toString() + 'px';
progressElement.style.width = window.innerWidth.toString()+ 'px';

const progressBar = document.getElementById('progressBar') as HTMLProgressElement;
const progressLabel = document.getElementById('progressLabel') as HTMLParagraphElement;

// loading
const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (url = '', itemsLoaded:number, itemsTotal:number) => {
  const percentage = Math.ceil((itemsLoaded / itemsTotal * 100));
  progressLabel.textContent = `${percentage}% loaded`;
  progressBar.value = percentage;
}
loadingManager.onLoad = () => {
  progressElement.className += ' fade-out';
  canvasElement.className += ' fade-in';
}


const scene = new THREE.Scene();
// scene.background = new THREE.Color(colors.a);
const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: canvasElement,
});
renderer.setPixelRatio(window.devicePixelRatio);

camera.position.set(-1.13, 0.2, 1.4);

renderer.setSize(width, height);
renderer.render(scene, camera);

// adds the computer model
const computer = model(scene, loadingManager);
const target = mobileDevice ? new THREE.Vector3(0.015, 0.3, 0): new THREE.Vector3(0.015, 0.41, 0);

// postprocessing setup
const composer = postProcessing(scene, camera, renderer);

const setupControls = () => {
  const controls = new OrbitControls( camera, renderer.domElement );

  controls.enableZoom = false;
  controls.rotateSpeed = 0.05;
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.minPolarAngle = Math.PI * 0.3;
  controls.minAzimuthAngle = Math.PI * -0.17;
  controls.maxAzimuthAngle = Math.PI * 0.25;
  controls.minDistance = 0.8;
  controls.maxDistance = 2;
  controls.target = target;

  const tcontrols = new TrackballControls( camera, renderer.domElement );
  tcontrols.noPan = true;
  tcontrols.noZoom = false;
  tcontrols.noRotate = true;
  tcontrols.zoomSpeed = 1.5;
  tcontrols.target = target;
  tcontrols.minDistance = 0.8;
  tcontrols.maxDistance = 2;

  // in case of mobile device limit/lock vertical orbit
  if(mobileDevice){
    controls.minPolarAngle = Math.PI * 0.5;
    controls.maxPolarAngle = Math.PI * 0.6;
  }
  return {orbitControl: controls, trackballControl: tcontrols};
}

const setupLighting = () => {
  const spotLight = new THREE.SpotLight(0xffffff, 10);
  spotLight.position.set(-1, 0.2, 1.4);

  // spotLight.position.set( 2.5, 5, 2.5 );
  spotLight.angle = Math.PI / 12;
  spotLight.penumbra = 1;
  spotLight.decay = 2;
  spotLight.distance = 0;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 10;
  spotLight.shadow.focus = 1;

  const ambient = new THREE.AmbientLight(0xeeeeff, 0.3);
  scene.add(spotLight);
  scene.add(ambient);
}

const setupLabels = () => {
  // label
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.className = 'w-full text-yellow-50';
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.body.appendChild( labelRenderer.domElement );

  const greetDiv = document.createElement('div');
  greetDiv.className = 'label text-yellow-50';
  greetDiv.textContent = "Hi There!";
  greetDiv.style.fontWeight = "100";
  greetDiv.style.fontSize = "3rem";
  greetDiv.style.color = "#ffffef";
  greetDiv.style.backgroundColor = "transparent";

  const greetLabel = new CSS2DObject(greetDiv);
  scene.add(greetLabel);
  // greetLabel.center.set(0, 0);
  return {renderer: labelRenderer, label:greetLabel};
}

const controls = setupControls();
const labelHandler = setupLabels();
setupLighting();

// scroll event for showing html elements
let zoomingOut = false;
const oldTarget = new THREE.Vector3(target.x, target.y, target.z);
const newTarget = new THREE.Vector3(target.x + 0.5, target.y, target.z);
let lerpFactor = 0.0;

// description
let descriptionShown = false;


document.addEventListener("wheel", (e) => {

  const dampedDelta = e.deltaY; 

  if(dampedDelta > 0 && mobileDevice && !descriptionShown){
    description.className = description.className.replace('fade-out', 'fade-in')
    descriptionShown = true;
  }
  if(dampedDelta < 0 && descriptionShown && window.scrollY <= 0){
    description.className = description.className.replace('fade-in', 'fade-out')
    descriptionShown = false;
  }

  if(dampedDelta > 0 && controls.orbitControl.maxDistance < (camera.position.distanceTo(target) + 0.01)){
    zoomingOut = true;

    if(window.scrollY <= 0){
      lerpFactor = clamp(lerpFactor + clock.getDelta() * 10, 0, 1);
      const position = target.lerpVectors(oldTarget, newTarget, lerpFactor); 
      controls.orbitControl.target = position;       
      controls.trackballControl.target = position;
      controls.trackballControl.noZoom = false;
    }else if(window.scrollY > 0){
      controls.trackballControl.noZoom = true;
    }
    if(controls.orbitControl.maxDistance >= (camera.position.distanceTo(target)) && !descriptionShown){
      description.className = description.className.replace('fade-out', 'fade-in')
      descriptionShown = true;
    }

  }
  else if(dampedDelta < 0 && controls.orbitControl.maxDistance > (camera.position.distanceTo(target) - 0.01)){
    zoomingOut = false;

    if(window.scrollY <= 0){

      lerpFactor = clamp(lerpFactor - clock.getDelta() * 10, 0, 1);
      const position = target.lerpVectors(oldTarget, newTarget, lerpFactor); 
      controls.orbitControl.target = position;       
      controls.trackballControl.target = position;

      controls.trackballControl.noZoom = false;
    }else if(window.scrollY > 0){
      controls.trackballControl.noZoom = true;
    }
    if(descriptionShown && window.scrollY <= 0){
      description.className = description.className.replace('fade-in', 'fade-out')
      descriptionShown = false;
    }
    
  }
});

// for mobile devices
var initialY: number | null = null;
var initialX: number | null = null;

const startTouch = (e:TouchEvent) => {
  initialY = e.touches[0].clientY;
  initialX = e.touches[0].clientX;
}

const moveTouch = (e:TouchEvent) => {
  if(initialY == null) return;
  if(initialX == null) return;

  var currentY = e.touches[0].clientY;
  var currentX = e.touches[0].clientX;

  var diffY = initialY - currentY;
  var diffX = initialX - currentX;

  if(diffY > 50.0 && diffX < 100.0){
    document.dispatchEvent(new WheelEvent('wheel', { deltaY: 1 } ));
  }else if(diffY < 0.0){
    document.dispatchEvent(new WheelEvent('wheel', { deltaY: -1 }));
  }
e.preventDefault();

}

document.addEventListener("touchstart", startTouch, false);
document.addEventListener("touchmove", moveTouch, false);

const animate = () => {
  requestAnimationFrame(animate);
  controls.orbitControl.update();
  controls.trackballControl.update();
  composer.render();
  labelHandler.renderer.render(scene, camera);
  labelHandler.renderer.setSize(window.innerWidth, window.innerHeight);

  labelHandler.label.position.set(0, 0.75 + 0.015*Math.cos(clock.getElapsedTime() * 2), 0);
  labelHandler.label.element.style.opacity = clamp(Math.log2(clock.getElapsedTime() + 1)/2, 0, 1).toString();

}

animate();