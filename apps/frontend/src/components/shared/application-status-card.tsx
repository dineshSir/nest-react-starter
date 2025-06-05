import { CircleCheck, CircleX, Clock, File } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import moment from "moment";
import MyButton from "./my-button";
import PaymentCard from "./payment-card";
import { useState } from "react";
import RecipientCard from "./recipent-card";
import DownloadAdmitCard from "./download-admit-card";
interface ApplicationStatusCardProps {
  applicationStatus:
    | "submitted"
    | "paid"
    | "reviewed"
    | "rejected"
    | "approved"
    | "document-verified"
    | "cancelled";
  applicationNumber: string;
  rejectionReason?: string;
  departmentName?: string;
  amount: string;
  vacancyId : string;
  applicationId : string;
}

const ApplicationStatusMeter = ({
  items,
  status,
  date = new Date().toISOString(),
}: {
  items: {
    name: string;
    label: string;
    description: string;
  }[];
  status: string;
  date?: string;
  amount?: string;
  paymentMethod?: string;
}) => {
  const submitted =
    status === "submitted" ||
    status === "paid" ||
    status === "reviewed" ||
    status === "document-verified" ||
    status === "approved" ||
    status === "rejected";
  const paid =
    status === "paid" ||
    status === "reviewed" ||
    status === "approved" ||
    status === "document-verified" ||
    status === "rejected";
  const documentVerified =
    status === "document-verified" ||
    status === "approved" ||
    status === "rejected";
  const reviewed =
    status === "reviewed" ||
    status === "approved" ||
    status === "document-verified" ||
    status === "rejected";
  const rejected = status === "rejected";
  const approved = status === "approved";

  return (
    <div className="">
      {items.map((item, index) => (
        <div key={index} className="flex flex-row ">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "bg-[#E5E7EB] w-6 h-6 rounded-full",
                item.name === "submitted" && submitted && "bg-green",
                item.name === "paid" && paid && "bg-green",
                item.name === "reviewed" && reviewed && "bg-green",
                item.name === "document-verified" &&
                  documentVerified &&
                  "bg-green",
                item.name === "approved" && approved && "bg-green",
                item.name === "approved" && rejected && "bg-red"
              )}
            >
              {(item.name === "submitted" && submitted) ||
              (item.name === "paid" && paid) ||
              (item.name === "reviewed" && reviewed) ||
              (item.name === "document-verified" && documentVerified) ||
              (item.name === "approved" && approved) ? (
                <CircleCheck className="text-white w-6 h-6" />
              ) : item.name === "approved" && rejected ? (
                <CircleX className="text-white w-6 h-6" />
              ) : (
                ""
              )}
            </div>
            {index < items.length - 1 && (
              <div className="bg-[#E5E7EB] h-12 w-1"></div>
            )}
          </div>
          <div className="ml-3 -mt-2">
            <div className="text-text text-sm font-[700] leading-5">
              {item.label}
              <span>
                {" "}
                {(item.name === "submitted" && submitted) ||
                (item.name === "paid" && paid) ||
                (item.name === "reviewed" && reviewed) ? (
                  <span className="text-green text-sm font-normal leading-5">
                    {moment(date).format("DD MMM YYYY HH:MM A")}
                  </span>
                ) : item.name === "document-verified" && documentVerified ? (
                  <span className="text-green text-sm font-normal leading-5">
                    Verified
                  </span>
                ) : item.name === "approved" && rejected ? (
                  <span className="text-red text-sm font-normal leading-5">
                    Rejected
                  </span>
                ) : item.name === "approved" && approved ? (
                  <span className="text-green text-sm font-normal leading-5">
                    Approved
                  </span>
                ) : (
                  ""
                )}
              </span>
            </div>
            <div className="text-[12px] text-text font-normal leading-4 font-open-sans">
              {item.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ApplicationStatusCard = ({
  applicationStatus,
  applicationNumber,
  rejectionReason,
  departmentName,
  amount,
  vacancyId,
  applicationId
}: ApplicationStatusCardProps) => {
  const [paymentOpen, setPaymentOpen] = useState<boolean>(false);
  const [recipientOpen, setRecipientOpen] = useState<boolean>(false);
  const [admitCardOpen, setAdmitCardOpen] = useState<boolean>(false);
  return (
    <div className="px-1 py-2 rounded-[12px] bg-white space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green/20 rounded-[8px]">
          <CircleCheck className="text-green w-6 h-6" />
        </div>
        <div className="flex flex-col ">
          <div className="text-text text-lg font-[700] leading-7">
            {applicationNumber}
          </div>
          <div className="text-text text-sm font-[600] leading-5">
            {departmentName}
          </div>
        </div>
      </div>

      <div className="p-3 flex items-center gap-3 bg-[#F9FAFB] rounded-[8px]">
        <div className="p-2 bg-primary/10 rounded-[6px] flex items-center justify-center">
          <File className="text-primary w-8 h-8" />
        </div>
        <div className="text-text text-[16px] font-[700] leading-5">
          Applications Details
        </div>
      </div>

      <Card className="p-3 rounded-[8px]">
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-[22px]">
            <Clock className="w-4 h-4" />
            <div
              className={cn(
                "text-sm font-[700] leading-6",
                applicationStatus === "approved" ? "text-green" : "text-red"
              )}
            >
              {applicationStatus === "submitted" || applicationStatus === "paid"
                ? "Application Pending"
                : applicationStatus === "reviewed" ||
                    applicationStatus === "document-verified"
                  ? "Under Review"
                  : applicationStatus === "approved"
                    ? "Application Approved"
                    : "Application Rejected"}
            </div>
          </div>

          <ApplicationStatusMeter
            items={[
              {
                name: "submitted",
                label: "Application Submitted",
                description: "Your application has been successfully submitted",
              },
              {
                name: "paid",
                label: "Payment Completed",
                description: `Payment of ${amount} NPR received via eSewa`,
              },
              {
                name: "reviewed",
                label: "Under Review",
                description: "Application is being reviewed ",
              },
              {
                name: "document-verified",
                label: "Document Verification",
                description: "Verification of submitted documents",
              },
              {
                name: "approved",
                label: "Final Approval",
                description: "Final review and approval of registration",
              },
            ]}
            status={applicationStatus}
          />

          {applicationStatus === "rejected" && rejectionReason && (
            <div className="p-3 space-y-2 bg-[#FEF2F2] text-[#991B1B] font-open-sans">
              <div className="flex flex-col gap-2">
                <div className="font-raleway text-sm font-[600] leading-4">
                  Reason For Rejection
                </div>
                <div className="text-[12px] font-[400] leading-4">
                  {rejectionReason}
                </div>
              </div>
            </div>
          )}
          {applicationStatus === "submitted" && (
            <div>
              <MyButton
                className="w-full"
                label="Pay Now"
                onClick={() => setPaymentOpen(true)}
              />
              <PaymentCard
                open={paymentOpen}
                setOpen={setPaymentOpen}
                amount={amount}
                vacancyId={vacancyId}
                applicationId={applicationId}
              />
            </div>
          )}
          {(applicationStatus === "paid" ||
            applicationStatus === "reviewed" ||
            applicationStatus === "document-verified" ||
            applicationStatus === "approved") && (
            <div>
              <MyButton
                className="w-full"
                label="View Recipent"
                onClick={() => setRecipientOpen(true)}
              />
              <RecipientCard open={recipientOpen} setOpen={setRecipientOpen} />
            </div>
          )}
        </div>
        <DownloadAdmitCard open={admitCardOpen} setOpen={setAdmitCardOpen} />
      </Card>
    </div>
  );
};

export default ApplicationStatusCard;
