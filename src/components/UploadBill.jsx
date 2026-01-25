// import { useState } from "react";
import { API_ENDPOINTS } from '../config/api';
// import axios from "axios";
import { API_ENDPOINTS } from '../config/api';

// export default function UploadBill({ setBills }) {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [bill, setBill] = useState(null);
//   const [error, setError] = useState(null);

//   const handleUpload = async () => {
//     if (!file) {
//       alert("Please select a file first");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       setLoading(true);
//       setError(null);
//       setBill(null);

//       const res = await axios.post(API_ENDPOINTS.EXTRACT, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setBill(res.data.extractedData); // bill + items
//     } catch (err) {
//       console.error("Upload error:", err);
//       setError("Failed to extract data. Check backend logs.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       await axios.post(API_ENDPOINTS.BILLS, bill);
//       alert("✅ Bill saved successfully!");
//       setBills((prev) => [...prev, bill]);
//       setBill(null);
//       setFile(null);
//     } catch (err) {
//       console.error("Save error:", err);
//       setError("Failed to save bill to DB.");
//     }
//   };

//   const updateBillField = (field, value) => {
//     setBill({ ...bill, [field]: value });
//   };

//   const updateItemField = (index, field, value) => {
//     const updatedItems = [...bill.items];
//     updatedItems[index][field] = value;
//     setBill({ ...bill, items: updatedItems });
//   };

//   return (
//     <div className="bg-darkCard p-6 rounded-2xl shadow-lg space-y-6">
//       <h1 className="text-xl font-bold">📄 Upload Bill</h1>

//       <div className="flex items-center gap-4">
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => setFile(e.target.files[0])}
//           className="p-2 border border-gray-600 rounded-md bg-gray-800"
//         />
//         <button
//           onClick={handleUpload}
//           disabled={loading}
//           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
//         >
//           {loading ? "⏳ Processing..." : "🚀 Upload & Extract"}
//         </button>
//       </div>

//       {loading && (
//         <p className="text-yellow-400 animate-pulse">
//           Extracting data, please wait...
//         </p>
//       )}

//       {error && <p className="text-red-400">{error}</p>}

//       {/* Bill Preview Table */}
//       {bill && (
//         <div className="bg-gray-800 p-4 rounded-lg text-white">
//           <h2 className="text-lg font-semibold mb-3">✅ Preview & Edit Bill</h2>

//           {/* Bill Info */}
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <input
//               type="text"
//               value={bill.vendor || ""}
//               onChange={(e) => updateBillField("vendor", e.target.value)}
//               placeholder="Vendor"
//               className="p-2 bg-gray-900 rounded border border-gray-700"
//             />
//             <input
//               type="date"
//               value={(() => {
//                 if (!bill.date) return "";

//                 let date = bill.date;

//                 // If date is like "02/08/2025" (DD/MM/YYYY)
//                 if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
//                   const [day, month, year] = date.split("/");
//                   date = `${year}-${month}-${day}`;
//                 }

//                 // If date is not already ISO format, try converting
//                 const isoDate = new Date(date);
//                 if (isNaN(isoDate)) return ""; // invalid date safeguard

//                 return isoDate.toISOString().split("T")[0];
//               })()}
//               onChange={(e) => updateBillField("date", e.target.value)}
//               className="p-2 bg-gray-900 rounded border border-gray-700"
//             />

//             <input
//               type="text"
//               value={bill.category || ""}
//               onChange={(e) => updateBillField("category", e.target.value)}
//               placeholder="Category"
//               className="p-2 bg-gray-900 rounded border border-gray-700"
//             />
//             <input
//               type="number"
//               value={bill.total || ""}
//               onChange={(e) =>
//                 updateBillField("total", parseFloat(e.target.value))
//               }
//               placeholder="Total"
//               className="p-2 bg-gray-900 rounded border border-gray-700"
//             />
//           </div>

//           {/* Items Table */}
//           <table className="w-full border text-sm mb-4">
//             <thead>
//               <tr className="bg-gray-700">
//                 <th className="p-2 text-left">Item</th>
//                 <th className="p-2">Qty</th>
//                 <th className="p-2">Price</th>
//                 <th className="p-2">GST</th>
//                 <th className="p-2">CGST</th>
//                 <th className="p-2">SGST</th>
//                 <th className="p-2">Category</th>
//               </tr>
//             </thead>
//             <tbody>
//               {bill.items?.map((item, idx) => (
//                 <tr key={idx} className="border-t border-gray-600">
//                   <td>
//                     <input
//                       type="text"
//                       value={item.name || ""}
//                       onChange={(e) =>
//                         updateItemField(idx, "name", e.target.value)
//                       }
//                       className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       value={item.qty || ""}
//                       onChange={(e) =>
//                         updateItemField(idx, "qty", parseInt(e.target.value))
//                       }
//                       className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       value={item.price || ""}
//                       onChange={(e) =>
//                         updateItemField(
//                           idx,
//                           "price",
//                           parseFloat(e.target.value)
//                         )
//                       }
//                       className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       value={item.gst || ""}
//                       onChange={(e) =>
//                         updateItemField(idx, "gst", parseFloat(e.target.value))
//                       }
//                       className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       value={item.cgst || ""}
//                       onChange={(e) =>
//                         updateItemField(idx, "cgst", parseFloat(e.target.value))
//                       }
//                       className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       value={item.sgst || ""}
//                       onChange={(e) =>
//                         updateItemField(idx, "sgst", parseFloat(e.target.value))
//                       }
//                       className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="text"
//                       value={item.category || ""}
//                       onChange={(e) =>
//                         updateItemField(idx, "category", e.target.value)
//                       }
//                       className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Save Button */}
//           <button
//             onClick={handleSave}
//             className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
//           >
//             💾 Save to Database
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState } from "react";
import { API_ENDPOINTS } from '../config/api';
import axios from "axios";
import { API_ENDPOINTS } from '../config/api';

