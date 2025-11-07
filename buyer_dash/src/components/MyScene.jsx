// Save as MyScene.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// 1. IMPORT YOUR ASSET
// asset lives in src/assets, components is one level deeper, so use ../assets
// prefer resolving asset URL at runtime so Vite treats it as an asset (binary)
const buildingAssetUrl = new URL('../assets/tower_house_design.glb', import.meta.url).href;

function MyScene() {
    const mountRef = useRef(null);
    const keys = useRef({ 'KeyW': false, 'KeyA': false, 'KeyS': false, 'KeyD': false });
    const clock = useRef(new THREE.Clock());

    useEffect(() => {
        // Scene, Camera, and Renderer
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb); 
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        // 2. LOAD THE IMPORTED ASSET URL
        const loader = new GLTFLoader();
        loader.load(buildingAssetUrl, (gltf) => { // <-- Use the imported URL
            scene.add(gltf.scene);
        });

        // First-Person Controls
        const controls = new PointerLockControls(camera, renderer.domElement);
        const onClick = () => controls.lock();
        document.body.addEventListener('click', onClick);

        // Keyboard controls
        const onKeyDown = (e) => (keys.current[e.code] = true);
        const onKeyUp = (e) => (keys.current[e.code] = false);
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        // Animation Loop
        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.current.getDelta();

            if (controls.isLocked) {
                if (keys.current['KeyW']) controls.moveForward(5 * delta);
                if (keys.current['KeyS']) controls.moveForward(-5 * delta);
                if (keys.current['KeyA']) controls.moveRight(-5 * delta);
                if (keys.current['KeyD']) controls.moveRight(5 * delta);
            }
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            document.body.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []); 

    return (
        <>
            <style>{`
                #info {
                    position: absolute;
                    top: 10px;
                    width: 100%;
                    text-align: center;
                    color: black;
                    font-family: Arial, sans-serif;
                }
            `}</style>
            <div id="info">Click to walk (W, A, S, D) and look (Mouse)</div>
            <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />
        </>
    );
}

export default MyScene;