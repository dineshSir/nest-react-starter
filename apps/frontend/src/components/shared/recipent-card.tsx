import { Diamond, File, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import MyButton from "./my-button";

const RecipientCard = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="hidden">
        <div>View Recipient</div>
      </DialogTrigger>
      <DialogContent
        cross={false}
        className=" px-3 py-5 bg-[#f8f9fc] rounded-[6px] min-w-[389px]"
      >
        {/* header  */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#E5E7FF] rounded-[6px]">
              <File />
            </div>
            <div className="text-text text-2xl font-[600] leading-9">
              Payment Details
            </div>
          </div>
          <div>
            <X
              className="h-8 w-8 text-primary font-bold hover:rotate-180 duration-100 cursor-pointer"
              onClick={() => setOpen(false)}
            />
            <span className="sr-only">Close</span>
          </div>
        </div>
        {/* body  */}
        <div className="p-3 flex gap-4 flex-col font-raleway">
          {/* Payment Status  */}
          <div className="flex items-center justify-between">
            <div className="w-[145px] flex items-center justify-between ">
              <div>
                <Diamond className="w-4 h-4" />
              </div>
              <div className="text-text text-[16px] font-[700] leading-6 ">
                Payment Status
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green/20 text-green rounded-2xl py-1 px-2 ">
              <div className="bg-green  h-2 w-2 rounded-full"></div>
              <div className="text-[12px] font-[600] leading-4">
                Payment Completed
              </div>
            </div>
          </div>
          <hr />
          {/* Transaction Details  */}
          <div className="space-y-3">
            <div className="flex items-ceter justify-between">
              <div className="text-text font-sm leading-5">Transaction ID</div>
              <div className="text-text font-sm font-[600] leading-5">
                TXN-2025-01-09-001
              </div>
            </div>
            <div className="flex items-ceter justify-between">
              <div className="text-text font-sm leading-5">Payment Date</div>
              <div className="text-text font-sm font-[600] leading-5">
                Jan 09, 2025 09:15 AM
              </div>
            </div>
            <div className="flex items-ceter justify-between">
              <div className="text-text font-sm leading-5">Payment Method</div>
              <div className="text-text font-sm font-[600] leading-5">
                ConnectIPS
              </div>
            </div>
          </div>
          <hr />
          {/* Amount paid  */}
          <div className="flex items-center justify-between">
            <div className="text-text text-[16px] font-[700] leading-6 ">
              Amount Paid
            </div>
            <div>
              <div className="font-raleway text-green text-lg font-[700] leading-7">
                1000 NPR
              </div>
              <div className="text-[#6B6B6B] text-right text-[12px] font-normal leading-4">
                Including all taxes
              </div>
            </div>
          </div>
          <MyButton label="Download Receipt" className="w-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipientCard;
