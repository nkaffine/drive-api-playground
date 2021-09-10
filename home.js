const DRIVE_FOLDER = 'application/vnd.google-apps.folder';

// Home manager code
function initHomeManager()
{
    let homes = localStorage.getItem('homes');
    if (homes === null)
    {
        console.log("building new home manager");
        homes = {Home: buildCustomNode("Home")};
        saveHomes(homes);
    } else {
        homes = JSON.parse(homes);
    }
    let keys = Object.keys(homes);
    homeManager = {__homes: homes, currentHome: keys[0]};
    for (let i = 0; i < keys.length; i++)
    {
        let root = homes[keys[i]];
        homeManager[keys[i]] =
            {
                root: root,
                currentPath: [{id: root.id, name:root.name, type: 'custom'}],
                fileBeingAdded: null
            }
    }
    document.getElementById('createHomeFolder').onclick = function (){createHomeFolderInCurrentDirectory(homeManager);};
    document.getElementById('newHomeButton').onclick = function(){createHome(homeManager);};
    document.getElementById('addToCurrentHomeButton').onclick = function () {addToCurrentHome(homeManager);};
    updateHomeMenus(homeManager);
}

function updateHomeMenus(homeManager)
{
    let homes = document.getElementById('homes');
    homes.innerHTML = "";
    let keys = Object.keys(homeManager.__homes);
    for (let i = 0; i < keys.length; i++)
    {
        let newListItem = document.createElement('li');
        let link = document.createElement('a');
        const name = keys[i];
        link.innerText = name;
        link.onclick = function() {homeManager.currentHome = name; handleHomeClick();};
        newListItem.appendChild(link);
        document.getElementById('homes').appendChild(newListItem);
    }
}

function getHome(homeManager)
{
    return homeManager[homeManager.currentHome];
}

// Home Creating Related Functions
function createHome(homeManager)
{
    let homeName = document.getElementById('newHomeName').value;
    document.getElementById('newHomeName').value = '';
    if (homeName !== '')
    {
        if (!(homeName in homeManager.__homes))
        {
            let root = buildCustomNode(homeName);
            homeManager.__homes[homeName] = root;
            homeManager.currentHome = homeName;
            homeManager[homeName] =
                {
                    root: root,
                    currentPath: [{id: root.id, name: root.name, type: 'custom'}],
                    fileBeingAdded: null
                };
            saveHomes(homeManager.__homes);
            AnalyticsManager.createdHome();
        }
    }
    hidNewHomePopup();
    updateHomeMenus(homeManager);
    displayCurrentHomePath(homeManager);
}

// Browsing Home Related Functions

function navigateToSubFolder(homeManager, file)
{
    getHome(homeManager).currentPath.push({id:getNodeId(file), name:file.name, type:getNodeType(file)});
    AnalyticsManager.clickedHomeFolder(file);
    displayCurrentHomePath(homeManager);
}

function navigateToSuperFolder(homeManager, folderId)
{
    for(let i = 0; i < getHome(homeManager).currentPath.length; i++) {
        if (getHome(homeManager).currentPath[i].id === folderId)
        {
            getHome(homeManager).currentPath = getHome(homeManager).currentPath.slice(0,i + 1);
        }
    }
    displayCurrentHomePath(homeManager);
}

function renameFile(homeManager, file, name)
{
    let currentDirectory = getNodeAtPath(getHome(homeManager).root, getHome(homeManager).currentPath);
    if(currentDirectory === null || currentDirectory === undefined || name === '')
    {
        return;
    }
    let keys = Object.keys(currentDirectory.children);
    if (keys.length === 0)
    {
        return;
    }
    for (let i = 0; i < keys.length; i++)
    {
        if (currentDirectory.children[keys[i]].name === name)
        {
            return;
        }
    }
    let child = currentDirectory.children[file.id];
    child.name = name;
    saveHomes(homeManager.__homes);
    AnalyticsManager.aliasedItem(file);
    displayCurrentHomePath(homeManager);
}

function createHomeFileRow(homeManager, file)
{
    let html = document.createElement('TR');
    let rowOnClick = function(){navigateToSubFolder(homeManager, file);};
    let td1 = document.createElement('td');
    td1.className += 'file';
    td1.innerHTML = `<img src="${getIconLink(file)}">`;
    td1.onclick = rowOnClick;
    let td2 = document.createElement('td');
    td2.className += 'file';
    if (getFileType(file) === 'custom' || getFileType(file) === DRIVE_FOLDER)
    {

        td2.innerHTML = `<a>${file.name}</a>`;
        td2.onclick = rowOnClick;
    }
    else
    {
        td2.innerHTML = `<a href="${getNodeLink(file)}" target="_blank">${file.name}</a>`;
        td2.onclick = AnalyticsManager.clickedDriveFileInHome;
    }
    let td3 = document.createElement('td');
    let td4 = document.createElement('td');
    if(getNodeType(file) !== NodeType.SHADOW)
    {
        let input = document.createElement('input');
        input.type = 'text';
        td3.appendChild(input);

        let button =  document.createElement('button');
        button.innerText = file.driveFile !== null ? 'Alias' : 'Rename';
        button.onclick = function() {renameFile(homeManager, file, input.value); input.value = ''};
        td4.appendChild(button);
    }

    let td5 = document.createElement('td');
    td5.className += 'driveFileName';
    if (file.driveFile !== null && file.driveFile.name !== file.name)
    {
        td5.innerText = file.driveFile.name;
    }
    html.appendChild(td1);
    html.appendChild(td2);
    html.appendChild(td3);
    html.appendChild(td4);
    html.appendChild(td5);
    return html;
}

