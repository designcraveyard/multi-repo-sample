/**
 * Example custom widget rendered inside the ChatKit conversation.
 *
 * Widgets receive data from tool calls and can dispatch actions
 * back through the onAction handler.
 */
export function ExampleWidget({ data }: { data: Record<string, unknown> }) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
      }}
    >
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
        Widget Output
      </h4>
      <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
