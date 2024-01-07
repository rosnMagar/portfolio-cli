import * as THREE from 'three';
import { Terminal } from '../terminal/terminal';

const vShader = `

    varying vec2 vUv;  

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
const fShader = `

    uniform sampler2D u_texture;
    uniform vec2 u_textureSize;
    uniform float u_time;
    varying vec2 vUv;

    float random (float st) {
        return fract(st * 0.293);
    }

    void main() {

        float alpha = float(int(vUv.y * u_textureSize.y * 2.0) % 2);
        vec4 scanLines = vec4(alpha, alpha, alpha, 1.0); 

        vec2 tmpUv = vUv;

        float x = vUv.y + u_time * 0.4 + random(u_time);
        // for more info plot this in desmos
        tmpUv.x -= abs(sin(x)/cos(x)/3000.0);

        // shear effect
        vec4 tex = texture(u_texture, tmpUv);
        gl_FragColor = tex * scanLines;
    }
`;

export const TerminalMaterial = () : THREE.Material => {

    const canvasTerminal = document.createElement("Canvas") as HTMLCanvasElement;
    const terminal = new Terminal([640, 480], canvasTerminal, [3, 3, 3, 1]);
    terminal.render();

    const texture = new THREE.CanvasTexture(canvasTerminal);
    const clock = new THREE.Clock();

    // const material = new THREE.MeshStandardMaterial({
    //     map: texture, 
    //     emissiveMap: texture, 
    //     emissive: 0xffffff, 
    //     emissiveIntensity: 1, 
    //     roughness: 0.2, 
    //     metalness: 0.3,
    // });

    const uniforms = {
        u_resolution: { value: { x: null, y: null } },
        u_time: {value: 0.0},
        u_texture: {type: "t", value: texture},
        u_textureSize: {value: [640, 480]}
    }

    const screenMaterial = new THREE.ShaderMaterial({
        vertexShader: vShader,
        fragmentShader: fShader,
        uniforms
    });

    setInterval(() => {
        texture.needsUpdate = true;
        uniforms.u_time.value = clock.getElapsedTime();
    }, 1000/24)

    return screenMaterial;
}