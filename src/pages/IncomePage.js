import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import {
  getIncomesByMonth,
  addIncome,
  updateIncome,
  deleteIncome,
  duplicateIncome,
  addSource,
  getSources,
  updateSource,
  deleteSource,
} from "../services/api";

const IncomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [incomeList, setIncomeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    sourceType: "",
    owner: "",
    amount: "",
    date: "",
    isRecurring: false,
    isEstimated: false,
    frequency: "None",
    description: "",
  });

  // Source modal state
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [sourceFormData, setSourceFormData] = useState({
    id: null,
    sourceType: "",
    description: "",
  });
  const [sourceList, setSourceList] = useState([]);
  const [loadingSources, setLoadingSources] = useState(false);

  const [userId, setUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState(null);

  // Decode JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("User is not authenticated");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const id =
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        decoded.sub ||
        null;

      if (!id) setError("User is not authenticated");
      else setUserId(id);
    } catch {
      setError("Invalid token");
    }
  }, []);

  // Fetch incomes
  useEffect(() => {
    if (!userId) return;

    const fetchIncomes = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const response = await getIncomesByMonth(
          userId,
          now.getMonth() + 1,
          now.getFullYear()
        );
        setIncomeList(response.data);
        setError(null);
      } catch (e) {
        setError("Failed to load incomes.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncomes();
  }, [userId]);

  // Fetch sources
  useEffect(() => {
    if (!userId) return;

    const fetchSources = async () => {
      setLoadingSources(true);
      try {
        const response = await getSources(userId);
        setSourceList(response.data);
      } catch (err) {
        console.error("Failed to load sources:", err);
      } finally {
        setLoadingSources(false);
      }
    };

    fetchSources();
  }, [userId]);

  // Close Alert Message after 20 secs
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Income form handlers
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleShowAddModal = () => {
    setEditingIncome(null);
    setFormData({
      sourceType: "",
      owner: "",
      amount: "",
      date: "",
      isRecurring: false,
      isEstimated: false,
      frequency: "None",
      description: "",
    });
    setShowModal(true);
  };

  const handleShowEditModal = (income) => {
    setEditingIncome(income);
    setFormData({
      id: income.id,
      userId: income.userId,
      owner: income.owner,
      sourceType: income.sourceType,
      amount: income.amount,
      date: income.date.split("T")[0],
      month: income.month,
      year: income.year,
      isRecurring: income.isRecurring,
      isEstimated: income.isEstimated,
      frequency: income.frequency || "None",
      description: income.description || "",
      createdBy: income.createdBy,
      createdDate: income.createdDate,
      modifiedDate: income.modifiedDate,
    });
    setShowModal(true);
  };

  const handleSaveIncome = async (e) => {
    e.preventDefault();
    if (!userId) return setError("User is not authenticated");

    // Extract from formData.date (which is in YYYY-MM-DD)
    const [year, month, day] = formData.date.split("-").map(Number);

    const incomePayload = {
      userId: userId,
      owner: formData.owner || userId,
      sourceType: formData.sourceType,
      amount: parseFloat(formData.amount),
      date: formData.date, // original date string
      month: month, // ✅ Correct month (1–12 directly from input)
      year: year,
      isRecurring: formData.frequency !== "None",
      isEstimated: formData.isEstimated,
      frequency: formData.frequency,
      description: formData.description || "",
      createdBy: userId,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
    };

    try {
      if (editingIncome) {
        await updateIncome({ ...incomePayload, id: editingIncome.id });
      } else {
        await addIncome(incomePayload);
      }

      // Use the same year/month you extracted instead of now
      const refresh = await getIncomesByMonth(userId, month, year);
      setIncomeList(refresh.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save income.");
    } finally {
      setShowModal(false);
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await deleteIncome(id);
      const now = new Date();
      const response = await getIncomesByMonth(
        userId,
        now.getMonth() + 1,
        now.getFullYear()
      );
      setIncomeList(response.data);
    } catch {
      setError("Failed to delete income.");
    }
  };

  // Add for next month
  const handleGenerateNextMonth = async () => {
    if (!userId) return setError("User is not authenticated");

    try {
      setLoading(true);
      const response = await fetch(
        `/api/incomes/generate-next-month/${userId}`,
        { method: "POST" }
      );
      const data = await response.json();

      // Refresh current month to include generated incomes if needed
      const now = new Date();
      const refresh = await getIncomesByMonth(
        userId,
        now.getMonth() + 1,
        now.getFullYear()
      );
      setIncomeList(refresh.data);

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to generate next month incomes.");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateIncome = async (id) => {
    try {
      await duplicateIncome(id);
      const now = new Date();
      const response = await getIncomesByMonth(
        userId,
        now.getMonth() + 1,
        now.getFullYear()
      );
      setIncomeList(response.data);
    } catch {
      setError("Failed to duplicate income.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Source modal handlers
  const handleShowAddSourceModal = () => {
    setSourceFormData({ id: null, sourceType: "", description: "" });
    setShowSourceModal(true);
  };

  const handleSaveSource = async () => {
    if (!userId) return setError("User is not authenticated");

    const now = new Date().toISOString();
    const payload = {
      Name: sourceFormData.sourceType,
      Description: sourceFormData.description,
      UserId: userId,
      CreatedDate: now,
      ModifiedDate: now,
    };

    try {
      if (sourceFormData.id) {
        await updateSource(sourceFormData.id, payload);
      } else {
        await addSource(payload);
      }

      const response = await getSources(userId);
      setSourceList(response.data);
      setShowSourceModal(false);
      setSourceFormData({ id: null, sourceType: "", description: "" });
      setError(null);
    } catch (err) {
      console.error("Failed to save source:", err);
      setError("Failed to save source.");
    }
  };

  const handleEditSource = (source) => {
    setSourceFormData({
      id: source.id,
      sourceType: source.name,
      description: source.description,
    });
    setShowSourceModal(true);
  };

  const confirmDeleteSource = (source) => {
    setSourceToDelete(source);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!sourceToDelete) return;

    try {
      const success = await deleteSource(sourceToDelete.id);
      if (success) {
        setSourceList((prev) => prev.filter((s) => s.id !== sourceToDelete.id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setShowDeleteModal(false);
      setSourceToDelete(null);
    }
  };

  return (
    <div className="container mt-4" style={{ margin: "auto" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Income Overview</h4>
      </div>
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError(null)}
          style={{ border: "2px solid black" }}
        >
          {error}
        </Alert>
      )}
      {/* Delete Source Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the source "
          {sourceToDelete?.Name || sourceToDelete?.name}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirmed}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Income Sources Section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mt-4">Income Sources</h5>
        <Button className="me-2" onClick={handleShowAddSourceModal}>
          <i className="bi bi-plus-circle me-2"></i> Add Source
        </Button>
      </div>
      {/* //#region Source Type */}
      {loadingSources ? (
        <Spinner animation="border" />
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sourceList.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">
                    No sources found
                  </td>
                </tr>
              ) : (
                sourceList.map((source) => (
                  <tr key={source.id}>
                    <td>{source.name}</td>
                    <td>{source.description}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditSource(source)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => confirmDeleteSource(source)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* #region Income Section*/}
      {/* region Income Section*/}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mt-4">Incomes</h5>
        <div className="d-flex gap-2">
          <Button onClick={handleShowAddModal}>
            <i className="bi bi-plus-circle"></i> Add Income
          </Button>
          <Button variant="outline-success" onClick={handleGenerateNextMonth}>
            <i className="bi bi-calendar-plus"></i> Generate Next Month
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Owner</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Recurring</th>
                <th>Estimated</th>
                <th>Frequency</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomeList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    No incomes found
                  </td>
                </tr>
              ) : (
                incomeList.map((income) => (
                  <tr key={income.id}>
                    <td>{new Date(income.date).toLocaleDateString()}</td>
                    <td>{income.owner}</td>
                    <td>{income.sourceType}</td>
                    <td>${income.amount.toFixed(2)}</td>
                    <td>{income.isRecurring ? "Yes" : "No"}</td>
                    <td>{income.isEstimated ? "Yes" : "No"}</td>
                    <td>{income.frequency}</td>
                    <td>{income.description}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowEditModal(income)}
                      >
                        <i className="bi bi-pencil" title="Edit Income"></i>
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleDuplicateIncome(income.id)}
                      >
                        <i className="bi bi-files" title="Duplicate Income"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteIncome(income.id)}
                      >
                        <i className="bi bi-trash" title="Delete Income"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Income Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSaveIncome}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingIncome ? "Edit Income" : "Add New Income"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Owner</Form.Label>
              <Form.Control
                name="owner"
                value={formData.owner}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            {/* <Form.Group className="mb-3">
              <Form.Label>Source Type</Form.Label>
              <Form.Control
                name="sourceType"
                value={formData.sourceType}
                onChange={handleFormChange}
                required
              />
            </Form.Group> */}

            <Form.Group className="mb-3">
              <Form.Label>Source Type</Form.Label>
              <Form.Select
                name="sourceType"
                value={formData.sourceType}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Source</option>
                {sourceList.map((source) => (
                  <option key={source.id} value={source.name}>
                    {source.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                name="date"
                type="date"
                value={formData.date}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Recurrence</Form.Label>
              <Form.Select
                name="frequency"
                value={formData.frequency}
                onChange={handleFormChange}
              >
                <option value="None">One-time</option>
                <option value="Weekly">Weekly</option>
                <option value="ByWeekly">By Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is Recurring?"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is Estimated?"
                name="isEstimated"
                checked={formData.isEstimated}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleFormChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingIncome ? "Save Changes" : "Add Income"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* Add/Edit Source Modal */}
      <Modal show={showSourceModal} onHide={() => setShowSourceModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {sourceFormData.id ? "Edit Source" : "Add Source"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Source Type</Form.Label>
              <Form.Control
                type="text"
                value={sourceFormData.sourceType}
                onChange={(e) =>
                  setSourceFormData({
                    ...sourceFormData,
                    sourceType: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={sourceFormData.description}
                onChange={(e) =>
                  setSourceFormData({
                    ...sourceFormData,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSourceModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSource}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default IncomePage;
