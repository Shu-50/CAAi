import { useState } from "react";

export default function ExtractedDataTable({ data, onSave }) {
  const [editedData, setEditedData] = useState(data);

  const handleChange = (index, field, value) => {
    const newItems = [...editedData.items];
    newItems[index][field] = value;
    setEditedData({ ...editedData, items: newItems });
  };

  const handleSave = () => {
    onSave(editedData);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Bill Details</h2>
      <p><strong>Vendor:</strong> {editedData.vendor}</p>
      <p><strong>Date:</strong> {editedData.date}</p>
      <p><strong>Total:</strong> {editedData.total}</p>

      <table className="table-auto w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Name</th>
            <th className="border px-2">Qty</th>
            <th className="border px-2">Price</th>
            <th className="border px-2">Category</th>
          </tr>
        </thead>
        <tbody>
          {editedData.items.map((item, index) => (
            <tr key={index}>
              <td className="border px-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  className="w-full border p-1"
                />
              </td>
              <td className="border px-2">
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => handleChange(index, "qty", e.target.value)}
                  className="w-full border p-1"
                />
              </td>
              <td className="border px-2">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleChange(index, "price", e.target.value)}
                  className="w-full border p-1"
                />
              </td>
              <td className="border px-2">
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => handleChange(index, "category", e.target.value)}
                  className="w-full border p-1"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Save to DB
      </button>
    </div>
  );
}
