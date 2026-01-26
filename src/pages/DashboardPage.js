// /////////////// ------------------- That is tested and working ---------------- \\\\\\\\\\\\\\\
// import React, { useEffect, useState } from "react";
// import { getDashboardSummary, getUserCategoryBudgets } from "../services/api";
// import { jwtDecode } from "jwt-decode";
// import "../CSS/Global.css";

// import PieChartSection from "../components/Dashboard/PieChartSection";
// import CategoryChart from "../components/Dashboard/CategoryChart";

// export default function DashboardPage() {
//   const [summary, setSummary] = useState(null);
//   const [categoryData, setCategoryData] = useState([]);
//   const [loadingSummary, setLoadingSummary] = useState(true);
//   const [loadingCategory, setLoadingCategory] = useState(true);
//   const [userId, setUserId] = useState(null);

//   const [viewType, setViewType] = useState("monthly");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     try {
//       const decoded = jwtDecode(token);
//       const id =
//         decoded[
//           "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
//         ] || decoded.sub;

//       setUserId(id);
//     } catch {
//       console.error("Invalid token");
//     }
//   }, []);

//   useEffect(() => {
//     if (!userId) return;
//     const monthToSend = viewType === "yearly" ? 0 : selectedMonth;

//     setLoadingSummary(true);
//     getDashboardSummary(userId, monthToSend, selectedYear)
//       .then(setSummary)
//       .catch(() => console.error("Error loading dashboard summary"))
//       .finally(() => setLoadingSummary(false));

//     setLoadingCategory(true);
//     const loadCategoryData = async () => {
//       try {
//         let data = await getUserCategoryBudgets(
//           userId,
//           monthToSend,
//           selectedYear,
//         );

//         const parsed = data.map((x) => ({
//           CategoryName: x.categoryName || "Unknown",
//           Budget: Number(x.budget) || 0,
//           TotalExpense: Number(x.totalExpense) || 0,
//         }));

//         setCategoryData(parsed);
//       } catch (err) {
//         console.error("Error loading category data", err);
//       } finally {
//         setLoadingCategory(false);
//       }
//     };

//     loadCategoryData();
//   }, [userId, viewType, selectedMonth, selectedYear]);

//   if (loadingSummary) return <div>Loading dashboard summary...</div>;
//   if (!summary) return <div>No dashboard data available</div>;

//   return (
//     <div className="container mt-4">
//       {/* FILTER HEADER */}
//       <div className="card shadow-sm mb-4">
//         <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
//           <h4 className="mb-0">Financial Overview</h4>

//           <div className="d-flex align-items-center gap-3">
//             {/* View Type Buttons */}
//             <div className="btn-group">
//               <button
//                 className={`btn ${viewType === "monthly" ? "btn-primary" : "btn-outline-primary"}`}
//                 onClick={() => setViewType("monthly")}
//               >
//                 Monthly
//               </button>
//               <button
//                 className={`btn ${viewType === "yearly" ? "btn-primary" : "btn-outline-primary"}`}
//                 onClick={() => setViewType("yearly")}
//               >
//                 Yearly
//               </button>
//             </div>

//             {/* Month Selector */}
//             {viewType === "monthly" && (
//               <select
//                 className="form-select"
//                 style={{ width: 140 }}
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(Number(e.target.value))}
//               >
//                 {[
//                   "January",
//                   "February",
//                   "March",
//                   "April",
//                   "May",
//                   "June",
//                   "July",
//                   "August",
//                   "September",
//                   "October",
//                   "November",
//                   "December",
//                 ].map((m, i) => (
//                   <option key={i} value={i + 1}>
//                     {m}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {/* Year Selector */}
//             <select
//               className="form-select"
//               style={{ width: 120 }}
//               value={selectedYear}
//               onChange={(e) => setSelectedYear(Number(e.target.value))}
//             >
//               {[2028, 2027, 2026, 2025, 2024, 2023].map((y) => (
//                 <option key={y} value={y}>
//                   {y}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* PIE CHART + SUMMARY */}
//       <PieChartSection summary={summary} />

