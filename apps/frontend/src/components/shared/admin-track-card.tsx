import { Card } from "@/components/ui/card";

interface AdminTrackCardProps {
  title: string;
  items: {
    label: string;
    value: number;
  }[];
}

const AdminTrackCard = ({ title, items }: AdminTrackCardProps) => {
  return (
    <Card className="p-5 ">
      <div className="mb-4 text-text text-lg font-[600] leading-6">{title}</div>
      <div className="space-y-4">
        {items.map((i) => (
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-2 text-sm leading-5">{i.label}</div>
            <div className=" col-span-10 flex w-full items-center gap-4">
              <div className="relative w-full">
                <div className="h-2 w-[100%] bg-gray-400 rounded">
                  <div
                    className={`h-2  bg-primary absolute  rounded-xl rounded-r-2xl`}
                    style={{ width: `${i.value}%` }}
                  ></div>
                </div>
              </div>
              <div className="font-open-sans text-sm leading-5 text-tex">
                {i.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AdminTrackCard;
