const API = "https://restwell-backend.onrender.com/api/bookings";

async function checkStatus() {
  const phone = document.getElementById("phone").value.trim();
  const table = document.getElementById("statusTable");

  table.innerHTML = "";

  if (phone.length !== 10) {
    table.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">
          Enter a valid 10-digit phone number
        </td>
      </tr>
    `;
    return;
  }

  try {
    const res = await fetch(`${API}/phone/${phone}`);

    if (!res.ok) throw new Error("Failed to fetch");

    const bookings = await res.json();

    if (!bookings || bookings.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;">
            No bookings found
          </td>
        </tr>
      `;
      return;
    }

    bookings.forEach(b => {
      const statusClass =
        b.status === "approved"
          ? "status-approved"
          : b.status === "rejected"
          ? "status-rejected"
          : "status-pending";

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${b.serviceName || "-"}</td>
        <td>${b.preferredDate || "-"}</td>
        <td>${b.timeSlot || "-"}</td>
        <td class="${statusClass}">
          ${(b.status || "pending").toUpperCase()}
        </td>
      `;

      table.appendChild(tr);
    });

  } catch (error) {
    console.error(error);
    table.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">
          Error loading booking status
        </td>
      </tr>
    `;
  }
}