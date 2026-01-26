// import React, { useMemo, useState } from "react";

// // ===== Demo data for Sources (used in table's "Source" column) =====
// const defaultSavingSources = [
//   { id: "tfsa", label: "TFSA (Tax-Free Savings Account)" },
//   { id: "rrsp", label: "RRSP (Retirement Savings)" },
//   { id: "emergency", label: "Emergency Fund" },
//   { id: "travel", label: "Travel Fund" },
// ];

// // ===== Demo items to render in table =====
// const demoItems = [
//   // Savings
//   { id: "tfsa", name: "TFSA", type: "saving", current: 3200, sourceId: "tfsa" },
//   { id: "rrsp", name: "RRSP", type: "saving", current: 5600, sourceId: "rrsp" },
//   {
//     id: "emergency",
//     name: "Emergency Fund",
//     type: "saving",
//     current: 1800,
//     sourceId: "emergency",
//   },
//   {
//     id: "travel",
//     name: "Travel Fund",
//     type: "saving",
//     current: 400,
//     sourceId: "travel",
//   },
//   // Debts
//   {
//     id: "loc",
//     name: "Line of Credit",
//     type: "debt",
//     balanceRemaining: 3500,
//     target: 3500,
//     sourceId: "tfsa",
//   },
//   {
//     id: "loan",
//     name: "Personal Loan",
//     type: "debt",
//     balanceRemaining: 7200,
//     target: 7200,
//     sourceId: "rrsp",
//   },
//   // Goals
//   {
//     id: "europe",
//     name: "Europe Trip",
//     type: "goal",
//     current: 900,
//     target: 2000,
//     sourceId: "travel",
//   },
//   {
//     id: "laptop",
//     name: "New Laptop",
//     type: "goal",
//     current: 150,
//     target: 1500,
//     sourceId: "tfsa",
//   },
// ];

// const SavingPage = ({ extraMoney = 650 }) => {
//   // ===== Year (left) =====
//   const currentYear = new Date().getFullYear();
//   const [year, setYear] = useState(String(currentYear));

//   // ===== Sources (used for Source column label lookup) =====
//   const [savingSources] = useState(defaultSavingSources);

//   // ===== Items to display in the table (mock/demo) =====
//   const [items, setItems] = useState(demoItems);

//   // ===== Allocations state (per table row) =====
//   const [allocations, setAllocations] = useState({}); // { [itemId]: number }

//   const totalAllocated = useMemo(
//     () =>
//       Object.values(allocations).reduce((sum, v) => sum + (Number(v) || 0), 0),
//     [allocations],
//   );
//   const remaining = Math.max(0, Number(extraMoney) - totalAllocated);

//   const handleAllocChange = (id, value) => {
//     const n = Number(value);
//     setAllocations((prev) => ({
//       ...prev,
//       [id]: isFinite(n) && n > 0 ? n : 0,
//     }));
//   };

//   const handleSave = () => {
//     if (remaining > 0) {
//       alert("Allocate all extra money first.");
//       return;
//     }
//     const payload = Object.entries(allocations)
//       .filter(([, amt]) => Number(amt) > 0)
//       .map(([itemId, amount]) => ({
//         itemId,
//         amount: Number(amount),
//         year,
//       }));
//     console.log("Saving allocations:", payload);
//     alert("Demo save complete. Check console for the payload.");
//   };

//   // ===== Utilities =====
//   const currency = (n) =>
//     typeof n === "number" && isFinite(n) ? `$${n.toLocaleString()}` : "—";

//   const typeLabel = (t) =>
//     t === "saving" ? "Saving" : t === "debt" ? "Debt" : "Goal";

//   // ===== Add Item Modal (YOUR full modal) =====
//   const [showAddModal, setShowAddModal] = useState(false);

//   // Modal fields (as you provided)
//   const [mItemName, setMItemName] = useState("");
//   const [mType, setMType] = useState("saving"); // 'saving' | 'goal' | 'debt'
//   const [mYear, setMYear] = useState(String(currentYear));
//   const [mTarget, setMTarget] = useState(""); // optional now
//   const [mCurrentOrBalance, setMCurrentOrBalance] = useState(""); // optional
//   const [mAddAmount, setMAddAmount] = useState("");

