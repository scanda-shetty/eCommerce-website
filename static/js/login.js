document.addEventListener("DOMContentLoaded", function() {
    const loginButton = document.getElementById("loginButton");
    const closeButton = document.querySelectorAll("#loginContainer button");
    const CloseButton = document.querySelectorAll("#registerContainer button");
    const registerLink = document.getElementById("registerLink");
    const loginLink = document.getElementById("loginLink");
    const loginContainer = document.getElementById("loginContainer");
    const registerContainer = document.getElementById("registerContainer");
  
    loginButton.addEventListener("click", function() {
        loginContainer.classList.add("opened");
      });
    
      // Close Login Container
      for (let i = 0; i < closeButton.length; i++) {
        closeButton[i].addEventListener("click", function() {
          loginContainer.classList.remove("opened");
        });
      }
    
      // Open Register Container
      registerLink.addEventListener("click", function() {
        loginContainer.classList.remove("opened");
        registerContainer.classList.add("opened");
      });
    
      // Close Register Container
      const registerCloseButton = registerContainer.querySelector(".closeButton");
      registerCloseButton.addEventListener("click", function() {
        registerContainer.classList.remove("opened");
      });
    
      // Switch to Login Container
      loginLink.addEventListener("click", function() {
        registerContainer.classList.remove("opened");
        loginContainer.classList.add("opened");
      });
    });