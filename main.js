const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 850,
        minWidth: 1024,
        minHeight: 700,
        title: "Mid Day Meal Scheme - Double-Entry Register",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableWebSQL: false
        },
        backgroundColor: '#f8fafc',
        show: false
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handler: Save register data to user-chosen JSON file
ipcMain.handle('save-file-dialog', async (event, dataString) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Register Data',
        defaultPath: 'MDM-Register-Backup.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (canceled || !filePath) return { success: false };

    try {
        fs.writeFileSync(filePath, dataString, 'utf-8');
        return { success: true, filePath };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// IPC handler: Load register data from JSON file
ipcMain.handle('open-file-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Open Saved Register Data',
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (canceled || filePaths.length === 0) return { success: false };

    try {
        const content = fs.readFileSync(filePaths[0], 'utf-8');
        return { success: true, content, filePath: filePaths[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// IPC handler: Print or export to PDF
ipcMain.handle('print-to-pdf', async (event) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Register as PDF',
        defaultPath: 'MDM-Register-August-2025.pdf',
        filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
    });

    if (canceled || !filePath) return { success: false };

    try {
        const pdfData = await mainWindow.webContents.printToPDF({
            landscape: true,
            pageSize: 'A4',
            printBackground: true,
            margins: { marginType: 'custom', top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 }
        });
        fs.writeFileSync(filePath, pdfData);
        return { success: true, filePath };
    } catch (err) {
        return { success: false, error: err.message };
    }
});
