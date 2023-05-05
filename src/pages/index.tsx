import { useState, useEffect } from "react";
import { TableAndModalPage } from "../detool-api/TableAndModalPage";
import React from "react";
import { Loading } from "../components/Loading";
import { AppLayout } from "../components/AppLayout";
import { Person } from "../models/Person";
import { trpc } from "../utils/trpc";

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  // FIXME `as any` types issue with trpc internals
  return (
    <AppLayout>
      <TableAndModalPage model={Person} crud_api={trpc.model_instance as any} />
    </AppLayout>
  );
}

export default App;
