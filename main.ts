import { app, BrowserWindow, ipcMain, Point, screen } from 'electron';
import * as fs from 'fs';

class Explorer {

    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow: any;

    static isBeingDragged: boolean = false;
    static dragStartingPosition: {x: number, y: number} = {x: 0, y: 0};

    private static onWindowAllClosed() {
        Explorer.application.quit();
    }

    private static onClose() {
        Explorer.mainWindow = null;
    }

    private static onReady() {
        Explorer.mainWindow = new Explorer.BrowserWindow({
            width: 800, 
            height: 600,
            frame: true,
            webPreferences: {
                preload: __dirname + '/preload.js',
                worldSafeExecuteJavaScript: true,
                contextIsolation: true
            }
        });
        console.log(__dirname + '/index.html');
        Explorer.mainWindow.loadFile(__dirname + '/index.html');
        Explorer.mainWindow.on('closed', Explorer.onClose);
        Explorer.mainWindow.webContents.openDevTools();
    }

    static start(app: Electron.App, browserWindow: typeof BrowserWindow) {
        if (!app) {
            console.log('App is undefined.');
            return;
        }
        if (!browserWindow) {
            console.log('browserWindow is undefined.');
            return;
        }

        Explorer.BrowserWindow = browserWindow;
        Explorer.application = app;
        Explorer.application.on('window-all-closed', Explorer.onWindowAllClosed);
        Explorer.application.on('ready', Explorer.onReady);

        ipcMain.handle('list-files', async (event: any, args: any) => {
            return fs.readdirSync(args);
        });

        ipcMain.handle('window-minimize', async (event: any, args: any) => {
            return Explorer.mainWindow.minimize();
        });

        ipcMain.handle('window-maximize', async (event: any, args: any) => {
            return Explorer.mainWindow.isMaximized() ? Explorer.mainWindow.unmaximize() : Explorer.mainWindow.maximize();
        });

        ipcMain.handle('window-close', async (event: any, args: any) => {
            return Explorer.mainWindow.close();
        });

        ipcMain.handle('window-start-drag', async (event: any, args: any) => {
            Explorer.dragStartingPosition.x = args.x;
            Explorer.dragStartingPosition.y = args.y;
            Explorer.isBeingDragged = true;
        })

        ipcMain.handle('window-end-drag', async (event: any, args: any) => {
            Explorer.isBeingDragged = false;
        })

        setInterval(() => {
            if(Explorer.isBeingDragged && Explorer.mainWindow) {
                const mousePosition: Point = screen.getCursorScreenPoint();
                Explorer.mainWindow.setPosition(mousePosition.x - Explorer.dragStartingPosition.x, mousePosition.y - Explorer.dragStartingPosition.y);
            }
        }, 20);
    }
}

new Explorer.start(app, BrowserWindow);