function displayCurrentHomePath(homeManager)
{
    document.getElementById('homeName').innerText = getHome(homeManager).root.name;
    tableBody = document.getElementById("homeBrowser").tBodies[0];
    tableBody.innerHTML = "";
    files = getFilesAtPath(getHome(homeManager).root, getHome(homeManager).currentPath);
    for (let i = 0; i < files.length; i++)
    {
        file = files[i];
        tableBody.appendChild(createHomeFileRow(homeManager, file));
    }
    homePath = document.getElementById('homePath');
    homePath.innerHTML = "";
    for(let i = 0; i < getHome(homeManager).currentPath.length; i++) {
        span = document.createElement('span');
        if (i === 0)
        {
            span.innerText = getHome(homeManager).currentPath[i].name;
        } else {
            span.innerText = ` > ${getHome(homeManager).currentPath[i].name}`;
        }
        const id = getHome(homeManager).currentPath[i].id;
        span.onclick = function(){navigateToSuperFolder(homeManager, id);};
        span.className += "filepath";
        homePath.appendChild(span);
    }
}

function createHomeFolderInCurrentDirectory(homeManager)
{
    let folderName = document.getElementById('homeFolderName').value;
    document.getElementById('homeFolderName').value = '';
    if (folderName !== '')
    {
        addChildToRoot(getHome(homeManager).root, getHome(homeManager).currentPath, buildCustomNode(folderName));
        saveHomes(homeManager.__homes);
        AnalyticsManager.createdCustomFolder();
    }
    displayCurrentHomePath(homeManager);
}

function updateCurrentHomePath(files)
{
    tableBody = document.getElementById("homeBrowser").tBodies[0];
    tableBody.innerHTML = "";
    for (let i = 0; i < files.length; i++)
    {
        file = files[i];
        tableBody.appendChild(createHomeFileRow(homeManager, file));
    }
}

// Adding to Home Related Functions

function hideAddToHome()
{
    document.getElementById('addToHome').style.display = 'none';
}

function addToCurrentHome(homeManager)
{
    let driveFile = getHome(homeManager).fileBeingAdded;
    let node = buildDriveNode(driveFile);
    addChildToRoot(getHome(homeManager).root, getHome(homeManager).currentPath, node);
    getHome(homeManager).currentPath = getHome(homeManager).currentPath.slice(0,1);
    getHome(homeManager).fileBeingAdded = null;
    saveHomes(homeManager.__homes);
    AnalyticsManager.addedToHome(driveFile);
    hideAddToHome();
}

function addFileToFolder(homeManager, folder)
{
    let driveFile = getHome(homeManager).fileBeingAdded;
    let node = buildDriveNode(driveFile);
    getHome(homeManager).currentPath.push({id: getNodeId(folder), name:folder.name, type: getNodeType(folder)});
    addChildToRoot(getHome(homeManager).root, getHome(homeManager).currentPath, node);
    getHome(homeManager).currentPath = getHome(homeManager).currentPath.slice(0,1);
    getHome(homeManager).fileBeingAdded = null;
    saveHomes(homeManager.__homes);
    AnalyticsManager.addedToHome(driveFile);
    hideAddToHome();
}

function navigateToAddToHomeSuperFolder(homeManager, folderId)
{
    for(let i = 0; i < getHome(homeManager).currentPath.length; i++) {
        if (getHome(homeManager).currentPath[i].id === folderId)
        {
            getHome(homeManager).currentPath = getHome(homeManager).currentPath.slice(0,i + 1);
        }
    }
    displayCurrentAddToHomePath(homeManager);
}

function navigateToAddToHomeSubFolder(homeManager, folder)
{
    getHome(homeManager).currentPath.push({id: getNodeId(folder), name: folder.name, type: getNodeType(folder)});
    displayCurrentAddToHomePath(homeManager);
}

function createAddToHomeFolderRow(homeManager, folder)
{
    let html = document.createElement('TR');
    let td1 = document.createElement('TD');
    let td2 = document.createElement('TD');
    let td3 = document.createElement('TD');
    td1.innerHTML = `<img src="${getIconLink(folder)}">`;
    td1.onclick = function () {navigateToAddToHomeSubFolder(homeManager, folder);};
    td1.className += 'file';
    td2.innerText = folder.name;
    td2.onclick = td1.onclick;
    td2.className += 'file';
    let button = document.createElement('button');
    button.innerText = "Add to Folder";
    button.onclick = function () {addFileToFolder(homeManager, folder)};
    td3.appendChild(button);
    html.appendChild(td1);
    html.appendChild(td2);
    html.appendChild(td3);
    return html;
}

function displayCurrentAddToHomePath(homeManager)
{
    let addToHome = document.getElementById('addToHome');
    let table = addToHome.getElementsByTagName('table')[0];
    let tableBody = table.tBodies[0];
    tableBody.innerHTML = "";
    let files = getFoldersAtPath(getHome(homeManager).root, getHome(homeManager).currentPath);
    for (let i = 0; i < files.length; i++)
    {
        let file = files[i];
        tableBody.appendChild(createAddToHomeFolderRow(homeManager, file));
    }
    let homePath = document.getElementById('addToHomePath');
    homePath.innerHTML = "";
    for(let i = 0; i < getHome(homeManager).currentPath.length; i++) {
        span = document.createElement('span');
        if (i === 0)
        {
            span.innerText = getHome(homeManager).currentPath[i].name;
        } else {
            span.innerText = ` > ${getHome(homeManager).currentPath[i].name}`;
        }
        const id = getHome(homeManager).currentPath[i].id;
        span.onclick = function(){navigateToAddToHomeSuperFolder(homeManager, id);};
        homePath.appendChild(span);
    }
}

function saveHomes(homes) {
    localStorage.setItem("homes", JSON.stringify(homes));
}