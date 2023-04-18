export const Row: React.FC<{ c: React.ReactNode[] }> = (props) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
      {props.c.map((child, i) => (
        <div
          key={i}
          style={{ flex: 1, /*border: '1px solid #DDD',*/ padding: "1em 0" }}
          children={child}
        />
      ))}
    </div>
  );
};
