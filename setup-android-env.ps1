# Android Development Environment Setup Script
# This script sets up environment variables for Android and Java development

Write-Host "Setting up Android Development Environment Variables..." -ForegroundColor Green

# Define paths
$JAVA_HOME = "C:\Program Files\Java\jdk-25"
$ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# Set environment variables for current session
Write-Host "`nSetting environment variables for current session..." -ForegroundColor Yellow
$env:JAVA_HOME = $JAVA_HOME
$env:ANDROID_HOME = $ANDROID_HOME

# Add to PATH for current session
$env:Path = "$JAVA_HOME\bin;$ANDROID_HOME\platform-tools;$ANDROID_HOME\tools;$ANDROID_HOME\tools\bin;$ANDROID_HOME\cmdline-tools\latest\bin;$env:Path"

Write-Host "Current session variables set" -ForegroundColor Green

# Set system environment variables permanently (requires admin)
Write-Host "`nSetting system environment variables permanently..." -ForegroundColor Yellow
Write-Host "This requires administrator privileges." -ForegroundColor Cyan

try {
    # Set JAVA_HOME
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $JAVA_HOME, [System.EnvironmentVariableTarget]::User)
    Write-Host "JAVA_HOME set to: $JAVA_HOME" -ForegroundColor Green
    
    # Set ANDROID_HOME
    [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $ANDROID_HOME, [System.EnvironmentVariableTarget]::User)
    Write-Host "ANDROID_HOME set to: $ANDROID_HOME" -ForegroundColor Green
    
    # Get current user PATH
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
    
    # Add Java and Android to PATH if not already present
    $pathsToAdd = @(
        "$JAVA_HOME\bin",
        "$ANDROID_HOME\platform-tools",
        "$ANDROID_HOME\tools",
        "$ANDROID_HOME\tools\bin",
        "$ANDROID_HOME\cmdline-tools\latest\bin"
    )
    
    $newPath = $userPath
    foreach ($path in $pathsToAdd) {
        if ($newPath -notlike "*$path*") {
            $newPath = "$path;$newPath"
            Write-Host "Added to PATH: $path" -ForegroundColor Green
        }
    }
    
    # Set the new PATH
    [System.Environment]::SetEnvironmentVariable("Path", $newPath, [System.EnvironmentVariableTarget]::User)
    
    Write-Host "`nEnvironment variables set successfully!" -ForegroundColor Green
    Write-Host "`nIMPORTANT: You need to restart PowerShell or your terminal for the changes to take effect." -ForegroundColor Yellow
    
} catch {
    Write-Host "Error setting environment variables: $_" -ForegroundColor Red
    Write-Host "`nYou can set them manually:" -ForegroundColor Yellow
    Write-Host "1. Press Win + X and select 'System'" -ForegroundColor Cyan
    Write-Host "2. Click 'Advanced system settings'" -ForegroundColor Cyan
    Write-Host "3. Click 'Environment Variables'" -ForegroundColor Cyan
    Write-Host "4. Add these variables:" -ForegroundColor Cyan
    Write-Host "   JAVA_HOME = $JAVA_HOME" -ForegroundColor White
    Write-Host "   ANDROID_HOME = $ANDROID_HOME" -ForegroundColor White
}

# Verify installation
Write-Host "`n--- Verification ---" -ForegroundColor Cyan
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"

# Test Java
Write-Host "`nTesting Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = & "$env:JAVA_HOME\bin\java.exe" -version 2>&1
    Write-Host "Java is accessible" -ForegroundColor Green
    Write-Host $javaVersion
} catch {
    Write-Host "Java not accessible: $_" -ForegroundColor Red
}

Write-Host "`n--- Next Steps ---" -ForegroundColor Cyan
Write-Host "1. Close and reopen PowerShell/Terminal" -ForegroundColor White
Write-Host "2. Run: npx cap sync android" -ForegroundColor White
Write-Host "3. Run: npx cap build android" -ForegroundColor White
Write-Host "   OR" -ForegroundColor Yellow
Write-Host "4. Run: cd android && ./gradlew assembleDebug" -ForegroundColor White
