# Surfe API Web Application

A comprehensive web application for company and people enrichment using the Surfe API. This application provides an intuitive interface for searching companies, enriching company data, finding people, and managing API operations with intelligent key rotation.

## 🌟 Features

### Core Functionality
- **Company Search**: Find companies by industry, location, employee count, and revenue
- **People Search**: Search for people using company and personal filters
- **Company Enrichment**: Enrich company data with detailed information (background processing)
- **People Enrichment**: Enhance people profiles with additional data (background processing)
- **API Diagnostics**: Monitor API health and key rotation status

### Advanced Features
- **Intelligent API Key Rotation**: Automatic fallback between 5 API keys for maximum reliability
- **Universal Autocomplete**: Smart suggestions for industries, countries, departments, seniorities
- **Background Processing**: Asynchronous enrichment tasks with real-time status updates
- **CSV Export**: Download search results and enrichment data
- **Real-time Job Monitoring**: Live updates on enrichment job progress with polling
- **Key Consistency**: Same API key used for job creation and status polling (prevents 404 errors)

## 🚀 Quick Start

### Live Demo

**🌐 Try it now**: [https://surfe-api-project.vercel.app/](https://surfe-api-project.vercel.app/)

You can access the live application immediately! Just visit the link above and start using the features. The application is fully deployed and ready to use.

### Using the Live Application

1. **Visit the live app**: [https://surfe-api-project.vercel.app/](https://surfe-api-project.vercel.app/)
2. **Start exploring**: Use Company Search, People Search, and other features
3. **Note**: Some features may require valid API keys to be configured in the Vercel environment

### Local Development Setup

If you want to run the application locally for development:

### Prerequisites

Before you begin, make sure you have:
- **Python 3.8+** installed
- **Surfe API keys** (you'll need 1-5 API keys for best performance)
- Basic knowledge of web applications (helpful but not required)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd surfe-api-app
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Surfe API Keys (add 1-5 keys for rotation)
   SURFE_API_KEY_1=your_first_api_key_here
   SURFE_API_KEY_2=your_second_api_key_here
   SURFE_API_KEY_3=your_third_api_key_here
   SURFE_API_KEY_4=your_fourth_api_key_here
   SURFE_API_KEY_5=your_fifth_api_key_here
   
   # Application Settings
   DEBUG=True
   ```

4. **Run the application**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Open your browser**
   Navigate to `http://localhost:8000`

## 📁 Project Structure

```
surfe-api-app/
├── api/
│   ├── routes/
│   │   ├── company_search.py      # Company search endpoints
│   │   ├── people_search.py       # People search endpoints
│   │   ├── company_enrichment.py  # Company enrichment
│   │   ├── people_enrichment.py   # People enrichment
│   │   ├── diagnostics.py         # API monitoring
│   │   └── dashboard.py           # Dashboard routes
│   └── models/
│       ├── requests.py            # Request data models
│       └── responses.py           # Response data models
├── core/
│   ├── background_tasks.py        # Async enrichment processing
│   ├── job_manager.py             # Job status management
│   └── dependencies.py           # FastAPI dependencies
├── utils/
│   └── api_client.py              # Surfe API integration
├── static/
│   ├── js/
│   │   ├── shared.js              # Common utilities & autocomplete
│   │   ├── people_search.js       # People search functionality
│   │   └── company_search.js      # Company search functionality
│   └── css/
│       └── styles.css             # Application styling
├── templates/
│   ├── index.html                 # Dashboard page
│   ├── people_search.html         # People search page
│   └── company_search.html        # Company search page
├── main.py                        # FastAPI application entry point
├── requirements.txt               # Python dependencies
└── README.md                      # This file
```

## 🎯 How to Use

### 1. Dashboard
- Visit the main page to see an overview of available features
- Check API status and key rotation health
- Navigate to different sections using the sidebar

### 2. Company Search
1. Go to **Company Search** in the sidebar
2. Fill in search criteria:
   - **Industries**: Type to search (e.g., "Software", "FinTech")
   - **Countries**: Enter country codes (e.g., "US", "FR", "DE")
   - **Employee Count**: Set min/max range
   - **Revenue**: Set revenue range in USD
3. Click **🔍 Search Companies**
4. Download results as CSV using **📥 Download CSV**

### 3. People Search
1. Go to **People Search** in the sidebar
2. Set **Company Filters**:
   - Industries, countries, employee count, revenue
3. Set **People Filters**:
   - Countries, departments, job titles, seniorities
4. Click **🔍 Search People**
5. Download results as CSV

### 4. Company Enrichment (Background Processing)
1. Go to **Company Enrichment** in the sidebar
2. Enter company domains (one per line or comma-separated):
   ```
   google.com
   microsoft.com
   apple.com
   ```
3. Click **Start Enrichment**
4. **Monitor job progress**:
   - Job starts with "pending" status
   - Automatically updates to "running"
   - Polls for completion every 3 seconds
   - Shows "completed" when data is ready
5. **View enriched data**: Detailed company information including:
   - Company description and details
   - Employee information
   - Industry classifications
   - Revenue and financial data
6. **Download results** as CSV when enrichment completes

### 5. People Enrichment (Background Processing)
1. Go to **People Enrichment** in the sidebar
2. Enter people data in the form:
   - **Names**: First and last names
   - **Company information**: Company name, domain
   - **Contact details**: Email, LinkedIn URLs
   - **Location**: Country, city
3. Click **Start Enrichment**
4. **Track real-time progress**:
   - Background task processes the enrichment
   - Status updates automatically (pending → running → completed)
   - Uses same API key for job creation and polling (prevents errors)
5. **Review enriched profiles**: Enhanced data including:
   - Complete professional profiles
   - Social media links
   - Employment history
   - Contact information
6. **Export results** when processing completes

### 6. API Diagnostics
- **Monitor API health**: Check rotation system status
- **View key statistics**: Success rates, available keys, total requests
- **Debug issues**: See which keys are working and error details
- **Test rotation**: Verify all API keys are functioning

## ⚙️ Configuration

### API Keys Setup

The application supports **intelligent key rotation** with 1-5 API keys:

```env
# Minimum setup (1 key)
SURFE_API_KEY_1=your_api_key

# Recommended setup (3-5 keys for best performance)
SURFE_API_KEY_1=key_1
SURFE_API_KEY_2=key_2
SURFE_API_KEY_3=key_3
SURFE_API_KEY_4=key_4
SURFE_API_KEY_5=key_5
```

**Benefits of multiple keys:**
- Automatic fallback when a key hits rate limits
- Higher overall throughput
- Better reliability during peak usage

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SURFE_API_KEY_1` | Primary Surfe API key | Yes | - |
| `SURFE_API_KEY_2-5` | Additional keys for rotation | No | - |
| `DEBUG` | Enable debug logging | No | `False` |

## 🔧 API Endpoints

### Company Operations
- `POST /api/v2/companies/search` - Search companies with filters
- `POST /api/v2/companies/enrich` - Start company enrichment (background task)
- `GET /api/v2/companies/enrich/status/{job_id}` - Check enrichment job status

### People Operations
- `POST /api/v2/people/search` - Search people with company and personal filters
- `POST /api/v2/people/enrich` - Start people enrichment (background task)
- `GET /api/v2/people/enrich/status/{job_id}` - Check enrichment job status

### Diagnostics & Monitoring
- `GET /api/diagnostics/rotation-status` - Check API key rotation health and statistics
- `GET /api/diagnostics/test-rotation` - Test all configured API keys
- `GET /api/diagnostics/key-stats` - Detailed key performance metrics

## 🚨 Troubleshooting

### Common Issues

#### 1. "No API keys configured"
**Solution**: Add at least one API key to your environment variables
```env
SURFE_API_KEY_1=your_actual_api_key_here
```

#### 2. "All API keys exhausted"
**Symptoms**: All requests failing, rotation diagnostics show 0% success rate
**Solutions**:
- Wait for rate limits to reset (usually 1 hour)
- Add more API keys to your configuration
- Check if your keys are still valid

#### 3. Autocomplete not working
**Symptoms**: No suggestions when typing in search fields
**Solutions**:
- Check browser console for JavaScript errors
- Ensure `shared.js` is loading properly
- Verify internet connection

#### 4. Enrichment jobs stuck in "pending" or "running"
**Symptoms**: Jobs never complete or update status, stuck in processing
**Solutions**:
- Check API diagnostics page for key rotation health
- Verify API keys are working and not exhausted
- Look at server logs for detailed error messages
- Background tasks use key consistency (same key for creation and polling)
- Wait for longer periods as enrichment can take time

#### 5. Enrichment jobs fail with 404 errors
**Symptoms**: Job created successfully but status polling fails
**Solutions**:
- This is handled automatically by key consistency system
- Same API key used for job creation and status polling
- If persistent, check API diagnostics for key availability

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=True
```

This will provide detailed logs in the console for troubleshooting.

## 📊 Monitoring

### API Health Dashboard
Visit `/api/diagnostics/rotation-status` to see:
- Total API requests made
- Success rate per API key
- Available vs exhausted keys
- Recent error messages

### Key Rotation Status
The application automatically:
- Rotates between available API keys
- Disables keys that hit rate limits
- Re-enables keys after cooldown periods
- Provides real-time status updates

## 🔄 Deployment

### Live Application
The application is **already deployed** and accessible at:
**🌐 [https://surfe-api-project.vercel.app/](https://surfe-api-project.vercel.app/)**

### Vercel Deployment Configuration

The application is configured for Vercel with the following environment variables set:

```env
# In Vercel Environment Variables Dashboard
SURFE_API_KEY_1=your_primary_surfe_api_key
SURFE_API_KEY_2=your_second_surfe_api_key
SURFE_API_KEY_3=your_third_surfe_api_key
SURFE_API_KEY_4=your_fourth_surfe_api_key
SURFE_API_KEY_5=your_fifth_surfe_api_key
```

**For administrators**: API keys are managed in the Vercel dashboard under Environment Variables.

### Local Development
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Deploy Your Own Instance

If you want to deploy your own instance:

1. **Fork this repository**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your forked repository
3. **Set environment variables** in Vercel dashboard:
   - Add `SURFE_API_KEY_1` through `SURFE_API_KEY_5`
   - Set any additional configuration variables
4. **Deploy**: Vercel will automatically deploy your application

### Docker (Optional)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 API Reference

### Search Filters

#### Company Filters
- `industries`: Array of industry names
- `countries`: Array of country codes (ISO 2-letter)
- `employeeCount`: Object with `from` and `to` values
- `revenue`: Object with `from` and `to` values
- `domains`: Array of specific domains to include
- `domainsExcluded`: Array of domains to exclude

#### People Filters
- `countries`: Array of country codes
- `departments`: Array of department names
- `jobTitles`: Array of job title keywords
- `seniorities`: Array of seniority levels

### Response Formats

#### Company Search Response
```json
{
  "companies": [
    {
      "name": "Company Name",
      "domain": "company.com",
      "employeeCount": 150,
      "revenue": 5000000,
      "industries": ["Software", "SaaS"],
      "countries": ["US"]
    }
  ],
  "nextPageToken": "optional_pagination_token"
}
```

#### People Search Response
```json
{
  "people": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@company.com",
      "jobTitle": "CEO",
      "companyName": "Company Name",
      "linkedInUrl": "https://linkedin.com/in/johndoe"
    }
  ]
}
```

## 📋 Requirements

### System Requirements
- Python 3.8 or higher
- 1GB RAM minimum (2GB recommended)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Python Dependencies
```
fastapi>=0.104.0
uvicorn>=0.24.0
aiohttp>=3.9.0
python-multipart>=0.0.6
jinja2>=3.1.2
python-dotenv>=1.0.0
```

## ❓ FAQ

**Q: How many API keys do I need?**
A: Minimum 1, but 3-5 keys are recommended for better performance and reliability.

**Q: What happens if all my API keys hit rate limits?**
A: The application will show error messages and wait for keys to reset (usually 1 hour).

**Q: Can I use this for commercial purposes?**
A: Check the Surfe API terms of service for commercial usage guidelines.

**Q: How do I get Surfe API keys?**
A: Sign up at [Surfe's website](https://surfe.com) and follow their API documentation.

**Q: Is my data stored anywhere?**
A: The application only stores temporary job statuses in memory. All search and enrichment data comes directly from Surfe API and is not permanently stored.

**Q: How does the background processing work?**
A: Enrichment jobs are processed asynchronously. The system creates a job, polls for status every 3 seconds, and uses the same API key throughout to ensure consistency.

**Q: Why do I need multiple API keys?**
A: Multiple keys provide automatic fallback when individual keys hit rate limits, significantly improving reliability and throughput.

## 📞 Support

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Documentation**: Check the `/api/docs` endpoint for API documentation
- **Surfe API**: Visit [Surfe's documentation](https://docs.surfe.com) for API-specific questions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ for efficient company and people data enrichment**
