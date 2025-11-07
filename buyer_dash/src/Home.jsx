import { useState } from 'react';
import ModelViewer from './components/ModelViewer';
import Sidebar from './components/Sidebar';
import styles from './css/Home.module.css';

export default function Home() {
  const [selection, setSelection] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [modelRef, setModelRef] = useState(null);

  // selection shape: { buildingId, floorName, roomName }
  const handleSelect = (payload) => {
    setSelection(payload);
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  const handleModelRef = (ref) => {
    console.log("Model ref updated:", ref);
    setModelRef(ref);
  };

  return (
    <div className={styles.container}>
      <Sidebar 
        onSelect={handleSelect}
        gltfRef={modelRef}
        onNodeSelect={handleNodeSelect}
        selectedNode={selectedNode}
      />
      <div className={styles.modelContainer}>
        <ModelViewer 
          selection={selection}
          onNodeSelect={handleNodeSelect}
          ref={handleModelRef}
        />
      </div>
    </div>
  );
}