import React from 'react';

interface ExampleWidgetProps {
  data: {
    title: string;
    description: string;
    items?: string[];
  };
  onAction: (action: { type: string; data: unknown }) => void;
}

export function ExampleWidget({ data, onAction }: ExampleWidgetProps) {
  return (
    <div style={{
      padding: '16px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      margin: '8px 0',
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
        {data.title}
      </h3>
      <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>
        {data.description}
      </p>
      {data.items && (
        <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
          {data.items.map((item, i) => (
            <li key={i} style={{ fontSize: '14px', marginBottom: '4px' }}>{item}</li>
          ))}
        </ul>
      )}
      <button
        onClick={() => onAction({ type: 'example_action', data: { widgetTitle: data.title } })}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Take Action
      </button>
    </div>
  );
}
