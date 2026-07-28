import { CreateUserDialog } from "@/features/users/components/add-user-button";
import { UserList } from "@/features/users/components/data-table/user-list";

const UserPage = () => {
  return (
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>

            <p className="mt-1 text-muted-foreground">
              Manage users information in your inventory
            </p>
          </div>
          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <CreateUserDialog/>
          </div>
        </div>
        <UserList />
      </div>
  );
};

export default UserPage;
