# 🚀 GitHub Pages Deployment Guide

## Your Website URL
```
🌐 https://sliu44artcenter.github.io/ixp1final1/
```

---

## 📋 Step-by-Step Instructions

### **Step 1: Go to Repository Settings**

1. Open your browser
2. Navigate to: `https://github.com/sliu44artcenter/ixp1final1`
3. Click the **⚙️ Settings** tab (top navigation bar)

### **Step 2: Navigate to Pages Settings**

1. On the left sidebar, scroll down
2. Click **Pages** (under "Code and automation")

### **Step 3: Configure GitHub Pages**

You'll see a page titled **"GitHub Pages"**

#### **Source Configuration:**

1. Find the **"Build and deployment"** section
2. Under **Source**, select: `Deploy from a branch`
3. Under **Branch**:
   - **First dropdown**: Select `claude/hand-tracked-coin-toss-01WGmnC2h1Mcc9nra8UNyzF3`
     - (Or select `main` if you merged your changes)
   - **Second dropdown**: Select `/ (root)`
4. Click **Save**

### **Step 4: Wait for Deployment**

1. GitHub will start building your site
2. Refresh the page after 1-2 minutes
3. You'll see a message at the top:
   ```
   ✅ Your site is live at https://sliu44artcenter.github.io/ixp1final1/
   ```

### **Step 5: Visit Your Live Site**

Click the link or navigate to:
```
https://sliu44artcenter.github.io/ixp1final1/
```

---

## ✅ Verification Checklist

When you visit your live site, verify:

- [ ] Loading screen appears
- [ ] Camera permission prompt appears
- [ ] Your coin textures load (not fallback colors)
- [ ] Hand tracking works
- [ ] Coin can be thrown
- [ ] All three weight buttons work
- [ ] Results show HEADS/TAILS correctly

---

## 🔧 If Something's Wrong

### **Issue: 404 Page Not Found**

**Cause**: GitHub Pages not enabled or still deploying

**Fix**:
1. Wait 2-3 minutes longer
2. Check Settings → Pages is configured
3. Ensure branch name is correct

### **Issue: Camera Doesn't Work**

**Cause**: HTTPS required for camera access

**Fix**: 
- GitHub Pages automatically uses HTTPS ✅
- Make sure you're visiting `https://` not `http://`

### **Issue: Textures Don't Load**

**Cause**: Textures not in repository

**Fix**:
1. Check files exist: `https://github.com/sliu44artcenter/ixp1final1/tree/[branch]/assets`
2. Verify all 5 PNG files are there:
   - coin_front.png
   - coin_back.png
   - coin_edge.png
   - coin_front_normal.png
   - coin_back_normal.png

### **Issue: Old Version Showing**

**Cause**: GitHub Pages cache

**Fix**:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Wait a few minutes for CDN to update

---

## 🎯 Quick Reference

| What | Value |
|------|-------|
| **Repository** | `sliu44artcenter/ixp1final1` |
| **Branch** | `claude/hand-tracked-coin-toss-01WGmnC2h1Mcc9nra8UNyzF3` |
| **Live URL** | `https://sliu44artcenter.github.io/ixp1final1/` |
| **Settings** | `https://github.com/sliu44artcenter/ixp1final1/settings/pages` |

---

## 📱 Mobile Access

Your site works on mobile! Share this URL:
```
https://sliu44artcenter.github.io/ixp1final1/
```

**Requirements:**
- Modern browser (Chrome, Safari, Firefox)
- Camera access permission
- HTTPS (automatic on GitHub Pages)

---

## 🌟 Share Your Project

Once live, you can share:
- Direct link: `https://sliu44artcenter.github.io/ixp1final1/`
- Repository: `https://github.com/sliu44artcenter/ixp1final1`
- QR Code: Generate one pointing to your live site

---

**Your hand-tracked coin toss is ready to go live!** 🎉
