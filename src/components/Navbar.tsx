import { Navbar as FlowbiteNavbar } from "flowbite-react";

export const Navbar: React.FC<{}> = (props) => {
  return (
    <FlowbiteNavbar fluid={true} rounded={true}>
      <FlowbiteNavbar.Brand href="#">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          detool
        </span>
      </FlowbiteNavbar.Brand>
      <FlowbiteNavbar.Toggle />
      <FlowbiteNavbar.Collapse>
        <FlowbiteNavbar.Link href="#" active={true} children={"Home"} />
        {/* <FlowbiteNavbar.Link href="#" children={"Services"} /> */}
        {/* <FlowbiteNavbar.Link href="#" children={"Pricing"} /> */}
        {/* <FlowbiteNavbar.Link href="#" children={"Contact"} /> */}
      </FlowbiteNavbar.Collapse>
    </FlowbiteNavbar>
  );
};
