// DOM Elements
const form = document.getElementById("feedbackForm");
const msg = document.getElementById("msg");
const adminSection = document.getElementById("adminSection");
const feedbackTable = document.querySelector("#feedbackTable tbody");
const openAdminBtn = document.getElementById("openAdmin");
const toggleAdminBtn = document.getElementById("toggleAdmin");
const ratingContainer = document.getElementById("ratingContainer");
const ratingInput = document.getElementById("rating");
const statsContainer = document.getElementById("statsContainer");
const emptyState = document.getElementById("emptyState");
const currentYearSpan = document.getElementById("currentYear");

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  currentYearSpan.textContent = new Date().getFullYear();
  
  loadFeedback();
  setupRatingSelection();
});

// Setup rating selection
function setupRatingSelection() {
  const ratingOptions = ratingContainer.querySelectorAll('.rating-option');
  
  ratingOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove selected class from all options
      ratingOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Add selected class to clicked option
      option.classList.add('selected');
      
      // Set the hidden input value
      ratingInput.value = option.getAttribute('data-value');
    });
  });
}

// Load stored feedback from localStorage
function loadFeedback() {
  const feedbacks = JSON.parse(localStorage.getItem("feedbackData") || "[]");
  
  // Update table
  feedbackTable.innerHTML = "";
  
  if (feedbacks.length === 0) {
    emptyState.style.display = 'block';
    feedbackTable.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    feedbackTable.style.display = 'table';
    
    feedbacks.forEach((fb, index) => {
      const row = document.createElement("tr");
      const stars = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${fb.name || "-"}</td>
        <td>${fb.email || "-"}</td>
        <td><span class="rating-stars">${stars}</span> (${fb.rating}/5)</td>
        <td>${fb.message}</td>
        <td>${fb.date}</td>
      `;
      feedbackTable.appendChild(row);
    });
  }
  
  // Update stats
  updateStats(feedbacks);
}

// Update statistics
function updateStats(feedbacks) {
  if (feedbacks.length === 0) {
    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">0</div>
        <div class="stat-label">Total Feedback</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">0.0</div>
        <div class="stat-label">Average Rating</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">0</div>
        <div class="stat-label">This Month</div>
      </div>
    `;
    return;
  }
  
  // Calculate average rating
  const totalRating = feedbacks.reduce((sum, fb) => sum + parseInt(fb.rating), 0);
  const avgRating = (totalRating / feedbacks.length).toFixed(1);
  
  // Count feedback from this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthCount = feedbacks.filter(fb => {
    const fbDate = new Date(fb.date);
    return fbDate.getMonth() === currentMonth && fbDate.getFullYear() === currentYear;
  }).length;
  
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${feedbacks.length}</div>
      <div class="stat-label">Total Feedback</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${avgRating}</div>
      <div class="stat-label">Average Rating</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${thisMonthCount}</div>
      <div class="stat-label">This Month</div>
    </div>
  `;
}

// Show message
function showMessage(text, type) {
  msg.textContent = text;
  msg.className = "message " + type;
  msg.style.display = "block";
  setTimeout(() => (msg.style.display = "none"), 5000);
}

// Save feedback
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const rating = ratingInput.value;
  const message = document.getElementById("message").value.trim();

  if (!rating || !message) {
    showMessage("Please fill in all required fields!", "error");
    return;
  }

  const feedback = {
    name,
    email,
    rating,
    message,
    date: new Date().toLocaleString(),
  };

  const feedbacks = JSON.parse(localStorage.getItem("feedbackData") || "[]");
  feedbacks.push(feedback);
  localStorage.setItem("feedbackData", JSON.stringify(feedbacks));

  form.reset();
  // Clear rating selection
  document.querySelectorAll('.rating-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  ratingInput.value = '';
  
  showMessage("Thank you for your feedback! We appreciate your input.", "success");
  loadFeedback();
});

// Admin toggle
openAdminBtn.addEventListener("click", () => {
  adminSection.style.display = "block";
  openAdminBtn.style.display = "none";
  loadFeedback();
});

toggleAdminBtn.addEventListener("click", () => {
  adminSection.style.display = "none";
  openAdminBtn.style.display = "block";
});

// Clear all data
document.getElementById("clearData").addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all feedback? This action cannot be undone.")) {
    localStorage.removeItem("feedbackData");
    loadFeedback();
    showMessage("All feedback data has been cleared.", "success");
  }
});

// Export CSV
document.getElementById("exportCSV").addEventListener("click", () => {
  const feedbacks = JSON.parse(localStorage.getItem("feedbackData") || "[]");
  if (feedbacks.length === 0) {
    showMessage("No feedback to export!", "error");
    return;
  }

  const csvContent =
    "data:text/csv;charset=utf-8," +
    ["Name,Email,Rating,Message,Date"]
      .concat(feedbacks.map(fb =>
        `"${fb.name || ''}","${fb.email || ''}","${fb.rating}","${fb.message.replace(/"/g, '""')}","${fb.date}"`
      ))
      .join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `feedback_data_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showMessage("CSV file downloaded successfully!", "success");
});