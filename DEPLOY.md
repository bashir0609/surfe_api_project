# 🚀 Deploy Your Own Surfe API App

Deploy your personal instance of the Surfe API application with your own API keys.

## Quick Deploy to Vercel

Click the button below to deploy your own instance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/surfe-api-app&env=SURFE_API_KEY_1,SURFE_API_KEY_2,SURFE_API_KEY_3,SURFE_API_KEY_4,SURFE_API_KEY_5&envDescription=Your%20Surfe%20API%20keys%20for%20accessing%20the%20Surfe%20API&envLink=https://app.surfe.com/settings/api)

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
4. **Enter API Keys**: 
   - `SURFE_API_KEY_1` (Required) - Your primary API key
   - `SURFE_API_KEY_2` (Optional) - Second key for rotation
   - `SURFE_API_KEY_3` (Optional) - Third key for rotation
   - `SURFE_API_KEY_4` (Optional) - Fourth key for rotation
   - `SURFE_API_KEY_5` (Optional) - Fifth key for rotation
5. **Deploy**: Click "Deploy" and wait for completion
6. **Access Your App**: Get your personal URL like `surfe-api-app-yourname.vercel.app`

## ✅ Benefits of Personal Deployment

- **🔒 Your Keys Stay Private**: Only you have access to your API keys
- **💰 You Control Costs**: Use your own Surfe API quota
- **⚡ No Sharing**: Your personal instance, no rate limiting from other users
- **🛠 Customizable**: Modify the code as needed for your use case
- **🔄 Auto Updates**: Pull updates from the main repository when available

## 🔧 Configuration Options

### API Key Rotation
- **1 Key**: Basic functionality
- **2-3 Keys**: Recommended for reliability
- **4-5 Keys**: Maximum reliability and rate limit handling

### Environment Variables
All environment variables are configured during Vercel deployment:

| Variable | Required | Description |
|----------|----------|-------------|
| `SURFE_API_KEY_1` | ✅ Yes | Primary Surfe API key |
| `SURFE_API_KEY_2` | ⚪ Optional | Second key for rotation |
| `SURFE_API_KEY_3` | ⚪ Optional | Third key for rotation |
| `SURFE_API_KEY_4` | ⚪ Optional | Fourth key for rotation |
| `SURFE_API_KEY_5` | ⚪ Optional | Fifth key for rotation |

## 🚨 Important Notes

### Security
- **Never share your deployment URL** if you want to keep your usage private
- **Your API keys are stored securely** in Vercel's environment variables
- **No one else can access your keys** - they're tied to your Vercel account

### Usage & Billing
- **Vercel hosting is free** for personal projects with reasonable usage
- **Surfe API costs** are billed to your Surfe account based on your usage
- **No additional fees** from this application

### Support
- **Issues with deployment**: Check [Vercel documentation](https://vercel.com/docs)
- **Issues with Surfe API**: Contact [Surfe support](https://app.surfe.com/support)
- **App-specific issues**: Create an issue in this repository

## 🔄 Updating Your Deployment

When updates are available:
1. **Pull changes** to your forked repository
2. **Vercel auto-deploys** from your main branch
3. **Or manually trigger** deployment in Vercel dashboard

## 🛡️ Privacy & Security

This deployment method ensures:
- ✅ Your API keys never leave your Vercel environment
- ✅ No shared infrastructure with other users
- ✅ Full control over your data and usage
- ✅ Compliance with enterprise security requirements

---

**Ready to deploy?** Click the deploy button above to get started! 🚀