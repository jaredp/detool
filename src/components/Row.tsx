import React from "react";

export const Row: React.FC<{ c: React.ReactNode[] }> = (props) => {
  return (
    <div className="flex flex-row gap-4">
      {props.c.map((child, i) => (
        <React.Fragment key={i} children={child} />
      ))}
    </div>
  );
};
