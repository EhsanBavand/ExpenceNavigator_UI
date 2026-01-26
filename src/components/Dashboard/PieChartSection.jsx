import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
const COLORS = ["#4CAF50", "#F44336", "#2196F3", "#FF9800", "#9C27B0"];

export default function PieChartSection({ summary }) {
  if (!summary) return null;

  const data = [
    { name: "Income", value: summary.totalIncome },
    { name: "Budget", value: summary.totalBudget },
    { name: "Expenses", value: summary.totalExpenses },
    { name: "Income Left", value: summary.remainingIncome },
    { name: "Budget Left", value: summary.remainingBudget },
  ];
  const donutData = [
    {
      name: "Expenses",
      value: summary.totalExpenses,
      color: "#2196F3", // professional green
    },
    {
      name: "Income Left",
      value: summary.remainingIncome,
      color: "#FF9800", // soft yellow
    },
  ].filter((x) => x.value > 0);

  const height = 260;

  const validData = data.filter((x) => x.value > 0);

  if (validData.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontSize: "14px",
        }}
      >
        No data available
      </div>
    );
  }

  const total = validData.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
      {/* 🔹 SUMMARY CARDS */}
      <div
        className="d-flex flex-wrap justify-content-between mb-4"
        style={{ gap: 10 }}
      >
        {data.map((x, i) => (
          <SummaryCard
            key={i}
            title={x.name}
            value={x.value}
            color={COLORS[i]}
          />
        ))}
      </div>

      {/* 🔹 PIE CHART */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Income vs Expenses</h5>

          <div style={{ width: "100%", height: 400 }}>
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

                <Tooltip formatter={(value, name) => [`$${value}`, name]} />

                {/* 🔹 CENTER INCOME */}
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
                  ${summary.totalIncome.toFixed(2)}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ title, value = 0, color }) {
  return (
    <div style={{ flex: "1 1 18%", margin: 5 }}>
      <div
        className="card shadow-sm"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="card-body text-center">
          <h6 className="text-muted">{title}</h6>
          <h4 style={{ color }}>${value.toFixed(2)}</h4>
        </div>
      </div>
    </div>
  );
}
