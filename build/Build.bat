@echo off

:start

set CFDUC_PROJ_DIR=%~dp0
set CFDUC_NULLVAL=null

echo Building CloudflareDUC for Linux (x64), Windows (x64) and MacOS (x64)...
echo.
echo.

goto verify_prodmode






:verify_prodmode

cd %CFDUC_PROJ_DIR%
cd ..

call node src/isProdMode.js

IF %ERRORLEVEL% == 1 (
    echo Error: The production mode is turned off. Please turn it on in the file "src/intsettings.js"
    PAUSE
    EXIT
) ELSE (
    goto check_pkg
)






:check_pkg

cd %CFDUC_PROJ_DIR%
call pkg
cls

echo Building CloudflareDUC for Linux (x64), Windows (x64) and MacOS (x64)...
echo.
echo.

IF %ERRORLEVEL% == 1 (
    echo.
	echo "pkg" is not installed, installing...
    call npm i -g pkg
    goto build_exes
) ELSE (
    echo "pkg" is installed, proceeding...
	goto build_exes
)




:build_exes

cd %CFDUC_PROJ_DIR%

echo.
echo Building executables...
call pkg ../src/wrapper.js --targets node10-linux-x64,node10-macos-x64,node10-win-x64 --output CloudflareDUC
echo.
echo.
echo.
echo.
echo ------------------------------------------------------------------------------------
echo Done building CloudflareDUC. All executables should be located in the "build" folder
echo ------------------------------------------------------------------------------------

REM windows beep sound
@echo 

PAUSE