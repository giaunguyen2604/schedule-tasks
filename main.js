require('dotenv').config();

const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const puppeteer = require('puppeteer');
const schedule = require('node-schedule');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html'); // Load your HTML file

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Schedule task to open the form daily at 5:20 PM
function scheduleDailyForm() {
  schedule.scheduleJob('25 17 * * *', () => {
    if (!mainWindow) {
      createWindow(); // Create the window if it's not already open
    } else {
      mainWindow.show(); // Show the window if it's hidden
    }
  });
}

// Handle task submission and automation
ipcMain.on('submit-task', async (event, {taskValue, hourValue, projectValue}) => {
  console.log(`Received task: ${taskValue, hourValue, projectValue}`);

  // Launch Puppeteer for automation
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();

  // Set the browser window to full screen width and height
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;
  await page.setViewport({ width, height });

  try {
    // Go to the main site
    await page.goto('https://offwork.executionlab.asia/signin', { waitUntil: 'networkidle2' });

    // Perform login
    await page.waitForSelector('#basic_email');
    await page.type('#basic_email', process.env.EMAIL); // Adjust selector
    await page.waitForSelector('#basic_password');
    await page.type('#basic_password', process.env.PASSWORD); // Adjust selector
    await page.keyboard.press('Enter'); 
    await page.waitForNavigation();

    // Navigate to the form page
    await page.goto('https://offwork.executionlab.asia/heatmap', { waitUntil: 'networkidle2' });

    // Fill the input field with the textarea value
    await page.waitForSelector('#activity');
    await page.type('#activity', taskValue); 
    await page.waitForSelector('#hour');
    await page.type('#hour', hourValue); 
    await page.waitForSelector('#project');
    await page.type('#project', projectValue);
    await page.keyboard.press('Enter')
  } catch (error) {
    console.error('An error occurred:', error);
  }
});

app.on('ready', () => {
  createWindow();
  scheduleDailyForm(); // Schedule the form to show daily
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
