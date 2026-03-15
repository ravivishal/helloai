#!/usr/bin/env python3
"""Deploy to Vercel via API (bypasses CLI file upload issues)"""
import os
import sys
import json
import hashlib
import requests

TOKEN = "vca_2d4qhVLuGalcZd2W5U5UvbKpzjuvSbm2QxHpSF1EF71ir6RhnF10iBLg"
TEAM_ID = "team_Jhk4ChcwxuVXk5rXF6VFYgi7"
PROJECT_NAME = "helloai"
API = "https://api.vercel.com"

SKIP_DIRS = {'.git', '.vercel', '.next', 'node_modules', '__pycache__'}
SKIP_FILES = {'deploy.sh', 'deploy.py', '.env.local', '.env'}

headers = {
    "Authorization": f"Bearer {TOKEN}",
}

def sha1_file(path):
    h = hashlib.sha1()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

def collect_files(root):
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            if fname in SKIP_FILES:
                continue
            if fname.endswith(':Zone.Identifier'):
                continue
            fullpath = os.path.join(dirpath, fname)
            relpath = os.path.relpath(fullpath, root)
            files.append((relpath, fullpath))
    return sorted(files)

def upload_file(filepath, sha):
    size = os.path.getsize(filepath)
    with open(filepath, 'rb') as f:
        data = f.read()
    resp = requests.post(
        f"{API}/v2/files?teamId={TEAM_ID}",
        headers={
            **headers,
            "Content-Type": "application/octet-stream",
            "x-vercel-digest": sha,
            "Content-Length": str(size),
        },
        data=data,
    )
    return resp.status_code

def main():
    root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root)

    print("=== Collecting files ===")
    files = collect_files(root)
    print(f"Found {len(files)} files")

    print("\n=== Uploading files ===")
    file_list = []
    for i, (relpath, fullpath) in enumerate(files):
        sha = sha1_file(fullpath)
        size = os.path.getsize(fullpath)
        status = upload_file(fullpath, sha)
        marker = "✓" if status in (200, 409) else f"✗ ({status})"
        print(f"  [{i+1}/{len(files)}] {marker} {relpath}")
        
        if status not in (200, 409):
            print(f"    Skipping due to upload error")
            continue
            
        file_list.append({
            "file": relpath,
            "sha": sha,
            "size": size,
        })

    print(f"\n=== Creating deployment ({len(file_list)} files) ===")
    
    deploy_body = {
        "name": PROJECT_NAME,
        "files": file_list,
        "projectSettings": {
            "framework": "nextjs",
            "buildCommand": "npm run build",
            "outputDirectory": ".next",
        },
        "target": "production",
    }

    resp = requests.post(
        f"{API}/v13/deployments?teamId={TEAM_ID}",
        headers={**headers, "Content-Type": "application/json"},
        json=deploy_body,
    )

    data = resp.json()
    if "url" in data:
        print(f"\n✅ Deployed! URL: https://{data['url']}")
        print(f"   Status: {data.get('readyState', 'building')}")
        print(f"   ID: {data.get('id', 'N/A')}")
        if data.get('readyState') != 'READY':
            print(f"\n   Build in progress. Check: https://vercel.com/ravivishals-projects/{PROJECT_NAME}")
    elif "error" in data:
        print(f"\n❌ Error: {data['error']['message']}")
        if 'link' in data['error']:
            print(f"   Details: {data['error']['link']}")
    else:
        print(json.dumps(data, indent=2))

if __name__ == "__main__":
    main()