//       {/* CATEGORY CHART */}
//       {loadingCategory ? (
//         <div>Loading category data...</div>
//       ) : (
//         <CategoryChart data={categoryData} />
//       )}
//     </div>
//   );
// }

// /////////////////////////// ------------- Subcategory ----------------- \\\\\\\\\\\\\\\\\\\\\\
// import React, { useEffect, useState } from "react";
// import { getDashboardSummary, getUserCategoryBudgets } from "../services/api";
// import {
//   getSubcategoriesSummary,
//   SubCategoriesByCategory,
// } from "../services/api";
// import { jwtDecode } from "jwt-decode";
// import "../CSS/Global.css";
// import PieChartSection from "../components/Dashboard/PieChartSection";
// import CategoryChart from "../components/Dashboard/CategoryChart";
// import SubCategoryChart from "../components/Dashboard/SubCategoryChart";

// export default function DashboardPage() {
//   const [summary, setSummary] = useState(null);
//   const [categoryData, setCategoryData] = useState([]);
//   const [loadingSummary, setLoadingSummary] = useState(true);
//   const [loadingCategory, setLoadingCategory] = useState(true);
//   const [userId, setUserId] = useState(null);
//   const [subCategoryData, setSubCategoryData] = useState([]);
//   const [selectedCategoryId, setSelectedCategoryId] = useState(null);

//   const [viewType, setViewType] = useState("monthly");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

//   const handleCategoryClick = async (catId) => {
//     if (!userId) return;

//     const monthToSend = viewType === "yearly" ? 0 : selectedMonth;

//     try {
//       const data = await SubCategoriesByCategory(
//         catId,
//         userId,
//         monthToSend,
//         selectedYear,
//       );
//       const parsed = data.map((x) => ({
//         SubCategoryName: x.name || "Unknown",
//         Amount: Number(x.amount) || 0,
//       }));

//       setSubCategoryData(parsed);
//       setSelectedCategoryId(catId);
//       console.log("Subcategories API response:", data);
//     } catch (err) {
//       console.error("Error loading subcategories", err);
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     try {
//       const decoded = jwtDecode(token);
//       const id =
//         decoded[
//           "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
//         ] || decoded.sub;

//       setUserId(id);
//     } catch {
//       console.error("Invalid token");
//     }
//   }, []);

//   useEffect(() => {
//     if (!userId) return;
//     const monthToSend = viewType === "yearly" ? 0 : selectedMonth;
//     setLoadingSummary(true);
//     getDashboardSummary(userId, monthToSend, selectedYear)
//       .then(setSummary)
//       .catch(() => console.error("Error loading dashboard summary"))
//       .finally(() => setLoadingSummary(false));

//     setLoadingCategory(true);
//     const loadCategoryData = async () => {
//       try {
//         let data;
//         data = await getUserCategoryBudgets(userId, monthToSend, selectedYear);
//         const parsed = data.map((x) => ({
//           CategoryId: x.categoryId,
//           CategoryName: x.categoryName || "Unknown",
//           Budget: Number(x.budget) || 0,
//           TotalExpense: Number(x.totalExpense) || 0,
//         }));

//         console.log("Category data:", parsed);
//         setCategoryData(parsed);
//       } catch (err) {
//         console.error("Error loading category data", err);
//       } finally {
//         setLoadingCategory(false);
//       }
//     };
//     loadCategoryData();
//   }, [userId, viewType, selectedMonth, selectedYear]);

//   if (loadingSummary) return <div>Loading dashboard summary...</div>;
//   if (!summary) return <div>No dashboard data available</div>;

//   return (
//     <div className="container mt-4">
//       {/* 🔹 FILTER HEADER */}
//       <div className="card shadow-sm mb-4">
//         <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
//           <h4 className="mb-0">Financial Overview</h4>

//           <div className="d-flex align-items-center gap-3">
//             {/* 🔹 View Type Buttons */}
//             <div className="btn-group">
//               <button
//                 className={`btn ${
//                   viewType === "monthly" ? "btn-primary" : "btn-outline-primary"
//                 }`}
//                 onClick={() => setViewType("monthly")}
//               >
//                 Monthly
//               </button>
//               <button
//                 className={`btn ${
//                   viewType === "yearly" ? "btn-primary" : "btn-outline-primary"
//                 }`}
//                 onClick={() => setViewType("yearly")}
//               >
//                 Yearly
//               </button>
//             </div>

//             {/* 🔹 Month Selector */}
//             {viewType === "monthly" && (
//               <select
//                 className="form-select"
//                 style={{ width: 140 }}
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(Number(e.target.value))}
//               >
//                 {[
//                   "January",
//                   "February",
//                   "March",
//                   "April",
//                   "May",
//                   "June",
//                   "July",
//                   "August",
//                   "September",
//                   "October",
//                   "November",
//                   "December",
//                 ].map((m, i) => (
//                   <option key={i} value={i + 1}>
//                     {m}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {/* 🔹 Year Selector */}
//             <select
//               className="form-select"
//               style={{ width: 120 }}
//               value={selectedYear}
//               onChange={(e) => setSelectedYear(Number(e.target.value))}
//             >
//               {[2028, 2027, 2026, 2025, 2024, 2023].map((y) => (
//                 <option key={y} value={y}>
//                   {y}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* 🔹 PIE CHART + SUMMARY */}
//       <PieChartSection summary={summary} />

