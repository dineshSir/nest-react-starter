import { Card } from "@/components/ui/card";
import MyButton from "./my-button";

interface ResultsCardProps {
  id: string;
  title: string;
  subtitle: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  date: string;
  status: "Passed" | "Failed";
  time: string;
}

const ResultsCard = ({
  id,
  title,
  subtitle,
  totalQuestions,
  correctAnswers,
  percentage,
  date,
  status,
  time,
}: ResultsCardProps) => {
  return (
    <Card className=" text-text p-3 rounded-[12px] bg-white border-[1px] border-secondary/50">
      <div className="flex justify-between items-start mb-1 pb-5">
        <div>
          <p className="text-[12px] font-[600] leading-[16px] text-gray-600 pb-2">
            {id}{" "}
            <span
              className={`text-xs p-1 ml-2 rounded-full text-[10px]  leading-[14px] ${status === "Passed" ? "text-green bg-green/10" : "text-red-500"}`}
            >
              {status}
            </span>
          </p>
          <h3 className="text-[16px] font-[700] pb-1">{title}</h3>
          <p className="text-[14px] text-[#64748B] font-[400] ">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-[23px] font-[700] leading-[35px] text-[#059669]">
            {percentage}%
          </p>
        </div>
      </div>

      <div className="flex justify-around items-center my-4">
        <div>
          <p className="text-[12px] font-[500]">Questions</p>
          <p className="text-[14px] font-[600]">{totalQuestions}</p>
        </div>
        <div>
          <p className="text-[12px] font-[500]">Correct</p>
          <p className="text-[14px] font-[600] text-green">{correctAnswers}</p>
        </div>
        <div>
          <p className="text-[12px] font-[500]">Time</p>
          <p className="text-[14px] font-[600]">{time}</p>
        </div>
      </div>
      <div className="w-full mb-2 flex items-center gap-2">
        <div className="h-2 bg-gray-200 rounded-full flex-1">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-[12px] font-[600] leading-[16px]">{date}</div>
      </div>

      <div className="text-center">
        <MyButton className="w-full h-[30px]" label="View Details" />
      </div>
    </Card>
  );
};

export default ResultsCard;
