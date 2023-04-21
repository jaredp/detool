import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const AppLayout: React.FC<{ body: React.ReactNode }> = (props) => {
  return (
    <div className="flex flex-col md:h-screen">
      <Navbar />
      <div className="md:flex-fit md:flex md:flex-grow md:flex-row md:overflow-y-auto">
        <Sidebar />
        <div className="flex-grow overflow-y-auto p-4">{props.body}</div>
      </div>

      <Footer />
    </div>
  );
};
