"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";

interface InterviewsCardProps {
  name: string;
  initials: string;
  subtitle: string;
  primaryColor: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

const getStatusStyles = (status: string) => {
  const statusMap: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-amber-100", text: "text-amber-700" },
    confirmed: { bg: "bg-emerald-100", text: "text-emerald-700" },
    completed: { bg: "bg-blue-100", text: "text-blue-700" },
    cancelled: { bg: "bg-red-100", text: "text-red-700" },
  };

  return statusMap[status] || statusMap.pending;
};

export default function InterviewsCard({
  name,
  initials,
  subtitle,
  status,
}: InterviewsCardProps) {
  const statusStyle = getStatusStyles(status);

  // Parse subtitle to extract role and time
  const [role, time] = subtitle.split(" \u2022 ");

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between w-full p-4 bg-white rounded-xl border hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-gray-800">{name}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {role}
            </span>
            <span className="hidden sm:inline-block">\u2022</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {time}
            </span>
          </div>
        </div>
      </div>

      <Badge
        className={`${statusStyle.bg} ${statusStyle.text} hover:${statusStyle.bg}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    </motion.div>
  );
}
