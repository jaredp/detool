import { Sidebar as FlowbiteSidebar } from "flowbite-react";
import { TableCellsIcon } from "@heroicons/react/24/solid";

export function Sidebar<T>(props: {
  tabs: T[];
  label: (model: T) => string;
  onClick: (pageIndex: number) => void;
  selectedPageIndex: number | null;
}): React.ReactElement {
  return (
    <FlowbiteSidebar aria-label="FlowbiteSidebar with call to action button example">
      <FlowbiteSidebar.Items>
        <FlowbiteSidebar.ItemGroup>
          {props.tabs.map((model, index) => (
            <FlowbiteSidebar.Item
              href="#"
              active={props.selectedPageIndex === index}
              icon={TableCellsIcon}
              key={props.label(model)}
              onClick={() => {
                props.onClick(index);
              }}
            >
              {props.label(model)}
            </FlowbiteSidebar.Item>
          ))}
        </FlowbiteSidebar.ItemGroup>
      </FlowbiteSidebar.Items>
    </FlowbiteSidebar>
  );
}