export default function UploadBill({ setBills }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bill, setBill] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      setError(null);
      setBill(null);

      const res = await axios.post(API_ENDPOINTS.EXTRACT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setBill(res.data.extractedData); // bill + items
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to extract data. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(API_ENDPOINTS.BILLS, bill);
      alert("✅ Bill saved successfully!");
      setBills((prev) => [...prev, bill]);
      setBill(null);
      setFile(null);
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save bill to DB.");
    }
  };

  const updateBillField = (field, value) => {
    setBill({ ...bill, [field]: value });
  };

  const updateItemField = (index, field, value) => {
    const updatedItems = [...bill.items];
    updatedItems[index][field] = value;
    setBill({ ...bill, items: updatedItems });
  };

  // 🗑️ Delete Item Handler
  const handleDeleteItem = async (item, idx) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      if (item.id) {
        await axios.delete(API_ENDPOINTS.ITEM_DELETE(item.id));
        alert("🗑️ Item deleted successfully from DB!");
      } else {
        alert("🗑️ Item removed from preview!");
      }

      // Remove item from local state
      setBill((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== idx),
      }));
    } catch (err) {
      console.error("Delete item error:", err);
      alert("❌ Failed to delete item");
    }
  };

  return (
    <div className="bg-darkCard p-6 rounded-2xl shadow-lg space-y-6">
      <h1 className="text-xl font-bold">📄 Upload Bill</h1>

      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="p-2 border border-gray-600 rounded-md bg-gray-800"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
        >
          {loading ? "⏳ Processing..." : "🚀 Upload & Extract"}
        </button>
      </div>

      {loading && (
        <p className="text-yellow-400 animate-pulse">
          Extracting data, please wait...
        </p>
      )}

      {error && <p className="text-red-400">{error}</p>}

      {/* Bill Preview Table */}
      {bill && (
        <div className="bg-gray-800 p-4 rounded-lg text-white">
          <h2 className="text-lg font-semibold mb-3">✅ Preview & Edit Bill</h2>

          {/* Bill Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={bill.vendor || ""}
              onChange={(e) => updateBillField("vendor", e.target.value)}
              placeholder="Vendor"
              className="p-2 bg-gray-900 rounded border border-gray-700"
            />
            <input
              type="date"
              value={(() => {
                if (!bill.date) return "";

                let date = bill.date;

                // Handle DD/MM/YYYY format
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
                  const [day, month, year] = date.split("/");
                  date = `${year}-${month}-${day}`;
                }

                // Convert to ISO format
                const isoDate = new Date(date);
                if (isNaN(isoDate)) return "";

                return isoDate.toISOString().split("T")[0];
              })()}
              onChange={(e) => updateBillField("date", e.target.value)}
              className="p-2 bg-gray-900 rounded border border-gray-700"
            />
            <input
              type="text"
              value={bill.category || ""}
              onChange={(e) => updateBillField("category", e.target.value)}
              placeholder="Category"
              className="p-2 bg-gray-900 rounded border border-gray-700"
            />
            <input
              type="number"
              value={bill.total || ""}
              onChange={(e) =>
                updateBillField("total", parseFloat(e.target.value))
              }
              placeholder="Total"
              className="p-2 bg-gray-900 rounded border border-gray-700"
            />
          </div>

          {/* Items Table */}
          <table className="w-full border text-sm mb-4">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2 text-left">Item</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Price</th>
                <th className="p-2">GST</th>
                <th className="p-2">CGST</th>
                <th className="p-2">SGST</th>
                <th className="p-2">Category</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {bill.items?.map((item, idx) => (
                <tr key={idx} className="border-t border-gray-600">
                  <td>
                    <input
                      type="text"
                      value={item.name || ""}
                      onChange={(e) =>
                        updateItemField(idx, "name", e.target.value)
                      }
                      className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.qty || ""}
                      onChange={(e) =>
                        updateItemField(idx, "qty", parseInt(e.target.value))
                      }
                      className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.price || ""}
                      onChange={(e) =>
                        updateItemField(
                          idx,
                          "price",
                          parseFloat(e.target.value)
                        )
                      }
                      className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.gst || ""}
                      onChange={(e) =>
                        updateItemField(idx, "gst", parseFloat(e.target.value))
                      }
                      className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.cgst || ""}
                      onChange={(e) =>
                        updateItemField(idx, "cgst", parseFloat(e.target.value))
                      }
                      className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.sgst || ""}
                      onChange={(e) =>
                        updateItemField(idx, "sgst", parseFloat(e.target.value))
                      }
                      className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.category || ""}
                      onChange={(e) =>
                        updateItemField(idx, "category", e.target.value)
                      }
                      className="p-1 bg-gray-900 rounded border border-gray-700 w-full"
                    />
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => handleDeleteItem(item, idx)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
          >
            💾 Save to Database
          </button>
        </div>
      )}
    </div>
  );
}

