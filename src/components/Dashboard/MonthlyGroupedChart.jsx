// src/components/Dashboard/MonthlyGroupedBarChart.jsx
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  // CartesianGrid, // ❌ remove grid boxes
  LabelList,
  Text,
} from "recharts";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Plain number formatter: no currency symbol, with thousand separators and 2 decimals */
function fmtNumber(value) {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return String(value);
  return new Intl.NumberFormat(undefined, {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export default function MonthlyGroupedBarChart({
  data,
  height = 360,
  showLegend = true,
  colors = {
    expense: "#2196F3", // red
    budget: "#FF9800", // blue
    income: "#4CAF50", // green
  },
}) {
  const chartData = (data || []).map((d) => ({
    name: monthNames[(d.month ?? 1) - 1],
    Expense: d.expense ?? null,
    Budget: d.budget ?? null,
    Income: d.income ?? null,
  }));

  /** Vertical label renderer placed slightly above each bar, plain numbers */
  const renderVerticalTopLabel = (props) => {
    const { x, y, width, value } = props;
    if (value === null || value === undefined) return null;

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;

    // Skip minuscule values to avoid crowding at the baseline
    const MIN_FOR_LABEL = 0.01;
    if (Math.abs(numeric) < MIN_FOR_LABEL) return null;

    const labelText = fmtNumber(numeric);

    const centerX = x + width / 2;
    const topY = y - 8;

    return (
      <Text
        x={centerX}
        y={topY}
        textAnchor="middle"
        verticalAnchor="end"
        angle={-90} // vertical
        fill="#374151"
        fontSize={13}
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
      >
        {labelText}
      </Text>
    );
  };

  function fmtNumber(value) {
    const num = typeof value === "string" ? Number(value) : value;
    if (!Number.isFinite(num)) return String(value);
    return new Intl.NumberFormat(undefined, {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      {/* <BarChart data={chartData} barGap={8} barCategoryGap="18%"> */}
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 12, left: 12, bottom: 12 }}
      >
        {/* ❌ Remove grid boxes */}
        {/* <CartesianGrid strokeDasharray="3 3" /> */}

        <XAxis dataKey="name" />

        {/* ✅ Hide Y-axis completely: no ticks, no labels, no axis line */}
        {/* <YAxis tick={false} axisLine={false} tickLine={false} width={0} /> */}

        {/* <YAxis
          tickLine={false} // hide the small dashes if you want
          axisLine={true} // keep axis line
          tickFormatter={(v) => fmtNumber(v)} // plain numbers with separators
          width={48} // space for labels (adjust if needed)
          tick={{ fill: "#374151", fontSize: 12 }} // label style (gray-700)
        /> */}

        <XAxis dataKey="name" />

        <YAxis
          // ✅ SHOW numbers
          tickFormatter={(v) => fmtNumber(v)}
          tick={{ fill: "#374151", fontSize: 12 }} // style of numbers
          axisLine={true}
          tickLine={false}
          width={48} // ensure labels have room
        />

        {/* ✅ Remove the hover overlay “box” with cursor={false};
            Also show plain numbers in tooltip (no currency). */}
        {/* <Tooltip
          cursor={false}
          formatter={(value, name) => [fmtNumber(value), name]}
          // Optional: minimal tooltip styling (remove shadow feel)
          contentStyle={{ borderRadius: 6, boxShadow: "none" }}
        /> */}

        {/* <Tooltip
          // Hide the grey hover rectangle
          cursor={false}
          // Render nothing for tooltip content
          content={null}
        /> */}

        {showLegend && <Legend />}

        <Bar dataKey="Expense" fill={colors.expense} radius={[4, 4, 0, 0]}>
          <LabelList dataKey="Expense" content={renderVerticalTopLabel} />
        </Bar>
        <Bar dataKey="Budget" fill={colors.budget} radius={[4, 4, 0, 0]}>
          <LabelList dataKey="Budget" content={renderVerticalTopLabel} />
        </Bar>
        <Bar dataKey="Income" fill={colors.income} radius={[4, 4, 0, 0]}>
          <LabelList dataKey="Income" content={renderVerticalTopLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
