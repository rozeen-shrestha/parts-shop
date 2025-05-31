'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Order {
  _id: string;
  billing: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    note: string;
  };
  payment: {
    method: string;
    proofs?: string[];
    proofFileIds?: string[];
  };
  cartItems: {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
    quantity: number;
    inStock?: boolean;
  }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingMethod?: string;
  deliveryMethod?: string;
  createdAt: string;
  status?: 'unverified' | 'verified' | 'confirmed'; // Added status
  trackingId?: string; // Added trackingId
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [proofModal, setProofModal] = useState<{ open: boolean; fileId: string | null }>({ open: false, fileId: null });
  const [trackingInput, setTrackingInput] = useState<string>("");
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null); // loading state for confirm

  useEffect(() => {
    fetch('/api/order')
      .then(res => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setOrders(data as Order[]);
      });
  }, []);

  // PATCH order status or trackingId
  async function updateOrder(orderId: string, update: { status?: string; trackingId?: string }, order?: Order) {
    setLoadingOrderId(orderId);
    await fetch(`/api/order/manage?orderId=${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    // Send confirmation email if status is confirmed
    if (update.status === "confirmed" && update.trackingId && order) {
      await fetch("/api/order/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: order.billing.email,
          name: `${order.billing.firstName} ${order.billing.lastName}`,
          trackingId: update.trackingId,
          orderId,
        }),
      });
    }
    fetch('/api/order')
      .then(res => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setOrders(data as Order[]);
      });
    setLoadingOrderId(null);
  }

  // DELETE order (unverified only)
  async function deleteOrder(orderId: string) {
    await fetch(`/api/order?orderId=${orderId}`, {
      method: "DELETE",
    });
    fetch('/api/order')
      .then(res => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setOrders(data as Order[]);
      });
  }

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        Orders Management
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 overflow-x-auto bg-gray-900 rounded-lg p-4"
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-300">
              <th className="py-3 px-4 text-left">Customer</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Total</th>
              <th className="py-3 px-4 text-left">Shipping</th>
              <th className="py-3 px-4 text-left">Delivery</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...orders]
              .sort((a, b) => {
                const statusOrder: Record<string, number> = { unverified: 0, verified: 1, confirmed: 2 };
                return (statusOrder[a.status ?? ""] ?? 99) - (statusOrder[b.status ?? ""] ?? 99);
              })
              .map((order, idx) => (
                <tr key={order._id || idx} className="border-b border-gray-700">
                  <td className="py-3 px-4">{order.billing.firstName} {order.billing.lastName}</td>
                  <td className="py-3 px-4">{order.billing.email}</td>
                  <td className="py-3 px-4">{order.billing.phone}</td>
                  <td className="py-3 px-4">Rs {order.total.toFixed(2)}</td>
                  <td className="py-3 px-4">{order.shippingMethod || '-'}</td>
                  <td className="py-3 px-4">{order.deliveryMethod || '-'}</td>
                  <td className="py-3 px-4">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center flex flex-col md:flex-row gap-2 justify-center items-center">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </button>
                    {/* Add Verify button beside View */}
                    {order.status === "unverified" && (
                      <>
                        <button
                          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                          onClick={async () => {
                            await updateOrder(order._id, { status: "verified" });
                          }}
                        >
                          Verify
                        </button>
                        <button
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to delete this unverified order?")) {
                              await deleteOrder(order._id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {/* Add Confirm button beside View */}
                    {order.status === "verified" && (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Tracking ID"
                          value={trackingInputs[order._id] || ""}
                          onChange={e =>
                            setTrackingInputs(inputs => ({
                              ...inputs,
                              [order._id]: e.target.value,
                            }))
                          }
                          className="px-2 py-1 rounded border border-gray-700 bg-gray-800 text-white"
                          style={{ width: 110 }}
                        />
                        <button
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                          onClick={async () => {
                            const trackingId = trackingInputs[order._id]?.trim();
                            if (!trackingId) return;
                            await updateOrder(order._id, { status: "confirmed", trackingId }, order);
                            setTrackingInputs(inputs => ({ ...inputs, [order._id]: "" }));
                          }}
                          disabled={!trackingInputs[order._id]?.trim() || loadingOrderId === order._id}
                        >
                          {loadingOrderId === order._id ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                          ) : null}
                          Confirm
                        </button>
                      </div>
                    )}
                    {order.status === "confirmed" && order.trackingId && (
                      <span className="text-xs text-blue-300">Tracking: <b>{order.trackingId}</b></span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </motion.div>

      {/* Modal for Viewing Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[44rem] max-w-full overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-white">Order Details</h2>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background:
                    selectedOrder.status === "verified"
                      ? "#2563eb"
                      : selectedOrder.status === "confirmed"
                      ? "#16a34a"
                      : "#f59e42",
                  color: "#fff",
                }}
              >
                {selectedOrder.status ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : "Unverified"}
              </span>
              {selectedOrder.trackingId && (
                <span className="ml-4 text-xs text-blue-300">
                  Tracking ID: <b>{selectedOrder.trackingId}</b>
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Customer Info */}
              <div>
                <div className="mb-2"><b>Name:</b> {selectedOrder.billing.firstName} {selectedOrder.billing.lastName}</div>
                <div className="mb-2"><b>Email:</b> {selectedOrder.billing.email}</div>
                <div className="mb-2"><b>Phone:</b> {selectedOrder.billing.phone}</div>
                <div className="mb-2"><b>Address:</b> {selectedOrder.billing.address}</div>
                <div className="mb-2"><b>Note:</b> {selectedOrder.billing.note}</div>
                <div className="mb-2"><b>Payment Method:</b> {selectedOrder.payment.method}</div>
              </div>
              {/* Right Column: Order Info */}
              <div>
                <div className="mb-2"><b>Shipping Method:</b> {selectedOrder.shippingMethod || '-'}</div>
                <div className="mb-2"><b>Delivery Method:</b> {selectedOrder.deliveryMethod || '-'}</div>
                <div className="mb-2"><b>Subtotal:</b> Rs {selectedOrder.subtotal.toFixed(2)}</div>
                <div className="mb-2"><b>Shipping Cost:</b> Rs {selectedOrder.shippingCost.toFixed(2)}</div>
                <div className="mb-2"><b>Total:</b> Rs {selectedOrder.total.toFixed(2)}</div>
                <div className="mb-2"><b>Date:</b> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                <div className="mb-2"><b>Items:</b>
                  <ul className="ml-4 list-disc">
                    {selectedOrder.cartItems.map((item, i) => (
                      <li key={item.id || i}>
                        <div>
                          <span className="font-semibold">{item.name}</span> x{item.quantity} (Rs {(item.price * item.quantity).toFixed(2)})
                        </div>
                        <div className="text-xs text-gray-400">
                          Category: {item.category || '-'} | In Stock: {item.inStock ? 'Yes' : 'No'}
                        </div>
                        {item.image && (
                          <img
                            src={`/api/file/${item.image}`}
                            alt={item.name}
                            className="w-16 h-16 object-cover mt-1 rounded"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* Proof Images Below */}
            <div className="mt-6">
              <b>Proof Files:</b>
              <div className="flex gap-3 mt-2 flex-wrap">
                {(selectedOrder.payment.proofs && selectedOrder.payment.proofs.length > 0
                  ? selectedOrder.payment.proofs
                  : selectedOrder.payment.proofFileIds && selectedOrder.payment.proofFileIds.length > 0
                  ? selectedOrder.payment.proofFileIds
                  : []
                ).length > 0 ? (
                  (selectedOrder.payment.proofs && selectedOrder.payment.proofs.length > 0
                    ? selectedOrder.payment.proofs
                    : selectedOrder.payment.proofFileIds || []
                  ).map((fileId, i) => (
                    <img
                      key={fileId}
                      src={`/api/file/${fileId}`}
                      alt={`Proof ${i + 1}`}
                      className="w-24 h-24 object-cover rounded cursor-pointer border-2 border-gray-700 hover:border-blue-500"
                      onClick={() => setProofModal({ open: true, fileId })}
                    />
                  ))
                ) : (
                  <span className="text-gray-400 ml-2">No proofs</span>
                )}
              </div>
            </div>
            {/* Actions */}
            <div className="mt-6 flex flex-col md:flex-row gap-3 justify-end items-end">
              {/* Buttons beside Close */}
              <div className="flex flex-row gap-3">
                {selectedOrder.status === "unverified" && (
                  <>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      onClick={async () => {
                        await updateOrder(selectedOrder._id, { status: "verified" });
                        setSelectedOrder(null);
                      }}
                    >
                      Verify
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this unverified order?")) {
                          await deleteOrder(selectedOrder._id);
                          setSelectedOrder(null);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
                {selectedOrder.status === "verified" && (
                  <>
                    <input
                      type="text"
                      placeholder="Tracking ID"
                      value={trackingInput}
                      onChange={e => setTrackingInput(e.target.value)}
                      className="px-2 py-1 rounded border border-gray-700 bg-gray-800 text-white"
                    />
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                      onClick={async () => {
                        if (trackingInput.trim()) {
                          setLoadingOrderId(selectedOrder._id);
                          await updateOrder(
                            selectedOrder._id,
                            { status: "confirmed", trackingId: trackingInput.trim() },
                            selectedOrder
                          );
                          setTrackingInput("");
                          setSelectedOrder(null);
                          setLoadingOrderId(null);
                        }
                      }}
                      disabled={!trackingInput.trim() || loadingOrderId === selectedOrder._id}
                    >
                      {loadingOrderId === selectedOrder._id ? (
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                      ) : null}
                      Confirm & Add Tracking
                    </button>
                  </>
                )}
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Viewing Proof File Fullscreen */}
      {proofModal.open && proofModal.fileId && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="relative bg-gray-900 rounded-lg p-4 max-w-3xl w-full flex flex-col items-center">
            <button
              className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
              onClick={() => setProofModal({ open: false, fileId: null })}
            >
              Close
            </button>
            <img
              src={`/api/file/${proofModal.fileId}`}
              alt="Proof"
              className="max-h-[80vh] max-w-full rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
