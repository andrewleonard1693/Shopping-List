const electron = require('electron');
const url = require('url');
const path = require('path');

const {app,BrowserWindow,Menu,ipcMain} = electron;

//set environment
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen for the app to be ready.
app.on('ready',function(){
    //create new window
    mainWindow = new BrowserWindow({});

    //load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol:'file:',
        slashes: true

    }));
    //Quit app when closed
    mainWindow.on('closed',function(){
        app.quit()
    });
    
    //if we are on a mac then we add an empty object to the beginning of the main menu template
    //this takes care of the problem where only 'Electron' is showing in the menu
    if(process.platform == 'darwin'){ mainMenuTemplate.unshift({})};
    // //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    // //insert the menu
    Menu.setApplicationMenu(mainMenu)
})// end on ready

//handle create add window
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add shopping list item'
    });

    //load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol:'file:',
        slashes: true
    }));
    //garbage collection handle
    addWindow.on('close',function(){
        addWindow = null;
    });
}

//catch item:add
ipcMain.on('item:add',function(event, item){
    console.log(item);
    mainWindow.webContents.send('item:add',item);
    addWindow.close();
})
//create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+A' :
                'Ctrl+A',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Ctrl+Q',
                click(){
                    app.quit()
                }
            }
        ]
    }

];

//add developer tool items if not in production

if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
             label: 'Toggle DevTools',
             accelerator: process.platform == 'darwin' ? 'Command+I' :
                'Ctrl+I',
             click(item, focusedWindow){
                focusedWindow.toggleDevTools();
             }   
            },
            {
                role: 'reload'
            }
        ]
    });
}