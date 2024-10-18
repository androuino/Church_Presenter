#!/bin/bash

# Enable hostapd and dnsmasq
sudo systemctl start hostapd
sudo systemctl start dnsmasq

# Set wlan0 to static IP
sudo ifconfig wlan0 192.168.4.1 netmask 255.255.255.0
