import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const AppLayout: React.FC<{ body: React.ReactNode }> = (props) => {
  return (
    <div className="flex flex-col  md:h-screen">
      <Navbar />
      <div className="md:flex md:flex-row  md:flex-fit md:overflow-y-auto">
        <Sidebar />
        <div className="flex-grow overflow-y-auto">{props.body}</div>
      </div>

      <Footer />
    </div>
  );
};
