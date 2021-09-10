

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');
var driveItem = document.getElementById('driveItem');
var newHomeItem = document.getElementById('newHome');
newHomeItem.onclick = function () {document.getElementById('newHomePopup').style.display = 'block'};
// var clearHomeItem = document.getElementById('clearHome');
// clearHomeItem.onclick = function() {
//   localStorage.clear();
//   location.reload();
// };

homeManager = null;
driveManager = null;


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function hidNewHomePopup()
{
    document.getElementById('newHomePopup').style.display = 'none';
}

function loadingStarted(purpose)
{
    let spinner = document.getElementById(`${purpose}Spinner`);
    spinner.style.display = 'block';
}

function loadingEnded(purpose)
{
    let spinner = document.getElementById(`${purpose}Spinner`);
    spinner.style.display = 'none';
}

/**
 * On load, called to load the auth2 library and API client library
 */
function handleClientLoad() {
    loadingStarted("drive");
    initHomeManager();
    initDriveManager();
    gapi.load('client:auth2', initClient)
}

/**
 * Handles switching to the drive view of the app.
 */
function handleDriveClick(event) {
    document.getElementById("drive").style.display = 'block';
    document.getElementById("home").style.display = "none";
    AnalyticsManager.clickedDrive();
}

/**
 * Handles switching to the home view of the app.
 */
function handleHomeClick() {
    document.getElementById("drive").style.display = 'none';
    document.getElementById("home").style.display = 'block';
    AnalyticsManager.clickedHome();
    displayCurrentHomePath(homeManager);
}

function handleAddToHome(fileId) {
    getHome(homeManager).fileBeingAdded = driveManager.currentFiles[fileId];
    addToHome = document.getElementById("addToHome");
    addToHome.style.display = 'block';
    getHome(homeManager).currentPath = getHome(homeManager).currentPath.slice(0,1);
    displayCurrentAddToHomePath(homeManager);
}

function driveFolderClicked(file)
{
    driveManager.currentPath.push({id:file.id, name:file.name});
    AnalyticsManager.clickedDriveFolder();
    listFiles();
}

function createTableRow(file) {
    html = document.createElement('TR');
    if (file.mimeType === 'application/vnd.google-apps.folder') {
        let td = document.createElement('td');
        td.innerHTML = `<img src="${file.iconLink}">`;
        let onclickFunc = function () {driveFolderClicked(file);};
        td.onclick = onclickFunc;
        td.className += 'file';
        html.appendChild(td);
        let filename = document.createElement('td');
        filename.innerText = file.name;
        filename.onclick = onclickFunc;
        filename.className += 'file';
        html.appendChild(filename);
        let button = document.createElement('td');
        button.innerHTML = `<button onclick="handleAddToHome('${file.id}')">Add to Home</button>`;
        html.appendChild(button);
        let fileBrowser =document.getElementById('fileBrowser');
        let tableBody = fileBrowser.tBodies[0];
        tableBody.appendChild(html);
    } else {
        let td = document.createElement('td');
        td.innerHTML = `<img src="${file.iconLink}">`;
        td.onclick = function () {window.open(file.webViewLink);};
        td.className += 'file';
        html.appendChild(td);
        let filename = document.createElement('td');
        filename.innerHTML = `<a onclick="AnalyticsManager.clickedDriveFile()" href='${file.webViewLink}' target="_blank">${file.name}</a>`;
        html.appendChild(filename);
        let button = document.createElement('td');
        button.innerHTML = `<button onclick="handleAddToHome('${file.id}')">Add to Home</button>`;
        html.appendChild(button);
        let fileBrowser =document.getElementById('fileBrowser');
        let tableBody = fileBrowser.tBodies[0];
        tableBody.appendChild(html);
    }
}

function navigateToNode(id) {
    for(let i = 0; i < driveManager.currentPath.length; i++) {
        if (driveManager.currentPath[i]["id"] === id)
        {
            driveManager.currentPath = driveManager.currentPath.slice(0,i + 1);
        }
    }
    listFiles();
}


/**
 * Shows the current path
 */
function showCurrentPath() {
    currentPathLabel = document.getElementById('driveCurrentPath');
    currentPathLabel.innerText = "";
    for (let i = 0; i < driveManager.currentPath.length; i++) {
        item = driveManager.currentPath[i];
        if (i === 0) {
            currentPathLabel.innerHTML = `<span class='filepath' onclick="navigateToNode('${item.id}')">${item['name']}</span>`;
        } else {
            currentPathLabel.innerHTML += ` > <span class='filepath' onclick="navigateToNode('${item.id}')">${item['name']}</span>`;
        }
    }
}

/**
 * Print files.
 */
function listFiles() {
    showCurrentPath();
    document.getElementById('fileBrowser').tBodies[0].innerHTML = "";
    loadingStarted("drive");
    gapi.client.drive.files.list({
        'q': `'${driveManager.currentPath.slice(-1)[0]['id']}' in parents and trashed = false`,
        'fields': 'files(*)'
    }).then(function(response) {
        let files = response.result.files;
        driveManager.currentFiles = {};
        loadingEnded("drive");
        document.getElementById('fileBrowser').tBodies[0].innerHTML = "";
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                driveManager.currentFiles[file.id] = file;
                createTableRow(file)
            }
        } else {
            console.log("No Files Found")
        }
    });
}