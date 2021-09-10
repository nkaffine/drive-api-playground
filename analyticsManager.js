// Setting up analytics
if (location.hostname === 'localhost')
{
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics_debug.js','ga');

    ga('create', 'UA-78172213-4', 'auto');
    ga('set', 'sendHitTask', null);
}
else
{
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    if (location.hostname === 'testdrive.kaffine.tech')
    {
        ga('create', 'UA-78172213-4', 'auto');
    }
    else
    {
        ga('create', 'UA-78172213-5', 'auto');
    }
}

//TODO: add something for testing server analytics. Maybe have a different tag actually
class AnalyticsManager
{
    static sendEvent(category, action, label)
    {
        ga('send', 'event', category, action, label);
    }
    // Drive Related Analytics
    static clickedDriveFile()
    {
        this.sendEvent('Drive', 'clicked', 'file');
    }

    static clickedDriveFolder()
    {
        this.sendEvent('Drive', 'clicked', 'folder');
    }

    static clickedDrive()
    {
        this.sendEvent('Drive', 'clicked', 'menu');
    }

    // Home Related Analytics
    static createdHome()
    {
        this.sendEvent('Home', 'created', 'home');
    }

    static clickedHome()
    {
        this.sendEvent('Home', 'clicked', 'menu');
    }

    static clickedCustomFolder()
    {
        this.sendEvent('Home', 'clicked', 'customFolder');
    }

    static clickedDriveFolderInHome()
    {
        this.sendEvent('Home', 'clicked', 'driveFolder');
    }

    static clickedDriveFileInHome()
    {
        this.sendEvent('Home', 'clicked', 'driveFile');
    }

    static createdCustomFolder()
    {
        this.sendEvent('Home','created','customFolder');
    }

    static addedFolderToHome()
    {
        this.sendEvent('Drive', 'addedToHome', 'folder');
    }

    static addedFileToHome()
    {
        this.sendEvent('Drive', 'addedToHome', 'file');
    }

    static clickedHomeFolder(file)
    {
        if (file.driveFile === null)
        {
            this.clickedCustomFolder();
        }
        else
        {
            this.clickedDriveFolderInHome();
        }
    }

    static addedToHome(file)
    {
        if(file.mimeType === 'application/vnd.google-apps.folder')
        {
            this.addedFolderToHome();
        }
        else
        {
            this.addedFileToHome();
        }
    }
    static aliasedFile()
    {
        this.sendEvent('Home', 'aliased', 'file');
    }

    static aliasedDriveFolder()
    {
        this.sendEvent('Home', 'aliased', 'driveFolder');
    }

    static aliasedItem(file)
    {
        if (file.driveFile !== null)
        {
            if (file.driveFile.mimeType === DRIVE_FOLDER)
            {
                this.aliasedDriveFolder();
            }
            else
            {
                this.aliasedFile();
            }
        }
    }
}