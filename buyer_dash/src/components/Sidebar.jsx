import styles from '../css/Sidebar.module.css';
import NodesPanel from './NodesPanel';

const sampleData = [
  {
    id: 1,
    title: 'Luxury Tower A',
    location: 'Building A',
    price: '$250,000',
  
    floors: [
      { name: 'Floor 15 - Unit A1' },
      { name: 'Floor 15 - Unit A2' },
      { name: 'Floor 15 - Unit A3' },
      { name: 'Floor 15 - Unit A4' }
    ],
    modelPath: '/src/assets/tower_house_design.glb'
  },
  {
    id: 2,
    title: 'Family Block B',
    location: 'Building B',
    price: '$180,000',
    
    floors: [
      { name: 'Floor 12 - Unit B1', status: 'Sold' },
      { name: 'Floor 12 - Unit B2', status: 'Sold' },
      { name: 'Floor 12 - Unit B3', status: 'Available' }
    ],
    modelPath: '/src/assets/tower_house_design.glb'
  },
  {
    id: 3,
    title: 'Premium Block C',
    location: 'Building C',
    price: '$350,000',
  
    floors: [
      { name: 'Floor 20 - Unit C1', status: 'Sold' },
      { name: 'Floor 20 - Unit C2', status: 'Available' },
      { name: 'Floor 20 - Unit C3', status: 'Available' }
    ],
    modelPath: '/src/assets/tower_house_design.glb'
  },
  {
    id: 4,
    title: 'Studio Block D',
    location: 'Building D',
    price: '$120,000',
   
    floors: [
      { name: 'Floor 8 - Unit D1' },
      { name: 'Floor 8 - Unit D2' },
      {name :'Floor 8 - Unit D3'}
    ],
    modelPath: '/src/assets/tower_house_design.glb'
  }
].map(item => ({
  ...item,
  onClick: () => console.log(`Selected apartment group: ${item.title}`)
}));

export default function Sidebar({ onSelect, gltfRef, onNodeSelect, selectedNode, modelLoaded }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sectionHeader}>Building Nodes</div>
      <NodesPanel 
        gltfRef={gltfRef}
        onNodeSelect={onNodeSelect}
        selectedNode={selectedNode}
        modelLoaded={modelLoaded}
      />
      {sampleData.map((item) => (
        <div key={item.id} className={styles.row} onClick={item.onClick}>
          <div className="meta">
            <div className={styles.column}>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.subtitle}>{item.location}</p>
            </div>
            <div className={styles.column}>
              <p className={styles.value}>{item.price}</p>
              <p className={styles.subtitle}>{item.status}</p>
            </div>
          </div>

          <div className={styles.floorsContainer}>
            {item.floors && item.floors.length > 0 ? (
              item.floors.map((floor, idx) => {
                const floorStatus = floor.status || 'Available';
                const isSold = floorStatus === 'Sold' || floorStatus === 'Reserved';
                return (
                  <div
                    key={idx}
                    className={`${styles.floorCard} ${isSold ? styles.sold : styles.available}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isSold && onSelect) {
                        onSelect({ buildingId: item.id, floorName: floor.name });
                      }
                    }}
                    title={isSold ? 'Sold/Reserved' : 'Available - Click to view'}
                  >
                    <div className={styles.floorLabel}>{floor.name}</div>
                    <div className={styles.statusLabel}>
                      {isSold ? 'SOLD' : 'AVAILABLE'}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.floorCard}>
                <div className={styles.floorLabel}>No floors available</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}