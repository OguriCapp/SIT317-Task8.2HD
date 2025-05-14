// Main JavaScript for Deakin Nexus

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });

  // Initialize popovers
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  });

  // Task progress bars animation
  const progressBars = document.querySelectorAll('.progress-bar');
  if (progressBars.length > 0) {
    progressBars.forEach(bar => {
      const width = bar.getAttribute('aria-valuenow') + '%';
      bar.style.width = 0;
      setTimeout(() => {
        bar.style.transition = 'width 1s ease';
        bar.style.width = width;
      }, 100);
    });
  }

  // Task form date picker defaults
  const dueDateInputs = document.querySelectorAll('input[type="date"]');
  if (dueDateInputs.length > 0) {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    dueDateInputs.forEach(input => {
      if (!input.value) {
        input.setAttribute('min', dateString);
      }
    });
  }

  // Task delete confirmation
  const deleteButtons = document.querySelectorAll('.delete-btn');
  if (deleteButtons.length > 0) {
    deleteButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        if (!confirm('Are you sure you want to delete this item?')) {
          e.preventDefault();
        }
      });
    });
  }
  
  // Mobile sidebar toggle
  const sidebarToggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('show');
    });
  }
  
  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
  if (alerts.length > 0) {
    alerts.forEach(alert => {
      setTimeout(() => {
        alert.classList.add('fade');
        setTimeout(() => {
          alert.remove();
        }, 500);
      }, 5000);
    });
  }
}); 