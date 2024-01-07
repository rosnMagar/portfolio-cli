import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import { TerminalMaterial } from './terminalMaterial';

export const model = (scene: THREE.Scene, manager: THREE.LoadingManager): THREE.Object3D<THREE.Object3DEventMap> => {

    const loader = new GLTFLoader(manager);
    let obj: THREE.Object3D<THREE.Object3DEventMap>;

    loader.load('./computer/computer.gltf', (gltf) => {
        obj = gltf.scene;
        let screenMesh: any;

        obj.traverse((child: any) => {
            if(child.isMesh && child.name == "defaultMaterial007"){
                screenMesh = child;
                screenMesh.material = TerminalMaterial(); 
            }
        });

        scene.add(gltf.scene);
        return gltf.scene;
    }
    , undefined, (error) => console.error(error));

    return new THREE.Object3D();

}