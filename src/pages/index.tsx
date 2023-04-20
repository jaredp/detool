import { useState, useEffect } from "react";
import CreateReactAppEntryPoint from "../App";
import React from "react";
import { PulseMultiple } from "react-svg-spinners";

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <PulseMultiple width={48} height={48} />
        <p style={{ color: "gray" }}>Loading...</p>
      </div>
    );
  }

  return <CreateReactAppEntryPoint />;
}

export default App;
