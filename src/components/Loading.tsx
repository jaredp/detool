import { PulseMultiple } from "react-svg-spinners";

export const Loading: React.FC<{}> = (props) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <PulseMultiple width={48} height={48} />
      <p style={{ color: "gray" }}>Loading...</p>
    </div>
  );
};
