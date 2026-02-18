import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
const COLORS = ["#4CAF50", "#F44336", "#2196F3", "#FF9800", "#9C27B0"];

export default function PieChartSection({ summary }) {
  // If nothing loaded yet, render a skeleton card (no text).
  if (!summary) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Income vs Expenses</h5>
          <div className="skeleton-box skeleton-chart-lg" />
        </div>
      </div>
    );
  }

  const data = [
    { name: "Income", value: Number(summary.totalIncome) || 0 },
    { name: "Budget", value: Number(summary.totalBudget) || 0 },
    { name: "Expenses", value: Number(summary.totalExpenses) || 0 },
    { name: "Income Left", value: Number(summary.remainingIncome) || 0 },
    { name: "Budget Left", value: Number(summary.remainingBudget) || 0 },
  ];

  const donutData = [
    {
      name: "Expenses",
      value: Number(summary.totalExpenses) || 0,
      color: "#2196F3",
    },
    {
      name: "Income Left",
      value: Number(summary.remainingIncome) || 0,
      color: "#FF9800",
    },
  ].filter((x) => x.value > 0);

  const height = 260;

  const validData = data.filter((x) => x.value > 0);
  const showSkeleton = validData.length === 0 || donutData.length === 0;

  const totalIncomeSafe = Number(summary.totalIncome) || 0;

  return (
    <>
      {/* Summary cards */}
      <div
        className="d-flex flex-wrap justify-content-between mb-4"
        style={{ gap: 10 }}
      >
        {data.map((x, i) => (
          <SummaryCard
            key={i}
            title={x.name}
            value={x.value}
            color={COLORS[i % COLORS.length]}
          />
        ))}
      </div>

      {/* Chart card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Income vs Expenses</h5>

          <div style={{ width: "100%", height: 400 }}>
            {showSkeleton ? (
              <div className="skeleton-box skeleton-chart-lg" />
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={3}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value, name) => [
                      `$${Number(value).toFixed(2)}`,
                      name,
                    ]}
                  />

                  {/* Center label */}
                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 13, fill: "#777" }}
                  >
                    Total Income
                  </text>

                  <text
                    x="50%"
                    y="55%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 18, fontWeight: 700 }}
                  >
                    ${totalIncomeSafe.toFixed(2)}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ title, value = 0, color }) {
  const safeValue = Number(value) || 0;
  return (
    <div style={{ flex: "1 1 18%", margin: 5 }}>
      <div
        className="card shadow-sm"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="card-body text-center">
          <h6 className="text-muted">{title}</h6>
          <h4 style={{ color }}>${safeValue.toFixed(2)}</h4>
        </div>
      </div>
    </div>
  );
}
