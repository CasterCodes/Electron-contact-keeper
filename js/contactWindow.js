const electron = require('electron');
const { ipcRenderer } = require('electron');


let deleteButton;

ipcRenderer.on('store:contact', (e, contact) => {
        document.querySelector('.list-group').innerHTML = `
        <li class="list-group-item"><strong>Name : </strong>${contact.name}</li>
                    <li class="list-group-item"><strong>Email : </strong>${contact.email}</li>
                    <li class="list-group-item"><strong>Phone : </strong>${contact.phone}</li>
                    <li class="list-group-item"><strong>Group : </strong>${contact.group}</li>
                    <li class="list-group-item">
                          <div class="row">
                                <div class="col-6">
                                    <button class="btn btn-primary btn-block edit" data-id=${contact.id}>Edit</button>
                                </div>
                                <div class="col-6">
                                    <button class="btn btn-danger btn-block delete" data-id=${contact.id}>Delete</button>
                                </div>
                          </div>
                    </li>
        
        `;

        deleteButton = document.querySelector('.delete');
        editButton = document.querySelector('.edit');
        editButton.addEventListener('click', handleEdit);
        deleteButton.addEventListener('click', handleDelete);
  
})

const handleDelete = (e) => {
    const id = +e.target.getAttribute('data-id');
    ipcRenderer.send('delete:contact', id)
}
const handleEdit = (e) => {
    const id = +e.target.getAttribute('data-id');
    ipcRenderer.send('edit:contact', id);
}


