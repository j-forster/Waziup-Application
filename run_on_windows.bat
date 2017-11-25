@echo off
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
ECHO this process requires the node.js framework.
ECHO have a look at https://nodejs.org
) else (
npm start
)
