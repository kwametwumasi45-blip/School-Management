(() => {
  "use strict";

  const API = {
    students: "/api/students",
    teachers: "/api/teachers",
    classes: "/api/classes",
    subjects: "/api/subjects",
    attendance: "/api/attendance",
    examinations: "/api/examinations",
    fees: "/api/fees",
    reports: "/api/reports",
    settings: "/api/settings"
  };

  const labels = {
    students: ["Students", "Student registration and student records."],
    teachers: ["Teachers & Staff", "Teaching and staff records."],
    classes: ["Classes", "Class records."],
    subjects: ["Subjects", "Subject records."],
    attendance: ["Attendance", "Attendance records."],
    examinations: ["Examinations", "Examination records and results."],
    fees: ["Fees & Payments", "Fee assignments and payment records."],
    reports: ["Reports", "School reports and summaries."],
    settings: ["Settings", "School information and preferences."]
  };

  const $ = (id) => document.getElementById(id);
  let currentPage = "dashboard";
  let lastRows = [];

  function setMessage(message, type = "") {
    const box = $("module-message");
    box.textContent = message;
    box.className = "message" + (type ? " " + type : "");
  }

  async function apiGet(url) {
    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      headers: { "Accept": "application/json" }
    });

    if (response.status === 401) {
      window.location.href = "/login";
      throw new Error("Your session has expired. Please log in again.");
    }

    const text = await response.text();
    let payload;
    try { payload = text ? JSON.parse(text) : {}; }
    catch { throw new Error("The server returned a non-JSON response. Check the API route."); }

    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || `Request failed (${response.status}).`);
    }
    return payload;
  }

  function extractRows(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.records)) return payload.records;
    if (payload.data && typeof payload.data === "object") return [payload.data];
    return [];
  }

  function renderTable(rows) {
    const head = $("records-head");
    const body = $("records-body");
    head.replaceChildren();
    body.replaceChildren();
    lastRows = rows;

    if (!rows.length) {
      body.innerHTML = '<tr><td class="empty-cell">No records were returned for this module.</td></tr>';
      $("record-count").textContent = "0 records";
      return;
    }

    const keys = [...new Set(rows.flatMap(row => Object.keys(row || {})))];
    const headerRow = document.createElement("tr");
    keys.forEach(key => {
      const th = document.createElement("th");
      th.textContent = key.replaceAll("_", " ");
      headerRow.appendChild(th);
    });
    head.appendChild(headerRow);

    rows.forEach(row => {
      const tr = document.createElement("tr");
      keys.forEach(key => {
        const td = document.createElement("td");
        const value = row?.[key];
        td.textContent = value === null || value === undefined ? "—" :
          (typeof value === "object" ? JSON.stringify(value) : String(value));
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    $("record-count").textContent = `${rows.length} record${rows.length === 1 ? "" : "s"}`;
  }

  async function loadModule(page) {
    currentPage = page;
    const [heading, description] = labels[page];
    $("page-title").textContent = heading;
    $("module-heading").textContent = heading;
    $("module-description").textContent = description;
    setMessage("Loading records…");
    try {
      const payload = await apiGet(API[page]);
      const rows = extractRows(payload);
      renderTable(rows);
      setMessage(rows.length ? "Records loaded successfully." : "The connection is working, but there are no records to display yet.", "success");
    } catch (error) {
      renderTable([]);
      setMessage(error.message || "Could not load this module.", "error");
    }
  }

  function showPage(page) {
    document.querySelectorAll(".nav-link").forEach(button => {
      button.classList.toggle("active", button.dataset.page === page);
    });
    if (page === "dashboard") {
      currentPage = "dashboard";
      $("page-title").textContent = "Dashboard";
      $("dashboard-page").hidden = false;
      $("dashboard-page").classList.add("active");
      $("module-page").hidden = true;
      loadDashboardStats();
    } else if (labels[page]) {
      $("dashboard-page").hidden = true;
      $("dashboard-page").classList.remove("active");
      $("module-page").hidden = false;
      $("module-page").classList.add("active");
      loadModule(page);
    }
    $("sidebar").classList.remove("open");
  }

  async function loadDashboardStats() {
    const ids = { students: "stat-students", teachers: "stat-teachers", classes: "stat-classes", subjects: "stat-subjects" };
    for (const [module, id] of Object.entries(ids)) {
      try {
        const payload = await apiGet(API[module]);
        $(id).textContent = extractRows(payload).length;
      } catch {
        $(id).textContent = "—";
      }
    }
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-page]");
    if (button) showPage(button.dataset.page);
  });

  $("refresh-button").addEventListener("click", () => {
    if (currentPage !== "dashboard" && API[currentPage]) loadModule(currentPage);
  });

  $("menu-toggle").addEventListener("click", () => $("sidebar").classList.toggle("open"));

  $("logout-button").addEventListener("click", async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) window.location.href = "/login";
      else setMessage("Could not log out. Please try again.", "error");
    } catch {
      setMessage("Could not contact the server to log out.", "error");
    }
  });

  $("today-label").textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  }).format(new Date());

  // Confirm the session before showing protected dashboard content.
  apiGet("/api/auth/me")
    .then(() => showPage("dashboard"))
    .catch(() => { window.location.href = "/login"; });
})();