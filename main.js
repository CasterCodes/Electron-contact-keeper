const { create } = require('domain');
const electron = require('electron');
const path = require("path");
const url = require('url');


// process.env.NODE_ENV = 'production';

const Store  = require('electron-store');

const {app, BrowserWindow, ipcMain, Menu, Notification } = electron;

//windows defination

let mainWindow,userWindow;
const store = new Store();
const user = store.get('user');

let contacts;
contacts = store.get('contacts') ? store.get('contacts') : [];

//when app is ready
app.on('ready', () => {
    if(!user) {
        store.delete('contacts');
        createUserWindow();
    }else {
        createMainWindow();
    } 
    
}); 


// create user window
const createUserWindow = () => {
        userWindow =   new BrowserWindow({
            width:350,
            height:400,
            icon:path.join(__dirname, 'windows/logos/icon.png'),
            webPreferences:{
                nodeIntegration:true,
                enableRemoteModule:true,
               
            }
              
        })
    
        // load html file
         userWindow.loadURL(url.format({
               pathname:path.join(__dirname, 'windows/client.html'),
               protocol:"file:",
               slashes:true,
         }))


    
        // garbase collection
        userWindow.on('close', () => {
               userWindow == null;
        });

    // add application  menu
     const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
     Menu.setApplicationMenu(mainMenu);
}

// create main window
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        icon:path.join(__dirname, 'windows/logos/icon.png'),
        titleBarStyle: "hidden",
        webPreferences:{
            nodeIntegration:true,
            enableRemoteModule:true,
           
        }
          
    })

    // load html file
     mainWindow.loadURL(url.format({
           pathname:path.join(__dirname, 'windows/index.html'),
           protocol:"file:",
           slashes:true,
     }))


     // maximize the main window 
     mainWindow.maximize();

    // add application  menu
     const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
     Menu.setApplicationMenu(mainMenu);

     // quit the applicaiton when the main window closes
     mainWindow.on('close', () => app.quit());

     mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('user:name', user);
        mainWindow.webContents.send('stored:contacts', contacts);
        
     })
     //open the main window only when ready to show
     mainWindow.once('ready-to-show', () => {
        mainWindow.show()
     })
    
}

// main menu template
const mainMenuTemplate = [];

// add devTools when in production

if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
          label:'Development Tools',
          submenu: [
               {
                   label:'Dev Tools',
                   click:(e, focusedWindow)=> {
                         focusedWindow.toggleDevTools();
                   }
               },
               {
                   label:'Reload',
                   role:'Reload'
               }
          ]
    })
}
// catch events
ipcMain.on('user:identification', (e, user) => {
    setTimeout(() => createMainWindow(), 4000)
    store.set('user', user);
    userWindow.hide();
})

ipcMain.on('store:contact', (e, contact) => {
      contacts.push(contact);
      store.set('contacts', contacts); 
})

ipcMain.on('delete:contact', (e, id) => {
      contacts = contacts.filter(contact => contact.id != id);
      store.set('contacts', contacts);
      mainWindow.webContents.send('close:window', id);
})
ipcMain.on('edit:contact', (e, id) => {
    const contact = contacts.find(contact => contact.id === id);
    mainWindow.webContents.send('edit:contact', contact);
})

ipcMain.on('store:contact-edit', (e, contact) => {
       const storedContact = contacts.find(item => item.id === +contact.id);
       storedContact.name = contact.name;
       storedContact.email = contact.email;
       storedContact.phone = contact.phone;
       storedContact.group = contact.group;
       store.set('contacts', contacts);
       mainWindow.webContents.send('edit-dom-contact', contact);
})