import { useState } from 'react';
import ModelViewer from './components/ModelViewer';
import Sidebar from './components/Sidebar';
import styles from './css/Home.module.css';

export default function Home() {
  const [selection, setSelection] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [modelRef, setModelRef] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  // selection shape: { buildingId, floorName, roomName }
  const handleSelect = (payload) => {
    setSelection(payload);
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    // Also update selection to trigger camera zoom on the node
    if (node && node.uuid) {
      setSelection({ nodeId: node.uuid });
    }
  };

  const handleModelRef = (ref) => {
    console.log("Model ref updated:", ref);
    setModelRef(ref);
  };

  const handleModelLoaded = () => {
    console.log("Model loaded callback received in Home");
    setModelLoaded(true);
  };

  return (
    <div className={styles.container}>
      <Sidebar 
        onSelect={handleSelect}
        gltfRef={modelRef}
        onNodeSelect={handleNodeSelect}
        selectedNode={selectedNode}
        modelLoaded={modelLoaded}
      />
      <div className={styles.modelContainer}>
        <ModelViewer 
          selection={selection}
          onNodeSelect={handleNodeSelect}
          onModelLoaded={handleModelLoaded}
          ref={handleModelRef}
        />
      </div>
    </div>
  );
}