import styles from '../css/RoomLayout.module.css';

export default function RoomLayout({ rooms, onRoomClick, buildingId, floorName }) {
  return (
    <div className={styles.roomLayout}>
      <div className={styles.roomsContainer}>
        {rooms.map((room, index) => (
          <div
            key={index}
            className={styles.room}
            onClick={(e) => {
              e.stopPropagation();
              if (onRoomClick) onRoomClick({ buildingId, floorName, roomName: room.name });
            }}
            style={{ cursor: onRoomClick ? 'pointer' : 'default' }}
            title={room.name}
          >
            <div className={`${styles.box} ${room.size === 'large' ? styles.boxLarge : room.size === 'small' ? styles.boxSmall : ''}`} />
            <span className={styles.roomName}>{room.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}