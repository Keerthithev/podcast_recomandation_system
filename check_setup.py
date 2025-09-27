#!/usr/bin/env python3
"""
Setup Checker for PodcastAI Recommendation System
This script checks if all prerequisites and dependencies are properly installed.
"""

import sys
import subprocess
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.8 or higher"""
    print("Checking Python version...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - OK")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} - Need Python 3.8+")
        return False

def check_node_version():
    """Check if Node.js is installed and version is 16 or higher"""
    print("Checking Node.js version...")
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version_str = result.stdout.strip().lstrip('v')
            major_version = int(version_str.split('.')[0])
            if major_version >= 16:
                print(f"✅ Node.js {version_str} - OK")
                return True
            else:
                print(f"❌ Node.js {version_str} - Need Node.js 16+")
                return False
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not installed")
        return False

def check_backend_dependencies():
    """Check if backend dependencies are installed"""
    print("Checking backend dependencies...")
    backend_path = Path("backend")
    if not backend_path.exists():
        print("❌ Backend directory not found")
        return False
    
    requirements_path = backend_path / "requirements.txt"
    if not requirements_path.exists():
        print("❌ requirements.txt not found")
        return False
    
    try:
        # Check if virtual environment exists
        venv_path = backend_path / "venv"
        if not venv_path.exists():
            print("❌ Virtual environment not found. Run: python -m venv venv")
            return False
        
        # Try to import key packages
        import fastapi
        import uvicorn
        import motor
        import pydantic
        print("✅ Backend dependencies - OK")
        return True
    except ImportError as e:
        print(f"❌ Missing backend dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def check_frontend_dependencies():
    """Check if frontend dependencies are installed"""
    print("Checking frontend dependencies...")
    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print("❌ Frontend directory not found")
        return False
    
    node_modules_path = frontend_path / "node_modules"
    if not node_modules_path.exists():
        print("❌ node_modules not found. Run: npm install")
        return False
    
    package_json_path = frontend_path / "package.json"
    if not package_json_path.exists():
        print("❌ package.json not found")
        return False
    
    print("✅ Frontend dependencies - OK")
    return True

def check_env_files():
    """Check if environment files exist"""
    print("Checking environment files...")
    
    backend_env = Path("backend/.env")
    frontend_env = Path("frontend/.env")
    
    backend_ok = backend_env.exists()
    frontend_ok = frontend_env.exists()
    
    if backend_ok:
        print("✅ Backend .env file exists")
    else:
        print("❌ Backend .env file missing")
    
    if frontend_ok:
        print("✅ Frontend .env file exists")
    else:
        print("❌ Frontend .env file missing")
    
    return backend_ok and frontend_ok

def check_ports():
    """Check if required ports are available"""
    print("Checking port availability...")
    
    import socket
    
    def is_port_available(port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('localhost', port))
                return True
            except OSError:
                return False
    
    port_8000_ok = is_port_available(8000)
    port_5173_ok = is_port_available(5173)
    
    if port_8000_ok:
        print("✅ Port 8000 available")
    else:
        print("❌ Port 8000 in use")
    
    if port_5173_ok:
        print("✅ Port 5173 available")
    else:
        print("❌ Port 5173 in use")
    
    return port_8000_ok and port_5173_ok

def main():
    """Run all checks"""
    print("🔍 PodcastAI Setup Checker")
    print("=" * 40)
    
    checks = [
        check_python_version,
        check_node_version,
        check_backend_dependencies,
        check_frontend_dependencies,
        check_env_files,
        check_ports
    ]
    
    results = []
    for check in checks:
        results.append(check())
        print()
    
    print("=" * 40)
    print("📋 Summary:")
    
    if all(results):
        print("🎉 All checks passed! Your setup looks good.")
        print("\nTo start the application:")
        print("1. Backend: cd backend && python main.py")
        print("2. Frontend: cd frontend && npm run dev")
    else:
        print("⚠️  Some checks failed. Please fix the issues above.")
        print("\nFor detailed setup instructions, see SETUP_GUIDE.md")

if __name__ == "__main__":
    main()
