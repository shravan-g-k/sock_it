import { useGLTF, OrbitControls, Stage, Html } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Vector3, Box3 } from 'three';
import "../css/LoadingSpinner.css";
import debugStyles from '../css/DebugPanel.module.css';

function LoadingSpinner() {
  return <div className="spinner" />;
}

function LoadedModel({ gltfRef }) {
  // load gltf and store its scene reference for parent to inspect
  const gltf = useGLTF('/src/assets/tower_house_design.glb');
  useEffect(() => {
    if (gltf && gltf.scene && gltfRef) {
      gltfRef.current = gltf.scene;
    }
  }, [gltf, gltfRef]);

  return <primitive object={gltf.scene} />;
}

function CameraController({ selection, gltfRef, controlsRef }) {
  const { camera } = useThree();
  const animRef = useRef(null);
  const defaultZoomDuration = 700;

  const focusOnNode = (targetNode, duration = defaultZoomDuration) => {
    if (!targetNode) return;

    const box = new Box3();
    box.setFromObject(targetNode);
    
    let center, radius;
    if (box.isEmpty()) {
      center = new Vector3();
      targetNode.getWorldPosition(center);
      radius = 2;
    } else {
      center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());
      radius = size.length() / 2;
    }

    const startPos = camera.position.clone();
    const startTarget = controlsRef.current ? controlsRef.current.target.clone() : new Vector3(0, 0, 0);

    // Calculate optimal camera position
    const dir = camera.getWorldDirection(new Vector3()).normalize();
    const distance = Math.max(radius * 2.2, 1.5);
    const endPos = center.clone().add(dir.clone().multiplyScalar(-distance));
    const endTarget = center.clone();

    const startTime = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    function animate(now) {
      const t = Math.min(1, (now - startTime) / duration);
      // Use smooth easing
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      camera.position.lerpVectors(startPos, endPos, ease);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(startTarget, endTarget, ease);
        controlsRef.current.update();
      }
      if (t < 1) animRef.current = requestAnimationFrame(animate);
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

export default function ModelViewer({ selection: externalSelection, onNodesUpdate }) {
  const controlsRef = useRef();
  const gltfRef = useRef(null);
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
    }
  };

  // Make gltfRef available to parent component for NodesPanel
  useEffect(() => {
    if (onNodesUpdate) {
      onNodesUpdate(gltfRef);
    }
  }, [gltfRef, onNodesUpdate]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
    {/* Wrap DOM fallback in <Html> so it isn't injected directly into the R3F scene
      (raw DOM like <div> inside Canvas causes the "Div is not part of THREE" error) */}
    <Suspense fallback={<Html style={{ pointerEvents: 'none' }}><LoadingSpinner /></Html>}>
          <Stage environment="city" intensity={0.6}>
            <LoadedModel gltfRef={gltfRef} />
          </Stage>
          <OrbitControls ref={controlsRef} autoRotate />
          <CameraController selection={selection} gltfRef={gltfRef} controlsRef={controlsRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}