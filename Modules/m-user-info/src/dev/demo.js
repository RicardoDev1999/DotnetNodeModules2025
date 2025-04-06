// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the component with initial values
  let componentInstance = null;
  
  // Function to initialize or update the component
  function setupOrUpdateComponent() {
    const username = document.getElementById('username').value;
    const ageInput = document.getElementById('age').value;
    const age = ageInput ? new Date(ageInput) : null;
    
    // Setup params
    const params = {
      username,
      age
    };
    
    // If already initialized, update it
    if (componentInstance) {
      componentInstance.updateUserData(params);
      console.log('Component updated with:', params);
    } else {
      // First initialization
      // Access the component via the global variable set by webpack (should be properly exposed now)
      if (window.mUserInfo && typeof window.mUserInfo.setup === 'function') {
        componentInstance = window.mUserInfo.setup('my-component', params);
        console.log('Component initialized with:', params);
      } else {
        console.error('Component not found. Make sure it is properly loaded.', window.mUserInfo);
      }
    }
  }
  
  // Initialize the component on page load (with a small delay to ensure it's loaded)
  setTimeout(() => {
    setupOrUpdateComponent();
  }, 300);
  
  // Update button event listener
  document.getElementById('update-btn').addEventListener('click', () => {
    setupOrUpdateComponent();
  });
});