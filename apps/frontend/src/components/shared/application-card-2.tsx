import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import MyButton from "./my-button";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";
import ApplicationStatusCard from "./application-status-card";

interface ApplicationCard2Props {
  applicationId: string;
  amount: string;
  dueDate: string;
  faculty: string;
  paymentStatus: "Pending payment" | "Paid";
  vacancyId : string;
  applicationStatus:
    | "submitted"
    | "paid"
    | "reviewed"
    | "rejected"
    | "approved"
    | "document-verified"
    | "cancelled";
  onViewDetails?: () => void;
}

const ApplicationCard2 = ({
  applicationId,
  amount,
  dueDate,
  paymentStatus,
  applicationStatus,
  onViewDetails,
  faculty,
  vacancyId
}: ApplicationCard2Props) => {
  return (
    <Card className="bg-transparent text-text p-2 rounded-[12px] border-[1px] border-secondary/50 hover:bg-white transition-all duration-400 hover:shadow hover:shadow-secondary">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-3">
          <div className=" text-[18px] font-[700] leading-[27px]">
            {applicationId}
          </div>
          <div className=" text-[20px] font-[600] leading-[30px]">
            {faculty}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className=" font-[600] text-[14px] leading-[21px]">
            {dueDate}
          </span>
          <span className=" font-[700] text-[16px] leading-[24px]">
            {amount} NPR
          </span>
        </div>
      </div>

      <div className="mt-4 flex lg:flex-row  flex-col justify-between font-[600] text-[14px] leading-[21px]">
        <div>
          Payment:
          <span
            className={cn(
              "ml-1",
              paymentStatus === "Pending payment" && "text-[#DC2626]"
            )}
          >
            {paymentStatus}
          </span>
        </div>
      </div>

      <div className="flex flex-col   font-[600] text-[14px] leading-[21px] mt-4">
        <div className="flex items-center gap-4">
          <div>
            Application Status:
            <span
              className={cn(
                "ml-1",
                applicationStatus === "submitted" && "text-red-500"
              )}
            >
              {applicationStatus}
            </span>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <MyButton
              label="View Details"
              onClick={onViewDetails}
              className="h-9"
            />
          </DialogTrigger>
          <DialogContent>
            <ApplicationStatusCard
              amount={amount}
              applicationNumber={applicationId}
              applicationStatus={applicationStatus}
              departmentName={faculty}
              vacancyId={vacancyId}
              applicationId={applicationId}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default ApplicationCard2;
