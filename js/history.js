async function loadHistory() {
  const phone = document.getElementById("phone").value.trim();
  const tableBody = document.getElementById("bookingTable");

  // Clear previous data
  tableBody.innerHTML = "";

  // Validation
  if (phone.length !== 10) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center;">
          Enter a valid 10-digit phone number
        </td>
      </tr>
    `;
    return;
  }

  try {
    const res = await fetch(
      `https://restwell-backend.onrender.com/api/bookings/phone/${phone}`
    );

    if (!res.ok) throw new Error("Network response was not ok");

    const data = await res.json();

    if (!data || data.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align:center;">
            No bookings found
          </td>
        </tr>
      `;
      return;
    }

    data.forEach(b => {
      const statusClass =
        b.status === "approved"
          ? "status-approved"
          : b.status === "rejected"
          ? "status-rejected"
          : "status-pending";

      tableBody.innerHTML += `
        <tr>
          <td>${b.serviceName || "-"}</td>
          <td class="${statusClass}">
            ${(b.status || "pending").toUpperCase()}
          </td>
          <td>${b.preferredDate || "-"}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Error loading bookings:", err);

    tableBody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center;">
          Error loading bookings. Please try again.
        </td>
      </tr>
    `;
  }
}