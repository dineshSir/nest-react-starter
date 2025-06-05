import JobForm from "@/components/forms/forms/job/job-form";
import type { JobFormType } from "@/components/forms/forms/job/job-schema";
import useJobForm from "@/components/forms/forms/job/use-job-form";
import FormGroupLabel from "@/components/shared/form-group-label";
import MyButton from "@/components/shared/my-button";
import Mysheet from "@/components/shared/my-sheet";
import { DataTable } from "@/components/table/table-component/data-table";
import { Fetch } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import MyDeleteButton from "../shared/delete-button";
import { Edit } from "lucide-react";

const columns: ColumnDef<JobFormType>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "title",
    header: "Job Title",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "experienceYears",
    header: "Experience (Years)",
  },
  {
    accessorKey: "educationRequirement",
    header: "Education",
  },
  {
    accessorKey: "skills",
    header: "Skills",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      const { onDelete } = useJobForm(row.original.id);
      console.log(open);
      return (
        <div className="flex gap-2">
          <Mysheet
            open={open}
            setOpen={setOpen}
            openButton={<Edit className="h-4 w-4 text-primary" />}
          >
            <JobForm
              jobId={row.original.id}
              dialogClose={() => setOpen(false)}
            />
          </Mysheet>
          <MyDeleteButton name={row.original.title} onClick={onDelete} />
        </div>
      );
    },
  },
];

const JobTable = () => {
  const { data } = useQuery<{ data: JobFormType[] }>({
    queryKey: ["jobs"],
    queryFn: () =>
      Fetch({
        method: "GET",
        url: `/job-positions`,
      }),
  });
  const [open, setOpen] = useState(false);
  return (
    <div className="">
      <div className="flex items-center justify-between gap-4">
        <FormGroupLabel label="Job Management" />
        <Mysheet
          open={open}
          setOpen={setOpen}
          openButton={
            <MyButton label="Create New Position" plusIcon className="mb-4" />
          }
        >
          <JobForm dialogClose={() => setOpen(false)} />
        </Mysheet>
      </div>
      <DataTable columns={columns} data={data?.data ?? []} />
    </div>
  );
};

export default JobTable;
