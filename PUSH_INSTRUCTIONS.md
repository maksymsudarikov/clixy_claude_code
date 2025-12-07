# Manual Push Instructions

Your code is ready and committed locally. To push to GitHub, follow ONE of these options:

## Option 1: Use GitHub Desktop (Easiest)
1. Download and install GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository
4. Select: `/Users/maksymsudarikov/Downloads/clixy`
5. Click "Publish repository"
6. Choose repository name: `clixy_claude_code`
7. Push button will appear - click it

## Option 2: Use Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Clixy Deploy"
4. Select scopes: `repo` (all checkboxes under it)
5. Click "Generate token"
6. Copy the token (save it somewhere safe!)
7. In terminal, run:
```bash
cd /Users/maksymsudarikov/Downloads/clixy
git remote remove origin
git remote add origin https://YOUR_TOKEN@github.com/maksymsudarikov/clixy_claude_code.git
git push -u origin main
```

## Option 3: Add SSH Key to GitHub
1. Copy your public key:
```bash
cat ~/.ssh/id_ed25519.pub | pbcopy
```
2. Go to: https://github.com/settings/keys
3. Click "New SSH key"
4. Title: "MacBook"
5. Paste the key (it's already in your clipboard)
6. Click "Add SSH key"
7. Then push:
```bash
cd /Users/maksymsudarikov/Downloads/clixy
git push -u origin main
```

## After Successful Push

Once you push successfully, GitHub Actions will automatically:
1. Build your application with Supabase credentials
2. Deploy to GitHub Pages

You can watch the deployment here:
https://github.com/maksymsudarikov/clixy_claude_code/actions

Your site will be available at:
- **Main portfolio** (PIN protected): https://maksymsudarikov.github.io/clixy_claude_code/
- **Gift cards** (public): https://maksymsudarikov.github.io/clixy_claude_code/#/gift-card

PIN Code: **9634**

## Enable GitHub Pages
After your first push, you need to enable GitHub Pages:
1. Go to: https://github.com/maksymsudarikov/clixy_claude_code/settings/pages
2. Under "Source", select: `Deploy from a branch`
3. Under "Branch", select: `gh-pages` or the branch that GitHub Actions creates
4. Click "Save"

Wait 2-3 minutes and your site will be live!
