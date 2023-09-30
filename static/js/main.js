const carBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
var r = document.getElementById("result");
var flag = false;
// voice recogition

function startConverting() {
    if ('webkitSpeechRecognition' in window) {
        var speechRecognizer = new webkitSpeechRecognition();
        speechRecognizer.continuous = true;
        speechRecognizer.interimResults = true;
        speechRecognizer.lang = "en-IN";
        speechRecognizer.start();

        var finalTranscripts = "";
        speechRecognizer.onresult = function(event) {
            var interimTranscripts = '';
            for (var i = event.resultIndex; i < event.results.length; i++) {
                var transcript = event.results[i][0].transcript;
                console.log(transcript);
                if (event.results[i].isFinal) {
                    finalTranscripts += transcript;
                } else {
                    interimTranscripts += transcript;
                }
                //console.log("interm" + interimTranscripts);
            }
            console.log("intermmmmm" + interimTranscripts);

            let k = finalTranscripts + interimTranscripts;
            r.value = k;
        };
        if (flag) {
            console.log("ending");
            speechRecognizer.stop();
            flag = false;
        }
        speechRecognizer.onerror = function(event) {
            console.log("error");
        };
    } else {
        r.value = "Your Browser is not supported\n";
    }
}

function ssearch() {
    var formBtn = document.getElementById("form-btn");
    flag = true;
    formBtn.click();
}

// end of speechRecoginition
//var formBtn = document.getElementById("form-btn");
//formBtn.click();
//cart
let cart = [];
//buttons
let buttonsDOM = [];
// getting products
class Products {
    async getProducts() {
        try {
            let result = await fetch("static/json/products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const { company, title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { company, title, price, id, image }
            })
            return products;

        } catch (error) {
            console.log(error);
        }
    }
}
// displaying products
class UI {
    constructor() {
      this.cart = []; // Define cart as a property of the UI class
    }
  
    displayProducts(products) {
      if (products.length === 0) {
        productsDOM.innerHTML = "<p class='p'>Item not found</p>";
        return;
      }
      let result = "";
      products.forEach((product) => {
        result += `
          <!-- single product -->
          <article class="product">
              <div class="img-container">
                  <img src=${product.image} alt="product" class="product-img" />
                  <button class="bag-btn" data-id=${product.id}>
                       <i class="fas fa-shopping-cart"></i>
                       add to cart
                   </button>
              </div>
              <h6>${product.company}</h6>
              <h5>${product.title}</h5>
              <h4>Rs. ${product.price}</h4>
          </article>
          <!-- end of single product -->
        `;
      });
      productsDOM.innerHTML = result;
      const productElements = document.querySelectorAll(".product");
      productElements.forEach((productElement) => {
        productElement.addEventListener("click", this.hideCart);
      });
    }
  
