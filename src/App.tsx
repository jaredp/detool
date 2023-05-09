import React from "react";
import { Person } from "./models/Person";
import { TableAndModalPage } from "./detool-api/TableAndModalPage";
import { ListDetailPage } from "./detool-api/ListDetailPage";
import { Navbar as FlowbiteNavbar } from "flowbite-react";

import { Sidebar } from "./components/Sidebar";
import { Company } from "./models/Company";
import { Post } from "./models/Post";

const Pages: [string, React.ReactElement][] = [
  ["Person", <ListDetailPage model={Person} />],
  ["Company", <div className="p-4"><TableAndModalPage model={Company} /></div>],
  ["Post", <div className="p-4"><TableAndModalPage model={Post} /></div>],
];

export default function App() {
  const [selectedPageIndex, setSelectedPageIndex] = React.useState<number>(0);

  return (
    <div className="flex flex-col md:h-screen">
      <div className="md:flex-fit md:flex md:flex-grow md:flex-row md:overflow-y-auto">
        <div className="w-fit border-r flex flex-col md:h-screen select-none">
          <FlowbiteNavbar.Brand href="#" className="p-6 pb-0">
            <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
              detool
            </span>
          </FlowbiteNavbar.Brand>

          <Sidebar
            selectedPageIndex={selectedPageIndex}
            tabs={Pages}
            label={(p) => p[0]}
            onClick={(pageIndex) => {
              setSelectedPageIndex(pageIndex);
            }}
          />
        </div>

        <div className="relative flex-grow overflow-y-auto">
          {Pages[selectedPageIndex][1]}
        </div>
      </div>

    </div>
  );
}
