import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SubCategoryChart({ data }) {
  if (!data || data.length === 0)
    return <div>No subcategory data to display</div>;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Sub Categories</h5>

        <div style={{ width: "100%", height: 450 }}>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={data}>
              <XAxis dataKey="SubCategoryName" />
              <YAxis />
              <Tooltip
                cursor={false}
                formatter={(value) => [`$${value}`, "Amount"]}
              />
              <Bar
                dataKey="Amount"
                fill="#6c63ff"
                barSize={20}
                radius={[6, 6, 0, 0]}
                activeBar={false}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
