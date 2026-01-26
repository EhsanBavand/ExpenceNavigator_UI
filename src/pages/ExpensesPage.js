import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTrash, FaCheck } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import {
  getCategories,
  getSubCategories,
  getPlaces,
  getExpenses,
  createCategory,
  createSubCategory,
  createPlace,
  createExpense,
  deleteCategory,
  deleteSubCategory,
  deletePlace,
  deleteExpense,
  updateCategory,
  updateSubCategory,
  updatePlace,
  updateExpense,
  getDashboardSummary,
  copyExpenseByRange,
} from "../services/api";

export default function ExpenseManager() {
  const [formTab, setFormTab] = useState("category");
  const [tableTab, setTableTab] = useState("category");

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [places, setPlaces] = useState([]);

  const [categoryName, setCategoryName] = useState("");
  const [categoryBudget, setCategoryBudget] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [selectedCategoryForPlace, setSelectedCategoryForPlace] = useState("");
  const [selectedSubCategoryForPlace, setSelectedSubCategoryForPlace] =
    useState("");
  const [expenseForm, setExpenseForm] = useState({
    date: "",
    category: "",
    subCategory: "",
    place: "",
    store: "",
    amount: "",
    paidFor: "",
    itemName: "",
    note: "",
    isFixed: false,
  });

  const [userId, setUserId] = useState(null);

  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1–12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [editSubCategoryModalOpen, setEditSubCategoryModalOpen] =
    useState(false);
  const [editPlaceModalOpen, setEditPlaceModalOpen] = useState(false);

  const [editCategoryItem, setEditCategoryItem] = useState(null);
  const [editSubCategoryItem, setEditSubCategoryItem] = useState(null);
  const [editPlaceItem, setEditPlaceItem] = useState(null);

  const [editCategoryName, setEditCategoryName] = useState("");
  const [editSubCategoryName, setEditSubCategoryName] = useState("");
  const [editSubCategoryParent, setEditSubCategoryParent] = useState("");
  const [editPlaceName, setEditPlaceName] = useState("");
  const [editPlaceSubCategory, setEditPlaceSubCategory] = useState("");

  const [editExpenseModalOpen, setEditExpenseModalOpen] = useState(false);
  const [editExpenseForm, setEditExpenseForm] = useState({
    date: "",
    categoryId: "",
    subCategoryId: "",
    placeId: "",
    amount: "",
    paidFor: "",
    note: "",
    isFixed: false,
  });
  const [expenses, setExpenses] = useState([]);
  const [categoryIsRecurring, setCategoryIsRecurring] = useState(false);
  const categoryMap = React.useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.catId] = c.name;
    });
    return map;
  }, [categories]);

  const sortedExpenses = React.useMemo(() => {
    return [...expenses].sort((a, b) => {
      const catA = categoryMap[a.categoryId] || "";
      const catB = categoryMap[b.categoryId] || "";
      return catA.localeCompare(catB);
    });
  }, [expenses, categoryMap]);

  const [editPlaceCategory, setEditPlaceCategory] = useState("");

  // Show Total Summery
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalBudget: 0,
    totalExpenses: 0,
    remainingIncome: 0,
    remainingBudget: 0,
  });

  const fetchSummary = async () => {
    if (!userId || !selectedMonth || !selectedYear) return;

    try {
      const data = await getDashboardSummary(
        userId,
        parseInt(selectedMonth),
        parseInt(selectedYear)
      );
      setSummary(data);
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchData(), fetchSummary()]);
  };

  // After your existing useState declarations
  const [showBudgetPrompt, setShowBudgetPrompt] = useState(false);
  const [budgetPromptCategory, setBudgetPromptCategory] = useState(null);
  const [newBudgetAmount, setNewBudgetAmount] = useState("");

  useEffect(() => {
    if (!userId) return;
    fetchData();
    fetchSummary();
  }, [userId, selectedMonth, selectedYear]);

  // Decode JWT to get userId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const id =
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        decoded.sub ||
        null;
      setUserId(id);
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId, selectedMonth, selectedYear]);

  useEffect(() => {
    console.log("Categories:", categories);
    console.log("SubCategories:", subCategories);
    console.log("Places:", places);
  }, [categories, subCategories, places]);

  const fetchData = async () => {
    try {
      const [catRes, subRes, placeRes, expRes] = await Promise.all([
        getCategories(userId, selectedMonth, selectedYear),
        getSubCategories(userId),
        getPlaces(userId),
        getExpenses(userId, selectedMonth, selectedYear),
      ]);

      setCategories(catRes);
      setSubCategories(subRes);
      setPlaces(placeRes);
      setExpenses(expRes);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName || !userId) return;

    try {
      await createCategory(
        userId,
        categoryName,
        categoryBudget ? parseFloat(categoryBudget) : 0,
        categoryIsRecurring
      );

      await refreshAll();
      await fetchSummary();

      setCategoryName("");
      setCategoryBudget("");
      setCategoryIsRecurring(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create category");
    }
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    if (!subCategoryName || !selectedCategory || !userId) return;

    try {
      const res = await createSubCategory({
        name: subCategoryName,
        categoryId: selectedCategory, // ✅ this is now the ID, not name
        userId,
        isRecurring: true, // <--- add this
      });

      setSubCategories([...subCategories, res]);
      setSubCategoryName("");
      setSelectedCategory("");
    } catch (err) {
      console.error(err);
      alert("Failed to create subcategory");
    }
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    if (!placeName || !userId) return;
    try {
      const res = await createPlace({
        name: placeName,
        // categoryId: selectedCategoryForPlace,
        subCategoryId: selectedSubCategoryForPlace || null,
        userId,
        isRecurring: true, // <--- add this
      });
      setPlaces([...places, res]);
      setPlaceName("");
      setSelectedCategoryForPlace("");
      setSelectedSubCategoryForPlace("");
    } catch (err) {
      console.error(err);
      alert("Failed to create place");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (
      !userId ||
      !expenseForm.category ||
      !expenseForm.amount ||
      !expenseForm.date
    )
      return;

    const dateObj = new Date(expenseForm.date);
    if (isNaN(dateObj)) return;

    try {
      await createExpense({
        userId,
        date: expenseForm.date, // yyyy-MM-dd
        categoryId: expenseForm.category,
        subCategoryId: expenseForm.subCategory || null,
        placeId: expenseForm.place || null,
        amount: parseFloat(expenseForm.amount),
        paidFor: expenseForm.paidFor || null,
        itemName: expenseForm.itemName || null,
        note: expenseForm.note || null,

        // ✅ derived (hidden)
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear(),

        isFixed: expenseForm.isFixed ?? false,
      });

      // ✅ single source of truth
      await refreshAll();

      setExpenseForm({
        date: "",
        category: "",
        subCategory: "",
        place: "",
        store: "",
        amount: "",
        paidFor: "",
        itemName: "",
        note: "",
        isFixed: false,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create expense");
    }
  };

  const handleExpenseChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "category") {
      setExpenseForm({
        ...expenseForm,
        category: value,
        subCategory: "", // reset subCategory
        place: "", // reset place
      });
    } else {
      setExpenseForm({
        ...expenseForm,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleDelete = async (
    id,
    type,
    userId = null,
    month = null,
    year = null
  ) => {
    // if (!id || !userId) return;
    if (!id) return;

    try {
      switch (type) {
        case "expense":
          await deleteExpense(id);
          await refreshAll();
          await fetchSummary();
          break;

        case "category":
          if (!userId || month == null || year == null) {
            console.warn("Missing params for category delete");
            return;
          }
          await deleteCategory(id, userId, month, year);
          await refreshAll();
          break;

        case "subCategory":
          await deleteSubCategory(id);
          setSubCategories(await getSubCategories(userId));
          break;

        case "place":
          await deletePlace(id);
          setPlaces(await getPlaces(userId));
          break;

        default:
          console.warn("Unknown delete type:", type);
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const openEditCategoryModal = (category) => {
    setEditCategoryItem(category);
    setEditCategoryName(category.name);
    setEditCategoryModalOpen(true);
  };

  const openEditSubCategoryModal = (sub) => {
    setEditSubCategoryItem(sub);
    setEditSubCategoryName(sub.name);
    setEditSubCategoryParent(sub.categoryId);
    setEditSubCategoryModalOpen(true);
  };

  const openEditPlaceModal = (place) => {
    const freshPlace = places.find((p) => p.id === place.id);

    setEditPlaceItem(freshPlace);
    setEditPlaceName(freshPlace.name);
    setEditPlaceCategory(freshPlace.categoryId);
    setEditPlaceSubCategory(freshPlace.subCategoryId);

    setEditPlaceModalOpen(true);
  };

  const saveEditCategory = async () => {
    if (!editCategoryItem) return;

    const payload = {
      catId: editCategoryItem.catId,
      userId: editCategoryItem.userId,
      name: editCategoryName,
      budget: editCategoryItem.budget,
      isRecurring: editCategoryItem.isRecurring,
      isActive: editCategoryItem.isActive,
      month: editCategoryItem.month,
      year: editCategoryItem.year,
    };

    try {
      await updateCategory(payload);

      await refreshAll();

      const refreshedCategories = await getCategories(
        userId,
        selectedMonth,
        selectedYear
      );
      setCategories(refreshedCategories);

      await fetchSummary(); // ✅ ADD THIS

      setEditCategoryModalOpen(false);
    } catch (err) {
      console.error("Failed to update category", err);
      alert("Failed to update category");
    }
  };

  const saveEditSubCategory = async () => {
    if (!editSubCategoryItem) return;
    if (!editSubCategoryParent) {
      alert("Please select a parent category");
      return;
    }

    try {
      const payload = {
        id: editSubCategoryItem.id,
        name: editSubCategoryName,
        categoryId: editSubCategoryParent,
        createdDate: editSubCategoryItem.createdDate || null,
        isRecurring: editSubCategoryItem.isRecurring,
        isActive: editSubCategoryItem.isActive,
      };

      await updateSubCategory(editSubCategoryItem.id, payload);

      // ⬇️ IMPORTANT PART: refresh from backend
      const refreshedSubCategories = await getSubCategories(userId);
      setSubCategories(refreshedSubCategories);

      setEditSubCategoryModalOpen(false);
    } catch (err) {
      console.error("Failed to update subcategory:", err.response?.data || err);
      alert("Failed to update subcategory");
    }
  };

  const saveEditPlace = async () => {
    try {
      const userId = localStorage.getItem("userId"); // or however you store it

      const payload = {
        name: editPlaceName,
        // categoryId: editPlaceCategory,
        subCategoryId: editPlaceSubCategory || null,
        userId,
        isRecurring: editPlaceItem.isRecurring,
        isActive: editPlaceItem.isActive,
      };

      console.log("Payload:", payload);

      await updatePlace(editPlaceItem.id, payload);

      setPlaces(
        places.map((p) =>
          p.id === editPlaceItem.id
            ? {
                ...p,
                name: editPlaceName,
                // categoryId: editPlaceCategory,
                // subCategoryId: editPlaceSubCategory,
                isRecurring: editPlaceItem.isRecurring,
              }
            : p
        )
      );

      setEditPlaceModalOpen(false);
    } catch (err) {
      console.error("Failed to update place:", err.response?.data || err);
      alert("Failed to update place");
    }
  };

  const saveEditExpense = async (id) => {
    const rowData = editExpenseForm[id] || {};
    const original = expenses.find((e) => e.id === id);
    if (!original) return;

    const dateStr =
      rowData.date ?? (original.date ? original.date.split("T")[0] : null);

    if (!dateStr) return;

    const dateObj = new Date(dateStr);
    if (isNaN(dateObj)) return;

    try {
      const payload = {
        userId,
        date: dateStr,
        categoryId: rowData.categoryId ?? original.categoryId,
        subCategoryId: rowData.subCategoryId ?? original.subCategoryId ?? null,
        placeId: rowData.placeId ?? original.placeId ?? null,
        amount: parseFloat(rowData.amount ?? original.amount),
        paidFor: rowData.paidFor ?? original.paidFor ?? null,
        itemName: rowData.itemName ?? original.itemName ?? null,
        note: rowData.note ?? original.note ?? "",
        isFixed: rowData.isFixed ?? original.isFixed ?? false,

        // ✅ derived again
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear(),
      };

      await updateExpense(id, payload);

      // ✅ DO NOT mutate local state
      // Expense may move to another month
      await refreshAll();

      setEditExpenseForm((prev) => ({ ...prev, [id]: undefined }));
    } catch (err) {
      console.error("Failed to update expense:", err.response?.data || err);
      alert("Failed to update expense");
    }
  };

  const [categorySort, setCategorySort] = useState({
    field: "name",
    asc: true,
  });

  const handleCategorySort = (field) => {
    const asc = categorySort.field === field ? !categorySort.asc : true;
    setCategorySort({ field, asc });
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const field = categorySort.field;
    let valA = a[field];
    let valB = b[field];

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return categorySort.asc ? -1 : 1;
    if (valA > valB) return categorySort.asc ? 1 : -1;
    return 0;
  });

  // Sub Category
  const [subCatSort, setSubCatSort] = useState({ field: "name", asc: true });

  const handleSubCatSort = (field) => {
    const asc = subCatSort.field === field ? !subCatSort.asc : true;
    setSubCatSort({ field, asc });
  };

  const sortedSubCategories = [...subCategories].sort((a, b) => {
    const field = subCatSort.field; // ✅ use state
    let valA, valB;

    if (field === "category") {
      valA = categories.find((c) => c.catId === a.categoryId)?.name || "";
      valB = categories.find((c) => c.catId === b.categoryId)?.name || "";
    } else {
      valA = a[field];
      valB = b[field];
    }

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return subCatSort.asc ? -1 : 1;
    if (valA > valB) return subCatSort.asc ? 1 : -1;
    return 0;
  });

  // Place
  const [placeSort, setPlaceSort] = useState({ field: "name", asc: true });
  const sortedPlaces = [...places].sort((a, b) => {
    let valA = a.name.toLowerCase();
    let valB = b.name.toLowerCase();
    return placeSort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  // Expense
  const [expenseSort, setExpenseSort] = useState({ field: "date", asc: true });

  const sortedExpenseInTable = [...expenses].sort((a, b) => {
    let valA, valB;
    switch (expenseSort.field) {
      case "date":
        valA = new Date(a.date);
        valB = new Date(b.date);
        break;
      case "category":
        valA = categories.find((c) => c.catId === a.categoryId)?.name || "";
        valB = categories.find((c) => c.catId === b.categoryId)?.name || "";
        break;
      case "subCategory":
        valA =
          subCategories.find((sc) => sc.id === a.subCategoryId)?.name || "";
        valB =
          subCategories.find((sc) => sc.id === b.subCategoryId)?.name || "";
        break;
      case "place":
        valA = places.find((p) => p.id === a.placeId)?.name || "";
        valB = places.find((p) => p.id === b.placeId)?.name || "";
        break;
      case "isFixed":
        // true > false
        valA = a.isFixed ? 1 : 0;
        valB = b.isFixed ? 1 : 0;
        break;
      default:
        valA = valB = 0;
    }

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return expenseSort.asc ? -1 : 1;
    if (valA > valB) return expenseSort.asc ? 1 : -1;
    return 0;
  });

  const toggleExpenseSort = (field) => {
    setExpenseSort((prev) => {
      if (prev.field === field) {
        return { field, asc: !prev.asc }; // toggle direction
      }
      return { field, asc: true }; // new field defaults to ascending
    });
  };

  // Generate for Next Month
  const monthNames = [
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
  ];

  const [showGenerateModal, setShowGenerateExpenseModal] = useState(false);

  const [generateRange, setGenerateRange] = useState({
    fromMonth: selectedMonth,
    fromYear: selectedYear,
    toMonth: selectedMonth,
    toYear: selectedYear,
  });

  const hasDataToCopy = sortedExpenseInTable.length > 0;

  const buildGeneratePayload = () => ({
    userId,
    sourceYear: selectedYear,
    sourceMonth: selectedMonth,
    targetFromYear: generateRange.fromYear,
    targetFromMonth: generateRange.fromMonth,
    targetToYear: generateRange.toYear,
    targetToMonth: generateRange.toMonth,
  });

  return (
    <div className="container my-4">
      <div className="d-flex mb-3">
        <div className="d-flex gap-2">
          {/* Month */}
          <div>
            <label className="form-label mb-1">Month</label>
            <select
              className="form-select"
              style={{ width: "140px" }}
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
              ].map((m, index) => (
                <option key={index} value={index + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="form-label mb-1">Year</label>
            <select
              className="form-select"
              style={{ width: "110px" }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {Array.from({ length: 2035 - 2023 + 1 }, (_, i) => {
                const year = 2023 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* ---------------- Forms ---------------- */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">Forms</div>
            <div className="card-body">
              <ul className="nav nav-tabs mb-3">
                {["category", "subCategory", "place", "expense"].map((tab) => (
                  <li className="nav-item" key={tab}>
                    <button
                      className={`nav-link ${formTab === tab ? "active" : ""}`}
                      onClick={() => setFormTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Category Form */}
              {formTab === "category" && (
                <form onSubmit={handleAddCategory}>
                  {/* Category Name */}
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Category Name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />

                  {/* Budget */}
                  <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Budget"
                    value={categoryBudget}
                    onChange={(e) => setCategoryBudget(e.target.value)}
                    min="0"
                    required
                  />

                  {/* ✅ Is Recurring */}
                  {/* <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isRecurring"
                      checked={categoryIsRecurring}
                      onChange={(e) => setCategoryIsRecurring(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="isRecurring">
                      Is Recurring
                    </label>
                  </div> */}

                  <button className="btn btn-primary w-100">
                    Add Category
                  </button>
                </form>
              )}

              {/* SubCategory Form */}
              {formTab === "subCategory" && (
                <form onSubmit={handleAddSubCategory}>
                  <select
                    className="form-select mb-2"
                    value={selectedCategory} // this should be the ID
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                  >
                    <option value="">Choose Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.catId}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="SubCategory Name"
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    required
                  />
                  <button className="btn btn-primary w-100">
                    Add SubCategory
                  </button>
                </form>
              )}

              {/* Place Form */}
              {formTab === "place" && (
                <form onSubmit={handleAddPlace}>
                  {/* Category Select */}
                  {/* <select
                    className="form-select mb-2"
                    value={selectedCategoryForPlace}
                    onChange={(e) => {
                      setSelectedCategoryForPlace(e.target.value);
                      setSelectedSubCategoryForPlace(""); // reset subcategory when category changes
                    }}
                    required
                  >
                    <option value="">Choose Category</option>
                    {categories.map((c) => (
                      <option key={c.catId} value={c.catId}>
                        {c.name}
                      </option>
                    ))}
                  </select> */}

                  {/* Place Name */}
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Place Name"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    required
                  />

                  {/* <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isRecurring"
                      checked={placeIsRecurring}
                      onChange={(e) => setplaceIsRecurring(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="isRecurring">
                      Is Recurring
                    </label>
                  </div> */}

                  <button className="btn btn-warning w-100">Add Place</button>
                </form>
              )}

              {/* Expense Form */}
              {formTab === "expense" && (
                <form onSubmit={handleAddExpense}>
                  <div className="row g-2">
                    {/* Date */}
                    <div className="col-12 col-sm-6">
                      <input
                        type="date"
                        name="date"
                        className="form-control"
                        value={expenseForm.date || ""}
                        onChange={handleExpenseChange}
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="col-12 col-sm-6">
                      <select
                        className="form-select"
                        name="category"
                        value={expenseForm.category}
                        onChange={(e) => {
                          const value = e.target.value;
                          setExpenseForm({
                            ...expenseForm,
                            category: value,
                            subCategory: "", // reset subcategory
                            place: "", // reset place
                          });
                        }}
                        required
                      >
                        <option value="">Choose a Category</option>
                        {categories
                          .filter((c) => c.isActive)
                          .map((c) => (
                            <option key={c.catId} value={c.catId}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* SubCategory */}
                    <div className="col-12 col-sm-6">
                      <select
                        className="form-select"
                        name="subCategory"
                        value={expenseForm.subCategory || ""}
                        onChange={handleExpenseChange}
                      >
                        <option value="">
                          Choose a SubCategory (optional)
                        </option>
                        {subCategories
                          .filter(
                            (sc) => sc.categoryId === expenseForm.category
                          )
                          .map((sc) => (
                            <option key={sc.id} value={sc.id}>
                              {sc.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Place */}
                    <div className="col-12 col-sm-6">
                      <select
                        className="form-select"
                        name="place"
                        value={expenseForm.place || ""}
                        onChange={handleExpenseChange}
                        // required
                      >
                        <option value="">Choose a Place</option>
                        {places.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Amount */}
                    <div className="col-12 col-sm-6">
                      <input
                        type="number"
                        name="amount"
                        className="form-control"
                        placeholder="Amount"
                        value={expenseForm.amount}
                        onChange={handleExpenseChange}
                        required
                      />
                    </div>

                    {/* Paid For */}
                    <div className="col-12 col-sm-6">
                      <input
                        type="text"
                        name="paidFor"
                        className="form-control"
                        placeholder="Paid For"
                        value={expenseForm.paidFor}
                        onChange={handleExpenseChange}
                      />
                    </div>

                    {/* Item Name */}
                    <div className="col-12 col-sm-6">
                      <input
                        type="text"
                        name="itemName"
                        className="form-control"
                        placeholder="Item Name"
                        value={expenseForm.itemName}
                        onChange={handleExpenseChange}
                      />
                    </div>

                    {/* Note */}
                    <div className="col-12">
                      <textarea
                        name="note"
                        className="form-control"
                        placeholder="Note"
                        value={expenseForm.note}
                        onChange={handleExpenseChange}
                      ></textarea>
                    </div>

                    {/* Fixed Expense */}
                    <div className="col-12">
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          id="expenseLable"
                          name="isFixed"
                          className="form-check-input"
                          checked={expenseForm.isFixed}
                          onChange={handleExpenseChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="expenseLable"
                        >
                          Fixed Expense
                        </label>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="col-12">
                      <button className="btn btn-success w-100">
                        Add Expense
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- Tables ---------------- */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">Tables</div>
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="card text-center shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted">Total Income</h6>
                    <h4 className="text-success">${summary.totalIncome}</h4>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card text-center shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted">Total Budget</h6>
                    <h4 className="text-primary">${summary.totalBudget}</h4>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card text-center shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted">Remaining</h6>
                    <h4
                      className={
                        summary.remainingIncome < 0
                          ? "text-danger"
                          : "text-success"
                      }
                    >
                      ${summary.remainingBudget}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="d-flex justify-content-between mb-0">
                {/* Left: main table tabs */}
                <ul className="nav nav-tabs">
                  {["category", "subCategory", "place", "expense"].map(
                    (tab) => (
                      <li className="nav-item" key={tab}>
                        <button
                          className={`nav-link ${
                            tableTab === tab ? "active" : ""
                          }`}
                          onClick={() => setTableTab(tab)}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)} Table
                        </button>
                      </li>
                    )
                  )}
                </ul>

                {/* Generate Next Month */}
                <button
                  className={`nav-link fw-bold ${
                    tableTab === "copyNextMonth"
                      ? "text-success border border-success"
                      : "text-success"
                  }`}
                  style={{
                    borderRadius: "0.25rem",
                    backgroundColor: "transparent",
                    borderWidth: tableTab === "copyNextMonth" ? "2px" : "1px",
                    border: "1px solid green",
                    padding: "0px 5px",
                  }}
                  onClick={() => setShowGenerateExpenseModal(true)}
                >
                  Copy Expenses Next Month
                </button>
              </div>

              {/* Category Table */}
              {tableTab === "category" && (
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      {/* <th>Name</th>
                      <th>Budget</th> */}
                      <th onClick={() => handleCategorySort("name")}>Name</th>
                      <th onClick={() => handleCategorySort("budget")}>
                        Budget
                      </th>
                      {/* <th>Recurring</th> */}
                      <th>Active</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {categories.map((cat) => ( */}
                    {sortedCategories.map((cat) => (
                      <tr key={cat.id}>
                        <td>{cat.name}</td>
                        <td>{cat.budget}</td>
                        {/* <td>{cat.isRecurring ? "Yes" : "No"}</td> */}
                        <td>{cat.isActive ? "Yes" : "No"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => openEditCategoryModal(cat)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(
                                cat.catId,
                                "category",
                                userId,
                                parseInt(selectedMonth),
                                parseInt(selectedYear)
                              )
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center">
                          No categories
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* SubCategory Table */}
              {tableTab === "subCategory" && (
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      {/* <th>Name</th>
                      <th>Category</th> */}
                      <th onClick={() => handleSubCatSort("name")}>Name</th>
                      <th onClick={() => handleSubCatSort("category")}>
                        Category
                      </th>

                      {/* <th>Recurring</th> */}
                      <th>Active</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {subCategories.map((sc) => ( */}
                    {sortedSubCategories.map((sc) => (
                      <tr key={sc.id}>
                        <td>{sc.name}</td>
                        <td>
                          {categories.find((c) => c.catId === sc.categoryId)
                            ?.name || "-"}
                        </td>
                        {/* <td>{sc.isRecurring ? "Yes" : "No"}</td> */}
                        <td>{sc.isActive ? "Yes" : "No"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => openEditSubCategoryModal(sc)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(
                                sc.id,
                                "subCategory",
                                userId,
                                parseInt(selectedMonth),
                                parseInt(selectedYear)
                              )
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {subCategories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center">
                          No subcategories
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Place Table */}
              {tableTab === "place" && (
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      {/* <th>Name</th> */}
                      {/* <th>Category</th> */}
                      {/* <th>Recurring</th> */}
                      {/* <th>SubCategory</th> */}
                      <th
                        onClick={() =>
                          setPlaceSort({ field: "name", asc: !placeSort.asc })
                        }
                      >
                        Name
                      </th>
                      <th>Active</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {places.map((p) => ( */}
                    {sortedPlaces.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        {/* <td>
                          {categories.find((c) => c.catId === p.categoryId)
                            ?.name || "-"}
                        </td> */}
                        {/* <td>{p.isRecurring ? "Yes" : "No"}</td> */}
                        {/* <td>{subCategories.find(sc => sc.id === p.subCategoryId)?.name || "-"}</td> */}
                        <td>{p.isActive ? "Yes" : "No"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => openEditPlaceModal(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(
                                p.id,
                                "place",
                                userId,
                                parseInt(selectedMonth),
                                parseInt(selectedYear)
                              )
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {places.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center">
                          No places
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Expense Table */}
              {tableTab === "expense" && (
                <table className="table table-borderless">
                  <thead>
                    <tr>
                      {/* <th>Date</th>
                      <th>Category</th>
                      <th>SubCategory</th>
                      <th>Place</th> */}
                      <th
                        onClick={() =>
                          setExpenseSort({
                            field: "date",
                            asc: !expenseSort.asc,
                          })
                        }
                      >
                        Date
                      </th>
                      <th
                        onClick={() =>
                          setExpenseSort({
                            field: "category",
                            asc: !expenseSort.asc,
                          })
                        }
                      >
                        Category
                      </th>
                      <th
                        onClick={() =>
                          setExpenseSort({
                            field: "subCategory",
                            asc: !expenseSort.asc,
                          })
                        }
                      >
                        SubCategory
                      </th>
                      <th
                        onClick={() =>
                          setExpenseSort({
                            field: "place",
                            asc: !expenseSort.asc,
                          })
                        }
                      >
                        Place
                      </th>
                      <th>Amount</th>
                      <th>Paid For</th>
                      <th>Item Name</th>
                      <th>Note</th>
                      {/* <th>Fixed</th> */}
                      <th
                        onClick={() => toggleExpenseSort("isFixed")}
                        style={{ cursor: "pointer" }}
                      >
                        Fixed{" "}
                        {expenseSort.field === "isFixed" && expenseSort.asc}
                      </th>

                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {sortedExpenses.map((exp) => { */}
                    {sortedExpenseInTable.map((exp) => {
                      const row = editExpenseForm[exp.id] || {}; // ensure object exists

                      return (
                        <tr key={exp.id}>
                          {/* Date */}
                          <td>
                            <input
                              type="date"
                              className="form-control"
                              value={
                                row.date ??
                                (exp.date ? exp.date.split("T")[0] : "")
                              }
                              onChange={(e) =>
                                setEditExpenseForm({
                                  ...editExpenseForm,
                                  [exp.id]: { ...row, date: e.target.value },
                                })
                              }
                            />
                          </td>

                          {/* Category */}
                          <td>
                            <select
                              className="form-select"
                              value={row.categoryId ?? exp.categoryId ?? ""}
                              onChange={(e) =>
                                setEditExpenseForm({
                                  ...editExpenseForm,
                                  [exp.id]: {
                                    ...row,
                                    categoryId: e.target.value,
                                  },
                                })
                              }
                            >
                              <option value="">.....</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.catId}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* SubCategory */}
                          <td>
                            <select
                              className="form-select"
                              value={
                                row.subCategoryId ?? exp.subCategoryId ?? ""
                              }
                              onChange={(e) =>
                                setEditExpenseForm({
                                  ...editExpenseForm,
                                  [exp.id]: {
                                    ...row,
                                    subCategoryId: e.target.value,
                                  },
                                })
                              }
                            >
                              <option value="">....</option>
                              {subCategories
                                .filter(
                                  (sc) =>
                                    sc.categoryId ===
                                    (row.categoryId ?? exp.categoryId)
                                )
                                .map((sc) => (
                                  <option key={sc.id} value={sc.id}>
                                    {sc.name}
                                  </option>
                                ))}
                            </select>
                          </td>

                          {/* Place */}
                          <td>
                            <select
                              className="form-select"
                              value={row.placeId ?? exp.placeId ?? ""}
                              onChange={(e) =>
                                setEditExpenseForm({
                                  ...editExpenseForm,
                                  [exp.id]: { ...row, placeId: e.target.value },
                                })
                              }
                            >
                              <option value="">....</option>
                              {places
                                // .filter(
                                //   (p) =>
                                //     p.categoryId ===
                                //     (row.categoryId ?? exp.categoryId)
                                // )
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                            </select>
                          </td>

                          {/* Amount */}
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={row.amount ?? exp.amount ?? ""}
                              onChange={(e) =>
                                setEditExpenseForm({
                                  ...editExpenseForm,
                                  [exp.id]: { ...row, amount: e.target.value },
                                })
                              }
                            />
                          </td>

                          {/* Paid For */}
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={row.paidFor ?? exp.paidFor ?? ""}
                              onChange={(e) =>
                                setEditExpenseForm({
                                  ...editExpenseForm,
                                  [exp.id]: { ...row, paidFor: e.target.value },
                                })
                              }
                            />
                          </td>

                          {/* Item Name */}
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={row.itemName ?? exp.itemName ?? ""}
                              onChange={(e) =>
                                setEditExpenseForm({
                                  ...editExpenseForm,
                                  [exp.id]: {
                                    ...row,
                                    itemName: e.target.value,
                                  },
                                })
                              }
                            />
                          </td>

                          {/* Note */}
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={row.note ?? exp.note ?? ""}
                              onChange={(e) =>
                                setEditExpenseForm({
                                  ...editExpenseForm,
                                  [exp.id]: { ...row, note: e.target.value },
                                })
                              }
                            />
                          </td>

                          {/* Is Fixed */}
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={row.isFixed ?? exp.isFixed ?? false}
                              onChange={(e) =>
                                setEditExpenseForm({
                                  ...editExpenseForm,
                                  [exp.id]: {
                                    ...row,
                                    isFixed: e.target.checked,
                                  },
                                })
                              }
                            />
                          </td>

                          <td>
                            <FaCheck
                              className="text-success me-2"
                              style={{ cursor: "pointer" }}
                              onClick={() => saveEditExpense(exp.id)}
                            />
                            <FaTrash
                              className="text-danger"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleDelete(exp.id, "expense")}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {showBudgetPrompt && budgetPromptCategory && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Set Budget for {budgetPromptCategory.name}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowBudgetPrompt(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    You just added an expense to{" "}
                    <strong>{budgetPromptCategory.name}</strong>
                    but this category has no budget set for {selectedMonth}/
                    {selectedYear}.
                  </p>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter budget amount"
                    value={newBudgetAmount}
                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowBudgetPrompt(false)}
                  >
                    Not now
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      if (!newBudgetAmount || !budgetPromptCategory) return;

                      try {
                        await updateCategory({
                          catId: budgetPromptCategory.catId,
                          userId: budgetPromptCategory.userId,
                          name: budgetPromptCategory.name,
                          budget: parseFloat(newBudgetAmount),
                          isActive: budgetPromptCategory.isActive,
                          isRecurring: budgetPromptCategory.isRecurring,
                          month: selectedMonth,
                          year: selectedYear,
                        });

                        await refreshAll(); // refresh categories & summary
                        setShowBudgetPrompt(false);
                        setNewBudgetAmount("");
                        setBudgetPromptCategory(null);
                      } catch (err) {
                        console.error("Failed to update budget", err);
                        alert("Failed to update budget");
                      }
                    }}
                  >
                    Save Budget
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- Modals ---------------- */}
      {editCategoryModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Category</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditCategoryModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body">
                {/* Category Name */}
                <input
                  type="text"
                  className="form-control mb-2"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                />

                {/* Budget */}
                <input
                  type="number"
                  className="form-control mb-3"
                  value={editCategoryItem?.budget ?? 0}
                  onChange={(e) =>
                    setEditCategoryItem({
                      ...editCategoryItem,
                      budget: parseFloat(e.target.value),
                    })
                  }
                  min="0"
                />

                {/* Is Recurring */}
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="editIsRecurring"
                    checked={editCategoryItem?.isRecurring ?? false}
                    onChange={(e) =>
                      setEditCategoryItem({
                        ...editCategoryItem,
                        isRecurring: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor="editIsRecurring">
                    Is Recurring
                  </label>
                </div>

                {/* Is Active */}
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="editIsActive"
                    checked={editCategoryItem?.isActive ?? false}
                    onChange={(e) =>
                      setEditCategoryItem({
                        ...editCategoryItem,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor="editIsActive">
                    Is Active
                  </label>
                </div>

                {/* Hidden ID for safety */}
                <input type="hidden" value={editCategoryItem?.id} />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditCategoryModalOpen(false)}
                >
                  Cancel
                </button>

                {/* Save */}
                <button className="btn btn-primary" onClick={saveEditCategory}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editSubCategoryModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit SubCategory</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditSubCategoryModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <select
                  className="form-select mb-2"
                  value={editSubCategoryParent}
                  onChange={(e) => setEditSubCategoryParent(e.target.value)}
                >
                  <option value="">-- Select Parent Category --</option>
                  {categories.map((c) => (
                    <option key={c.catId} value={c.catId}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {/* input Name */}
                <input
                  type="text"
                  className="form-control"
                  value={editSubCategoryName}
                  onChange={(e) => setEditSubCategoryName(e.target.value)}
                />
                {/* Is Recurring */}
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="editSubIsRecurring"
                    checked={editSubCategoryItem?.isRecurring ?? false}
                    onChange={(e) =>
                      setEditSubCategoryItem({
                        ...editSubCategoryItem,
                        isRecurring: e.target.checked,
                      })
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor="editSubIsRecurring"
                  >
                    Is Recurring
                  </label>
                </div>

                {/* Is Active */}
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="editSubIsActive"
                    checked={editSubCategoryItem?.isActive ?? false}
                    onChange={(e) =>
                      setEditSubCategoryItem({
                        ...editSubCategoryItem,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor="editSubIsActive">
                    Is Active
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditSubCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={saveEditSubCategory}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editPlaceModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Place</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditPlaceModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  value={editPlaceName}
                  onChange={(e) => setEditPlaceName(e.target.value)}
                />
                {/* Is Recurring */}
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="editPlaceIsRecurring"
                    checked={editPlaceItem?.isRecurring ?? false}
                    onChange={(e) =>
                      setEditPlaceItem({
                        ...editPlaceItem,
                        isRecurring: e.target.checked,
                      })
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor="editPlaceIsRecurring"
                  >
                    Is Recurring
                  </label>
                </div>
                {/* Is Active */}
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="editPlaceIsActive"
                    checked={editPlaceItem?.isActive ?? false}
                    onChange={(e) =>
                      setEditPlaceItem({
                        ...editPlaceItem,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor="editPlaceIsActive"
                  >
                    Is Active
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditPlaceModalOpen(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveEditPlace}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editExpenseModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Expense</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditExpenseModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="date"
                      className="form-control"
                      value={editExpenseForm.date || ""}
                      onChange={(e) =>
                        setEditExpenseForm({
                          ...editExpenseForm,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/* Category */}
                  <div className="col-6">
                    <select
                      className="form-select"
                      value={editExpenseForm.categoryId}
                      onChange={(e) =>
                        setEditExpenseForm({
                          ...editExpenseForm,
                          categoryId: e.target.value,
                        })
                      }
                    >
                      <option value="">Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SubCategory */}
                  <div className="col-6">
                    <select
                      className="form-select"
                      value={editExpenseForm.subCategoryId || ""}
                      onChange={(e) =>
                        setEditExpenseForm({
                          ...editExpenseForm,
                          subCategoryId: e.target.value,
                        })
                      }
                    >
                      <option value="">SubCategory (optional)</option>
                      {subCategories
                        .filter(
                          (sc) => sc.categoryId === editExpenseForm.categoryId
                        )
                        .map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Place */}
                  <div className="col-6">
                    <select
                      className="form-select"
                      value={editExpenseForm.placeId || ""}
                      onChange={(e) =>
                        setEditExpenseForm({
                          ...editExpenseForm,
                          placeId: e.target.value,
                        })
                      }
                    >
                      <option value="">Place (optional)</option>
                      {places
                        .filter(
                          (p) => p.categoryId === editExpenseForm.categoryId
                        )
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Amount"
                      value={editExpenseForm.amount}
                      onChange={(e) =>
                        setEditExpenseForm({
                          ...editExpenseForm,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Paid For */}
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Paid For"
                      value={editExpenseForm.paidFor}
                      onChange={(e) =>
                        setEditExpenseForm({
                          ...editExpenseForm,
                          paidFor: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Note */}
                  <div className="col-12">
                    <textarea
                      className="form-control"
                      placeholder="Note"
                      value={editExpenseForm.note}
                      onChange={(e) =>
                        setEditExpenseForm({
                          ...editExpenseForm,
                          note: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>

                  {/* isFixed */}
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={editExpenseForm.isFixed || false}
                        onChange={(e) =>
                          setEditExpenseForm({
                            ...editExpenseForm,
                            isFixed: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label">Fixed Expense</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditExpenseModalOpen(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveEditExpense}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy to Next Month Expense */}
      <Modal
        show={showGenerateModal}
        onHide={() => setShowGenerateExpenseModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Copy Expense</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* SOURCE MONTH */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Source Month (searched month)
            </Form.Label>
            <Form.Control
              readOnly
              value={`${selectedYear} - ${monthNames[selectedMonth - 1]}`}
            />
          </Form.Group>

          {!hasDataToCopy && (
            <Alert variant="warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              There are no incomes in this month to copy.
            </Alert>
          )}

          {hasDataToCopy && (
            <>
              {/* TARGET RANGE */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Copy to range</Form.Label>

                {/* FROM */}
                <div className="d-flex gap-2 mb-2">
                  <Form.Select
                    value={generateRange.fromMonth}
                    onChange={(e) =>
                      setGenerateRange((p) => ({
                        ...p,
                        fromMonth: Number(e.target.value),
                      }))
                    }
                  >
                    {monthNames.map((m, i) => (
                      <option key={i + 1} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </Form.Select>

                  <Form.Control
                    type="number"
                    value={generateRange.fromYear}
                    onChange={(e) =>
                      setGenerateRange((p) => ({
                        ...p,
                        fromYear: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                {/* TO */}
                <div className="d-flex gap-2">
                  <Form.Select
                    value={generateRange.toMonth}
                    onChange={(e) =>
                      setGenerateRange((p) => ({
                        ...p,
                        toMonth: Number(e.target.value),
                      }))
                    }
                  >
                    {monthNames.map((m, i) => (
                      <option key={i + 1} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </Form.Select>

                  <Form.Control
                    type="number"
                    value={generateRange.toYear}
                    onChange={(e) =>
                      setGenerateRange((p) => ({
                        ...p,
                        toYear: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </Form.Group>

              <Alert variant="info" className="mb-0">
                Only the Expense displayed for the selected month will be
                copied. Existing incomes in target months will be skipped
                automatically.
              </Alert>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowGenerateExpenseModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="success"
            disabled={!hasDataToCopy}
            onClick={async () => {
              const payload = buildGeneratePayload();
              console.log("Generate payload:", payload);

              await copyExpenseByRange(payload); // ✅ now valid

              setShowGenerateExpenseModal(false);
            }}
          >
            Copy
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