//   const resetModal = () => {
//     setMItemName("");
//     setMType("saving");
//     setMYear(String(year));
//     setMTarget("");
//     setMCurrentOrBalance("");
//     setMAddAmount("");
//   };

//   const openModal = () => {
//     resetModal();
//     setShowAddModal(true);
//   };

//   // This uses allocations/extraMoney to validate remaining, and
//   // adds a NEW item plus sets its allocation to mAddAmount.
//   const handleAddFromModal = (e) => {
//     e.preventDefault();

//     const name = mItemName.trim();
//     const addAmt = Number(mAddAmount || 0);
//     const yr = Number(mYear);

//     // Basic validations
//     if (!name) {
//       alert("Item name is required.");
//       return;
//     }
//     if (!["saving", "goal", "debt"].includes(mType)) {
//       alert("Invalid Type.");
//       return;
//     }
//     if (!yr || yr < 2000 || yr > 2100) {
//       alert("Please enter a valid Year (2000-2100).");
//       return;
//     }
//     if (!(addAmt > 0)) {
//       alert("Add Amount must be a positive number.");
//       return;
//     }

//     // Calculate remaining including allocations already set
//     const remainingNow = Math.max(0, Number(extraMoney) - totalAllocated);
//     if (addAmt > remainingNow) {
//       alert(
//         `Add Amount ($${addAmt}) cannot exceed remaining ($${remainingNow}).`,
//       );
//       return;
//     }

//     // Build a unique, URL-safe id based on the name
//     const baseId = name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/(^-+|-+$)/g, "");
//     const uniqueId = items.some((i) => i.id === baseId)
//       ? `${baseId}-${Date.now()}`
//       : baseId;

//     // default source to first source so the Source column shows a label
//     const defaultSourceId = savingSources[0]?.id;

//     // Create item object according to type
//     let newItem;
//     if (mType === "saving") {
//       newItem = {
//         id: uniqueId,
//         name,
//         type: "saving",
//         current: mCurrentOrBalance ? Number(mCurrentOrBalance) : 0,
//         sourceId: defaultSourceId,
//         year: yr,
//       };
//     } else if (mType === "goal") {
//       newItem = {
//         id: uniqueId,
//         name,
//         type: "goal",
//         current: mCurrentOrBalance ? Number(mCurrentOrBalance) : 0,
//         target: mTarget ? Number(mTarget) : undefined,
//         sourceId: defaultSourceId,
//         year: yr,
//       };
//     } else {
//       // debt
//       newItem = {
//         id: uniqueId,
//         name,
//         type: "debt",
//         balanceRemaining: mCurrentOrBalance
//           ? Number(mCurrentOrBalance)
//           : mTarget
//             ? Number(mTarget)
//             : undefined,
//         target: mTarget ? Number(mTarget) : undefined,
//         sourceId: defaultSourceId,
//         year: yr,
//       };
//     }

//     // Add to table
//     setItems((prev) => [newItem, ...prev]);

//     // Pre-fill allocation for this new item
//     setAllocations((prev) => ({
//       ...prev,
//       [uniqueId]: addAmt,
//     }));

//     setShowAddModal(false);
//     resetModal();
//   };

//   return (
//     <div className="container py-3">
//       {/* ===== Header ===== */}
//       <div className="d-flex align-items-center mb-3">
//         <h2 className="m-0 d-flex align-items-center">
//           <i className="bi bi-piggy-bank-fill me-2"></i>
//           Saving
//         </h2>
//       </div>

//       {/* ===== Top bar: Year (left) | Add Item (right) ===== */}
//       <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
//         {/* Left: Year selector */}
//         <div className="d-flex align-items-end gap-2">
//           <div>
//             <label htmlFor="year" className="form-label mb-1">
//               Year
//             </label>
//             <select
//               id="year"
//               className="form-select"
//               value={year}
//               onChange={(e) => setYear(e.target.value)}
//               style={{ width: 140 }}
//             >
//               <option value={String(currentYear + 1)}>{currentYear + 1}</option>
//               <option value={String(currentYear)}>{currentYear}</option>
//               <option value={String(currentYear - 1)}>{currentYear - 1}</option>
//               <option value={String(currentYear - 2)}>{currentYear - 2}</option>
//               <option value={String(currentYear - 3)}>{currentYear - 3}</option>
//             </select>
//           </div>
//         </div>

