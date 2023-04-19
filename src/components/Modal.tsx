import { Modal as FlowbiteModal } from "flowbite-react";

export const Modal: React.FC<{
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
}> = (props) => {
  return (
    <FlowbiteModal
      dismissible={true}
      show={true}
      size="4xl"
      popup={true}
      onClose={props.onClose}
    >
      <FlowbiteModal.Header />
      <FlowbiteModal.Body children={props.children} />
    </FlowbiteModal>
  );
};
