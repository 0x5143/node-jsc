@echo off
setlocal enabledelayedexpansion

set "target_dir=C:\Users\huangqc\AppData\Local\Google\AndroidStudio2024.1\device-explorer\Xiaomi 2206122SC\_\data\data\com.jg.hxmjl\files"
set "ignore_dirs=.idea .git"
set "extensions=bin mp4 png astc atlas mp3 ttf manifest pem plist"

echo Deleting files in %target_dir% with extensions: %extensions%

:: 删除指定后缀的文件，忽略 .idea 和 .git 目录及其子目录
rem 遍历目标目录下的所有文件
for /R "%target_dir%" %%G in (*) do (
    set "skip=false"
    rem 获取文件所在目录路径，去掉末尾的反斜杠
    set "file_dir=%%~dpG"
    set "file_dir=!file_dir:~0,-1!"

    rem 检查是否在忽略的一级子目录中
    for %%I in (%ignore_dirs%) do (
        rem 标准化要忽略的目录路径
        set "ignore_dir=%target_dir%\%%I"
        set "ignore_dir=!ignore_dir:~0,-1!"

        rem 检查当前文件是否在忽略的目录中
        if /i "!file_dir!"=="!ignore_dir!" (
            set "skip=true"
        )
    )
    
    rem 如果不在忽略的目录中，检查文件扩展名
    if "!skip!"=="false" (
        rem 获取文件扩展名并去掉前面的点
        set "file_ext=%%~xG"
        set "file_ext=!file_ext:~1!"  rem 移除扩展名前的点

        rem 检查文件扩展名是否在指定的扩展名列表中
        for %%E in (%extensions%) do (
            if /i "!file_ext!"=="%%E" (
                echo Deleting file %%G
                del /q "%%G"
            )
        )
    )
)

rem 删除空目录，忽略指定的目录
for /f "delims=" %%D in ('dir /ad /s /b "%target_dir%" ^| sort /r') do (
    set "skip=false"
    rem 获取目录路径，去掉末尾的反斜杠
    set "dir_path=%%~dpD"
    set "dir_path=!dir_path:~0,-1!"

    rem 检查是否在忽略的目录中
    for %%I in (%ignore_dirs%) do (
        rem 标准化要忽略的目录路径
        set "ignore_dir=%target_dir%\%%I"
        set "ignore_dir=!ignore_dir:~0,-1!"

        if /i "!dir_path!"=="!ignore_dir!" (
            set "skip=true"
        )
    )
    
    rem 如果不在忽略的目录中，则删除空目录
    if "!skip!"=="false" (
        echo Checking if empty and removing directory %%D
        rmdir /q /s "%%D" 2>nul
    )
)

endlocal

echo Done!
pause
