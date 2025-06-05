"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useState } from "react";
import AdminCard from "./admin-card";
import { AdminChart } from "./admin-chart";

interface SwitchCardProps {
  title: string;
  tabs?: string[];
  defaultTab?: string;
  data: any;
}

export default function SwitchCard({
  title,
  tabs = ["Weekly", "Monthly", "Yearly"],
  defaultTab = "Monthly",
  data,
}: SwitchCardProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const filterData =
    activeTab === "Monthly"
      ? data.month
      : activeTab === "Yearly"
        ? data.year
        : data.week;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-800">
              {title}
            </CardTitle>
            <Tabs
              defaultValue={activeTab}
              onValueChange={setActiveTab}
              className="w-fit"
            >
              <TabsList className="bg-gray-100">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
            <div className="w-full lg:w-3/5 h-[300px] md:h-[350px]">
              <AdminChart data={filterData}/>
            </div>
            <div className="w-full lg:w-2/5 space-y-4">
              <AdminCard
                bgColor="transparent"
                percentage="39.5"
                titleDot
                title="Total Approved"
                value= {filterData?.approved}
                primaryColor="primary"
                borderAll
              />
              <AdminCard
                bgColor="transparent"
                percentage="28.3"
                titleDot
                title="Total Paid"
                value= {filterData?.paid}
                primaryColor="secondary"
                borderAll
              />
              <AdminCard
                bgColor="transparent"
                percentage="12.7"
                titleDot
                title="Total Rejected"
                value= {filterData?.rejected}
                primaryColor="green"
                borderAll
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
