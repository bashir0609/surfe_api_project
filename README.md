# 🚀 Surfe API Web Application

<div align="center">

![Surfe API](https://img.shields.io/badge/Surfe-API%20Integration-blue?style=for-the-badge&logo=api&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-00a86b?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.8+-3776ab?style=for-the-badge&logo=python&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**A powerful, intelligent web application for company and people enrichment**

[🌐 **Live Demo**](https://surfe-api-project.vercel.app/) • [📖 **Documentation**](#-features) • [🚀 **Quick Start**](#-quick-start) • [🛠 **API Reference**](#-api-endpoints)

---

### ⭐ **Star this repo if you find it useful!**

</div>

## 🎯 **What is this?**

Transform your data enrichment workflow with this comprehensive web application built on the Surfe API. Search companies, enrich profiles, find people, and manage everything through an intuitive interface with enterprise-grade reliability.

<div align="center">

| 🏢 **Company Search** | 👥 **People Search** | 📈 **Data Enrichment** | 🔄 **Smart Rotation** |
|:---:|:---:|:---:|:---:|
| Find companies by industry, size, revenue | Search people by role, company, location | Enrich profiles with detailed data | 5-key rotation for 99.9% uptime |

</div>

---

## ✨ **Features**

<table>
<tr>
<td width="50%">

### 🔍 **Search & Discovery**
- 🏢 **Company Search** - Industry, location, size filters
- 👥 **People Search** - Role-based professional search  
- 🎯 **Smart Autocomplete** - Industries, countries, departments
- 📊 **Advanced Filtering** - Revenue, employee count, seniorities
- 📄 **CSV Export** - Download all results instantly

</td>
<td width="50%">

### ⚡ **Intelligence & Reliability**
- 🔄 **5-Key Rotation** - Automatic failover system
- 🚀 **Background Processing** - Async enrichment jobs
- 📈 **Real-time Monitoring** - Live job status updates
- 🛡️ **Error Recovery** - Smart retry mechanisms
- 📊 **Health Dashboard** - API performance metrics

</td>
</tr>
</table>

---

## 🌐 **Try It Now**

<div align="center">

### **🎉 Live Application**

[![Open Live App](https://img.shields.io/badge/🌐%20Open%20Live%20App-Visit%20Now-success?style=for-the-badge&logo=vercel)](https://surfe-api-project.vercel.app/)

**No installation required • Ready to use • Full functionality**

</div>

---

## 🚀 **Quick Start**

<details>
<summary><b>🖥️ Local Development Setup</b></summary>

```bash
# 📥 Clone the repository
git clone <your-repo-url>
cd surfe-api-app

# 🐍 Install dependencies
pip install -r requirements.txt

# ⚙️ Set up environment variables
echo "SURFE_API_KEY_1=your_api_key_here" > .env

# 🚀 Start the application
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 🎉 Open http://localhost:8000
```

</details>

<details>
<summary><b>🔑 Environment Configuration</b></summary>

Create a `.env` file:

```env
# 🔑 Surfe API Keys (1-5 keys for rotation)
SURFE_API_KEY_1=sk_live_your_primary_key
SURFE_API_KEY_2=sk_live_your_backup_key_1  
SURFE_API_KEY_3=sk_live_your_backup_key_2
SURFE_API_KEY_4=sk_live_your_backup_key_3
SURFE_API_KEY_5=sk_live_your_backup_key_4

# 🛠️ Application Settings
DEBUG=True
```

**💡 Pro Tip**: More keys = Better reliability!

</details>

---

## 🎮 **How to Use**

<div align="center">

### **🏢 Company Search**
*Find companies by industry, location, and size*

![Company Search](https://img.shields.io/badge/Step%201-Select%20Filters-blue) → ![Step 2](https://img.shields.io/badge/Step%202-Search-green) → ![Step 3](https://img.shields.io/badge/Step%203-Export%20CSV-orange)

</div>

<details>
<summary><b>👥 People Search Guide</b></summary>

### **Company Filters**
- 🏭 **Industries**: Software, FinTech, Healthcare, etc.
- 🌍 **Countries**: US, FR, DE, UK (ISO codes)
- 👥 **Employee Count**: Startup (1-50) to Enterprise (10K+)
- 💰 **Revenue Range**: $1M - $1B+

### **People Filters**  
- 🎯 **Job Titles**: CEO, CTO, Manager, Engineer
- 🏢 **Departments**: Engineering, Sales, Marketing
- ⭐ **Seniorities**: Founder, C-Level, Director, VP
- 📍 **Location**: Country-based filtering

</details>

<details>
<summary><b>📈 Enrichment Workflows</b></summary>

### **🏢 Company Enrichment**
```
Input: google.com, microsoft.com
↓ Background Processing (3-5 minutes)
Output: Complete company profiles with financials
```

### **👥 People Enrichment**
```
Input: Name + Company + LinkedIn
↓ Real-time Processing 
Output: Enhanced professional profiles
```

**✨ Features:**
- 🔄 Real-time status updates (every 3 seconds)
- 🛡️ Error handling with automatic retries
- 📊 Progress tracking with visual indicators
- 📄 CSV export when complete

</details>

---

## 🛠 **Tech Stack**

<div align="center">

| **Backend** | **Frontend** | **Infrastructure** |
|:---:|:---:|:---:|
| ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?logo=fastapi&logoColor=white) | ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black) | ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white) |
| ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) | ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white) | ![Surfe API](https://img.shields.io/badge/-Surfe%20API-FF6B6B?logoColor=white) |
| ![Async/Await](https://img.shields.io/badge/-Async%2FAwait-4FC08D?logoColor=white) | ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white) | ![Background Jobs](https://img.shields.io/badge/-Background%20Jobs-9C27B0?logoColor=white) |

</div>

---

## 📂 **Project Architecture**

<details>
<summary><b>📁 Folder Structure</b></summary>

```
surfe-api-app/
├── 🚀 api/
│   ├── routes/
│   │   ├── 🏢 company_search.py      # Company operations
│   │   ├── 👥 people_search.py       # People operations  
│   │   ├── 📈 company_enrichment.py  # Background enrichment
│   │   ├── 👤 people_enrichment.py   # Profile enhancement
│   │   ├── 📊 diagnostics.py         # Health monitoring
│   │   └── 🏠 dashboard.py           # Main dashboard
│   └── 📋 models/
├── ⚙️ core/
│   ├── 🔄 background_tasks.py        # Async job processing
│   ├── 📝 job_manager.py             # Status management
│   └── 🔐 dependencies.py           # Auth & validation
├── 🛠 utils/
│   └── 🔄 api_client.py              # Smart rotation system
├── 🎨 static/
│   ├── js/ (Universal autocomplete)
│   └── css/ (Modern styling)
├── 📄 templates/ (HTML pages)
└── 🚀 main.py (FastAPI app)
```

</details>

---

## 🔧 **API Endpoints**

<div align="center">

### **🏢 Company Operations**

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/api/v2/companies/search` | 🔍 Search companies with filters |
| `POST` | `/api/v2/companies/enrich` | 📈 Start enrichment job |
| `GET` | `/api/v2/companies/enrich/status/{id}` | 📊 Check job status |

### **👥 People Operations**

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/api/v2/people/search` | 👥 Search people profiles |
| `POST` | `/api/v2/people/enrich` | 👤 Enhance people data |
| `GET` | `/api/v2/people/enrich/status/{id}` | 📈 Monitor enrichment |

### **📊 Diagnostics & Health**

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/diagnostics/rotation-status` | 🔄 Key rotation health |
| `GET` | `/api/diagnostics/test-rotation` | 🧪 Test all API keys |

</div>

---

## 🚨 **Troubleshooting**

<details>
<summary><b>❌ Common Issues & Solutions</b></summary>

### **🔑 API Key Issues**

| Problem | Solution |
|:---|:---|
| ❌ "No API keys configured" | ✅ Add `SURFE_API_KEY_1` to environment |
| ❌ "All keys exhausted" | ✅ Wait 1 hour or add more keys |
| ❌ Rate limit errors | ✅ Check diagnostics page for key status |

### **🔄 Enrichment Issues**

| Problem | Solution |
|:---|:---|
| ⏳ Jobs stuck in "pending" | ✅ Check API key availability |
| ❌ 404 errors during polling | ✅ Key consistency handles this automatically |
| 🐌 Slow processing | ✅ Normal - enrichment takes 3-5 minutes |

### **🎯 Autocomplete Issues**

| Problem | Solution |
|:---|:---|
| 📝 No suggestions appearing | ✅ Check browser console for errors |
| 🎨 Dropdown positioning wrong | ✅ Verify CSS is loading properly |

</details>

---

## 🌍 **Deployment**

<div align="center">

### **🚀 Production Ready**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/bashir0609/surfe_api_project)

</div>

<details>
<summary><b>⚙️ Vercel Configuration</b></summary>

The app is **already deployed** at: **[surfe-api-project.vercel.app](https://surfe-api-project.vercel.app/)**

### **Deploy Your Own**

1. **🍴 Fork** this repository
2. **🔗 Connect** to Vercel
3. **⚙️ Set Environment Variables**:
   ```
   SURFE_API_KEY_1=your_key_1
   SURFE_API_KEY_2=your_key_2
   SURFE_API_KEY_3=your_key_3
   ```
4. **🚀 Deploy** automatically

</details>

<details>
<summary><b>🐳 Docker Deployment</b></summary>

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t surfe-api-app .
docker run -p 8000:8000 --env-file .env surfe-api-app
```

</details>

---

## 📊 **Performance & Monitoring**

<div align="center">

### **🎯 Key Metrics**

| Metric | Target | Status |
|:---|:---:|:---:|
| 🔄 **API Uptime** | 99.9% | ![Status](https://img.shields.io/badge/✅-Operational-success) |
| ⚡ **Response Time** | <2s | ![Speed](https://img.shields.io/badge/⚡-Fast-brightgreen) |
| 🔑 **Key Rotation** | 5 Keys | ![Keys](https://img.shields.io/badge/🔄-Active-blue) |
| 📈 **Success Rate** | >95% | ![Success](https://img.shields.io/badge/📊-High-green) |

</div>

### **📊 Real-time Monitoring**

Visit `/api/diagnostics/rotation-status` to see:
- 🔄 Key rotation statistics
- 📈 Success/failure rates  
- ⚡ Response times
- 🚨 Error tracking

---

## 🤝 **Contributing**

<div align="center">

### **🌟 Help make this project better!**

[![Contributors](https://img.shields.io/github/contributors/bashir0609/repo-name?style=for-the-badge)](https://github.com/bashir0609/repo-name/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/bashir0609/repo-name?style=for-the-badge)](https://github.com/bashir0609/repo-name/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/bashir0609/repo-name?style=for-the-badge)](https://github.com/bashir0609/repo-name/pulls)

</div>

### **🚀 Quick Contribution Guide**

1. **🍴 Fork** the repository  
2. **🌿 Create** feature branch: `git checkout -b amazing-feature`
3. **✨ Make** your changes
4. **🧪 Test** thoroughly  
5. **📝 Commit**: `git commit -m 'Add amazing feature'`
6. **📤 Push**: `git push origin amazing-feature`
7. **🔀 Create** Pull Request

---

## ❓ **FAQ**

<details>
<summary><b>🔑 How many API keys do I need?</b></summary>

**Minimum**: 1 key (basic functionality)  
**Recommended**: 3-5 keys (enterprise reliability)  
**Benefits**: Automatic failover, higher throughput, 99.9% uptime

</details>

<details>
<summary><b>💰 Is this free to use?</b></summary>

**Application**: ✅ Free and open source  
**Surfe API**: 💳 Requires paid Surfe subscription  
**Hosting**: 🆓 Free tier available on Vercel

</details>

<details>
<summary><b>🔄 How does key rotation work?</b></summary>

1. **🎯 Smart Detection**: Monitors API key health
2. **🔄 Automatic Failover**: Switches keys when limits hit
3. **⏰ Cooldown Management**: Re-enables keys after reset
4. **📊 Real-time Monitoring**: Track performance metrics

</details>

<details>
<summary><b>🛡️ Is my data secure?</b></summary>

- **🔒 No Storage**: Data not permanently stored
- **🔄 Temporary Jobs**: Only job statuses kept in memory  
- **🔐 Direct API**: All data comes from Surfe API
- **🛡️ Secure**: HTTPS encryption throughout

</details>

---

## 📄 **License**

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Open source and free to use under MIT License**

</div>

---

## 🙏 **Acknowledgments**

<div align="center">

### **Built with ❤️ using**

[![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Surfe API](https://img.shields.io/badge/-Surfe%20API-FF6B6B?style=flat-square&logoColor=white)](https://surfe.com/)
[![Vercel](https://img.shields.io/badge/-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

### **⭐ If this project helped you, please give it a star!**

[![GitHub Stars](https://img.shields.io/github/stars/bashir0609/repo-name?style=social)](https://github.com/bashir0609/repo-name/stargazers)

**📧 Questions? Open an issue or reach out!**

</div>
