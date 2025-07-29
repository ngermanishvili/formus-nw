module.exports = {
    apps: [
        {
            name: 'formus-app',
            script: 'npm',
            args: 'start',
            cwd: '/var/www/formus-app',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            log_file: '/var/log/formus-app/combined.log',
            out_file: '/var/log/formus-app/out.log',
            error_file: '/var/log/formus-app/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm Z'
        }
    ]
}; 