//       {loadingCategory ? (
//         <div>Loading category data...</div>
//       ) : (
//         <CategoryChart
//           data={categoryData}
//           onCategoryClick={handleCategoryClick}
//         />
//       )}

//       {/* 🔹 SUBCATEGORY CHART */}
//       <SubCategoryChart data={subCategoryData} />
//     </div>
//   );
// }

/////////////////////////// ------------- MOnthly ----------------- \\\\\\\\\\\\\\\\\\\\\\

// import React, { useEffect, useState } from "react";
// import { getDashboardSummary, getUserCategoryBudgets } from "../services/api";
// import {
//   getSubcategoriesSummary,
//   SubCategoriesByCategory,
// } from "../services/api";
// import { jwtDecode } from "jwt-decode";
// import "../CSS/Global.css";
// import PieChartSection from "../components/Dashboard/PieChartSection";
// import CategoryChart from "../components/Dashboard/CategoryChart";
// import SubCategoryChart from "../components/Dashboard/SubCategoryChart";

// // 🔹 New imports
// import MonthlyGroupedBarChart from "../components/Dashboard/MonthlyGroupedChart";

// export default function DashboardPage() {
//   const [summary, setSummary] = useState(null);
//   const [categoryData, setCategoryData] = useState([]);
//   const [loadingSummary, setLoadingSummary] = useState(true);
//   const [loadingCategory, setLoadingCategory] = useState(true);
//   const [userId, setUserId] = useState(null);
//   const [subCategoryData, setSubCategoryData] = useState([]);
//   const [selectedCategoryId, setSelectedCategoryId] = useState(null);

//   const [viewType, setViewType] = useState("monthly");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

//   // 🔹 Local state to toggle demo vs API (start with demo = true)
//   const [useDemoMonthlyBars, setUseDemoMonthlyBars] = useState(true);
//   const [monthlyBarsData, setMonthlyBarsData] = useState([]);

//   // Demo data for 2025: 0 for Jan–Sep; actual values for Oct–Dec
//   const monthlySummaryDemo2025 = [
//     { year: 2025, month: 1, expense: 0, budget: 0, income: 0 },
//     { year: 2025, month: 2, expense: 0, budget: 0, income: 0 },
//     { year: 2025, month: 3, expense: 0, budget: 0, income: 0 },
//     { year: 2025, month: 4, expense: 0, budget: 0, income: 0 },
//     { year: 2025, month: 5, expense: 0, budget: 0, income: 0 },
//     { year: 2025, month: 6, expense: 0, budget: 0, income: 0 },
//     { year: 2025, month: 7, expense: 0, budget: 0, income: 0 },
//     { year: 2025, month: 8, expense: 0, budget: 0, income: 0 },
//     { year: 2025, month: 9, expense: 0, budget: 0, income: 0 },
//     { year: 2025, month: 10, expense: 11270.02, budget: 12750, income: 13405 },
//     { year: 2025, month: 11, expense: 11835.15, budget: 13500, income: 13801 },
//     { year: 2025, month: 12, expense: 12599.41, budget: 12500, income: 14085 },
//   ];

