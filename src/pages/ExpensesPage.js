import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTrash, FaCheck } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
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
  const [selectedSubCategoryForPlace, setSelectedSubCategoryForPlace] = useState("");
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
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [editSubCategoryModalOpen, setEditSubCategoryModalOpen] = useState(false);
  const [editPlaceModalOpen, setEditPlaceModalOpen] = useState(false);

  const [editCategoryItem, setEditCategoryItem] = useState(null);
  const [editSubCategoryItem, setEditSubCategoryItem] = useState(null);
  const [editPlaceItem, setEditPlaceItem] = useState(null);

  const [editCategoryName, setEditCategoryName] = useState("");
  const [editSubCategoryName, setEditSubCategoryName] = useState("");
  const [editSubCategoryParent, setEditSubCategoryParent] = useState("");
  const [editPlaceName, setEditPlaceName] = useState("");
  const [editPlaceCategory, setEditPlaceCategory] = useState("");
  const [editPlaceSubCategory, setEditPlaceSubCategory] = useState("");

  const [editExpenseModalOpen, setEditExpenseModalOpen] = useState(false);

  const [editingExpenseId, setEditingExpenseId] = useState(null);
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
  const [editExpenseItem, setEditExpenseItem] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const [isRecurring, setIsRecurring] = useState(false);
  const [categoryIsRecurring, setCategoryIsRecurring] = useState(false);
  const [subCategoryIsRecurring, setSubCategoryIsRecurring] = useState(false);
  const [placeIsRecurring, setplaceIsRecurring] = useState(false);

  const [year, month] = selectedDate.split("-");

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
  }, [userId]);

  useEffect(() => {
    console.log("Categories:", categories);
    console.log("SubCategories:", subCategories);
    console.log("Places:", places);
  }, [categories, subCategories, places]);

  const fetchData = async () => {
    try {
      const [catRes, subRes, placeRes, expRes] = await Promise.all([
        getCategories(userId, month, year),
        getSubCategories(userId),
        getPlaces(userId),
        getExpenses(userId),
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
      const res = await createCategory(
        userId,
        categoryName,
        categoryBudget ? parseFloat(categoryBudget) : 0,
        categoryIsRecurring
      );

      setCategories([...categories, res]);
      setCategoryName("");
      setCategoryBudget("");
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
        isRecurring: subCategoryIsRecurring, // <--- add this
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
        isRecurring: placeIsRecurring, // <--- add this

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
    if (!userId || !expenseForm.category || !expenseForm.amount) return;

    try {
      const res = await createExpense({
        userId,
        date: expenseForm.date, // <-- add this
        categoryId: expenseForm.category,
        subCategoryId: expenseForm.subCategory || null,
        placeId: expenseForm.place || null,
        amount: parseFloat(expenseForm.amount),
        paidFor: expenseForm.paidFor || null,
        itemName: expenseForm.itemName || null,
        note: expenseForm.note || null,
        isFixed: expenseForm.isFixed || false,
      });

      setExpenses([...expenses, res]);

      // Reset form including date
      setExpenseForm({
        date: "", // <-- reset date
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
        place: "",       // reset place
      });
    } else {
      setExpenseForm({
        ...expenseForm,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleDelete = async (id, type) => {
    if (!id || !userId) return;

    try {
      switch (type) {
        case "category":
          await deleteCategory(id);
          const updatedCategories = await getCategories(userId, month, year);
          setCategories(updatedCategories);
          break;

        case "subCategory":
          await deleteSubCategory(id);
          const updatedSubCategories = await getSubCategories(userId);
          setSubCategories(updatedSubCategories);
          break;

        case "place":
          await deletePlace(id);
          const updatedPlaces = await getPlaces(userId);
          setPlaces(updatedPlaces);
          break;

        case "expense":
          await deleteExpense(id);
          const updatedExpenses = await getExpenses(userId);
          setExpenses(updatedExpenses);
          break;

        default:
          console.warn("Unknown type", type);
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
    const freshPlace = places.find(p => p.id === place.id);

    setEditPlaceItem(freshPlace);
    setEditPlaceName(freshPlace.name);
    setEditPlaceCategory(freshPlace.categoryId);
    setEditPlaceSubCategory(freshPlace.subCategoryId);

    setEditPlaceModalOpen(true);
  };

  const saveEditCategory = async () => {
    if (!editCategoryItem) return;

    const payload = {
      catId: editCategoryItem.catId, // must exist now
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
      // re-fetch categories after update
      const refreshedCategories = await getCategories(userId, month, year);
      setCategories(refreshedCategories);
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
      };

      await updateSubCategory(editSubCategoryItem.id, payload);

      // ⬇️ IMPORTANT PART: refresh from backend
      const refreshedSubCategories = await getSubCategories(userId);
      setSubCategories(refreshedSubCategories);

      setEditSubCategoryModalOpen(false);
    }
    catch (err) {
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
    const rowData = editExpenseForm[id] || {}; // if undefined, use empty object
    const original = expenses.find((e) => e.id === id);

    if (!original) return;

    try {
      const payload = {
        userId,
        date:
          rowData.date ?? (original.date ? original.date.split("T")[0] : ""),
        categoryId: rowData.categoryId ?? original.categoryId,
        subCategoryId:
          (rowData.subCategoryId ?? original.subCategoryId) || null,
        placeId: (rowData.placeId ?? original.placeId) || null,
        amount: parseFloat(rowData.amount ?? original.amount),
        paidFor: (rowData.paidFor ?? original.paidFor) || null,
        itemName: (rowData.itemName ?? original.itemName) || null,
        note: rowData.note ?? original.note ?? "",
        isFixed: (rowData.isFixed ?? original.isFixed) || false,
      };

      await updateExpense(id, payload);

      setExpenses(
        expenses.map((e) => (e.id === id ? { ...e, ...payload } : e))
      );
      // optionally clear form for this row
      setEditExpenseForm((prev) => ({ ...prev, [id]: undefined }));
    } catch (err) {
      console.error("Failed to update expense:", err.response?.data || err);
      alert("Failed to update expense");
    }
  };

  return (
    <div className="container my-4">
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
                  <input type="text"
                    className="form-control mb-2"
                    placeholder="Category Name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />

                  {/* Budget */}
                  <input type="number"
                    className="form-control mb-2"
                    placeholder="Budget"
                    value={categoryBudget}
                    onChange={(e) => setCategoryBudget(e.target.value)}
                    min="0"
                    required
                  />

                  {/* ✅ Is Recurring */}
                  <div className="form-check mb-3">
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
                  </div>

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

                  {/* ✅ Is Recurring */}
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isRecurring"
                      checked={subCategoryIsRecurring}
                      onChange={(e) =>
                        setSubCategoryIsRecurring(e.target.checked)
                      }
                    />
                    <label className="form-check-label" htmlFor="isRecurring">
                      Is Recurring
                    </label>
                  </div>
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
                  <input type="text"
                    className="form-control mb-2"
                    placeholder="Place Name"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    required
                  />

                  <div className="form-check mb-3">
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
                  </div>

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
                            place: "",       // reset place
                          });
                        }}
                        required
                      >
                        <option value="">Choose a Category</option>
                        {categories.map((c) => (
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
                        <option value="">Choose a SubCategory (optional)</option>
                        {subCategories
                          .filter((sc) => sc.categoryId === expenseForm.category)
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
                        required
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
                          name="isFixed"
                          className="form-check-input"
                          checked={expenseForm.isFixed}
                          onChange={handleExpenseChange}
                        />
                        <label className="form-check-label">Fixed Expense</label>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="col-12">
                      <button className="btn btn-success w-100">Add Expense</button>
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
            <div className="card-body">
              <ul className="nav nav-tabs mb-3">
                {["category", "subCategory", "place", "expense"].map((tab) => (
                  <li className="nav-item" key={tab}>
                    <button
                      className={`nav-link ${tableTab === tab ? "active" : ""}`}
                      onClick={() => setTableTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)} Table
                    </button>
                  </li>
                ))}
              </ul>

              {/* Category Table */}
              {tableTab === "category" && (
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Budget</th>
                      <th>Recurring</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td>{cat.name}</td>
                        <td>{cat.budget}</td>
                        <td>{cat.isRecurring ? "Yes" : "No"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => openEditCategoryModal(cat)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(cat.catId, "category")}
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
                      <th>Name</th>
                      <th>Category</th>
                      <th>Recurring</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subCategories.map((sc) => (
                      <tr key={sc.id}>
                        <td>{sc.name}</td>
                        <td>
                          {categories.find((c) => c.catId === sc.categoryId)?.name || "-"}
                        </td>
                        <td>{sc.isRecurring ? "Yes" : "No"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => openEditSubCategoryModal(sc)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(sc.id, "subCategory")}
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
                      <th>Name</th>
                      {/* <th>Category</th> */}
                      <th>Recurring</th>
                      {/* <th>SubCategory</th> */}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {places.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        {/* <td>
                          {categories.find((c) => c.catId === p.categoryId)
                            ?.name || "-"}
                        </td> */}
                        <td>{p.isRecurring ? "Yes" : "No"}</td>
                        {/* <td>{subCategories.find(sc => sc.id === p.subCategoryId)?.name || "-"}</td> */}
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => openEditPlaceModal(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(p.id, "place")}
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
                      <th>Date</th>
                      <th>Category</th>
                      <th>SubCategory</th>
                      <th>Place</th>
                      <th>Amount</th>
                      <th>Paid For</th>
                      <th>Item Name</th>
                      <th>Note</th>
                      <th>Fixed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => {
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
                              <option value="">Category</option>
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
                              <option value="">SubCategory</option>
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
                              <option value="">Place</option>
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
                                  [exp.id]: { ...row, itemName: e.target.value },
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
                <input type="text"
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
                  <label className="form-check-label" htmlFor="editSubIsRecurring">
                    Is Recurring
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
                {/* <select
                  className="form-select mb-2"
                  value={editPlaceCategory}
                  onChange={(e) => setEditPlaceCategory(e.target.value)}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.catId}>
                      {c.name}
                    </option>
                  ))}
                </select> */}
                <input type="text"
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
                  <label className="form-check-label" htmlFor="editPlaceIsRecurring">
                    Is Recurring
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

                  {/* Paid For */}
                  {/* <div className="col-6">
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
                  </div> */}

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
    </div>
  );
}
