@echo off
set "target_dir=C:\Users\huangqc\AppData\Local\Google\AndroidStudio2024.1\device-explorer\Xiaomi 2206122SC\_\data\data\com.jg.hxmjl\files"
set "ignore_dirs=.idea .git"
set "extensions=*.bin *.mp4 *.png *.astc *.atlas *.mp3"

echo Deleting files in %target_dir% with extensions: %extensions%

:: 删除指定后缀的文件，忽略 .idea 和 .git 目录
for /R "%target_dir%" %%G in (%extensions%) do (
    if /i not "%%~dpG"=="%target_dir%\.idea\" if /i not "%%~dpG"=="%target_dir%\.git\" (
        echo Deleting file %%G
        del "%%G"
    )
)

:: 删除空目录，忽略 .idea 和 .git 目录
for /f "delims=" %%D in ('dir /ad /s /b "%target_dir%" ^| sort /r') do (
    if /i not "%%~nxD"==".idea" if /i not "%%~nxD"==".git" (
        echo Checking if empty and removing directory %%D
        rmdir "%%D" 2>nul
    )
)

echo Done!
pause