//   const handleCategoryClick = async (catId) => {
//     if (!userId) return;
//     const monthToSend = viewType === "yearly" ? 0 : selectedMonth;

//     try {
//       const data = await SubCategoriesByCategory(
//         catId,
//         userId,
//         monthToSend,
//         selectedYear,
//       );
//       const parsed = data.map((x) => ({
//         SubCategoryName: x.name || "Unknown",
//         Amount: Number(x.amount) || 0,
//       }));
//       setSubCategoryData(parsed);
//       setSelectedCategoryId(catId);
//       console.log("Subcategories API response:", data);
//     } catch (err) {
//       console.error("Error loading subcategories", err);
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     try {
//       const decoded = jwtDecode(token);
//       const id =
//         decoded[
//           "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
//         ] || decoded.sub;
//       setUserId(id);
//     } catch {
//       console.error("Invalid token");
//     }
//   }, []);

//   // 🔹 Load your existing dashboard summary + categories (unchanged)
//   useEffect(() => {
//     if (!userId) return;
//     const monthToSend = viewType === "yearly" ? 0 : selectedMonth;

//     setLoadingSummary(true);
//     getDashboardSummary(userId, monthToSend, selectedYear)
//       .then(setSummary)
//       .catch(() => console.error("Error loading dashboard summary"))
//       .finally(() => setLoadingSummary(false));

//     setLoadingCategory(true);
//     const loadCategoryData = async () => {
//       try {
//         const data = await getUserCategoryBudgets(
//           userId,
//           monthToSend,
//           selectedYear,
//         );
//         const parsed = data.map((x) => ({
//           CategoryId: x.categoryId,
//           CategoryName: x.categoryName || "Unknown",
//           Budget: Number(x.budget) || 0,
//           TotalExpense: Number(x.totalExpense) || 0,
//         }));
//         console.log("Category data:", parsed);
//         setCategoryData(parsed);
//       } catch (err) {
//         console.error("Error loading category data", err);
//       } finally {
//         setLoadingCategory(false);
//       }
//     };
//     loadCategoryData();
//   }, [userId, viewType, selectedMonth, selectedYear]);

//   // 🔹 Monthly bars data source: DEMO first
//   useEffect(() => {
//     if (useDemoMonthlyBars) {
//       // use static demo for 2025
//       setMonthlyBarsData(monthlySummaryDemo2025);
//     } else {
//       // (optional) when you switch to API, call your analytics endpoint here:
//       // fetch(`/api/analytics/monthly?year=${selectedYear}`, { headers: { "x-user-id": userId }})
//       //   .then(r => r.json())
//       //   .then(rows => setMonthlyBarsData(rows));
//     }
//   }, [useDemoMonthlyBars, selectedYear, userId]);

//   if (loadingSummary) return <div>Loading dashboard summary...</div>;
//   if (!summary) return <div>No dashboard data available</div>;

//   return (
//     <div className="container mt-4">
//       {/* 🔹 FILTER HEADER */}
//       <div className="card shadow-sm mb-4">
//         <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
//           <h4 className="mb-0">Financial Overview</h4>

//           <div className="d-flex align-items-center gap-3">
//             {/* View Type */}
//             <div className="btn-group">
//               <button
//                 className={`btn ${viewType === "monthly" ? "btn-primary" : "btn-outline-primary"}`}
//                 onClick={() => setViewType("monthly")}
//               >
//                 Monthly
//               </button>
//               <button
//                 className={`btn ${viewType === "yearly" ? "btn-primary" : "btn-outline-primary"}`}
//                 onClick={() => setViewType("yearly")}
//               >
//                 Yearly
//               </button>
//             </div>

//             {/* Month Selector */}
//             {viewType === "monthly" && (
//               <select
//                 className="form-select"
//                 style={{ width: 140 }}
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(Number(e.target.value))}
//               >
//                 {[
//                   "January",
//                   "February",
//                   "March",
//                   "April",
//                   "May",
//                   "June",
//                   "July",
//                   "August",
//                   "September",
//                   "October",
//                   "November",
//                   "December",
//                 ].map((m, i) => (
//                   <option key={i} value={i + 1}>
//                     {m}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {/* Year Selector */}
//             <select
//               className="form-select"
//               style={{ width: 120 }}
//               value={selectedYear}
//               onChange={(e) => setSelectedYear(Number(e.target.value))}
//             >
//               {[2028, 2027, 2026, 2025, 2024, 2023].map((y) => (
//                 <option key={y} value={y}>
//                   {y}
//                 </option>
//               ))}
//             </select>

