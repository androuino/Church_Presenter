@echo off
java -Xms256m -Xmx512m ^
     -Dlogging.level.root=INFO ^
     -Dlogging.level.com.yourpackage=DEBUG ^
     -jar app-1.0-all.jar
pause