"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AdminCardProps {
  title: string
  value: string
  percentage: string
  isMore?: boolean
  bgColor?: string
  primaryColor: string
  titleDot?: boolean
  borderAll?: boolean
  borderLeft?: boolean
  className?: string
}

const getColorClass = (colorName: string) => {
  const colorMap: Record<string, string> = {
    primary: "text-primary border-primary",
    secondary: "text-secondary border-secondary",
    destructive: "text-destructive border-destructive",
    green: "text-emerald-500 border-emerald-500",
  }

  return colorMap[colorName] || colorMap.primary
}

const getDotColorClass = (colorName: string) => {
  const colorMap: Record<string, string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    destructive: "bg-destructive",
    green: "bg-emerald-500",
  }

  return colorMap[colorName] || colorMap.primary
}

const AdminCard = ({
  title,
  value,
  bgColor,
  primaryColor,
  titleDot = false,
  borderLeft = false,
  borderAll = false,
  className,
}: AdminCardProps) => {
  const colorClass = getColorClass(primaryColor)
  const dotColorClass = getDotColorClass(primaryColor)

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card
        className={cn(
          "p-4 md:p-5 transition-all duration-200 hover:shadow-md",
          borderLeft && "border-l-4",
          borderAll && "border",
          colorClass,
          className,
        )}
        style={{ backgroundColor: bgColor || "white" }}
      >
        <div className={cn("flex items-center mb-3 gap-2")}>
          {titleDot && <div className={cn("h-2.5 w-2.5 rounded-full", dotColorClass)}></div>}
          <div className="text-gray-700 text-sm md:text-base font-medium">{title}</div>
        </div>

        <div className={cn("text-2xl md:text-3xl font-bold mb-2", `text-${primaryColor}`)}>{value}</div>
{/* 
        <div className={cn("text-sm font-medium flex items-center gap-1", `text-${primaryColor}`)}>
          <span>
            {isMore ? "+" : "-"}
            {percentage}%
          </span>
          <span className="text-gray-500 text-xs">this month</span>
        </div> */}
      </Card>
    </motion.div>
  )
}

export default AdminCard
