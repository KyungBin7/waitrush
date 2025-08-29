#!/bin/bash

echo "🚀 Starting MinIO setup..."

# Docker 컨테이너들 시작
echo "📦 Starting Docker containers..."
docker-compose up -d

# MinIO가 시작될 때까지 대기
echo "⏳ Waiting for MinIO to start..."
sleep 10

# MinIO 클라이언트 설치 확인 (macOS)
if ! command -v mc &> /dev/null; then
    echo "📥 Installing MinIO client..."
    if command -v brew &> /dev/null; then
        brew install minio/stable/mc
    else
        echo "❌ Homebrew not found. Please install MinIO client manually:"
        echo "   curl https://dl.min.io/client/mc/release/darwin-amd64/mc -o /usr/local/bin/mc"
        echo "   chmod +x /usr/local/bin/mc"
        exit 1
    fi
fi

# MinIO 클라이언트 설정
echo "🔧 Configuring MinIO client..."
mc alias set local http://localhost:9000 minioadmin 1q2w3e4R

# 기본 버킷 생성
echo "📁 Creating default bucket..."
mc mb local/waitlist-images --ignore-existing

# 버킷 정책 설정 (public read access for uploaded images)
echo "🔐 Setting bucket policy..."
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::waitlist-images/*"]
    }
  ]
}
EOF

mc policy set-json /tmp/bucket-policy.json local/waitlist-images

echo "✅ MinIO setup complete!"
echo ""
echo "🔗 Access URLs:"
echo "   MinIO API: http://localhost:9000"
echo "   MinIO Console: http://localhost:9001"
echo "   Username: minioadmin"
echo "   Password: 1q2w3e4R"
echo ""
echo "📝 Next steps:"
echo "   1. Install backend dependencies: cd waitlist-backend && npm install"
echo "   2. Add MinIO SDK to backend"
echo "   3. Update backend configuration"