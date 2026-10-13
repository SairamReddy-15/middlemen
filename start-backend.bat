@echo off
echo Starting FarmDirect backend (Spring Boot)...
cd /d "%~dp0backend"
call mvn spring-boot:run
