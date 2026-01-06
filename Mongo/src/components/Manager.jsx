import { useEffect, useState } from "react";

function Manager() {
  // ===== STATES =====
  const [form, setForm] = useState({
    website: "",
    username: "",
    password: "",
  });

  const [passwords, setPasswords] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // 🔔 STACKED TOASTS
  const [toasts, setToasts] = useState([]);

  // ===== LOAD DATA =====
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("passop")) || [];
    setPasswords(stored);
  }, []);

  // ===== SHOW TOAST (STACKED) =====
  const showToast = (message) => {
    const id = crypto.randomUUID();

    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // ===== COPY =====
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  // ===== SAVE / UPDATE =====
  const savePassword = () => {
    if (!form.website || !form.username || !form.password) {
      console.warn("⚠️ Please fill all fields");
      console.error("❌ Add/Update password failed: missing input");
      return;
    }

    if (editId) {
      const updated = passwords.map((p) =>
        p.id === editId ? { ...form, id: editId } : p
      );
      setPasswords(updated);
      localStorage.setItem("passop", JSON.stringify(updated));
      console.log("✏️ Password updated:", form);

      setEditId(null);
      showToast("Password updated!");
    } else {
      const newItem = { ...form, id: crypto.randomUUID() };
      const updated = [...passwords, newItem];
      setPasswords(updated);
      localStorage.setItem("passop", JSON.stringify(updated));
      console.log("✅ Password saved:", newItem);

      showToast("Password saved!");
    }

    setForm({ website: "", username: "", password: "" });
  };

  // ===== EDIT =====
  const editPassword = (item) => {
    setForm({
      website: item.website,
      username: item.username,
      password: item.password,
    });
    setEditId(item._id);
  };

  // ===== DELETE =====
  const deletePassword = async (id) => {
  try {
    await fetch(`http://localhost:3000/passwords/${id}`, {
      method: "DELETE",
    });

   setPasswords((prev) =>
  prev.filter((item) => item._id.toString() !== id)
);

    console.log("🗑 Deleted from MongoDB:", id);
    showToast("Password deleted!");
  } catch (err) {
    console.error("❌ Delete failed:", err);
  }
};

  // ===== UI =====
  return (
    <section className="w-full flex justify-center">
      <div className="w-full max-w-4xl px-6 mt-8">

        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-purple-700">
          &lt;Key<span className="text-black">Ops</span> /&gt;
        </h1>
        <p className="text-center text-gray-700 mb-8">
          Your own Password Manager
        </p>

        {/* Website */}
        <input
          type="text"
          placeholder="Enter website URL"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          className="w-full rounded-full border border-purple-400 bg-white px-6 py-2 mb-4 outline-none"
        />

        {/* Username + Password */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Enter Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="flex-1 rounded-full border border-purple-400 bg-white px-6 py-2 outline-none"
          />

          <div className="relative flex-1">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-full border border-purple-400 bg-white px-6 py-2 pr-12 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <img
                src={showPassword ? "/icon/why.svg" : "/icon/eye.svg"}
                alt="toggle password"
                className="w-5 h-5 opacity-70 hover:opacity-100"
              />
            </button>
          </div>
        </div>

        {/* Add / Update Button */}
        <button
          type="button"
          onClick={savePassword}
          className="mx-auto flex items-center gap-2 bg-purple-300 hover:bg-purple-400 text-purple-900 px-6 py-2 rounded-full shadow-md transition"
        >
          <lord-icon
            src="https://cdn.lordicon.com/efxgwrkc.json"
            trigger="hover"
            colors="primary:#6c16c7,secondary:#4f1091"
            style={{ width: "20px", height: "20px" }}
          ></lord-icon>

          <span className="font-medium">
            {editId ? "Update Password" : "Add Password"}
          </span>
        </button>

        {/* Table */}
        <h2 className="text-xl font-semibold text-purple-900 mt-10 mb-4">
          Your Passwords
        </h2>

        <div className="overflow-x-auto rounded-xl shadow-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-purple-800 text-white">
                <th className="px-4 py-2 text-left">Site</th>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Password</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-purple-100">
              {passwords.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-600">
                    No passwords saved yet
                  </td>
                </tr>
              ) : (
                passwords.map((item) => (
                  <tr key={item._id} className="border-b border-purple-300">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={
                            item.website.startsWith("http")
                              ? item.website
                              : `https://${item.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-700 hover:underline"
                        >
                          {item.website}
                        </a>
                        <lord-icon
                          src="https://cdn.lordicon.com/gsjfryhc.json"
                          trigger="hover"
                          colors="primary:#6c16c7,secondary:#4f1091"
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                          onClick={() => copyToClipboard(item.website)}
                        ></lord-icon>
                      </div>
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {item.username}
                        <lord-icon
                          src="https://cdn.lordicon.com/gsjfryhc.json"
                          trigger="hover"
                          colors="primary:#6c16c7,secondary:#4f1091"
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                          onClick={() => copyToClipboard(item.username)}
                        ></lord-icon>
                      </div>
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {item.password}
                        <lord-icon
                          src="https://cdn.lordicon.com/gsjfryhc.json"
                          trigger="hover"
                          colors="primary:#6c16c7,secondary:#4f1091"
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                          onClick={() => copyToClipboard(item.password)}
                        ></lord-icon>
                      </div>
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <lord-icon
                          src="https://cdn.lordicon.com/exymduqj.json"
                          trigger="hover"
                          colors="primary:#6c16c7,secondary:#4f1091"
                          style={{ width: "20px", height: "20px", cursor: "pointer" }}
                          onClick={() => editPassword(item)}
                        ></lord-icon>

                        <lord-icon
                          src="https://cdn.lordicon.com/jzinekkv.json"
                          trigger="hover"
                          colors="primary:#6c16c7,secondary:#4f1091"
                          style={{ width: "20px", height: "20px", cursor: "pointer" }}
                          onClick={() => deletePassword(item._id)}
                        ></lord-icon>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔔 STACKED TOASTS */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-black text-white rounded-md shadow-lg w-64 overflow-hidden"
          >
            <div className="px-4 py-2 text-sm">
              {toast.message}
            </div>

            <div className="h-1 bg-purple-900">
              <div className="toast-progress-bar"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Manager;
