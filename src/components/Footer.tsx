import { Footer as FlowbiteFooter } from "flowbite-react";

export const Footer: React.FC<{}> = (props) => {
  return (
    <FlowbiteFooter container={true}>
      <FlowbiteFooter.Copyright
        href="#"
        by="detool"
        year={new Date().getFullYear()}
      />
      <FlowbiteFooter.LinkGroup>
        {/* <FlowbiteFooter.Link href="#" children={"About"} /> */}
        <FlowbiteFooter.Link href="#" children={"Privacy"} />
        <FlowbiteFooter.Link href="#" children={"Terms"} />
        <FlowbiteFooter.Link href="#" children={"Contact"} />
      </FlowbiteFooter.LinkGroup>
    </FlowbiteFooter>
  );
};
