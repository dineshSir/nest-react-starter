import { Card } from "@/components/ui/card";
import { Fetch } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import MyButton from "./my-button";

interface AdmitCardProps {
  id: string;
  title: string;
  subtitle: string;
  examDate: string;
  reportingTime: string;
  venue: string;
}

const AdmitCard = ({
  id,
  title,
  subtitle,
  examDate,
  reportingTime,
  venue,
}: AdmitCardProps) => {
  const [_admitCardOpen, setAdmitCardOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["admit-card"],
    queryFn: () =>
      Fetch({
        url: `/download-admit-card/user/${"2"}/application/${"1"}`,
        method: "GET",
        responseType: "blob",
      }),
  });
  if (!data) return <div>Loading</div>;

  const printBlobFile = async () => {
    const admitBlobFile = data;
    const url = window.URL.createObjectURL(admitBlobFile as any);
    const a = document.createElement("a");
    a.href = url;
    a.download = "example.pdf"; // You can get this from Content-Disposition too
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
      </div>

      <div className="flex justify-around items-center my-4">
        <div>
          <p className="text-[12px] font-[500]">Exam Date</p>
          <p className="text-[14px] font-[600]">{examDate}</p>
        </div>
        <div>
          <p className="text-[12px] font-[500]">Reporting Time</p>
          <p className="text-[14px] font-[600] text-green">{reportingTime}</p>
        </div>
        <div>
          <p className="text-[12px] font-[500]">Venue</p>
          <p className="text-[14px] font-[600]">{venue}</p>
        </div>
      </div>

      <div className="text-center px-2">
        <MyButton
          className="w-full h-[30px]"
          label="Download Admit Card"
          onClick={async () => {
            setAdmitCardOpen(true);
            await printBlobFile().then(() => {
              setAdmitCardOpen(false);
            });
          }}
        />
        {/* <DownloadAdmitCard open={admitCardOpen} setOpen={setAdmitCardOpen} /> */}
      </div>
    </Card>
  );
};

export default AdmitCard;
