@echo off
set "target_dir=C:\Users\huangqc\AppData\Local\Google\AndroidStudio2024.1\device-explorer\Xiaomi 2206122SC\_\data\data\com.jg.hxmjl\files"
set "ignore_dirs=.idea .git"
set "extensions=*.bin *.mp4 *.png *.astc *.atlas *.mp3 *.ttf *.manifest *.pem"

echo Deleting files in %target_dir% with extensions: %extensions%

:: 删除指定后缀的文件，忽略 .idea 和 .git 目录及其子目录
for /R "%target_dir%" %%G in (%extensions%) do (
    setlocal enabledelayedexpansion
    set "skip=false"
    for %%I in (%ignore_dirs%) do (
        if /i "%%~dpG"=="%target_dir%\%%I\" (
            set "skip=true"
        )
        if /i "%%~dpG"=="%target_dir%\%%I\" (
            set "skip=true"
        )
        if /i "%%~dpG"=="%target_dir%\%%I\" (
            set "skip=true"
        )
    )
    if "!skip!"=="false" (
        echo Deleting file %%G
        del "%%G"
    )
    endlocal
)

:: 删除空目录，忽略 .idea 和 .git 目录及其子目录
for /f "delims=" %%D in ('dir /ad /s /b "%target_dir%" ^| sort /r') do (
    setlocal enabledelayedexpansion
    set "skip=false"
    for %%I in (%ignore_dirs%) do (
        if /i "%%~nxD"=="%%I" (
            set "skip=true"
        )
        if /i "%%~dpD"=="%target_dir%\%%I\" (
            set "skip=true"
        )
    )
    if "!skip!"=="false" (
        echo Checking if empty and removing directory %%D
        rmdir "%%D" 2>nul
    )
    endlocal
)

echo Done!
pause
