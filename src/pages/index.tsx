import { useState, useEffect } from "react";
import CreateReactAppEntryPoint from "../App";
import React from "react";
import { Loading } from "../components/Loading";

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return <CreateReactAppEntryPoint />;
}

export default App;
