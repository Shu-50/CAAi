

import { useEffect, useState } from "react";
import axios from "axios";
import { useSettings } from '../hooks/useSettings.jsx';

export default function BillTable({ bills, setBills }) {
  const { formatCurrency, formatDate } = useSettings();
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bills
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/bills");
        setBills(res.data);
      } catch (err) {
        setError("Failed to fetch bills.");
        console.error("Error fetching bills:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [setBills]);

  const handleBillChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (itemId, field, value) => {
    setEditData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/bills/${editData.id}`,
        editData
      );
      setBills((prev) =>
        prev.map((b) => (b.id === editData.id ? res.data : b))
      );
      setEditing(null);
      setEditData(null);
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Failed to update bill");
    }
  };

  const handleDelete = async (billId) => {
    const confirm = window.confirm("⚠️ Are you sure you want to delete this bill?");
    if (!confirm) return;
    try {
      await axios.delete(`http://localhost:5000/bills/${billId}`);
      setBills((prev) => prev.filter((b) => b.id !== billId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete bill");
    }
  };

  return (
    <div className="bg-darkCard p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Saved Bills</h2>

      {loading ? (
        <p className="text-gray-400">Loading bills...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : bills.length === 0 ? (
        <p className="text-gray-400">No bills saved yet.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="p-2">Vendor</th>
              <th className="p-2">Date</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-center">Items</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-gray-800/40 border-b border-gray-700">
                <td className="p-2">
                  {editing === bill.id ? (
                    <input
                      type="text"
                      className="bg-gray-700 p-1 rounded w-full"
                      value={editData.vendor || ""}
                      onChange={(e) => handleBillChange("vendor", e.target.value)}
                    />
                  ) : (
                    bill.vendor || "—"
                  )}
                </td>
                <td className="p-2">
                  {editing === bill.id ? (
                    <input
                      type="date"
                      className="bg-gray-700 p-1 rounded w-full"
                      value={editData.date?.split("T")[0] || ""}
                      onChange={(e) => handleBillChange("date", e.target.value)}
                    />
                  ) : bill.date ? (
                    bill.date.split("T")[0]
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2 text-right">
                  {editing === bill.id ? (
                    <input
                      type="number"
                      step="0.01"
                      className="bg-gray-700 p-1 rounded w-full text-right"
                      value={editData.total || 0}
                      onChange={(e) =>
                        handleBillChange("total", parseFloat(e.target.value))
                      }
                    />
                  ) : (
                    formatCurrency(bill.total)
                  )}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() =>
                      setExpanded(expanded === bill.id ? null : bill.id)
                    }
                    className="text-accent underline"
                  >
                    {expanded === bill.id ? "Hide" : "View"}
                  </button>
                </td>
                <td className="p-2 text-center space-x-2">
                  {editing === bill.id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-green-600 px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditing(null);
                          setEditData(null);
                        }}
                        className="bg-gray-600 px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditing(bill.id);
                          setEditData(bill);
                        }}
                        className="bg-blue-600 px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(bill.id)}
                        className="bg-red-600 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {/* Expanded item details */}
            {bills.map(
              (bill) =>
                expanded === bill.id && (
                  <tr key={`items-${bill.id}`} className="bg-gray-900">
                    <td colSpan={5} className="p-4">
                      {bill.items?.length > 0 ? (
                        <table className="w-full border text-xs">
                          <thead>
                            <tr className="bg-gray-700 text-left">
                              <th className="p-2">Item</th>
                              <th className="p-2 text-center">Qty</th>
                              <th className="p-2 text-right">Price</th>
                              <th className="p-2 text-center">GST</th>
                              <th className="p-2 text-center">CGST</th>
                              <th className="p-2 text-center">SGST</th>
                              <th className="p-2 text-center">Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(editing === bill.id ? editData.items : bill.items).map(
                              (item) => (
                                <tr key={item.id} className="border-t border-gray-600">
                                  <td className="p-2">
                                    {editing === bill.id ? (
                                      <input
                                        type="text"
                                        className="bg-gray-700 p-1 rounded w-full"
                                        value={item.name || ""}
                                        onChange={(e) =>
                                          handleItemChange(item.id, "name", e.target.value)
                                        }
                                      />
                                    ) : (
                                      item.name || "—"
                                    )}
                                  </td>
                                  <td className="p-2 text-center">
                                    {editing === bill.id ? (
                                      <input
                                        type="number"
                                        className="bg-gray-700 p-1 rounded w-16 text-center"
                                        value={item.qty || 0}
                                        onChange={(e) =>
                                          handleItemChange(
                                            item.id,
                                            "qty",
                                            parseInt(e.target.value)
                                          )
                                        }
                                      />
                                    ) : (
                                      item.qty || 0
                                    )}
                                  </td>
                                  <td className="p-2 text-right">
                                    {editing === bill.id ? (
                                      <input
                                        type="number"
                                        step="0.01"
                                        className="bg-gray-700 p-1 rounded w-20 text-right"
                                        value={item.price || 0}
                                        onChange={(e) =>
                                          handleItemChange(
                                            item.id,
                                            "price",
                                            parseFloat(e.target.value)
                                          )
                                        }
                                      />
                                    ) : (
                                      formatCurrency(item.price)
                                    )}
                                  </td>
                                  <td className="p-2 text-center">
                                    {editing === bill.id ? (
                                      <input
                                        type="number"
                                        className="bg-gray-700 p-1 rounded w-14 text-center"
                                        value={item.gst || 0}
                                        onChange={(e) =>
                                          handleItemChange(
                                            item.id,
                                            "gst",
                                            parseFloat(e.target.value)
                                          )
                                        }
                                      />
                                    ) : (
                                      `${item.gst || 0}%`
                                    )}
                                  </td>
                                  <td className="p-2 text-center">
                                    {editing === bill.id ? (
                                      <input
                                        type="number"
                                        className="bg-gray-700 p-1 rounded w-14 text-center"
                                        value={item.cgst || 0}
                                        onChange={(e) =>
                                          handleItemChange(
                                            item.id,
                                            "cgst",
                                            parseFloat(e.target.value)
                                          )
                                        }
                                      />
                                    ) : (
                                      `${item.cgst || 0}%`
                                    )}
                                  </td>
                                  <td className="p-2 text-center">
                                    {editing === bill.id ? (
                                      <input
                                        type="number"
                                        className="bg-gray-700 p-1 rounded w-14 text-center"
                                        value={item.sgst || 0}
                                        onChange={(e) =>
                                          handleItemChange(
                                            item.id,
                                            "sgst",
                                            parseFloat(e.target.value)
                                          )
                                        }
                                      />
                                    ) : (
                                      `${item.sgst || 0}%`
                                    )}
                                  </td>
                                  <td className="p-2 text-center">
                                    {editing === bill.id ? (
                                      <input
                                        type="text"
                                        className="bg-gray-700 p-1 rounded w-28 text-center"
                                        value={item.category || ""}
                                        onChange={(e) =>
                                          handleItemChange(item.id, "category", e.target.value)
                                        }
                                      />
                                    ) : (
                                      item.category || "—"
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-gray-400">No items found.</p>
                      )}
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
