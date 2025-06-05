import FormGroupLabel from "@/components/shared/form-group-label";
import MyButton from "@/components/shared/my-button";
import { Form } from "@/components/ui/form";
import { TextInput } from "../../form-components/text-input";
import useJobForm from "./use-job-form";
import LoadingSpinner from "@/components/shared/loader";

const JobForm = ({
  jobId,
  dialogClose,
}: {
  jobId?: string;
  dialogClose?: () => void;
}) => {
  const { jobForm, onSubmit, isLoading, resetForm, control, isPending } =
    useJobForm(jobId, dialogClose);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Form {...jobForm}>
      <form onSubmit={onSubmit}>
        <FormGroupLabel label={jobId ? "Update Job" : "Create New Job"} />
        <div className="max-h-[80dvh] overflow-scroll grid-cols-1 place-content-start place-items-end grid  gap-2 px-1">
          <TextInput control={control} name="title" label="Job Title" />
          <TextInput control={control} name="department" label="Department" />
          <TextInput control={control} name="description" label="Description" />
          <TextInput
            control={control}
            name="educationRequirement"
            label="Education Requirement"
          />
          <TextInput control={control} name="experience" label="Experience" />
          <TextInput
            control={control}
            name="experienceYears"
            label="Experience Years"
            type="number"
          />
          <TextInput control={control} name="skills" label="Skills" />
          <TextInput
            control={control}
            name="responsibilities"
            label="Responsibilities"
          />
          <TextInput
            control={control}
            name="minimumAge"
            label="Minimum Age"
            type="number"
          />
          <TextInput
            control={control}
            name="maximumAge"
            label="Maximum Age"
            type="number"
          />
          <TextInput
            control={control}
            name="additionalRequirements"
            label="Additional Requirements"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <MyButton
            label="Reset"
            className="bg-primary hover:bg-primary/50"
            type="reset"
            onClick={resetForm}
          />
          <MyButton label="Save" loading={isPending} loadingLabel="Saving" />
        </div>
      </form>
    </Form>
  );
};

export default JobForm;
