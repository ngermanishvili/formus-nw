#!/bin/bash

# დეპლოიმენტ სკრიპტი სერვერისთვის
# გამოყენება: ./deploy.sh
#udfvgtwCpSbQ2os
SERVER_IP="167.71.58.161"
SERVER_USER="root"
APP_DIR="/var/www/formus-app"

# udfvgtwCpSbQ2os
echo "🚀 იწყება დეპლოიმენტი..."

# 1. ლოკალური ბილდი (თუ გსურთ)
# echo "📦 ლოკალური ბილდის შექმნა..."
# npm run build

# 2. ფაილების ატვირთვა სერვერზე (node_modules-ის გარეშე)
echo "📤 ფაილების ატვირთვა სერვერზე..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  --exclude 'coverage' \
  ./ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/

echo "✅ ფაილები წარმატებით აიტვირთა!"

# 3. სერვერზე კომანდების შესრულება
echo "🔧 სერვერზე დამზადება..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /var/www/formus-app




# Dependencies-ის ინსტალაცია
npm install

# Next.js აპლიკაციის ბილდი
npm run build

# PM2-ით აპლიკაციის გაშვება
pm2 delete formus-app 2>/dev/null || true
pm2 start npm --name "formus-app" -- start

# PM2 კონფიგურაციის შენახვა
pm2 save
pm2 startup

echo "🎉 აპლიკაცია წარმატებით გაშვებულია!"
EOF

echo "🌐 აპლიკაცია ხელმისაწვდომია: http://${SERVER_IP}:3000" 