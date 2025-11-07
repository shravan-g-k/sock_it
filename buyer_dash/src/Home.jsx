import { useState } from 'react';
import ModelViewer from './components/ModelViewer';
import Sidebar from './components/Sidebar';
import styles from './css/Home.module.css';

export default function Home() {
  const [selection, setSelection] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [modelRef, setModelRef] = useState({ current: null });

  // selection shape: { buildingId, floorName, roomName } or { nodeId }
  const handleSelect = (payload) => {
    setSelection(payload);
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setSelection({ nodeId: node.uuid });
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
          onNodesUpdate={ref => setModelRef(ref)}
        />
      </div>
    </div>
  );
}