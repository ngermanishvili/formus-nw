#!/bin/bash

DOMAIN="panoramagroup.ge"
OUTPUT="dns_log.txt"

echo "DNS Lookup for $DOMAIN" > $OUTPUT
echo "==========================" >> $OUTPUT

for TYPE in A MX TXT NS CNAME; do
    echo -e "\n--- $TYPE Records ---" >> $OUTPUT
    nslookup -type=$TYPE $DOMAIN >> $OUTPUT
done

echo -e "\n--- Subdomains ---" >> $OUTPUT
for SUB in www mail ftp pop smtp; do
    echo -e "\n$SUB.$DOMAIN (A Record):" >> $OUTPUT
    nslookup -type=A $SUB.$DOMAIN >> $OUTPUT
done

echo "Saved to $OUTPUT"