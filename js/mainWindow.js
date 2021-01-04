const electron = require('electron');
const { ipcRenderer } = require('electron');
const path = require('path');
const url = require('url');
const Store = require('electron-store');
const store = new Store();
const {BrowserWindow, Notification} = electron.remote;

const contactInfo = document.querySelector('.contact-info');
const contactForm  = document.querySelector('.contact-form');
const contactSubmitButton = document.querySelector('.add-contact');
const name = document.querySelector('#name');
const email = document.querySelector('#email');
const  phone = document.querySelector('#phone');
const group = document.querySelector("#group");
const hiddenId = document.querySelector('#hidden-id');
const cancelButton = document.querySelector('.cancel-contact');

let contactWindow ;


const sendNotification = (title, message) => {
       const notification = {
              title:title,
              body:message,
              icon:path.join(__dirname, '../windows/logos/icon.png'),
              hasReply:true,
       }
       const notificaitonObject = new Notification(notification);
       notificaitonObject.show();
}


const randomId = () => {
         return Math.floor(Math.random() * 10000);
}

const createContactWindow = () => {
         contactWindow =  new BrowserWindow({
             width:350,
             height:500,
             show:false,
            icon:path.join(__dirname, '../windows/logos/icon.png'),
            webPreferences:{
                nodeIntegration:true,
                enableRemoteModule:true,
            }   
        })
        contactWindow.loadURL(url.format({
            pathname:path.join(__dirname, '../windows/contact.html'),
            protocol:"file:",
            slashes:true,
      }))
      // when ready to show
      contactWindow.once('ready-to-show', () => {
             contactWindow.show();
      })
      // garbage collection
      contactWindow.on('close', () => {
             contactWindow = null;
      })
      
      contactWindow.setPosition(900,150)
}

const addContactToDom = (name,id) => {
    const link  = document.createElement('a');
    const para = document.createElement('p');
    para.classList ='name-para';
    para.setAttribute('id', id);
    para.appendChild(document.createTextNode(name))
    link.classList = 'card px-1 mt-2 contact';
    link.appendChild(para)
    contactInfo.appendChild(link);
}

const handleContactWindow = (e) => {
    e.preventDefault();
    if(e.target.classList.contains('name-para')){
        createContactWindow();
        const id = +e.target.getAttribute('id');
        const contacts = store.get('contacts');
        const contact = contacts.find(item => item.id === id);
        contactWindow.webContents.on('did-finish-load', () => {
                   contactWindow.webContents.send('store:contact', contact);
         })
      
    } 

    setTimeout(() => contactWindow.close(), 5000);
}

const handleContactDom = (e) => {
    e.preventDefault();
    const id = randomId();
    if(!name.value || !email.value || !phone.value || !group.value) {
       alert('Please fill in all fields');
    }  else {
     if(contactSubmitButton.textContent === 'Add Contact'){
            addContact(name.value, id)
     }else {
            editContact()
     }
       name.value = '';
       email.value = '';
       phone.value = '';
       group.value = '';
        
    }
}
const cancelEdition = () => {
    name.value = '';
    email.value = '';
    phone.value = '';
    group.value = '';
    hiddenId.value ='';
    cancelButton.style.display = 'none';
    contactSubmitButton.classList = 'btn btn-primary btn-block my-3 add-contact'
    contactSubmitButton.textContent = 'Add Contact';
}
const addContact = (name, id) => {
    addContactToDom(name, id);
    sendNotification('Contact Addition', `Contact ${name} was added successfully`);
    ipcRenderer.send('store:contact', 
    {id, name:name, email:email.value, phone:phone.value, group:group.value});
}

const editContact = () => {
    ipcRenderer.send('store:contact-edit', 
    {id:hiddenId.value, name:name.value, email:email.value, phone:phone.value, group:group.value});
    hiddenId.value ='';
    contactSubmitButton.classList = 'btn btn-primary btn-block my-3 add-contact'
    cancelButton.style.display = 'none';
    contactSubmitButton.textContent = 'Add Contact';
    sendNotification('Contact Edition', `Contact ${name.value} was edited successfully`);
}
// add event listeners
contactInfo.addEventListener('click', handleContactWindow);
contactForm.addEventListener('submit',handleContactDom);
cancelButton.addEventListener('click', cancelEdition);

// catch user name

ipcRenderer.on('user:name', (e, user) => {
    const userName = user ? user : 'Unknow User'
    document.querySelector('.user-link').innerHTML = userName;
})

//catch stored contacts
ipcRenderer.on('stored:contacts', (e, contacts) => {
       contacts.forEach(contact => addContactToDom(contact.name, contact.id));
})

ipcRenderer.on('close:window', (e,id) => {
         contactWindow.close();
         const contactDom = document.getElementById(`${id}`);
         contactDom.parentElement.remove();
         sendNotification('Contact deletion', `Contact  ${contactDom.textContent} was successfully deleted`);
})
ipcRenderer.on('edit:contact' , (e, contact) =>{
      name.value = contact.name;
      email.value = contact.email;
      phone.value = contact.phone;
      group.value = contact.group;
      hiddenId.value = contact.id;
      contactSubmitButton.classList = 'btn btn-info btn-block my-3 add-contact'
      cancelButton.style.display = 'block';
      contactSubmitButton.textContent = 'Update Contact';

} );
ipcRenderer.on('edit-dom-contact', (e, contact) => {
    document.getElementById(`${contact.id}`).textContent = contact.name;
         
})

