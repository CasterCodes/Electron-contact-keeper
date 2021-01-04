const electron = require('electron');


const {ipcRenderer} = electron;


const userForm = document.querySelector(".form");


const handleFormSubmit = e => {
    e.preventDefault();
       const user = document.querySelector(".user-name").value;
      ipcRenderer.send('user:identification', user);
}
// add event listener

userForm.addEventListener('submit', handleFormSubmit)