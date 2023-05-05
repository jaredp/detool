import { useState, useEffect } from "react";
import React from "react";
import { Loading } from "../components/Loading";
import SpaRoot from "../App";

// avoid server rendering complexity by not rendering anything until
// the app is mounted.
// The server will simply render the <Loading /> component

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return <SpaRoot />;
}

export default App;
