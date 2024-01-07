import { EffectComposer, FXAAShader, OutputPass, RenderPass, ShaderPass, UnrealBloomPass } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';

export const postProcessing = ( scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer): EffectComposer => {

    const params = {
        threshold: 0.35,
        strength: 0.4,
        radius: 1.0,
        exposure: 1 
    }

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.0, 1.0, 0.0 );
    bloomPass.threshold = params.threshold;
    bloomPass.strength = params.strength;
    bloomPass.radius = params.radius;

    const outputPass = new OutputPass();

    const composer = new EffectComposer(renderer);
    composer.addPass( renderScene );
    composer.addPass( bloomPass );
    composer.addPass( outputPass );

    return composer;

}