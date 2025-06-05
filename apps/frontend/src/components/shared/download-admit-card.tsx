import { LoaderIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

const DownloadAdmitCard = ({
  open = true,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="hidden">
        <div>Download Admit Card</div>
      </DialogTrigger>
      <DialogContent
        cross={false}
        className=" px-3 py-5 bg-[#f8f9fc] rounded-[6px] min-w-[389px]"
      >
        <div className="p-6 flex flex-col gap-3">
          <div className="text-text font-raleway text-lg font-[700] leading-7">
            Download Admit Card
          </div>
          <div className="text-[#666666] text-sm font-raleway font-normal leading-5">
            You are about to download the admit card for:
          </div>
          <div className="p-3 bg-card-primary rounded-[6px]">
            <div className="text-[#2D3748] text-sm font-raleway font-[600] leading-5">
              Agriculture Department Exam
            </div>
            <div className="text-[#666666] text-sm font-raleway font-normal leading-5">
              Agriculture Department
            </div>
          </div>
        </div>
        <hr></hr>
        <div className="flex flex-col items-center gap-6">
          <LoaderIcon className="w-10 h-10 text-secondary animate-spin" />
          <div className="text-[#666666] font-raleway text-sm font-normal leading-5">
            Downloading your admit Card
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadAdmitCard;
