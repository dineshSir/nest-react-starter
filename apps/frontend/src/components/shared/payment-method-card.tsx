import { cn } from "@/lib/utils";

interface PaymentCardProps {
  items: {
    method: "esewa" | "khalti" ;
    image: string;
    description: string;
    onSelectChange: (e: string) => void;
  }[];
  selectedMethod: "esewa" | "khalti" ;
  onSelectChange: (e: "esewa" | "khalti" ) => void;
}
export function PaymentMethodCard({
  items,
  selectedMethod,
  onSelectChange,
}: PaymentCardProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.method}
          onClick={() => onSelectChange(item.method)}
          className="flex flex-col justify-center  gap-2 px-[20px] py-[14px] border-[2px] rounded-lg bg-white hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="flex justify-center items-center border border-secondary w-4 h-4 p-1 rounded-full ">
              <div
                className={cn(
                  " w-2 h-2 p-1 rounded-full",
                  item.method === selectedMethod ? "bg-secondary" : "",
                )}
              ></div>
            </div>
            <img
              src={item.image}
              className="w-[93px] h-[35px] object-contain"
            />
          </div>
          <div className="text-[12px] text-text font-[400] mt-[14px] text-center">
            {item.description}
          </div>
        </div>
      ))}
    </div>
  );
}
