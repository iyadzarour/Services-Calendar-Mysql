# Script to kill process using port 11700
# Usage: .\kill-port.ps1

$port = 11700
Write-Host "Checking for processes using port $port..."

# Get all connections on the port
$connections = Get-NetTCPConnection -LocalPort $port -State Listen,Established -ErrorAction SilentlyContinue

if ($connections) {
    $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($processId in $processIds) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Killing process: $($process.ProcessName) (PID: $processId) - Path: $($process.Path)"
            try {
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Host "✓ Process killed successfully" -ForegroundColor Green
            } catch {
                Write-Host "✗ Failed to kill process: $_" -ForegroundColor Red
            }
        }
    }
    Write-Host "`nWaiting 2 seconds for port to be released..."
    Start-Sleep -Seconds 2
    
    # Verify port is free
    $remaining = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($remaining) {
        Write-Host "⚠ Warning: Port $port is still in use!" -ForegroundColor Yellow
        Write-Host "Trying alternative method..." -ForegroundColor Yellow
        # Try using netstat and taskkill
        $netstatOutput = netstat -ano | findstr ":$port"
        if ($netstatOutput) {
            $lines = $netstatOutput -split "`n"
            foreach ($line in $lines) {
                if ($line -match '\s+(\d+)$') {
                    $foundPid = $matches[1]
                    Write-Host "Killing process with PID: $foundPid" -ForegroundColor Yellow
                    taskkill /PID $foundPid /F 2>&1 | Out-Null
                }
            }
            Start-Sleep -Seconds 2
        }
    } else {
        Write-Host "✓ Port $port is now free" -ForegroundColor Green
    }
} else {
    Write-Host "✓ No process found using port $port" -ForegroundColor Green
}

