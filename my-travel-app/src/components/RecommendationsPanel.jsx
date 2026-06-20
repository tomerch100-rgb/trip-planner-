import React from 'react';

export default function RecommendationsPanel({ recommendations, onAddToTrip }) {
  // If there are no recommendations, do not render anything
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '2px solid #fbbf24',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 10px 15px -3px rgba(251, 191, 36, 0.2)',
        position: 'sticky',
        top: '20px',
        width: '100%',
        boxSizing: 'border-box',
        textAlign: 'left'
      }} 
      dir="ltr"
    >
      
      {/* Golden Header */}
      <div style={{ marginBottom: '15px', borderBottom: '1px solid #fde68a', paddingBottom: '10px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#78350f', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🌟</span> Recommended for you
        </h3>
        <p style={{ fontSize: '12px', color: '#92400e', marginTop: '4px', fontWeight: '500', margin: '4px 0 0 0' }}>
          Based on your previous trips
        </p>
      </div>

      {/* Recommended Attractions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {recommendations.map(attr => (
          <div 
            key={attr.id} 
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '12px',
              boxSizing: 'border-box',
              transition: 'all 0.2s'
            }}
          >
            <h4 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '14px', margin: '0 0 8px 0' }}>
              {attr.name}
            </h4>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span style={{ backgroundColor: '#fef3c7', color: '#78350f', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                {attr.default_price ? `${attr.default_price} ₪` : 'Free'}
              </span>
              {attr.rating > 0 && (
                <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  ⭐ {attr.rating}
                </span>
              )}
            </div>

            <button
              onClick={() => onAddToTrip(attr)}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #f59e0b, #d97706)',
                color: '#fff',
                border: 'none',
                padding: '8px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              + Add to Trip
            </button>
            
          </div>
        ))}
      </div>
    </div>
  );
}