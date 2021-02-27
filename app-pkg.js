const path = require('path');
const { spawn } = require('child_process');

// For testing
// spawn(process.execPath, [path.join(__dirname, 'app.js')], { stdio: 'inherit' });

// Start node application and detach spawned child process (no terminal remains open)
const options = { detached: false, stdio: 'ignore' };
const child = spawn(process.execPath, [path.join(__dirname, 'app.js')], options);
child.unref();
