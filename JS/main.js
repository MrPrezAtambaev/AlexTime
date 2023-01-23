//! Task 1.
//! Создать форму, в которую можно ввести след. информацию: имя пользователя, пароль, подтверждение пароля, админ или нет(можно использовать checkbox) задача: необходимо пользователей сохранять в local storage под ключом users, необходимо реализовать проверки: на уникальность имени и на совпадение паролей

function initStorage() {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", "[]");
  }
}
initStorage();

function setUsersToStorage(usersData) {
  localStorage.setItem("users", JSON.stringify(usersData));
}

function getUsersFromStorage() {
  let users = JSON.parse(localStorage.getItem("users"));
  return users;
}

let loginLink = document.querySelector(".login-link");
let logoutLink = document.querySelector(".loginout-link");
let registerLink = document.querySelector(".register-link");

let inpUsername = document.querySelector("#inputUsername");
let inpPass = document.querySelector("#inputPassword1");
let inpConfPass = document.querySelector("#inputPassword2");
let checkbox = document.querySelector("#checkbox1");

let loginBtn = document.querySelector(".login-btn");
let registerBtn = document.querySelector(".register-btn");

function registerUser() {
  let users = getUsersFromStorage();

  if (users.some((item) => item.username === inpUsername.value)) {
    alert("The user with this username already exists");
    return;
  }

  if (inpPass.value !== inpConfPass.value) {
    alert("Passwords don't match");
    return;
  }

  let userObj = {
    username: inpUsername.value,
    password: inpPass.value,
    checkAdmin: false,
  };

  if (checkbox.checked) {
    userObj.checkAdmin = true;
  }

  users.push(userObj);
  setUsersToStorage(users);

  inpUsername.value = "";
  inpPass.value = "";
  inpConfPass.value = "";
  checkbox.checked = false;

  let btnClose = document.querySelector(".btn-close-register");
  console.log(btnClose);
  btnClose.click();
}

registerBtn.addEventListener("click", registerUser);

//! Task 2.
//! Продолжаем предыдущий проект, создать форму для добавления продуктов в которую можно добавить: название, цену, ссылку на картинку; при нажатии на кнопку СОЗДАТЬ ПРОДУКТ, должна запрашиваться информация о пользователе в модальном окне(имя и пароль), затем необходимо проверить существует ли этот пользователь, подходит ли пароль к данному пользователю и является ли он админом, если все совпадает, добавить продукт в db.json(использовать json-server), также у каждого продукта должно быть поле АВТОР, автора необходимо динамически добавлять самостоятельно, данные можно получить к примеру в момент проверки существует ли пользователь вообще

let addProdBtn = document.querySelector(".add-product-btn");
let loginAddBtn = document.querySelector(".login-add-btn");

let imgInp = document.querySelector("#photo-inp");
let titleInp = document.querySelector("#title-inp");
let priceInp = document.querySelector("#price-inp");

let loginInpUser = document.querySelector("#loginUsername");
let loginPass = document.querySelector("#loginPassword");

addProdBtn.addEventListener("click", createProd);

function createProd() {
  let productObj = {
    title: titleInp.value,
    price: priceInp.value,
    url: imgInp.value,
    author: "",
  };

  function login() {
    let users = getUsersFromStorage();
    let userObj = users.find((item) => item.username == loginInpUser.value);
    console.log(userObj);

    if (!userObj) {
      alert("There is no this user");
      return;
    }

    if (userObj.password !== loginPass.value) {
      alert("The password don't match");
      return;
    }

    if (userObj.checkAdmin == false) {
      alert("You are not admin");
      return;
    }

    productObj.author = userObj.username;

    fetch("http://localhost:5000/products", {
      method: "POST",
      body: JSON.stringify(productObj),
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    });
  }

  loginAddBtn.addEventListener("click", login);

  imgInp.value = "";
  titleInp.value = "";
  priceInp.value = "";

  let btnCloseLogin = document.querySelector(".btn-close-login");
  btnCloseLogin.click();
}

//! Task 3.
//! Продолжаем предыдущий проект, добавить функцию рендера, которая срабатывает при обновлении страницы по умолчанию, а также запускается при нажатии на кнопку ПОЛУЧИТЬ СПИСОК ПРОДУКТОВ

let readBtn = document.querySelector(".getProducts-btn");

