# 🚀 Simple VPS Deployment

## Step 1: Connect to VPS
```bash
ssh root@YOUR_VPS_IP
```

## Step 2: Run deployment script
```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/ppid-master/main/vps-deploy.sh | bash
```

## Step 3: Update Docker image name
```bash
cd /opt/ppid
sudo nano docker-compose.yml
# Change: your-dockerhub-username/ppid-master:latest
# To: actual-username/ppid-master:latest
sudo docker-compose up -d
```

## If issues occur:
```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/ppid-master/main/fix-docker-issues.sh | bash
```

## Access application:
- URL: http://YOUR_VPS_IP
- Admin: admin@garut.go.id / Garut@2025?

## Check logs:
```bash
sudo docker-compose -f /opt/ppid/docker-compose.yml logs -f
```

## Update application:
```bash
cd /opt/ppid
sudo docker-compose pull
sudo docker-compose up -d
```