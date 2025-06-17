import { Fetch } from "@/lib/fetcher";
import { ArrowLeft, Info, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import MyButton from "./my-button";
import { PaymentMethodCard } from "./payment-method-card";
import { toast } from "sonner";

const PaymentCard = ({
  open,
  amount,
  setOpen,
}: {
  open: boolean;
  amount: string;
  setOpen: (open: boolean) => void;
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"esewa" | "khalti">(
    "esewa"
  );
  const [isNext, setIsNext] = useState<boolean>(false);
  const handlePayment = async (payment_method:string) => {
    const url = payment_method === "esewa" ?"/payment/esewa":"/payment/khalti-pay";
    const data = {
amount: amount,
productCode: "productABC_Code"
    };
    try {
      const response = await Fetch({
        method: "post",
        url: url,
        data: data,
      });
      if (response) {
      
        const responseData: any = response;
          khaltiCall(responseData);
        
      } else {
        toast.error("Service currently unavailable");
      }
    } catch (error: any) {
      toast.error(error.error);
    }
  };
  const esewaCall = (formData: any) => {
    var path = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", path);
    form.setAttribute("target", "_blank");
    for (var key in formData) {
      var hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", formData[key]);
      form.appendChild(hiddenField);
    }
    document.body.appendChild(form);
    form.submit();
  };

  const khaltiCall = async (data: any) => {
    console.log(data)
    const a = document.createElement("a");
    a.href = data.payment_url;
    a.target = "_blank";
    a.click();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="hidden">
        <div>Payment Card</div>
      </DialogTrigger>
      <DialogContent
        cross={false}
        className=" px-3 py-5 bg-[#f8f9fc] rounded-[6px] min-w-[680px]"
      >
        {!isNext && (
          <div>
            {/* header  */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary w-[6px] h-8 rounded-[3px]"></div>
                <div className="text-text text-2xl font-[600] leading-9">
                  Payment Gateway
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

            <div className="space-y-3 py-5 px-2 rounded-[10px] bg-white ">
              <div className="p-2 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-primary font-raleway text-2xl font-[500] leading-9 ">
                    Choose Payment Method
                  </div>
                  <div className="text-[#6B7280] text-sm font-normal leading-5">
                    Select your preferred payment option to continue
                  </div>
                </div>
                <div className="py-2 px-1 rounded-[6px] bg-[#f3f4f6] text-sm font-normal leading-5">
                  Amount Due:{" "}
                  <span className="font-[700] text-secondary leading-6 text-lg">
                    NPR {amount}
                  </span>
                </div>
              </div>
              {/* payment card  */}
              <div className="mt-6">
                <PaymentMethodCard
                  items={[
                    {
                      method: "esewa",
                      image:
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Esewa_logo.webp/1200px-Esewa_logo.webp.png",
                      description:
                        "Secure electronic wallet with wide acceptance",
                      onSelectChange: (e: string) => console.log(e),
                    },
                    {
                      method: "khalti",
                      image:
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJIP3ZSUBO_JG8sgBcNBuo4UwJSzIuWbzWyQ&s",
                      description:
                        "Fast digital payments with instant confirmation",
                      onSelectChange: (e: string) => console.log(e),
                    },
                  ]}
                  selectedMethod={paymentMethod}
                  onSelectChange={(e: "esewa" | "khalti") =>
                    setPaymentMethod(e)
                  }
                />
              </div>

              {/* footer  */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex text-text text-sm font-normal leading-5 items-center gap-2">
                  <Info className="fill-text w-[14px] h-[14px] text-white" />
                  <div>All transactions are secure and encrypted</div>
                </div>
                <MyButton
                  onClick={() => setIsNext(true)}
                  arrowRightIcon
                  label="Continue to Payment"
                  className="text-lg"
                />
              </div>
            </div>
          </div>
        )}

        {isNext && (
          <div>
            {/* header  */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowLeft
                  className="h-8 w-8 text-primary font-bold"
                  onClick={() => {
                    setIsNext(false);
                  }}
                />
                <div className="text-primary text-2xl font-[600] leading-9">
                  Mobile Number
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
            {/* amount to pay  */}
            <div className="py-5 px-2 font-raleway flex items-center justify-between bg-[#F8F8F8] rounded-[4px]">
              <div className="text-text text-[20px] font-[500]">
                Amount to pay:
              </div>
              <div className="text-secondary text-[20px] font-[600]">
                NPR {amount}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 justify-end">
              <div>
                <MyButton
                  label="Cancel"
                  variant="outline"
                  className="text-sm"
                />
              </div>
              <div>
                <MyButton
                  label="Confirm Payment"
                  onClick={() => handlePayment(paymentMethod)}
                  arrowRightIcon
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentCard;
