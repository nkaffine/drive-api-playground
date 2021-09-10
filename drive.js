// Client ID and API key from the Developer Console
var CLIENT_ID = 'id';
var API_KEY = 'key';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces
var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

function initDriveManager()
{
    driveManager = {
        currentPath: [{id:'root', name:'My Drive'}],
        currentFiles: null
    }
}

/**
 * Initializes the API client library and sets up sign-in state listeners
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        client_id: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
        driveItem.onclick = handleDriveClick;
    }, function(error) {
        console.log(JSON.stringify(error, null, 2));
    });
}

/**
 * Call when the signed in status changes, to update the UI appropriately.
 * After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        listFiles();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        document.getElementById('notSignedIn').style.display = 'contents';
        loadingEnded("drive");
    }
}

/**
 * Sign in the user upon button click
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 * Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

/**
 * Print files.
 */
function listFiles() {
    gapi.client.drive.files.list({
        'q': `'${driveManager.currentPath.slice(-1)[0]['id']}' in parents and trashed = false`,
        'fields': 'files(*)'
    }).then(function(response) {
        let files = response.result.files;
        showCurrentPath();
        driveManager.currentFiles = {};
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

function getFiles(folderId, completionFunction)
{
    gapi.client.drive.files.list({
        'q': `'${folderId}' in parents and trashed = false`,
        'fields': 'files(*)'
    }).then(function(response) {
        completionFunction(response.result.files);
    });
}
