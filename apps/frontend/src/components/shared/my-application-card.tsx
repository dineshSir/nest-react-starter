import { Card } from "@/components/ui/card";
import { type ElementType } from "react";

const MyApplicationCard = ({
  text,
  number,
  Logo,
  color,
}: {
  text: string;
  number: number;
  Logo: ElementType;
  color: string;
}) => {
  return (
    <Card
      className="p-[10px] w-[190px] h-[100px] bg-white rounded-none text-text font-[600] border-0 border-b-4"
      style={{ borderBottomColor: color }}
    >
      <div className="flex gap-2">
        <div className="text-[16px] max-w-[116px]">{text}</div>
        <Card
          className="size-[38px] text-white grid place-items-center"
          style={{ backgroundColor: color }}
        >
          <Logo className="size-[18px]" />
        </Card>
      </div>
      <div className="text-[24px] leading-[36px]">{number}</div>
    </Card>
  );
};

export default MyApplicationCard;
