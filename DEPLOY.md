# 🚀 Deploy Your Own Surfe API App

Deploy your personal instance of the Surfe API application with your own API keys using our pre-configured Vercel deployment.

## Quick Deploy to Vercel

Click the button below to deploy your own instance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/surfe-api-app&project-name=surfe-api-app&repository-name=surfe-api-app)

## 🏗️ Deployment Architecture

This project uses a custom `vercel-deploy.json` configuration that automatically:

- **🐍 Builds Python FastAPI backend** using `@vercel/python@4.3.0`
- **📁 Serves static assets** (HTML, CSS, JS) using `@vercel/static`
- **🔀 Routes requests** properly between API and static content
- **🔑 Configures environment variables** for your API keys

## What You'll Need

### 🔑 Surfe API Keys
1. **Log in to Surfe**: Go to [app.surfe.com](https://app.surfe.com)
2. **Navigate to API Settings**: Settings → API Keys
3. **Generate Keys**: Create 1-5 API keys for better reliability
4. **Copy Keys**: You'll paste these during Vercel deployment

### 📋 Deployment Steps

1. **Click Deploy Button** above
2. **Connect GitHub**: Authorize Vercel to access your GitHub
3. **Fork Repository**: Vercel will fork this repo to your account
4. **Configure Project**: 
   - Project name: `surfe-api-app` (or customize)
   - Framework preset: **Other** (Vercel will detect our custom config)
5. **Enter API Keys** (as prompted by `vercel-deploy.json`):
   - `SURFE_API_KEY_1` ✅ **Required** - Your primary API key
   - `SURFE_API_KEY_2` ⚪ **Optional** - Second key for rotation
   - `SURFE_API_KEY_3` ⚪ **Optional** - Third key for rotation
   - `SURFE_API_KEY_4` ⚪ **Optional** - Fourth key for rotation
   - `SURFE_API_KEY_5` ⚪ **Optional** - Fifth key for rotation
6. **Deploy**: Click "Deploy" and wait for completion (~2-3 minutes)
7. **Access Your App**: Get your personal URL like `surfe-api-app-yourname.vercel.app`

## 🔧 Technical Configuration

### Vercel Build Configuration
Our `vercel-deploy.json` handles:

```json
{
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python@4.3.0"
    },
    {
      "src": "static/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/main.py"
    }
  ]
}
```

### API Key Rotation Configuration
The deployment automatically configures our intelligent 5-key rotation system:

| Environment Variable | Status | Purpose |
|---------------------|--------|---------|
| `SURFE_API_KEY_1` | ✅ **Required** | Primary key - must be provided |
| `SURFE_API_KEY_2` | ⚪ Optional | Backup key for rate limit handling |
| `SURFE_API_KEY_3` | ⚪ Optional | Additional resilience |
| `SURFE_API_KEY_4` | ⚪ Optional | Enhanced reliability |
| `SURFE_API_KEY_5` | ⚪ Optional | Maximum fault tolerance |

## ✅ Benefits of Personal Deployment

- **🔒 Your Keys Stay Private**: Only you have access to your API keys
- **💰 You Control Costs**: Use your own Surfe API quota
- **⚡ No Sharing**: Your personal instance, no rate limiting from other users
- **🛠 Customizable**: Modify the code as needed for your use case
- **🔄 Auto Updates**: Pull updates from the main repository when available
- **🚀 Serverless**: Automatically scales with Vercel's serverless functions
- **🌍 Global CDN**: Fast loading worldwide via Vercel's edge network

## 🚨 Important Notes

### Security & Privacy
- **✅ API keys stored securely** in Vercel's encrypted environment variables
- **✅ No shared infrastructure** - your own isolated deployment
- **✅ HTTPS by default** - all traffic encrypted
- **❌ Never share your deployment URL** if you want to keep usage private

### Performance & Reliability
- **🔄 Automatic failover** between API keys if one hits rate limits
- **⚡ Cold start optimization** with Python runtime caching
- **📊 Built-in diagnostics** to monitor API key health
- **🔧 Self-healing** system that disables and re-enables problematic keys

### Usage & Billing
- **💸 Vercel hosting** - Free for personal projects (generous limits)
- **💳 Surfe API costs** - Billed to your Surfe account based on usage
- **📈 Usage tracking** - Monitor API consumption via built-in dashboard
- **🚫 No additional fees** from this application

## 🔄 Updating Your Deployment

When updates are available:

### Automatic Updates
1. **Enable auto-deploy** in Vercel dashboard
2. **Updates deploy automatically** when you sync your fork

### Manual Updates
1. **Sync your fork** with the upstream repository
2. **Vercel auto-builds** from your main branch
3. **Or trigger manually** in Vercel dashboard → Deployments → Redeploy

## 🔍 Monitoring & Diagnostics

Your deployment includes comprehensive monitoring:

- **📊 API Usage Dashboard** - Track requests across all keys
- **🔧 System Diagnostics** - Test connectivity and key health
- **⚡ Performance Metrics** - Monitor response times
- **🚨 Error Tracking** - Identify and resolve issues quickly

Access via: `https://your-app.vercel.app/pages/diagnostics`

## 🛠 Customization Options

### Adding More API Keys
1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add new variables** following the pattern `SURFE_API_KEY_X`
3. **Redeploy** to activate new keys

### Custom Domain
1. **Vercel Dashboard** → Your Project → Settings → Domains
2. **Add custom domain** (e.g., `api.yourcompany.com`)
3. **Configure DNS** as instructed by Vercel

### Environment-Specific Deployments
- **Production**: Use all 5 API keys for maximum reliability
- **Development**: Use 1-2 keys for testing
- **Staging**: Use 2-3 keys for pre-production testing

## 🆘 Troubleshooting

### Common Issues

**❌ Deployment Failed**
- Check if `main.py` exists in repository root
- Verify `vercel-deploy.json` is properly formatted
- Ensure at least `SURFE_API_KEY_1` is provided

**❌ API Keys Not Working**
- Verify keys are valid in [Surfe dashboard](https://app.surfe.com/settings/api)
- Check environment variables in Vercel dashboard
- Use diagnostics page to test key validity

**❌ Static Files Not Loading**
- Verify `static/` folder structure is intact
- Check Vercel build logs for static file errors
- Ensure proper routing in `vercel-deploy.json`

### Getting Help
- **🚀 Vercel Issues**: [Vercel Documentation](https://vercel.com/docs)
- **🔑 Surfe API Issues**: [Surfe Support](https://app.surfe.com/support)  
- **📱 App Issues**: Create issue in this repository
- **💬 Community**: Join our Discord for real-time help

## 🎯 Next Steps After Deployment

1. **✅ Test Your Deployment**
   - Visit your app URL
   - Run diagnostics to verify all systems
   - Test a sample search or enrichment

2. **📊 Monitor Usage**
   - Set up alerts in Surfe dashboard
   - Check Vercel analytics
   - Monitor API key rotation effectiveness

3. **🔒 Secure Your Instance**
   - Consider adding authentication for team use
   - Set up monitoring alerts
   - Review and rotate API keys periodically

4. **🚀 Scale & Optimize**
   - Add more API keys as usage grows
   - Configure custom domain for professional use
   - Set up staging environment for testing

---

**Ready to deploy your enterprise-grade Surfe API instance?** 

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/surfe-api-app&project-name=surfe-api-app&repository-name=surfe-api-app)

**🚀 Deploy now and get your personal API instance running in under 5 minutes!**