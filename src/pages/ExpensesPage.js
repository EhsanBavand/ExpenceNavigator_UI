
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
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
  updateExpense
} from "../services/api";

export default function ExpenseManager() {
  const [formTab, setFormTab] = useState("category");
  const [tableTab, setTableTab] = useState("category");

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [selectedCategoryForPlace, setSelectedCategoryForPlace] = useState("");
  const [selectedSubCategoryForPlace, setSelectedSubCategoryForPlace] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    category: "",
    subCategory: "",
    place: "",
    store: "",
    amount: "",
    paidFor: "",
    note: "",
    isFixed: false,
  });

  const [userId, setUserId] = useState(null);

  // Modals state
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
  const [editExpenseItem, setEditExpenseItem] = useState(null);
  const [editExpenseForm, setEditExpenseForm] = useState({
    categoryId: "",
    subCategoryId: "",
    placeId: "",
    amount: "",
    paidFor: "",
    note: "",
    isFixed: false,
  });


  // Decode JWT to get userId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const id = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.sub || null;
      setUserId(id);
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [catRes, subRes, placeRes, expRes] = await Promise.all([
        getCategories(userId),
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

  // ----------------- Add Handlers -----------------
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName || !userId) return;
    try {
      const res = await createCategory({ name: categoryName, userId, isActive: true });
      setCategories([...categories, res]);
      setCategoryName("");
    } catch (err) {
      console.error(err);
      alert("Failed to create category");
    }
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    if (!subCategoryName || !selectedCategory || !userId) return;
    try {
      const res = await createSubCategory({ name: subCategoryName, categoryId: selectedCategory, userId });
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
    if (!placeName || !selectedCategoryForPlace || !userId) return;
    try {
      const res = await createPlace({
        name: placeName,
        categoryId: selectedCategoryForPlace,
        subCategoryId: selectedSubCategoryForPlace || null,
        userId,
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
        categoryId: expenseForm.category,
        subCategoryId: expenseForm.subCategory || null,
        placeId: expenseForm.place || null,
        amount: parseFloat(expenseForm.amount),
        paidFor: expenseForm.paidFor || null,
        note: expenseForm.note || null,
        isFixed: expenseForm.isFixed || false,
      });
      setExpenses([...expenses, res]);
      setExpenseForm({
        category: "",
        subCategory: "",
        place: "",
        store: "",
        amount: "",
        paidFor: "",
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
    setExpenseForm({
      ...expenseForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDelete = async (id, type) => {
    try {
      if (type === "category") await deleteCategory(id);
      if (type === "subCategory") await deleteSubCategory(id);
      if (type === "place") await deletePlace(id);
      if (type === "expense") await deleteExpense(id);

      if (type === "category") setCategories(categories.filter(c => c.id !== id));
      if (type === "subCategory") setSubCategories(subCategories.filter(sc => sc.id !== id));
      if (type === "place") setPlaces(places.filter(p => p.id !== id));
      if (type === "expense") setExpenses(expenses.filter(exp => exp.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };
  // ----------------- Edit Handlers -----------------
  const openEditCategoryModal = (cat) => {
    setEditCategoryItem(cat);
    setEditCategoryName(cat.name);
    setEditCategoryModalOpen(true);
  };

  const openEditSubCategoryModal = (sub) => {
    setEditSubCategoryItem(sub);
    setEditSubCategoryName(sub.name);
    setEditSubCategoryParent(sub.categoryId);
    setEditSubCategoryModalOpen(true);
  };

  const openEditPlaceModal = (place) => {
    setEditPlaceItem(place);
    setEditPlaceName(place.name);
    setEditPlaceCategory(place.categoryId);
    setEditPlaceSubCategory(place.subCategoryId || "");
    setEditPlaceModalOpen(true);
  };

  const openEditExpenseModal = (exp) => {
    setEditExpenseItem(exp);
    setEditExpenseForm({
      categoryId: exp.categoryId || "",
      subCategoryId: exp.subCategoryId || "",
      placeId: exp.placeId || "",
      amount: exp.amount || "",
      paidFor: exp.paidFor || "",
      note: exp.note || "",
      isFixed: exp.isFixed || false,
    });
    setEditExpenseModalOpen(true);
  };

  const saveEditCategory = async () => {
    if (!editCategoryItem) return;

    try {
      await updateCategory(editCategoryItem.id, {
        id: editCategoryItem.id,          // required by your API
        name: editCategoryName,
        createdDate: editCategoryItem.createdDate,
        isActive: editCategoryItem.isActive,
        userId: editCategoryItem.userId
      });

      // update local state
      setCategories(categories.map(c =>
        c.id === editCategoryItem.id ? { ...c, name: editCategoryName } : c
      ));

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
      };

      console.log("Updating subcategory with payload:", payload);

      await updateSubCategory(editSubCategoryItem.id, payload);

      setSubCategories(subCategories.map(sc =>
        sc.id === editSubCategoryItem.id
          ? { ...sc, name: editSubCategoryName, categoryId: editSubCategoryParent }
          : sc
      ));

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
        categoryId: editPlaceCategory,
        subCategoryId: editPlaceSubCategory || null,
        userId // 👈 required for backend
      };

      console.log("Payload:", payload);

      await updatePlace(editPlaceItem.id, payload);

      setPlaces(places.map(p =>
        p.id === editPlaceItem.id
          ? { ...p, name: editPlaceName, categoryId: editPlaceCategory, subCategoryId: editPlaceSubCategory }
          : p
      ));

      setEditPlaceModalOpen(false);
    } catch (err) {
      console.error("Failed to update place:", err.response?.data || err);
      alert("Failed to update place");
    }
  };

  const saveEditExpense = async () => {
    if (!editExpenseItem) return;

    try {
      const payload = {
        userId,
        categoryId: editExpenseForm.categoryId,
        subCategoryId: editExpenseForm.subCategoryId || null,
        placeId: editExpenseForm.placeId || null,
        amount: parseFloat(editExpenseForm.amount),
        paidFor: editExpenseForm.paidFor || null,
        note: editExpenseForm.note || null,
        isFixed: editExpenseForm.isFixed || false,
      };

      await updateExpense(editExpenseItem.id, payload);

      // Update local list
      setExpenses(expenses.map(e =>
        e.id === editExpenseItem.id ? { ...e, ...payload } : e
      ));

      setEditExpenseModalOpen(false);
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
                {["category", "subCategory", "place", "expense"].map(tab => (
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
                  <input type="text" className="form-control mb-2" placeholder="Category Name" value={categoryName} onChange={e => setCategoryName(e.target.value)} />
                  <button className="btn btn-primary w-100">Add Category</button>
                </form>
              )}

              {/* SubCategory Form */}
              {formTab === "subCategory" && (
                <form onSubmit={handleAddSubCategory}>
                  <select className="form-select mb-2" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                    <option value="">Choose Category </option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input type="text" className="form-control mb-2" placeholder="SubCategory Name" value={subCategoryName} onChange={e => setSubCategoryName(e.target.value)} />
                  <button className="btn btn-primary w-100">Add SubCategory</button>
                </form>
              )}

              {/* Place Form */}
              {formTab === "place" && (
                <form onSubmit={handleAddPlace}>
                  <select className="form-select mb-2" value={selectedCategoryForPlace} onChange={e => setSelectedCategoryForPlace(e.target.value)}>
                    <option value="">Choose Category </option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select className="form-select mb-2" value={selectedSubCategoryForPlace} onChange={e => setSelectedSubCategoryForPlace(e.target.value)}>
                    <option value="">Choose SubCategory (Optional) </option>
                    {subCategories.filter(sc => sc.categoryId === selectedCategoryForPlace).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                  </select>
                  <input type="text" className="form-control mb-2" placeholder="Place Name" value={placeName} onChange={e => setPlaceName(e.target.value)} />
                  <button className="btn btn-warning w-100">Add Place</button>
                </form>
              )}

              {/* Expense Form */}
              {formTab === "expense" && (
                <form onSubmit={handleAddExpense}>
                  <div className="row g-2">
                    <div className="col-12 col-sm-6">
                      <select className="form-select" name="category" value={expenseForm.category} onChange={handleExpenseChange} required>
                        <option value="">Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-sm-6">
                      <select className="form-select" name="subCategory" value={expenseForm.subCategory || ""} onChange={handleExpenseChange}>
                        <option value="">SubCategory (optional)</option>
                        {subCategories.filter(sc => sc.categoryId === expenseForm.category).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-sm-6">
                      <select className="form-select" name="place" value={expenseForm.place || ""} onChange={handleExpenseChange}>
                        <option value="">Place (optional)</option>
                        {places.filter(p => p.categoryId === expenseForm.category).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-sm-6">
                      <input type="number" name="amount" className="form-control" placeholder="Amount" value={expenseForm.amount} onChange={handleExpenseChange} required />
                    </div>
                    <div className="col-12 col-sm-6">
                      <input type="text" name="paidFor" className="form-control" placeholder="Paid For" value={expenseForm.paidFor} onChange={handleExpenseChange} />
                    </div>
                    <div className="col-12">
                      <textarea name="note" className="form-control" placeholder="Note" value={expenseForm.note} onChange={handleExpenseChange}></textarea>
                    </div>
                    <div className="col-12">
                      <div className="form-check mb-2">
                        <input type="checkbox" name="isFixed" className="form-check-input" checked={expenseForm.isFixed} onChange={handleExpenseChange} />
                        <label className="form-check-label">Fixed Expense</label>
                      </div>
                    </div>
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
                {["category", "subCategory", "place", "expense"].map(tab => (
                  <li className="nav-item" key={tab}>
                    <button className={`nav-link ${tableTab === tab ? "active" : ""}`} onClick={() => setTableTab(tab)}>
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
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.id}>
                        <td>{cat.name}</td>
                        <td>
                          <button className="btn btn-sm btn-primary me-2" onClick={() => openEditCategoryModal(cat)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat.id, "category")}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr><td colSpan={2} className="text-center">No categories</td></tr>
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
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subCategories.map(sc => (
                      <tr key={sc.id}>
                        <td>{sc.name}</td>
                        <td>{categories.find(c => c.id === sc.categoryId)?.name || "-"}</td>
                        <td>
                          <button className="btn btn-sm btn-primary me-2" onClick={() => openEditSubCategoryModal(sc)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(sc.id, "subCategory")}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {subCategories.length === 0 && <tr><td colSpan={3} className="text-center">No subcategories</td></tr>}
                  </tbody>
                </table>
              )}

              {/* Place Table */}
              {tableTab === "place" && (
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>SubCategory</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {places.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{categories.find(c => c.id === p.categoryId)?.name || "-"}</td>
                        <td>{subCategories.find(sc => sc.id === p.subCategoryId)?.name || "-"}</td>
                        <td>
                          <button className="btn btn-sm btn-primary me-2" onClick={() => openEditPlaceModal(p)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, "place")}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {places.length === 0 && <tr><td colSpan={4} className="text-center">No places</td></tr>}
                  </tbody>
                </table>
              )}

              {/* Expense Table */}
              {tableTab === "expense" && (
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>SubCategory</th>
                      <th>Place</th>
                      <th>Amount</th>
                      <th>Paid For</th>
                      <th>Note</th>
                      <th>Fixed</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp.id}>
                        <td>{categories.find(c => c.id === exp.categoryId)?.name || "-"}</td>
                        <td>{subCategories.find(sc => sc.id === exp.subCategoryId)?.name || "-"}</td>
                        <td>{places.find(p => p.id === exp.placeId)?.name || "-"}</td>
                        <td>{exp.amount}</td>
                        <td>{exp.paidFor}</td>
                        <td>{exp.note}</td>
                        <td>{exp.isFixed ? "Yes" : "No"}</td>
                        <td>
                          <button className="btn btn-sm btn-primary me-2" onClick={() => openEditExpenseModal(exp)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exp.id, "expense")}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && <tr><td colSpan={8} className="text-center">No expenses</td></tr>}
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
                <button type="button" className="btn-close" onClick={() => setEditCategoryModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditCategoryModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEditCategory}>Save</button>
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
                <button type="button" className="btn-close" onClick={() => setEditSubCategoryModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <select
                  className="form-select mb-2"
                  value={editSubCategoryParent}
                  onChange={(e) => setEditSubCategoryParent(e.target.value)}
                >
                  <option value="">-- Select Parent Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-control"
                  value={editSubCategoryName}
                  onChange={(e) => setEditSubCategoryName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditSubCategoryModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEditSubCategory}>Save Changes</button>
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
                <button type="button" className="btn-close" onClick={() => setEditPlaceModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <select className="form-select mb-2" value={editPlaceCategory} onChange={(e) => setEditPlaceCategory(e.target.value)}>
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="form-select mb-2" value={editPlaceSubCategory} onChange={(e) => setEditPlaceSubCategory(e.target.value)}>
                  <option value="">-- Select SubCategory (Optional) --</option>
                  {subCategories.filter(sc => sc.categoryId === editPlaceCategory).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
                <input type="text" className="form-control" value={editPlaceName} onChange={(e) => setEditPlaceName(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditPlaceModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEditPlace}>Save Changes</button>
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
                <button type="button" className="btn-close" onClick={() => setEditExpenseModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-6">
                    <select
                      className="form-select"
                      value={editExpenseForm.categoryId}
                      onChange={(e) => setEditExpenseForm({ ...editExpenseForm, categoryId: e.target.value })}
                    >
                      <option value="">Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <select
                      className="form-select"
                      value={editExpenseForm.subCategoryId || ""}
                      onChange={(e) => setEditExpenseForm({ ...editExpenseForm, subCategoryId: e.target.value })}
                    >
                      <option value="">SubCategory (optional)</option>
                      {subCategories
                        .filter(sc => sc.categoryId === editExpenseForm.categoryId)
                        .map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <select
                      className="form-select"
                      value={editExpenseForm.placeId || ""}
                      onChange={(e) => setEditExpenseForm({ ...editExpenseForm, placeId: e.target.value })}
                    >
                      <option value="">Place (optional)</option>
                      {places
                        .filter(p => p.categoryId === editExpenseForm.categoryId)
                        .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Amount"
                      value={editExpenseForm.amount}
                      onChange={(e) => setEditExpenseForm({ ...editExpenseForm, amount: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Paid For"
                      value={editExpenseForm.paidFor}
                      onChange={(e) => setEditExpenseForm({ ...editExpenseForm, paidFor: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      className="form-control"
                      placeholder="Note"
                      value={editExpenseForm.note}
                      onChange={(e) => setEditExpenseForm({ ...editExpenseForm, note: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={editExpenseForm.isFixed}
                        onChange={(e) => setEditExpenseForm({ ...editExpenseForm, isFixed: e.target.checked })}
                      />
                      <label className="form-check-label">Fixed Expense</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditExpenseModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEditExpense}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
