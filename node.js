class FileNode
{
    constructor(id, name, driveFile, children, type)
    {
        this.id = id;
        this.name = name;
        this.driveFile = driveFile;
        this.children = children;
        this.type = type;
    }
}

const NodeType = {
    CUSTOM: 'custom',
    DRIVE: 'drive',
    SHADOW: 'shadow'
};

// Home Tree Related Functions

function buildCustomNode(name) {
    return new FileNode(uuidv4(), name, null, {}, NodeType.CUSTOM);
}

function buildDriveNode(driveFile) {
    return new FileNode(driveFile.id, driveFile.name, driveFile, {}, NodeType.DRIVE);
}

function buildShadowNode(driveFile)
{
    return new FileNode(driveFile.id, driveFile.name, driveFile, {}, NodeType.SHADOW);
}

function addChildToNode(node, child) {
    node.children[getNodeId(child)] = child;
}

/**
 * TODO: fix this, this isn't really how it works in the web app.
 * @param node
 * @returns {string|*}
 */
function getNodeLink(node) {
    if (node.driveFile != null) {
        if (node.driveFile.mimeType === "application/vnd.google-apps.folder") {
            return "";
        } else {
            return node.driveFile.webViewLink;
        }
    } else {
        return "";
    }
}

function getIconLink(node) {
    if (node.driveFile !== null) {
        return node.driveFile.iconLink;
    } else {
        return "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder";
    }
}

function getFileType(node)
{
    if(node.driveFile !== null){
        return node.driveFile.mimeType;
    } else {
        return "custom";
    }
}

function getNodeType(node) {
    if(node.type !==undefined)
    {
        return node.type;
    }
    else
    {
        if (node.driveFile === null)
        {
            return NodeType.CUSTOM;
        }
        else
        {
            return NodeType.DRIVE;
        }
    }
}

function getNodeId(node)
{
    return node.id;
}

function getNodeAtPath(root, path) {
    let currentNode = root;
    for (let i = 1; i < path.length; i++)
    {
        if (getNodeType(currentNode) === NodeType.DRIVE)
        {
            return null;
        }
        currentNode = currentNode.children[path[i].id];
    }
    return currentNode;
}

function addChildToRoot(root, path, child)
{
    let currentNode = getNodeAtPath(root, path);
    let keys = Object.keys(currentNode.children);
    for (let i = 0; i < keys.length; i++)
    {
        if (currentNode.children[keys[i]].name === child.name)
        {
            return;
        }
    }
    addChildToNode(currentNode, child);
}

function getFilesAtPath(root, path)
{
    let files = [];
    let currentNode = getNodeAtPath(root, path);
    if (currentNode === undefined)
    {
        console.log('invalid node');
        return [];
    }
    if (currentNode !== null && currentNode.driveFile === null)
    {
        keys = Object.keys(currentNode.children);
        for (let i = 0; i < keys.length; i++)
        {
            files.push(currentNode.children[keys[i]]);
        }
    } else {
        loadingStarted("home");
        getFiles(path.slice(-1)[0].id, function (driveFiles){
            let files = [];
            for (let i = 0; i < driveFiles.length; i++)
            {
                files.push(buildShadowNode(driveFiles[i]));
            }
            loadingEnded("home");
            updateCurrentHomePath(files)
        });
    }
    return files;
}

function getFoldersAtPath(root, path) {
    files = [];
    currentNode = getNodeAtPath(root, path);
    keys = Object.keys(currentNode.children);
    for (let i = 0; i < keys.length; i++)
    {
        if (getFileType(currentNode.children[keys[i]]) === "custom")
        {
            files.push(currentNode.children[keys[i]]);
        }
    }
    return files;
}

function saveRootNode(root) {
    localStorage.setItem("root", JSON.stringify(root))
}