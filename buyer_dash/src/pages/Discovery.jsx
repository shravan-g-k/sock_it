import { useState } from 'react';
import styles from '../css/Discovery.module.css';

const nearbyProperties = [
  {
    id: 1,
    name: 'Modern Luxury Apartments',
    address: '123 Downtown Street, City Center',
    distance: '0.5 km away',
    price: '$320,000',
    bedrooms: 3,
    bathrooms: 2,
    area: '1,250 sq ft',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    features: ['Parking', 'Gym', 'Pool', 'Security'],
    availableFloors: 8
  },
  {
    id: 2,
    name: 'Riverside Towers',
    address: '456 River Road, Riverside',
    distance: '1.2 km away',
    price: '$280,000',
    bedrooms: 2,
    bathrooms: 2,
    area: '980 sq ft',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    features: ['Parking', 'Gym', 'Balcony', 'Elevator'],
    availableFloors: 5
  },
  {
    id: 3,
    name: 'Green Valley Residences',
    address: '789 Park Avenue, Green Valley',
    distance: '2.1 km away',
    price: '$250,000',
    bedrooms: 2,
    bathrooms: 1,
    area: '850 sq ft',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    features: ['Parking', 'Garden', 'Security'],
    availableFloors: 3
  },
  {
    id: 4,
    name: 'City Heights Complex',
    address: '321 Main Boulevard, City Heights',
    distance: '1.8 km away',
    price: '$295,000',
    bedrooms: 3,
    bathrooms: 2,
    area: '1,100 sq ft',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
    features: ['Parking', 'Gym', 'Pool', 'Security', 'Concierge'],
    availableFloors: 6
  },
  {
    id: 5,
    name: 'Sunset View Apartments',
    address: '654 Sunset Drive, Westside',
    distance: '3.0 km away',
    price: '$270,000',
    bedrooms: 2,
    bathrooms: 2,
    area: '920 sq ft',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400',
    features: ['Parking', 'Balcony', 'Security'],
    availableFloors: 4
  },
  {
    id: 6,
    name: 'Ocean Breeze Residences',
    address: '987 Coastal Way, Beachside',
    distance: '4.5 km away',
    price: '$350,000',
    bedrooms: 3,
    bathrooms: 3,
    area: '1,400 sq ft',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400',
    features: ['Parking', 'Gym', 'Pool', 'Beach Access', 'Concierge'],
    availableFloors: 10
  }
];

export default function Discovery() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filter, setFilter] = useState('all'); // all, nearby, price-low, price-high

  const filteredProperties = nearbyProperties.filter(property => {
    if (filter === 'nearby') {
      const distance = parseFloat(property.distance.split(' ')[0]);
      return distance <= 2.0;
    }
    return true;
  }).sort((a, b) => {
    if (filter === 'price-low') {
      return parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, ''));
    }
    if (filter === 'price-high') {
      return parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, ''));
    }
    return 0;
  });

  return (
    <div className={styles.discoveryContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Discover Nearby Properties</h1>
        <p className={styles.subtitle}>Find your perfect home in the area</p>
      </div>

      <div className={styles.filters}>
        <button 
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All Properties
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'nearby' ? styles.active : ''}`}
          onClick={() => setFilter('nearby')}
        >
          Within 2 km
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'price-low' ? styles.active : ''}`}
          onClick={() => setFilter('price-low')}
        >
          Price: Low to High
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'price-high' ? styles.active : ''}`}
          onClick={() => setFilter('price-high')}
        >
          Price: High to Low
        </button>
      </div>

      <div className={styles.propertiesGrid}>
        {filteredProperties.map((property) => (
          <div 
            key={property.id} 
            className={styles.propertyCard}
            onClick={() => setSelectedProperty(property)}
          >
            <div className={styles.imageContainer}>
              <img 
                src={property.image} 
                alt={property.name}
                className={styles.propertyImage}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Property+Image';
                }}
              />
              <div className={styles.distanceBadge}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {property.distance}
              </div>
              <div className={styles.statusBadge}>
                {property.status}
              </div>
            </div>
            
            <div className={styles.propertyInfo}>
              <h3 className={styles.propertyName}>{property.name}</h3>
              <p className={styles.propertyAddress}>{property.address}</p>
              
              <div className={styles.propertyDetails}>
                <div className={styles.detailItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>{property.bedrooms} Bed</span>
                </div>
                <div className={styles.detailItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  <span>{property.bathrooms} Bath</span>
                </div>
                <div className={styles.detailItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M9 9h6v6H9z"/>
                  </svg>
                  <span>{property.area}</span>
                </div>
              </div>

              <div className={styles.features}>
                {property.features.slice(0, 3).map((feature, idx) => (
                  <span key={idx} className={styles.featureTag}>{feature}</span>
                ))}
                {property.features.length > 3 && (
                  <span className={styles.featureTag}>+{property.features.length - 3}</span>
                )}
              </div>

              <div className={styles.propertyFooter}>
                <div className={styles.price}>
                  <span className={styles.priceLabel}>Starting from</span>
                  <span className={styles.priceValue}>{property.price}</span>
                </div>
                <button className={styles.viewBtn}>
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProperty && (
        <div className={styles.modal} onClick={() => setSelectedProperty(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedProperty(null)}>
              ×
            </button>
            <img 
              src={selectedProperty.image} 
              alt={selectedProperty.name}
              className={styles.modalImage}
            />
            <div className={styles.modalInfo}>
              <h2>{selectedProperty.name}</h2>
              <p className={styles.modalAddress}>{selectedProperty.address}</p>
              <p className={styles.modalDistance}>{selectedProperty.distance}</p>
              
              <div className={styles.modalDetails}>
                <div className={styles.modalDetailRow}>
                  <span>Bedrooms:</span>
                  <span>{selectedProperty.bedrooms}</span>
                </div>
                <div className={styles.modalDetailRow}>
                  <span>Bathrooms:</span>
                  <span>{selectedProperty.bathrooms}</span>
                </div>
                <div className={styles.modalDetailRow}>
                  <span>Area:</span>
                  <span>{selectedProperty.area}</span>
                </div>
                <div className={styles.modalDetailRow}>
                  <span>Available Floors:</span>
                  <span>{selectedProperty.availableFloors}</span>
                </div>
                <div className={styles.modalDetailRow}>
                  <span>Price:</span>
                  <span className={styles.modalPrice}>{selectedProperty.price}</span>
                </div>
              </div>

              <div className={styles.modalFeatures}>
                <h3>Features:</h3>
                <div className={styles.featuresList}>
                  {selectedProperty.features.map((feature, idx) => (
                    <span key={idx} className={styles.featureTag}>{feature}</span>
                  ))}
                </div>
              </div>

              <button className={styles.contactBtn}>
                Contact Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

