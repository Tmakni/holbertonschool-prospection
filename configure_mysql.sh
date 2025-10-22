#!/bin/bash
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Password123!';"
sudo mysql -e "FLUSH PRIVILEGES;"
echo "MySQL root user configured successfully"