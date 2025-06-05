import * as React from "react";
import { Label, Pie, PieChart, ResponsiveContainer } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import LoadingSpinner from "./loader";

const AdminChart = (data: any) => {
  const chartData = [
    {
      name: "submitted",
      value: Number(data?.data?.submitted),
      fill: "var(--chart-1)",
    },
    {
      name: "approved",
      value: Number(data?.data?.approved),
      fill: "var(--chart-2)",
    },
    {
      name: "paid",
      value: Number(data?.data?.paid),
      fill: "var(--chart-3)",
    },
    {
      name: "rejected",
      value: Number(data?.data?.rejected),
      fill: "var(--chart-4)",
    },
    {
      name: "pendingReview",
      value: Number(data?.data?.rejected),
      fill: "var(--chart-5)",
    },
  ];

  const chartConfig = {
    submitted: {
      label: "Submitted",
    },
    approved: {
      label: "Approved",
    },
    paid: {
      label: "Final Selection",
    },
    rejected: {
      label: "Rejected",
    },
    pendingReview: {
      label: "Pending Review",
    },
  } satisfies ChartConfig;

  const totalApplicants = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);
  if (!data) {
    return <LoadingSpinner />;
  }
  return (
    <div className="w-full h-full">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalApplicants.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          Total Applicants
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export { AdminChart };
