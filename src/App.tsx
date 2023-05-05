import React from "react";
import { Person } from "./models/Person";
import { trpc } from "./utils/trpc";
import { TableAndModalPage } from "./detool-api/TableAndModalPage";

import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Company } from "./models/Company";

export default function App() {
  const models = [
    {model: Person, api: trpc.model_instance},
    {model: Company, api: trpc.company}
  ]
  const [selectedModel, setSelectedModel] = React.useState<typeof models[number]>(models[0]);

  return (
    <div className="flex flex-col md:h-screen">
      <Navbar />

      <div className="md:flex-fit md:flex md:flex-grow md:flex-row md:overflow-y-auto">
        <Sidebar models={models} label={m => m.model.name} onClick={(model) => {
          setSelectedModel(model);
        }} />
        <div className="flex-grow overflow-y-auto p-4">
          {/* FIXME: `as any` types issue with trpc internals */}
          <TableAndModalPage model={selectedModel.model} crud_api={selectedModel.api as any} />
        </div>
      </div>

      <Footer />
    </div>
  );
}