//             {/* 🔹 Toggle: Demo vs API */}
//             <div className="form-check form-switch ms-2">
//               <input
//                 className="form-check-input"
//                 type="checkbox"
//                 id="toggleDemoMonthly"
//                 checked={useDemoMonthlyBars}
//                 onChange={(e) => setUseDemoMonthlyBars(e.target.checked)}
//               />
//               <label className="form-check-label" htmlFor="toggleDemoMonthly">
//                 Use demo monthly bars
//               </label>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 🔹 PIE CHART + SUMMARY */}
//       <PieChartSection summary={summary} />

//       {loadingCategory ? (
//         <div>Loading category data...</div>
//       ) : (
//         <CategoryChart
//           data={categoryData}
//           onCategoryClick={handleCategoryClick}
//         />
//       )}

//       {/* 🔹 SUBCATEGORY CHART */}
//       <SubCategoryChart data={subCategoryData} />

//       {/* 🔹 NEW: Monthly Bars (Expense vs Budget vs Income) */}
//       <div className="card shadow-sm mt-4">
//         <div className="card-body">
//           <h5 className="mb-3">Monthly Expense vs Budget vs Income</h5>
//           {/* <MonthlyGroupedBarChart data={monthlyBarsData} currency="CAD" /> */}

//           <MonthlyGroupedBarChart
//             data={monthlyBarsData}
//             labelFontSize={16}
//             yAxisStroke="#374151"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// /pages/DashboardPage.jsx (or wherever you keep it)
import React, { useEffect, useState } from "react";
import {
  getDashboardSummary,
  getUserCategoryBudgets,
  SubCategoriesByCategory,
  getMonthlySummary, // ⬅️ NEW import
} from "../services/api";
import { jwtDecode } from "jwt-decode";
import "../CSS/Global.css";

