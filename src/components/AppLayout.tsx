import { listModelNames } from "../detool-api/model";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const AppLayout: React.FC<{ body: React.ReactNode }> = (props) => {
  // TODO more configuration
  const models = listModelNames();
  return (
    <div className="flex flex-col md:h-screen">
      <Navbar />
      <div className="md:flex-fit md:flex md:flex-grow md:flex-row md:overflow-y-auto">
        <Sidebar models={models} />
        <div className="flex-grow overflow-y-auto p-4">{props.body}</div>
      </div>

      <Footer />
    </div>
  );
};