//         {/* Right: Add Item */}
//         <div className="ms-auto">
//           <button
//             type="button"
//             className="btn btn-outline-secondary"
//             onClick={openModal}
//           >
//             <i className="bi bi-plus-lg me-1"></i>
//             Add Item
//           </button>
//         </div>
//       </div>

//       {/* ===== Extra Money ===== */}
//       <div className="mb-3 d-flex align-items-center gap-3">
//         <span className="badge bg-success fs-6">
//           Extra Money: <strong className="ms-1">${extraMoney}</strong>
//         </span>
//       </div>

//       {/* ===== Items table (with Source column) ===== */}
//       <div className="table-responsive">
//         <table className="table align-middle">
//           <thead>
//             <tr>
//               <th>Item</th>
//               <th>Type</th>
//               <th>Source</th>
//               <th className="text-end">Current / Balance</th>
//               <th className="text-end">Target</th>
//               <th className="text-end" style={{ width: 200 }}>
//                 Add Amount ($)
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((item) => {
//               const value = allocations[item.id] ?? 0;

//               const srcLabel =
//                 savingSources.find((s) => s.id === item.sourceId)?.label || "—";

//               const currentCol =
//                 item.type === "debt"
//                   ? item.balanceRemaining != null
//                     ? currency(item.balanceRemaining)
//                     : "—"
//                   : item.current != null
//                     ? currency(item.current)
//                     : "—";

//               const targetCol =
//                 item.type === "goal" || item.type === "debt"
//                   ? item.target != null
//                     ? currency(item.target)
//                     : "—"
//                   : "—";

//               return (
//                 <tr key={item.id}>
//                   <td>{item.name}</td>
//                   <td>{typeLabel(item.type)}</td>
//                   <td>{srcLabel}</td>
//                   <td className="text-end">{currentCol}</td>
//                   <td className="text-end">{targetCol}</td>
//                   <td className="text-end">
//                     <input
//                       data-testid={`alloc-input-${item.id}`}
//                       type="number"
//                       min={0}
//                       className="form-control text-end"
//                       value={value}
//                       onChange={(e) =>
//                         handleAllocChange(item.id, e.target.value)
//                       }
//                       onBlur={(e) => {
//                         const n = Number(e.target.value);
//                         if (!isFinite(n) || n < 0)
//                           handleAllocChange(item.id, 0);
//                       }}
//                     />
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {remaining > 0 && (
//         <div className="alert alert-warning mt-2">
//           You still have <strong>${remaining}</strong> unallocated for {year}.
//         </div>
//       )}

//       <div className="d-flex justify-content-end mt-3">
//         <button
//           data-testid="save-allocations"
//           className="btn btn-primary"
//           onClick={handleSave}
//           disabled={remaining > 0}
//           title={
//             remaining > 0
//               ? "Allocate all extra money first"
//               : "Save allocations"
//           }
//         >
//           Save All Allocations
//         </button>
//       </div>

//       {/* ===== YOUR modal plugged in & wired ===== */}
//       {showAddModal && (
//         <>
//           <div
//             className="modal fade show"
//             style={{ display: "block" }}
//             tabIndex="-1"
//             role="dialog"
//             aria-modal="true"
//           >
//             <div className="modal-dialog">
//               <div className="modal-content">
//                 <form onSubmit={handleAddFromModal}>
//                   <div className="modal-header">
//                     <h5 className="modal-title">Add Item</h5>
//                     <button
//                       type="button"
//                       className="btn-close"
//                       onClick={() => setShowAddModal(false)}
//                       aria-label="Close"
//                     />
//                   </div>

//                   <div className="modal-body">
//                     {/* Item name */}
//                     <div className="mb-3">
//                       <label className="form-label">Item</label>
//                       <input
//                         className="form-control"
//                         placeholder="e.g., TFSA, Europe Trip, Line of Credit"
//                         value={mItemName}
//                         onChange={(e) => setMItemName(e.target.value)}
//                         maxLength={80}
//                         required
//                       />
//                     </div>

//                     {/* Type */}
//                     <div className="mb-3">
//                       <label className="form-label">Type</label>
//                       <select
//                         className="form-select"
//                         value={mType}
//                         onChange={(e) => setMType(e.target.value)}
//                       >
//                         <option value="saving">Saving</option>
//                         <option value="goal">Goal</option>
//                         <option value="debt">Debt</option>
//                       </select>
//                     </div>
//                     {/* Target (optional now) */}
//                     <div className="mb-3">
//                       <label className="form-label">Target</label>
//                       <input
//                         type="number"
//                         min={0}
//                         className="form-control"
//                         placeholder={
//                           mType === "goal"
//                             ? "Goal amount (optional)"
//                             : mType === "debt"
//                               ? "Payoff target (optional)"
//                               : "Optional"
//                         }
//                         value={mTarget}
//                         onChange={(e) => setMTarget(e.target.value)}
//                       />
//                     </div>

//                     {/* Current / Balance (optional) */}
//                     <div className="mb-3">
//                       <label className="form-label">Current / Balance</label>
//                       <input
//                         type="number"
//                         min={0}
//                         className="form-control"
//                         placeholder={
//                           mType === "debt"
//                             ? "Current balance (optional)"
//                             : "Current saved (optional)"
//                         }
//                         value={mCurrentOrBalance}
//                         onChange={(e) => setMCurrentOrBalance(e.target.value)}
//                       />
//                     </div>

//                     {/* Add Amount ($) */}
//                     <div className="mb-1">
//                       <label className="form-label">Add Amount ($)</label>
//                       <input
//                         type="number"
//                         min={0}
//                         className="form-control"
//                         placeholder={`Up to remaining $${remaining}`}
//                         value={mAddAmount}
//                         onChange={(e) => setMAddAmount(e.target.value)}
//                         required
//                       />
//                     </div>
//                   </div>
//                   <div className="modal-footer">
//                     <button
//                       type="button"
//                       className="btn btn-light"
//                       onClick={() => setShowAddModal(false)}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="btn btn-primary"
//                       disabled={remaining <= 0}
//                     >
//                       Add
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//           <div className="modal-backdrop fade show" />
//         </>
//       )}
//     </div>
//   );
// };

// export default SavingPage;
import React, { useEffect, useMemo, useState } from "react";
import { getExtraMoneyByYear, getAllSavingAsync } from "../services/api";

// ===== Static Sources =====
const defaultSavingSources = [
  { id: "tfsa", label: "TFSA (Tax-Free Savings Account)" },
  { id: "rrsp", label: "RRSP (Retirement Savings)" },
  { id: "emergency", label: "Emergency Fund" },
  { id: "travel", label: "Travel Fund" },
];

const SavingPage = ({ userId }) => {
  // ===== Year =====
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));

  // ===== Data from API =====
  const [extraMoney, setExtraMoney] = useState(0);
  const [items, setItems] = useState([]);

  // ===== Sources =====
  const [savingSources] = useState(defaultSavingSources);

  // ===== Allocations =====
  const [allocations, setAllocations] = useState({});

  // ===== Load data from API =====
  useEffect(() => {
    if (!userId || !year) return;

    const loadData = async () => {
      try {
        // Extra Money
        const extra = await getExtraMoneyByYear(userId, year);
        setExtraMoney(Number(extra) || 0);

        // Items
        const data = await getAllSavingAsync(userId, year);

        const normalized = data.map((x) => ({
          id: x.id,
          name: x.name,
          type: x.type, // saving | goal | debt
          current: x.current ?? 0,
          balanceRemaining: x.balanceRemaining,
          target: x.target,
          sourceId: x.sourceId,
          year: x.year,
        }));

        setItems(normalized);
        setAllocations({});
      } catch (err) {
        console.error("Failed to load saving data", err);
      }
    };

    loadData();
  }, [userId, year]);

  // ===== Calculations =====
  const totalAllocated = useMemo(
    () =>
      Object.values(allocations).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [allocations],
  );

  const remaining = Math.max(0, extraMoney - totalAllocated);

  // ===== Handlers =====
  const handleAllocChange = (id, value) => {
    const n = Number(value);
    setAllocations((prev) => ({
      ...prev,
      [id]: isFinite(n) && n > 0 ? n : 0,
    }));
  };

  const handleSave = () => {
    if (remaining > 0) return;

    const payload = Object.entries(allocations)
      .filter(([, amt]) => amt > 0)
      .map(([itemId, amount]) => ({
        itemId,
        amount,
        year: Number(year),
      }));

    console.log("Saving allocations:", payload);
    alert("Saved successfully (check console)");
  };

  // ===== Utils =====
  const currency = (n) =>
    typeof n === "number" ? `$${n.toLocaleString()}` : "—";

  const typeLabel = (t) =>
    t === "saving" ? "Saving" : t === "debt" ? "Debt" : "Goal";

  // ===== Modal State =====
  const [showAddModal, setShowAddModal] = useState(false);
  const [mItemName, setMItemName] = useState("");
  const [mType, setMType] = useState("saving");
  const [mTarget, setMTarget] = useState("");
  const [mCurrentOrBalance, setMCurrentOrBalance] = useState("");
  const [mAddAmount, setMAddAmount] = useState("");

  const resetModal = () => {
    setMItemName("");
    setMType("saving");
    setMTarget("");
    setMCurrentOrBalance("");
    setMAddAmount("");
  };

  const handleAddFromModal = (e) => {
    e.preventDefault();

    const addAmt = Number(mAddAmount);
    if (!mItemName || addAmt <= 0 || addAmt > remaining) return;

    const id = `${mItemName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    const newItem = {
      id,
      name: mItemName,
      type: mType,
      current: Number(mCurrentOrBalance) || 0,
      target: Number(mTarget) || undefined,
      sourceId: savingSources[0].id,
      year: Number(year),
    };

    setItems((prev) => [newItem, ...prev]);
    setAllocations((prev) => ({ ...prev, [id]: addAmt }));
    setShowAddModal(false);
    resetModal();
  };

  // ===== Render =====
  return (
    <div className="container py-3">
      <h2 className="mb-3">
        <i className="bi bi-piggy-bank-fill me-2"></i>
        Saving
      </h2>

      {/* Year */}
      <select
        className="form-select mb-3"
        style={{ width: 150 }}
        value={year}
        onChange={(e) => setYear(e.target.value)}
      >
        {[0, -1, -2, -3, 1].map((y) => (
          <option key={y} value={currentYear + y}>
            {currentYear + y}
          </option>
        ))}
      </select>

      {/* Extra Money */}
      <span className="badge bg-success fs-6 mb-3 d-inline-block">
        Extra Money: ${extraMoney}
      </span>

      {/* Table */}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Source</th>
              <th className="text-end">Current / Balance</th>
              <th className="text-end">Target</th>
              <th className="text-end">Add Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{typeLabel(item.type)}</td>
                <td>
                  {savingSources.find((s) => s.id === item.sourceId)?.label ||
                    "—"}
                </td>
                <td className="text-end">
                  {item.type === "debt"
                    ? currency(item.balanceRemaining)
                    : currency(item.current)}
                </td>
                <td className="text-end">{currency(item.target)}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    className="form-control text-end"
                    value={allocations[item.id] || ""}
                    onChange={(e) => handleAllocChange(item.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {remaining > 0 && (
        <div className="alert alert-warning">
          Remaining: <strong>${remaining}</strong>
        </div>
      )}

      <button
        className="btn btn-primary float-end"
        disabled={remaining > 0}
        onClick={handleSave}
      >
        Save All Allocations
      </button>

      {/* Add Item Modal */}
      {showAddModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog">
              <form className="modal-content" onSubmit={handleAddFromModal}>
                <div className="modal-header">
                  <h5>Add Item</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    placeholder="Item name"
                    value={mItemName}
                    onChange={(e) => setMItemName(e.target.value)}
                    required
                  />
                  <input
                    className="form-control mb-2"
                    type="number"
                    placeholder="Add amount"
                    value={mAddAmount}
                    onChange={(e) => setMAddAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" type="button">
                    Cancel
                  </button>
                  <button className="btn btn-primary" type="submit">
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
};

export default SavingPage;