import PieChartSection from "../components/Dashboard/PieChartSection";
import CategoryChart from "../components/Dashboard/CategoryChart";
import SubCategoryChart from "../components/Dashboard/SubCategoryChart";
import MonthlyGroupedBarChart from "../components/Dashboard/MonthlyGroupedChart";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [userId, setUserId] = useState(null);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [viewType, setViewType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Monthly bars (API)
  const [monthlyBarsData, setMonthlyBarsData] = useState([]);
  const [loadingMonthlyBars, setLoadingMonthlyBars] = useState(true);
  const [monthlyBarsError, setMonthlyBarsError] = useState("");

  // -------- Get userId from token --------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const id =
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] || decoded.sub;
      setUserId(id);
    } catch {
      console.error("Invalid token");
    }
  }, []);

  // -------- Load summary + categories (existing logic) --------
  useEffect(() => {
    if (!userId) return;
    const monthToSend = viewType === "yearly" ? 0 : selectedMonth;

    // Summary
    setLoadingSummary(true);
    getDashboardSummary(userId, monthToSend, selectedYear)
      .then(setSummary)
      .catch(() => console.error("Error loading dashboard summary"))
      .finally(() => setLoadingSummary(false));

    // Categories
    setLoadingCategory(true);
    (async () => {
      try {
        const data = await getUserCategoryBudgets(
          userId,
          monthToSend,
          selectedYear,
        );
        const parsed = data.map((x) => ({
          CategoryId: x.categoryId,
          CategoryName: x.categoryName || "Unknown",
          Budget: Number(x.budget) || 0,
          TotalExpense: Number(x.totalExpense) || 0,
        }));
        setCategoryData(parsed);
      } catch (err) {
        console.error("Error loading category data", err);
      } finally {
        setLoadingCategory(false);
      }
    })();
  }, [userId, viewType, selectedMonth, selectedYear]);

  // -------- Load Subcategories on category click (existing logic) --------
  const handleCategoryClick = async (catId) => {
    if (!userId) return;
    const monthToSend = viewType === "yearly" ? 0 : selectedMonth;

    try {
      const data = await SubCategoriesByCategory(
        catId,
        userId,
        monthToSend,
        selectedYear,
      );
      const parsed = data.map((x) => ({
        SubCategoryName: x.name || "Unknown",
        Amount: Number(x.amount) || 0,
      }));
      setSubCategoryData(parsed);
      setSelectedCategoryId(catId);
    } catch (err) {
      console.error("Error loading subcategories", err);
    }
  };

  // -------- Load Monthly Bars from API (year-based timeline) --------
  useEffect(() => {
    if (!userId || !selectedYear) return;

    let cancelled = false;

    async function loadMonthly() {
      setLoadingMonthlyBars(true);
      setMonthlyBarsError("");
      try {
        const raw = await getMonthlySummary(userId, selectedYear);

        // Normalize array into 12 months with numeric values
        // Expected API row shape: { year, month, expense, budget, income }
        const byMonth = new Map(
          (Array.isArray(raw) ? raw : []).map((r) => [
            Number(r.month),
            {
              year: Number(r.year) || selectedYear,
              month: Number(r.month),
              expense: Number(r.expense) || 0,
              budget: Number(r.budget) || 0,
              income: Number(r.income) || 0,
            },
          ]),
        );

        const complete = Array.from({ length: 12 }, (_, i) => {
          const m = i + 1;
          return (
            byMonth.get(m) || {
              year: selectedYear,
              month: m,
              expense: 0,
              budget: 0,
              income: 0,
            }
          );
        });

        if (!cancelled) setMonthlyBarsData(complete);
      } catch (err) {
        console.error("Error loading monthly bars from API", err);
        if (!cancelled) {
          setMonthlyBarsError("Failed to load monthly bars data.");
          setMonthlyBarsData([]);
        }
      } finally {
        if (!cancelled) setLoadingMonthlyBars(false);
      }
    }

    loadMonthly();
    return () => {
      cancelled = true;
    };
  }, [userId, selectedYear]);

  if (loadingSummary) return <div>Loading dashboard summary...</div>;
  if (!summary) return <div>No dashboard data available</div>;

  return (
    <div className="container mt-4">
      {/* 🔹 FILTER HEADER */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
          <h4 className="mb-0">Financial Overview</h4>

          <div className="d-flex align-items-center gap-3">
            {/* View Type */}
            <div className="btn-group">
              <button
                className={`btn ${
                  viewType === "monthly" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setViewType("monthly")}
              >
                Monthly
              </button>
              <button
                className={`btn ${
                  viewType === "yearly" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setViewType("yearly")}
              >
                Yearly
              </button>
            </div>

            {/* Month Selector */}
            {viewType === "monthly" && (
              <select
                className="form-select"
                style={{ width: 140 }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            )}

            {/* Year Selector */}
            <select
              className="form-select"
              style={{ width: 120 }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[2028, 2027, 2026, 2025, 2024, 2023].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 🔹 PIE CHART + SUMMARY */}
      <PieChartSection summary={summary} />

      {/* 🔹 CATEGORY CHART */}
      {loadingCategory ? (
        <div>Loading category data...</div>
      ) : (
        <CategoryChart
          data={categoryData}
          onCategoryClick={handleCategoryClick}
        />
      )}

      {/* 🔹 SUBCATEGORY CHART */}
      <SubCategoryChart data={subCategoryData} />

      {/* 🔹 MONTHLY BARS */}
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="mb-3">Monthly Expense vs Budget vs Income</h5>

          {loadingMonthlyBars ? (
            <div>Loading monthly bars...</div>
          ) : monthlyBarsError ? (
            <div className="text-danger">{monthlyBarsError}</div>
          ) : (
            <MonthlyGroupedBarChart
              data={monthlyBarsData}
              labelFontSize={16}
              yAxisStroke="#374151"
            />
          )}
        </div>
      </div>
    </div>
  );
}
