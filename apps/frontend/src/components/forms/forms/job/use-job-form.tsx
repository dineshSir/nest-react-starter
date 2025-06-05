import { Fetch } from "@/lib/fetcher";
import { handleResponseError } from "@/lib/handle-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type JobFormType, JobSchema } from "./job-schema";

const useJobForm = (jobId?: string, dialogClose?: () => void) => {
  interface JobData {
    data: JobFormType;
  }
  const queryClient = useQueryClient();

  async function fetchJob(): Promise<JobFormType> {
    const res = await Fetch<JobData>({
      method: "GET",
      url: `/job-positions/${jobId}`,
    });
    return res.data;
  }
  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJob(),
    enabled: !!jobId,
  });

  const jobForm = useForm<JobFormType>({
    resolver: zodResolver(JobSchema),
    values: {
      title: job?.title || "",
      department: job?.department || "",
      description: job?.description || "",
      educationRequirement: job?.educationRequirement || "",
      experience: job?.experience || "",
      experienceYears: job?.experienceYears!,
      skills: job?.skills || "",
      responsibilities: job?.responsibilities || "",
      minimumAge: job?.minimumAge!,
      maximumAge: job?.maximumAge!,
      additionalRequirements: job?.additionalRequirements || "",
    },
  });
  const reset = jobForm.reset;

  const control = jobForm.control;
  const resetForm = () => {
    reset({
      title: job?.title || "",
      department: job?.department || "",
      description: job?.description || "",
      educationRequirement: job?.educationRequirement || "",
      experience: job?.experience || "",
      experienceYears: job?.experienceYears!,
      skills: job?.skills || "",
      responsibilities: job?.responsibilities || "",
      minimumAge: job?.minimumAge!,
      maximumAge: job?.maximumAge!,
      additionalRequirements: job?.additionalRequirements || "",
    });
  };

  const createJob = useMutation({
    mutationFn: async (job: JobFormType) => {
      await Fetch<object>({
        method: jobId ? "PATCH" : "POST",
        url: jobId ? `/job-positions/${jobId}` : "job-positions",
        data: job,
      })
        .then(() => {
          if (jobId) {
            toast.success("Job updated Successfully");
          } else {
            toast.success("Job created Successfully");
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            resetForm();
          }
          if (dialogClose) {
            dialogClose();
          }
          queryClient.invalidateQueries({ queryKey: ["jobs"] });
        })
        .catch((err) => handleResponseError(err, jobForm));
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
  const onSubmit = jobForm.handleSubmit((data) => {
    createJob.mutate(data);
  });
  const deleteJob = useMutation({
    mutationFn: async () => {
      return Fetch({
        url: `/job-positions/${jobId}`,
        method: "DELETE",
      }).then(() => {
        toast.success("user deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
      });
    },
  });
  const onDelete = () => {
    deleteJob.mutate();
  };
  return {
    job,
    jobForm,
    resetForm,
    onSubmit,
    control,
    isLoading,
    isPending: createJob.isPending,
    isError,
    onDelete,
  };
};

export default useJobForm;
