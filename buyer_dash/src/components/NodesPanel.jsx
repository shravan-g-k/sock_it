import { useState, useEffect } from 'react';
import { Box3, Vector3 } from 'three';
import debugStyles from '../css/DebugPanel.module.css';

export default function NodesPanel({ gltfRef, onNodeSelect, selectedNode, modelLoaded }) {
  const [nodesList, setNodesList] = useState([]);

  useEffect(() => {
    // Build nodes list whenever gltfRef changes or model loads
    if (!gltfRef?.current) {
      setNodesList([]);
      return;
    }

    const nodes = [];
    gltfRef.current.traverse((n) => {
      if (!n.name) return;
      // compute bounding box
      const box = new Box3();
      box.setFromObject(n);
      const center = box.isEmpty() ? null : box.getCenter(new Vector3()).toArray();
      const size = box.isEmpty() ? null : box.getSize(new Vector3()).toArray();
      // include uuid so clicks can map back to the actual scene object
      nodes.push({ name: n.name, center, size, uuid: n.uuid });
    });
    setNodesList(nodes);
  }, [gltfRef, modelLoaded]);

  return (
    <div className={debugStyles.debugPanel}>
      <div className={debugStyles.debugHeader}>
        <div>Scene nodes ({nodesList.length})</div>
      </div>
      {!modelLoaded && (
        <div className={debugStyles.debugSmall} style={{ padding: '8px', color: '#666' }}>
          Loading model...
        </div>
      )}
      {modelLoaded && !gltfRef?.current && (
        <div className={debugStyles.debugSmall} style={{ padding: '8px', color: '#666' }}>
          Model loaded but scene not available
        </div>
      )}
      {nodesList.length === 0 && modelLoaded && gltfRef?.current && (
        <div className={debugStyles.debugSmall} style={{ padding: '8px', color: '#666' }}>
          No named nodes found in scene
        </div>
      )}
      <div className={debugStyles.debugList}>
        {nodesList.map((n, i) => (
          <div 
            key={i}
            className={`${debugStyles.debugItem} ${selectedNode?.uuid === n.uuid ? debugStyles.selected : ''}`}
            onClick={() => onNodeSelect(n)}
            style={{ cursor: 'pointer' }}
            title="Click to focus camera on this node"
          >
            <div className={debugStyles.debugItemName}>{n.name}</div>
            <div className={debugStyles.debugSmall}>center: {n.center ? n.center.map(v => v.toFixed(2)).join(', ') : '—'}</div>
            <div className={debugStyles.debugSmall}>size: {n.size ? n.size.map(v => v.toFixed(2)).join(', ') : '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}