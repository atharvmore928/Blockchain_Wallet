const { execSync } = require('child_process');

const port = process.argv[2] || 3000;

if (process.platform !== 'win32') {
    process.exit(0);
}

try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();

    output.split('\n').forEach((line) => {
        const match = line.trim().match(/LISTENING\s+(\d+)/);
        if (match) {
            pids.add(match[1]);
        }
    });

    pids.forEach((pid) => {
        try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            console.log(`Freed port ${port} (stopped PID ${pid})`);
        } catch (error) {

        }
    });
} catch (error) {

}
