import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  // CartesianGrid,
} from "recharts";

const truncate = (s, n = 14) => (s?.length > n ? s.slice(0, n - 1) + "…" : s);

export default function SubCategoryChart({ data }) {
  if (!data || data.length === 0)
    return <div>No subcategory data to display</div>;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body" style={{ overflow: "visible" }}>
        <h5 className="card-title">Sub Categories</h5>

        <div style={{ width: "100%", height: 600 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 90 }}
            >
              {/* <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                horizontal={false}
              /> */}

              <XAxis
                dataKey="SubCategoryName"
                interval={0}
                tickLine={false}
                axisLine
                height={110} // more space for vertical labels
                angle={-90} // rotate vertically
                textAnchor="end" // aligns label near the tick line
                tickMargin={10}
              />

              <YAxis />
              <Tooltip
                cursor={false}
                formatter={(value) => [`$${value}`, "Amount"]}
              />
              <Bar
                dataKey="Amount"
                fill="#6c63ff"
                barSize={22}
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
