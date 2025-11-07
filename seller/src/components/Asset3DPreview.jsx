import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';

/**
 * Asset3DPreview
 * Props:
 * - modelUrl : string (object URL or remote URL to .glb file)
 */
const Model = ({ url }) => {
    const { scene } = useGLTF(url, true);
    return <primitive object={scene} />;
};

const Asset3DPreview = ({ modelUrl }) => {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl h-96 flex flex-col border border-[#FFE5D9]">
            <div className="flex justify-between items-center p-3 bg-[#FFF3EE] text-[#943410]">
                <span className="text-xs font-mono tracking-wider">3D Model Preview</span>
                <div className="text-xs text-[#943410]">{modelUrl ? 'Loaded' : 'No model'}</div>
            </div>

            <div className="flex-grow">
                {modelUrl ? (
                    <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[5, 10, 5]} intensity={0.8} />
                        <Suspense fallback={null}>
                            <Stage environment="city" intensity={0.6} contactShadow={{ opacity: 0.2 }}>
                                <Model url={modelUrl} />
                            </Stage>
                        </Suspense>
                        <OrbitControls enablePan enableZoom enableRotate />
                    </Canvas>
                ) : (
                    <div className="flex items-center justify-center h-full p-6 text-center text-[#943410]">
                        <div>
                            <div className="text-6xl font-extrabold mb-2">3D</div>
                            <p className="font-semibold">No GLB loaded</p>
                            <p className="text-sm text-[#B7410E]">Use the uploader above to drag & drop a .glb file for instant preview.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-2 bg-[#FFF3EE] text-xs text-[#943410] text-center">Interact with the model using mouse or touch (rotate, zoom, pan)</div>
        </div>
    );
};

export default Asset3DPreview;