readBtn.addEventListener("click", readProd);
document.addEventListener("DOMContentLoaded", readProd);

function readProd() {
  let container = document.querySelector(".container");
  container.innerHTML = "";

  let fetch0 = fetch("http://localhost:5000/products")
    .then((result) => result.json())
    .then((data) => {
      data.forEach((item) => {
        container.innerHTML += `
            <div class="card w-25 m-2 " style="width: 18rem;" title="${item.title}"> 
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <img src="${item.url}" width="100" height="100"></img>
                    <p class="card-text"><b>Price</b> ${item.price}</p>
                    <p class="card-text"><b>Author</b> ${item.author}</p>
                    <a href="#" class="btn btn-danger delete-prod-btn" title="${item.title}" id="${item.id}">Delete product</a>
                    <a href="#" class="btn btn-secondary update" data-bs-toggle="modal" data-bs-target="#staticBackdrop" title="${item.title}" id="${item.id}">Update product</a> 
                </div>
            </div>
            `;
      });

      addUpdateEvent();
      addDeleteEvent();
    });
}

//! Task 4.
//! Продолжаем предыдущий проект, добавить возможность редактирования продуктов, у каждого продукта должна быть кнопка РЕДАКТИРОВАТЬ, при нажатии на которую данные о продукте попадают в форму(можно использовать форму, которая предназначалась для создания продукта, можно создать отдельную, также можно использовать модалку), затем при нажатии на кнопку СОХРАНИТЬ ИЗМЕНЕНИЯ продукт должен быть изменен и страница должна заново отрисовать все продукты

function updateProd(e) {
  let users = getUsersFromStorage();

  if (!e.target.title) return;
  let prodTitle = e.target.title;

  let fetch1 = fetch("http://localhost:5000/products")
    .then((result) => result.json())
    .then((products) => {
      let productObj = products.find((item) => item.title == prodTitle);

      let modalTitle = document.querySelector(".modal-title-add");
      modalTitle.innerText = "Update Product";

      let modalFooter = document.querySelector(".footer-add");
      modalFooter.innerHTML = "";
      modalFooter.innerHTML = `<button type="button" class="btn btn-secondary save-changes-btn" title="${productObj.author}" id="${productObj.id}">Save changes</button>`;

      imgInp.value = productObj.url;
      titleInp.value = productObj.title;
      priceInp.value = productObj.price;

      addSaveEvent();
    });
}

function addUpdateEvent() {
  let updateBtns = document.querySelectorAll(".update");
  updateBtns.forEach((item) => item.addEventListener("click", updateProd));
}

function addSaveEvent() {
  let saveBtns = document.querySelectorAll(".save-changes-btn");
  saveBtns.forEach((item) => item.addEventListener("click", saveChanges));
}

function saveChanges(e) {
  if (!e.target.id) return;
  let prodId = e.target.id;

  let fetch2 = fetch("http://localhost:5000/products")
    .then((result) => result.json())
    .then((products) => {
      let productObj = products.find((item) => item.author == e.target.title);

      if (!productObj) {
        alert("You are not an admin");
        return;
      }

      fetch(`http://localhost:5000/products/${prodId}`, {
        method: "PATCH",
        body: JSON.stringify({
          url: imgInp.value,
          title: titleInp.value,
          price: priceInp.value,
        }),
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });

      e.target.removeAttribute("id");
      e.target.removeAttribute("title");

      imgInp.value = "";
      titleInp.value = "";
      priceInp.value = "";

      let btnCloseChanges = document.querySelector(".btn-close-product");
      btnCloseChanges.click();

      readProd();
    });
}

//! Task 5.
//! Продолжаем предыдущий проект, у каждого продукта должна быть кнопка УДАЛИТЬ, при нажатии кнопку, продукт должен быть удален, также необходимо вызвать рендер для отображения изменений

function deleteProduct(e) {
  console.log(e.target.id);
  if (!e.target.id) return;
  let prodId = e.target.id;

  let fetch3 = fetch(`http://localhost:5000/products/${prodId}`, {
    method: "DELETE",
  });

  readProd();
}

function addDeleteEvent() {
  let delBtns = document.querySelectorAll(".delete-prod-btn");
  delBtns.forEach((item) => item.addEventListener("click", deleteProduct));
}