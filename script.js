(function () {
  "use strict";

  var STORAGE_KEY = "admissionPortal.students.v1";
  var FIELDS = ["fullName", "matric", "email", "phone", "age", "department", "password"];

  // The student "database": an array of plain objects.
  var students = [];

  // Fictional demo data. Placeholder phones, example.com emails, invented matric numbers.
  var DEMO_STUDENTS = [
    { fullName: "Basiru Ibrahim", matric: "DEMO/24/CSC/0001", email: "basiru.ibrahim@example.com", phone: "08000000001", age: 19, department: "Computer Science" },
    { fullName: "Efion Ekanem", matric: "DEMO/24/LAW/0002", email: "efion.ekanem@example.com", phone: "08000000002", age: 21, department: "Law" },
    { fullName: "Chiamaka Okafor", matric: "DEMO/24/MED/0003", email: "chiamaka.okafor@example.com", phone: "08000000003", age: 18, department: "Medicine and Surgery" },
    { fullName: "Akujuobi Philemon", matric: "DEMO/24/EEE/0004", email: "akujuobi.philemon@example.com", phone: "08000000004", age: 22, department: "Electrical Engineering" },
    { fullName: "Aisha Bello", matric: "DEMO/24/ACC/0005", email: "aisha.bello@example.com", phone: "08000000005", age: 20, department: "Accounting" },
    { fullName: "Tunde Adeyemi", matric: "DEMO/24/ECO/0006", email: "tunde.adeyemi@example.com", phone: "08000000006", age: 23, department: "Economics" }
  ];

  var form = document.getElementById("regForm");
  var messageBox = document.getElementById("message");
  var tableBody = document.getElementById("studentBody");
  var table = document.getElementById("studentTable");
  var emptyState = document.getElementById("emptyState");
  var countEl = document.getElementById("count");
  var loadBtn = document.getElementById("loadDemo");
  var clearBtn = document.getElementById("clearDemo");

  /* ---------- Normalisation helpers ---------- */
  function normMatric(v) { return String(v).replace(/\s+/g, "").toUpperCase(); }
  function normEmail(v) { return String(v).trim().toLowerCase(); }

  /* ---------- Storage ---------- */
  function loadStudents() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      students = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      students = [];
    }
  }
  function saveStudents() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); } catch (e) { /* storage unavailable: memory only */ }
  }

  /* ---------- Password hashing (salted SHA-256 via Web Crypto) ---------- */
  function toHex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }
  async function hashPassword(password) {
    if (!(window.crypto && window.crypto.subtle)) { return "unavailable"; }
    var salt = toHex(window.crypto.getRandomValues(new Uint8Array(16)));
    var digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + password));
    return salt + ":" + toHex(digest);
  }

  /* ---------- Validation ---------- */
  function isDuplicate(key, value) {
    for (var i = 0; i < students.length; i++) {
      if (key === "matric" && normMatric(students[i].matric) === normMatric(value)) { return true; }
      if (key === "email" && normEmail(students[i].email) === normEmail(value)) { return true; }
    }
    return false;
  }

  function validateField(name, value) {
    var v = String(value).trim();
    switch (name) {
      case "fullName":
        if (v.length < 2) { return "Enter a name of at least 2 characters."; }
        return "";
      case "matric":
        if (!v) { return "Matriculation number is required."; }
        if (!/^[A-Za-z0-9\/\-]{5,25}$/.test(v.replace(/\s+/g, ""))) { return "Use 5–25 letters, digits, / or - (e.g. 24/CSC/0101)."; }
        if (isDuplicate("matric", v)) { return "This matriculation number is already registered."; }
        return "";
      case "email":
        if (!v) { return "Email address is required."; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { return "Enter a valid email, e.g. name@example.com."; }
        if (isDuplicate("email", v)) { return "This email address is already registered."; }
        return "";
      case "phone":
        var p = v.replace(/[\s\-()]/g, "");
        if (!p) { return "Phone number is required."; }
        var nigerian = /^(?:\+234|234|0)[789][01]\d{8}$/.test(p);
        var international = /^\+[1-9]\d{7,14}$/.test(p);
        if (!nigerian && !international) { return "Use a Nigerian number (08012345678, +2348012345678) or international (+14155550123)."; }
        return "";
      case "age":
        if (!v) { return "Age is required."; }
        if (!/^\d+$/.test(v)) { return "Age must be a whole number."; }
        var n = parseInt(v, 10);
        if (n < 16 || n > 100) { return "Age must be between 16 and 100."; }
        return "";
      case "department":
        return v ? "" : "Please select a department.";
      case "password":
        return String(value).length >= 8 ? "" : "Password must be at least 8 characters.";
    }
    return "";
  }

  function showFieldState(name, error) {
    var input = document.getElementById(name);
    document.getElementById(name + "-error").textContent = error;
    input.classList.toggle("invalid", !!error);
    input.classList.toggle("valid", !error && input.value !== "");
    input.setAttribute("aria-invalid", error ? "true" : "false");
  }

  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = text ? type : "";
  }

  /* ---------- Rendering ---------- */
  function addCell(row, label, text) {
    var td = document.createElement("td");
    td.setAttribute("data-label", label);
    td.textContent = text;
    row.appendChild(td);
    return td;
  }

  function render() {
    tableBody.innerHTML = "";
    for (var i = 0; i < students.length; i++) {
      var s = students[i];
      var tr = document.createElement("tr");
      addCell(tr, "#", i + 1);
      addCell(tr, "Name", s.fullName);
      addCell(tr, "Matric no.", s.matric);
      addCell(tr, "Email", s.email);
      addCell(tr, "Phone", s.phone);
      addCell(tr, "Age", s.age);
      addCell(tr, "Department", s.department);
      var typeCell = addCell(tr, "Type", "");
      var badge = document.createElement("span");
      badge.className = "badge " + (s.isDemo ? "demo" : "real");
      badge.textContent = s.isDemo ? "Demo" : "Registered";
      typeCell.appendChild(badge);
      tableBody.appendChild(tr);
    }
    countEl.textContent = students.length;
    table.hidden = students.length === 0;
    emptyState.hidden = students.length > 0;
    clearBtn.disabled = !students.some(function (s) { return s.isDemo; });
  }

  /* ---------- Events ---------- */
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    var values = {};
    var firstInvalid = null;

    for (var i = 0; i < FIELDS.length; i++) {
      var name = FIELDS[i];
      values[name] = document.getElementById(name).value;
      var error = validateField(name, values[name]);
      showFieldState(name, error);
      if (error && !firstInvalid) { firstInvalid = name; }
    }

    if (firstInvalid) {
      showMessage("Please fix the highlighted fields and try again.", "fail");
      document.getElementById(firstInvalid).focus();
      return;
    }

    var passwordHash = await hashPassword(values.password);
    var student = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      fullName: values.fullName.trim(),
      matric: normMatric(values.matric),
      email: normEmail(values.email),
      phone: values.phone.trim(),
      age: parseInt(values.age, 10),
      department: values.department,
      passwordHash: passwordHash, // never the plaintext password
      isDemo: false
    };
    values = null; // drop the submitted values, including the password

    students.push(student);
    saveStudents();
    render();
    form.reset();
    FIELDS.forEach(function (n) { showFieldState(n, ""); document.getElementById(n).classList.remove("valid"); });
    showMessage("Success! " + student.fullName + " has been registered. You can register another student or review the register below.", "success");
  });

  // Live feedback when leaving a field
  FIELDS.forEach(function (name) {
    var input = document.getElementById(name);
    input.addEventListener("blur", function () {
      if (input.value !== "") { showFieldState(name, validateField(name, input.value)); }
    });
    input.addEventListener("input", function () {
      if (input.classList.contains("invalid")) { showFieldState(name, validateField(name, input.value)); }
    });
  });

  loadBtn.addEventListener("click", function () {
    var added = 0;
    for (var i = 0; i < DEMO_STUDENTS.length; i++) {
      var d = DEMO_STUDENTS[i];
      if (isDuplicate("matric", d.matric) || isDuplicate("email", d.email)) { continue; }
      students.push({
        id: "demo-" + i,
        fullName: d.fullName, matric: normMatric(d.matric), email: normEmail(d.email),
        phone: d.phone, age: d.age, department: d.department,
        passwordHash: null, isDemo: true
      });
      added++;
    }
    saveStudents();
    render();
    showMessage(added ? added + " fictional demo record(s) loaded." : "Demo records are already loaded.", "info");
  });

  clearBtn.addEventListener("click", function () {
    var before = students.length;
    students = students.filter(function (s) { return !s.isDemo; });
    saveStudents();
    render();
    showMessage((before - students.length) + " demo record(s) removed. Your own registrations were kept.", "info");
  });

  loadStudents();
  render();
})();
