import React from "react";
import { Person } from "./models/Person";
import { trpc } from "./utils/trpc";
import { TableAndModalPage } from "./detool-api/TableAndModalPage";

import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Company } from "./models/Company";


const Pages: [string, React.ReactElement][] = [
  // FIXME: `as any` types issue with trpc internals
  ["Person", <TableAndModalPage model={Person} crud_api={trpc.model_instance as any} />],
  ["Company", <TableAndModalPage model={Company} crud_api={trpc.company as any} />],
]

export default function App() {
  const [selectedPage, setSelectedPage] = React.useState<typeof Pages[number]>(Pages[0]);

  return (
    <div className="flex flex-col md:h-screen">
      <Navbar />

      <div className="md:flex-fit md:flex md:flex-grow md:flex-row md:overflow-y-auto">
        <Sidebar tabs={Pages} label={p => p[0]} onClick={(page) => {
          setSelectedPage(page);
        }} />
        <div className="flex-grow overflow-y-auto p-4">
          { selectedPage[1] }
        </div>
      </div>

      <Footer />
    </div>
  );
}