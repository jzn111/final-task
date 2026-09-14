@echo off
chcp 65001 >nul
echo 正在启动校园公交信息中心服务器...
echo 访问地址: http://127.0.0.1:8772
py server.py
pause
