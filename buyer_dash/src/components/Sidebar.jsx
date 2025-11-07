import styles from '../css/Sidebar.module.css';
import RoomLayout from './RoomLayout';
import NodesPanel from './NodesPanel';

const sampleData = [
  {
    id: 1,
    title: 'Luxury Tower A',
    location: 'Building A',
    price: '$250,000',
    status: 'Available',
    floors: [
      { name: 'Floor 15 - Unit A1', rooms: [ { name: 'Living Room', size: 'large' }, { name: 'Master Bed', size: 'large' }, { name: 'Bath', size: 'small' } ] },
      { name: 'Floor 15 - Unit A2', rooms: [ { name: 'Living Room', size: 'large' }, { name: 'Kitchen', size: 'medium' }, { name: 'Bedroom', size: 'medium' } ] },
      { name: 'Floor 15 - Unit A3', rooms: [ { name: 'Studio', size: 'large' }, { name: 'Kitchenette', size: 'small' }, { name: 'Bath', size: 'small' } ] },
      { name: 'Floor 14 - Unit A4', rooms: [ { name: 'Living Room', size: 'large' }, { name: 'Guest Room', size: 'medium' }, { name: 'Bath', size: 'small' } ] }
    ],
    modelPath: '/src/assets/tower_house_design.glb'
  },
  {
    id: 2,
    title: 'Family Block B',
    location: 'Building B',
    price: '$180,000',
    status: 'Available',
    floors: [
      { name: 'Floor 12 - Unit B1', rooms: [ { name: 'Living Room', size: 'large' }, { name: 'Kitchen', size: 'medium' }, { name: 'Bedroom 1', size: 'medium' } ] },
      { name: 'Floor 12 - Unit B2', rooms: [ { name: 'Living Room', size: 'large' }, { name: 'Bedroom 1', size: 'medium' }, { name: 'Bedroom 2', size: 'medium' } ] },
      { name: 'Floor 11 - Unit B3', rooms: [ { name: 'Living Room', size: 'large' }, { name: 'Kitchen', size: 'medium' }, { name: 'Bath', size: 'small' } ] }
    ],
    modelPath: '/src/assets/tower_house_design.glb'
  },
  {
    id: 3,
    title: 'Premium Block C',
    location: 'Building C',
    price: '$350,000',
    status: 'Reserved',
    floors: [
      { name: 'Floor 20 - Unit C1', rooms: [ { name: 'Living Room', size: 'large' }, { name: 'Kitchen', size: 'large' }, { name: 'Master Bed', size: 'large' } ] },
      { name: 'Floor 20 - Unit C2', rooms: [ { name: 'Living Room', size: 'large' }, { name: 'Guest Room', size: 'medium' }, { name: 'Bath 1', size: 'small' } ] },
      { name: 'Floor 19 - Unit C3', rooms: [ { name: 'Studio', size: 'large' }, { name: 'Kitchen', size: 'small' }, { name: 'Bath', size: 'small' } ] }
    ],
    modelPath: '/src/assets/tower_house_design.glb'
  },
  {
    id: 4,
    title: 'Studio Block D',
    location: 'Building D',
    price: '$120,000',
    status: 'Available',
    floors: [
      { name: 'Floor 8 - Unit D1', rooms: [ { name: 'Living/Bed', size: 'large' }, { name: 'Kitchen', size: 'small' }, { name: 'Bath', size: 'small' } ] },
      { name: 'Floor 8 - Unit D2', rooms: [ { name: 'Studio', size: 'large' }, { name: 'Kitchenette', size: 'small' }, { name: 'Bath', size: 'small' } ] }
    ],
    modelPath: '/src/assets/tower_house_design.glb'
  }
].map(item => ({
  ...item,
  onClick: () => console.log(`Selected apartment group: ${item.title}`)
}));

export default function Sidebar({ onSelect, gltfRef, onNodeSelect, selectedNode }) {
  return (
    <div className={styles.sidebar}>
      <NodesPanel 
        gltfRef={gltfRef}
        onNodeSelect={onNodeSelect}
        selectedNode={selectedNode}
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
            {item.floors.map((floor, idx) => (
              <div
                key={idx}
                className={styles.floorCard}
                onClick={(e) => {
                  e.stopPropagation();
                  // could open floor details; by default do nothing
                }}
              >
                <div className={styles.floorLabel}>{floor.name}</div>
                <RoomLayout
                  rooms={floor.rooms}
                  buildingId={item.id}
                  floorName={floor.name}
                  onRoomClick={(payload) => onSelect && onSelect({ buildingId: item.id, floorName: floor.name, roomName: payload.roomName })}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}