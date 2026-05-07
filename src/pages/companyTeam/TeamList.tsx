import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetTeam, useDeleteTeam } from "@/features/api/companyTeam";
import TableData from "@/components/shared/DataTable/DataTable";
import SearchInput from "@/components/shared/SearchInput";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import TeamAddFormModal from "./TeamAddFormModal";

import { format } from "date-fns";

export default function TeamList() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { data: teamRes, isLoading } = useGetTeam({
    filter: paginationFilter,
  });
  const deleteTeam = useDeleteTeam();

  const handleOpenAddModal = (team: Team | null = null) => {
    setEditingTeam(team);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTeam(null);
  };

  const handleDelete = (row: Team) => {
    // eslint-disable-next-line no-alert
    if (window.confirm("Are you sure you want to delete this team?")) {
      deleteTeam.mutate(row?.teamId || "");
    }
  };

  const visibleColumns = {
    srNo: "Sr No",
    teamName: "Team Name",
    createdAt: "Created Date",
    positions: "Positions",
  };

  // Format table data if necessary
  const tableData =
    teamRes?.data?.map((item: Team, index: number) => ({
      ...item,
      srNo:
        ((paginationFilter.currentPage || 1) - 1) *
          (paginationFilter.pageSize || 25) +
        index +
        1,
      createdAt: item.createdAt
        ? format(new Date(item.createdAt), "dd/MM/yyyy")
        : "-",
    })) || [];

  return (
    <div className="w-full px-2 overflow-x-auto sm:px-4 py-6">
      <div className="flex mb-5 justify-between items-center">
        <h1 className="font-semibold capitalize text-xl text-black">
          Team Organizations
        </h1>
        <div className="flex items-center space-x-5 tb:space-x-7">
          <Button
            onClick={() => handleOpenAddModal(null)}
            className="py-2 w-fit flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Team Organization
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-80"
          />
        </div>
      </div>

      <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
        <TableData
          tableData={tableData}
          columns={visibleColumns}
          primaryKey="teamId"
          onEdit={(row) => handleOpenAddModal(row)}
          onDelete={handleDelete}
          onRowClick={(row) => {
            navigate(`/dashboard/company-team/${row.teamId}`);
          }}
          paginationDetails={mapPaginationDetails(teamRes)}
          isLoading={isLoading}
          setPaginationFilter={setPaginationFilter}
          searchValue={paginationFilter?.search}
          permissionKey="teamId"
          moduleKey="TEAM"
          sortableColumns={["teamName"]}
          actionColumnWidth="w-[160px]"
          customActions={(row) => (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/dashboard/company-team/${row.teamId}`)}
            >
              View Chart
            </Button>
          )}
        />
      </div>

      {isAddModalOpen && (
        <TeamAddFormModal
          isModalOpen={isAddModalOpen}
          modalClose={handleCloseModal}
          modalData={editingTeam}
        />
      )}
    </div>
  );
}