    getUserId() {
      var userIdElement = document.getElementById("user-id");
  
      if (userIdElement) {
        var userId = userIdElement.dataset.userId;
        console.log("User ID:", userId);
        return userId;
      }
    }
  
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach((button) => {
          let id = button.dataset.id;
          let inCart = cart.find((item) => item.id === id);
          if (inCart) {
            button.innerText = "In Cart";
            button.disabled = true;
          } else {
            button.addEventListener("click", (event) => {
              event.target.innerText = "In Cart";
              event.target.disabled = true;
              let cartItem = { ...Storage.getProducts(id), amount: 1 };
              cart = [...cart, cartItem];
              const userId = this.getUserId();
              Storage.saveCartByUserId(userId, cart);
              this.setCartValues(cart);
              this.addCartItem(cartItem);
              this.showCart();
            });
          }
        });
      }
      
  
    setCartValues(cart) {
      let tempTotal = 0;
      let itemsTotal = 0;
      cart.map((item) => {
        tempTotal += item.price * item.amount;
        itemsTotal += item.amount;
      });
      cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
      cartItems.innerText = itemsTotal;
      console.log("qq");
      console.log(cartTotal, cartItems);
    }
  
    addCartItem(item) {
      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.innerHTML = `<img src=${item.image} alt="product1">
          <div>
              <h4>${item.title} </h4>
              <h5>Rs.${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
          </div>
          <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>`;
      cartContent.appendChild(div);
      console.log(cartContent);
    }
  
    showCart() {
      cartOverlay.classList.add("transparentBcg");
      cartDOM.classList.add("showCart");
    }
  
    hideCart() {
      cartOverlay.classList.remove("transparentBcg");
      cartDOM.classList.remove("showCart");
    }
  
    // Save the cart items to local storage for the current user
    getCartFromLocalStorage() {
      const userId = this.getUserId();
      return Storage.getCartByUserId(userId);
    }
  
    setupAPP() {
      // Display the cart items
      const cart = this.getCartFromLocalStorage();
      this.populateCart(cart);
  
      // Set the cart values
      this.setCartValues(cart);
  
      carBtn.addEventListener("click", this.showCart);
      closeCartBtn.addEventListener("click", this.hideCart);
    }
  
    populateCart(cart) {
        const cartItems = cartContent.querySelectorAll(".cart-item");
        cartItems.forEach((item) => {
          cartContent.removeChild(item);
        });
      
        cart.forEach((item) => {
          this.addCartItem(item);
        });
      }
      
  
    cartLogic() {
      const userId = this.getUserId();
      let cart = Storage.getCartByUserId(userId);
  
      // ...
  
      // Save the updated cart to local storage
      // clear cart Logic
      clearCartBtn.addEventListener("click", () => {
        this.clearCart();
      });
  
      // cart functionality
      cartContent.addEventListener("click", (event) => {
        //console.log(event.target);
        if (event.target.classList.contains("remove-item")) {
          let removeItem = event.target;
          let id = removeItem.dataset.id;
          cartContent.removeChild(removeItem.parentElement.parentElement);
          this.removeItem(id);
        } else if (event.target.classList.contains("fa-chevron-up")) {
          let addAmt = event.target;
          let id = addAmt.dataset.id;
          let tempItem = cart.find((item) => item.id === id);
          tempItem.amount = tempItem.amount + 1;
          Storage.saveCartByUserId(userId, cart);
          this.setCartValues(cart);
          addAmt.nextElementSibling.innerText = tempItem.amount;
        } else if (event.target.classList.contains("fa-chevron-down")) {
          let lowAmt = event.target;
          let id = lowAmt.dataset.id;
          let tempItem = cart.find((item) => item.id === id);
          tempItem.amount = tempItem.amount - 1;
          if (tempItem.amount > 0) {
            Storage.saveCartByUserId(userId, cart);
            this.setCartValues(cart);
            lowAmt.previousElementSibling.innerText = tempItem.amount;
          } else {
            cartContent.removeChild(lowAmt.parentElement.parentElement);
            this.removeItem(id);
          }
        }
      });
  
      Storage.saveCartByUserId(userId, cart);
    }
  
    clearCart() {
      const userId = this.getUserId();
      let cart = Storage.getCartByUserId(userId);
  
      let cartItems = cart.map((item) => item.id);
      console.log(cartItems);
      cartItems.forEach((id) => this.removeItem(id));
      while (cartContent.children.length > 0) {
        cartContent.removeChild(cartContent.children[0]);
      }
      this.hideCart();
  
      Storage.saveCartByUserId(userId, cart);
    }
  
    removeItem(id) {
      const userId = this.getUserId();
      let cart = Storage.getCartByUserId(userId);
  
      cart = cart.filter((item) => item.id !== id);
      this.setCartValues(cart);
      Storage.saveCartByUserId(userId, cart);
      let button = this.getSingleButton(id);
      button.disabled = false;
      button.innerHTML = `<i class ="fas fa-shopping-cart"></i>add to cart`;
    }
  
    getSingleButton(id) {
      return buttonsDOM.find((button) => button.dataset.id === id);
    }
  }
  
  class Storage {
    static saveProducts(products) {
      localStorage.setItem("products", JSON.stringify(products));
      return products;
    }
  
    static getProducts(id) {
      let products = JSON.parse(localStorage.getItem("products"));
      return products.find((product) => product.id === id);
    }
  
    static saveCart(cart) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  
    static getCart() {
      return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    }
  
    static saveCartByUserId(userId, cart) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    }
  
    static getCartByUserId(userId) {
      const cartData = localStorage.getItem(`cart_${userId}`);
      return cartData ? JSON.parse(cartData) : [];
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
  
    ui.setupAPP();
    const cart = ui.getCartFromLocalStorage();
  
    products
      .getProducts()
      .then((product) => {
        ui.displayProducts(product);
        return Storage.saveProducts(product);
      })
      .then(() => {
        ui.getBagButtons();
        ui.cartLogic();
      })
      .then(() => {
        ui.populateCart(cart);
        ui.setCartValues(cart);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  
    console.log("Products stored");
  });
  