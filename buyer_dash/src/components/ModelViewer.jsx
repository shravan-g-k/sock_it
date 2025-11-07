import { useGLTF, OrbitControls, Stage, Html } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState, forwardRef } from 'react';
import { Vector3, Box3 } from 'three';
import "../css/LoadingSpinner.css";


function LoadingSpinner() {
  return <div className="spinner" />;
}

function LoadedModel({ gltfRef, onModelLoaded }) {
  // load gltf and store its scene reference for parent to inspect
  // use import.meta.url so Vite treats the .glb as an asset (avoid parsing it as JS)
  const url = new URL('../assets/tower_house_design.glb', import.meta.url).href;
  const gltf = useGLTF(url);
  useEffect(() => {
    if (gltf && gltf.scene && gltfRef) {
      gltfRef.current = gltf.scene;
      // debug: log that model loaded
      // eslint-disable-next-line no-console
      console.log('LoadedModel: scene set on gltfRef', gltf.scene);
      // Notify parent that model has loaded
      if (onModelLoaded) {
        onModelLoaded();
      }
    }
  }, [gltf, gltfRef, onModelLoaded]);

  return <primitive object={gltf.scene} />;
}

function CameraController({ selection, gltfRef, controlsRef }) {
  const { camera } = useThree();
  const animRef = useRef(null);
  const defaultZoomDuration = 700;
  const autoRotateStateRef = useRef(false);

  const focusOnNode = (targetNode, duration = defaultZoomDuration) => {
    if (!targetNode) return;

    const box = new Box3();
    box.setFromObject(targetNode);
    
    let center, size;
    if (box.isEmpty()) {
      center = new Vector3();
      targetNode.getWorldPosition(center);
      size = new Vector3(2, 2, 2); // Default size if bounding box is empty
    } else {
      center = box.getCenter(new Vector3());
      size = box.getSize(new Vector3());
    }

    // Calculate the diagonal of the bounding box to determine optimal viewing distance
    const diagonal = Math.sqrt(size.x * size.x + size.y * size.y + size.z * size.z);
    // Position camera at a distance that shows the entire object with some padding
    // Use a multiplier to ensure good viewing distance (2.5x the diagonal)
    const distance = Math.max(diagonal * 2.5, 1.5);
    
    // Calculate optimal viewing angle (slightly above and in front)
    // Use a nice isometric-like angle
    const angle = Math.PI / 4; // 45 degrees
    const heightOffset = size.y * 0.3; // Slightly above center
    
    // Calculate camera position with good viewing angle
    const cameraOffset = new Vector3(
      Math.sin(angle) * distance,
      heightOffset + distance * 0.5,
      Math.cos(angle) * distance
    );
    
    const endPos = center.clone().add(cameraOffset);
    const endTarget = center.clone();

    const startPos = camera.position.clone();
    const startTarget = controlsRef.current ? controlsRef.current.target.clone() : new Vector3(0, 0, 0);

    // Temporarily disable auto-rotate during zoom for better focus
    if (controlsRef.current) {
      autoRotateStateRef.current = controlsRef.current.autoRotate;
      controlsRef.current.autoRotate = false;
    }

    const startTime = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth easing function (ease-in-out cubic)
      const ease = t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      camera.position.lerpVectors(startPos, endPos, ease);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(startTarget, endTarget, ease);
        controlsRef.current.update();
      }
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure we're exactly at the target position
        camera.position.copy(endPos);
        if (controlsRef.current) {
          controlsRef.current.target.copy(endTarget);
          // Re-enable auto-rotate after zoom completes (if it was enabled before)
          controlsRef.current.autoRotate = autoRotateStateRef.current;
          controlsRef.current.update();
        }
      }
    }

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!selection || !gltfRef.current) return;

    if (selection.nodeId) {
      // Direct node selection from debug panel
      let targetNode = null;
      gltfRef.current.traverse((n) => {
        if (n.uuid === selection.nodeId) {
          targetNode = n;
        }
      });
      if (targetNode) focusOnNode(targetNode);
    } else {
      // Room name selection from sidebar
      const roomName = (selection.roomName || '').toLowerCase();
      let targetNode = null;
      
      // Try to find node by name
      gltfRef.current.traverse((n) => {
        if (!n.name) return;
        if (n.name.toLowerCase().includes(roomName)) {
          targetNode = n;
        }
      });

      // Fallback: try exact child match
      if (!targetNode) {
        gltfRef.current.traverse((n) => {
          if (!n.name) return;
          if (roomName.includes(n.name.toLowerCase())) {
            targetNode = n;
          }
        });
      }

      if (targetNode) {
        focusOnNode(targetNode);
      } else {
        // Default view if no match
        focusOnNode(gltfRef.current);
      }
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [selection, gltfRef, camera, controlsRef]);

  return null;
}

const ModelViewer = forwardRef(function ModelViewer({ selection: externalSelection, onNodeSelect, onModelLoaded: onModelLoadedProp }, ref) {
  const controlsRef = useRef();
  const gltfRef = useRef(null);
  
  // State to track when model is loaded (triggers re-render)
  const [modelLoaded, setModelLoaded] = useState(false);

  // Forward the gltfRef to parent through ref (support function or object refs)
  useEffect(() => {
    if (!ref) return;
    try {
      if (typeof ref === 'function') {
        // pass the ref object so parent can read .current as it changes
        ref(gltfRef);
      } else if (typeof ref === 'object' && ref !== null) {
        // set parent's ref.current to the same scene when available
        if (gltfRef.current) ref.current = gltfRef.current;
      }
    } catch (e) {
      // ignore
    }
  }, [ref]);

  // Update parent ref when model loads
  useEffect(() => {
    if (!ref || !modelLoaded) return;
    try {
      if (typeof ref === 'function') {
        // Call the ref callback again to notify parent that model has loaded
        ref(gltfRef);
      } else if (typeof ref === 'object' && ref !== null) {
        ref.current = gltfRef.current;
      }
    } catch (e) {
      // ignore
    }
  }, [modelLoaded, ref]);

  const handleModelLoaded = () => {
    setModelLoaded(true);
    // Notify parent component that model has loaded
    if (onModelLoadedProp) {
      onModelLoadedProp();
    }
  };
  const [selectedNode, setSelectedNode] = useState(null);
  const [selection, setSelection] = useState(externalSelection);

  useEffect(() => {
    setSelection(externalSelection);
  }, [externalSelection]);

  const handleNodeClick = (node) => {
    if (!gltfRef.current) return;
    
    setSelectedNode(node);
    let targetNode = null;
    gltfRef.current.traverse((n) => {
      if (n.uuid === node.uuid) {
        targetNode = n;
      }
    });

    if (targetNode) {
      setSelection({ nodeId: targetNode.uuid });
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
        <Suspense fallback={<Html style={{ pointerEvents: 'none' }}><LoadingSpinner /></Html>}>
          <Stage environment="city" intensity={0.6}>
            <LoadedModel gltfRef={gltfRef} onModelLoaded={handleModelLoaded} />
          </Stage>
          <OrbitControls ref={controlsRef} autoRotate />
          <CameraController selection={selection} gltfRef={gltfRef} controlsRef={controlsRef} />
        </Suspense>
      </Canvas>
    </div>
  );
});

export default ModelViewer;