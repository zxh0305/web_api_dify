#!/bin/bash

# Dify Chat System - Quick Start Script
# 支持Python和Node.js两种启动方式

echo "========================================"
echo "  Dify Chat System - Quick Start"
echo "========================================"
echo ""

# 检测Python是否安装
if command -v python3 &> /dev/null; then
    echo "[✓] Python 3 is available: $(python3 --version)"
    HAS_PYTHON=true
else
    echo "[✗] Python 3 not found"
    HAS_PYTHON=false
fi

# 检测Node.js是否安装
if command -v node &> /dev/null; then
    echo "[✓] Node.js is available: $(node --version)"
    HAS_NODE=true
else
    echo "[✗] Node.js not found"
    HAS_NODE=false
fi

echo ""
echo "Select startup method:"
echo "1) Python HTTP Server (Simple, no dependencies)"
echo "2) Node.js Express Server (Recommended, need npm install)"
echo "3) Docker (Need Docker installed)"
echo ""
read -p "Your choice [1-3]: " choice

case $choice in
    1)
        if [ "$HAS_PYTHON" = true ]; then
            read -p "Port [8000]: " port
            port=${port:-8000}
            read -p "Host [0.0.0.0]: " host
            host=${host:-0.0.0.0}

            echo ""
            echo "Starting Python server..."
            echo "Access URLs:"
            echo "  - Local: http://localhost:$port"
            echo "  - Network: http://$(hostname -I | awk '{print $1}'):$port"
            echo ""
            python3 server.py $port $host
        else
            echo "Error: Python 3 is not installed. Please install Python 3 first."
            exit 1
        fi
        ;;
    2)
        if [ "$HAS_NODE" = true ]; then
            if [ ! -d "node_modules" ]; then
                echo ""
                echo "Installing dependencies..."
                npm install
                if [ $? -ne 0 ]; then
                    echo "Error: Failed to install dependencies."
                    exit 1
                fi
            fi

            read -p "Port [8000]: " port
            export PORT=${port:-8000}
            read -p "Host [0.0.0.0]: " host
            export HOST=${host:-0.0.0.0}

            echo ""
            echo "Starting Node.js server..."
            npm start
        else
            echo "Error: Node.js is not installed. Please install Node.js first."
            exit 1
        fi
        ;;
    3)
        if command -v docker &> /dev/null; then
            echo "Starting with Docker..."
            docker-compose up -d

            echo ""
            echo "Access URLs:"
            echo "  - Local: http://localhost:8000"
            echo ""
            echo "View logs: docker-compose logs -f"
            echo "Stop service: docker-compose down"
        else
            echo "Error: Docker is not installed. Please install Docker first."
            exit 1
        fi
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac
