import React from "react";
import { Person } from "./models/Person";
import { TableAndModalPage } from "./detool-api/TableAndModalPage";
import { ListDetailPage } from "./detool-api/ListDetailPage";

import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Company } from "./models/Company";
import { Post } from "./models/Post";

const Pages: [string, React.ReactElement][] = [
  ["Person", <ListDetailPage model={Person} />],
  ["Company", <TableAndModalPage model={Company} />],
  ["Post", <TableAndModalPage model={Post} />],
];

export default function App() {
  const [selectedPageIndex, setSelectedPageIndex] = React.useState<number>(0);

  return (
    <div className="flex flex-col md:h-screen">
      <Navbar />

      <div className="md:flex-fit md:flex md:flex-grow md:flex-row md:overflow-y-auto">
        <Sidebar
          selectedPageIndex={selectedPageIndex}
          tabs={Pages}
          label={(p) => p[0]}
          onClick={(pageIndex) => {
            setSelectedPageIndex(pageIndex);
          }}
        />
        <div className="relative flex-grow overflow-y-auto">
          {Pages[selectedPageIndex][1]}
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
}
