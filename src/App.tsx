import { AppLayout } from "./components/AppLayout";
import { Person } from "./models/Person";
import { trpc } from "./utils/trpc";
import { TableAndModalPage } from "./detool-api/TableAndModalPage";

export default function App() {
  // FIXME `as any` types issue with trpc internals
  return (
    <AppLayout>
      <TableAndModalPage model={Person} crud_api={trpc.model_instance as any} />
    </AppLayout>
  );
}