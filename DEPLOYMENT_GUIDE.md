# 🚀 დეპლოიმენტის სახელმძღვანელო

## 📋 მოკლე აღწერა

ეს სახელმძღვანელო გაეხმარებათ Formus Next.js აპლიკაციის დეპლოიმენტში სერვერზე.
udfvgtwCpSbQ2os

## 🎯 წინა მოთხოვნები

- Ubuntu 24.10 სერვერი (167.71.58.161)
- SSH წვდომა სერვერზე
- PostgreSQL ბაზა უკვე კონფიგურირებულია

## 🔧 ავტომატური დეპლოიმენტი

### 1. დეპლოიმენტ სკრიპტის გამოყენება

```bash
# სკრიპტის executable-ად გაკეთება
chmod +x deploy.sh

# დეპლოიმენტის გაშვება
./deploy.sh
```

## 🛠️ ხელით დეპლოიმენტი

### 1. სერვერზე Node.js ინსტალაცია

```bash
# SSH სერვერზე
ssh root@167.71.58.161

# Node.js 20.x ინსტალაცია
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# ვერსიის შემოწმება
node --version
npm --version
```

### 2. PM2 ინსტალაცია (Process Manager)

```bash
npm install -g pm2
```

### 3. აპლიკაციის დირექტორიის შექმნა

```bash
mkdir -p /var/www/formus-app
mkdir -p /var/log/formus-app
```

### 4. კოდის ატვირთვა (ლოკალური კომპიუტერიდან)

```bash
# rsync გამოყენებით (რეკომენდებული)
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  --exclude 'coverage' \
  ./ root@167.71.58.161:/var/www/formus-app/

# ან scp გამოყენებით
scp -r ./* root@167.71.58.161:/var/www/formus-app/
```

### 5. სერვერზე დამზადება

```bash
# SSH სერვერზე
ssh root@167.71.58.161

# აპლიკაციის დირექტორიაში გადასვლა
cd /var/www/formus-app

# Dependencies ინსტალაცია
npm install

# აპლიკაციის ბილდი
npm run build
```

### 6. PM2-ით აპლიკაციის გაშვება

```bash
# PM2 ecosystem file-ით
pm2 start ecosystem.config.js --env production

# ან უბრალო გაშვება
pm2 start npm --name "formus-app" -- start

# PM2 სტატუსის შემოწმება
pm2 status

# PM2 ლოგების ნახვა
pm2 logs formus-app

# PM2 restart
pm2 restart formus-app

# PM2 კონფიგურაციის შენახვა system startup-სთვის
pm2 save
pm2 startup
```

## 🌍 Nginx კონფიგურაცია (80 პორტისთვის)

### 1. Nginx ინსტალაცია

```bash
apt update
apt install nginx -y
```

### 2. Nginx კონფიგურაცია

```bash
# კონფიგურაციის ფაილის შექმნა
nano /etc/nginx/sites-available/formus-app
```

### 3. Nginx კონფიგურაციის შინაარსი

```nginx
server {
    listen 80;
    server_name 167.71.58.161;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Nginx-ის ჩართვა

```bash
# symbolic link შექმნა
ln -s /etc/nginx/sites-available/formus-app /etc/nginx/sites-enabled/

# default კონფიგურაციის წაშლა
rm /etc/nginx/sites-enabled/default

# nginx კონფიგურაციის ტესტი
nginx -t

# nginx restart
systemctl restart nginx
systemctl enable nginx
```

## 🔍 მონიტორინგი და ტესტირება

### 1. აპლიკაციის სტატუსის შემოწმება

```bash
# PM2 სტატუსი
pm2 status

# Nginx სტატუსი
systemctl status nginx

# პორტების შემოწმება
netstat -tlnp | grep :3000
netstat -tlnp | grep :80
```

### 2. ლოგების მონიტორინგი

```bash
# PM2 ლოგები
pm2 logs formus-app --lines 50

# Nginx ლოგები
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# აპლიკაციის ლოგები
tail -f /var/log/formus-app/combined.log
```

### 3. ტესტირება

```bash
# ლოკალური ტესტი
curl http://localhost:3000

# გარეგანი ტესტი
curl http://167.71.58.161
```

## 🔄 განახლება

### 1. კოდის განახლება

```bash
# ლოკალურად კოდის განახლება
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  ./ root@167.71.58.161:/var/www/formus-app/

# სერვერზე
ssh root@167.71.58.161
cd /var/www/formus-app
npm run build
pm2 restart formus-app
```

## 🚨 ხშირი პრობლემები

### 1. პორტი დაკავებულია

```bash
# პროცესის პოვნა
lsof -i :3000

# პროცესის გაუქმება
kill -9 <PID>
```

### 2. PM2 პროცესები არ ეშვება

```bash
# ყველა PM2 პროცესის გაუქმება
pm2 kill

# ხელახლა გაშვება
pm2 start ecosystem.config.js --env production
```

### 3. Nginx გაუმართავი

```bash
# კონფიგურაციის ტესტი
nginx -t

# ლოგების შემოწმება
journalctl -u nginx
```

## 📁 ფაილების სტრუქტურა სერვერზე

```
/var/www/formus-app/           # მთავარი აპლიკაცია
/var/log/formus-app/          # ლოგ ფაილები
/etc/nginx/sites-available/    # Nginx კონფიგურაცია
```

## 🎯 საბოლოო შედეგი

- აპლიკაცია ხელმისაწვდომი იქნება: `http://167.71.58.161`
- API routes: `http://167.71.58.161/api/*`
- ბაზა უკვე კონფიგურირებულია და მუშაობს
