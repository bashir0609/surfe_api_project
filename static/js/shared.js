// shared.js - Common components and utilities for Surfe API project

// FIXED: Smart makeRequest function that handles both local backend and external Surfe API
async function makeRequest(endpoint, method = 'GET', data = null) {
    let url;

    // Determine if this should go to local backend or external Surfe API
    if (endpoint.startsWith('/api/')) {
        // FIXED: Use dynamic origin instead of hardcoded localhost
        const baseUrl = window.location.origin; // This works in both development and production
        url = `${baseUrl}${endpoint}`;
        console.log(`🏠 LOCAL: Making ${method} request to: ${url}`);
    } else if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
        // Full URLs (external APIs like Surfe)
        url = endpoint;
        console.log(`🌐 EXTERNAL: Making ${method} request to: ${url}`);
    } else {
        // Relative paths - assume external Surfe API for backward compatibility
        const surfeBaseUrl = 'https://api.surfe.com';
        url = `${surfeBaseUrl}${endpoint}`;
        console.log(`🌐 SURFE: Making ${method} request to: ${url}`);
    }

    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
        console.log(`📤 Request data:`, data);
    }

    try {
        const response = await fetch(url, options);
        console.log(`📥 Response status: ${response.status}`);

        // FIXED: Better error handling for non-JSON responses
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            // Handle non-JSON responses
            const text = await response.text();
            result = { 
                success: false, 
                detail: { error: `Non-JSON response: ${text.substring(0, 200)}...` },
                status_code: response.status
            };
        }
        
        console.log(`📦 Response data:`, result);

        return result;
    } catch (error) {
        console.error('🚨 Fetch error:', error);
        return { success: false, detail: { error: 'Network error or server is down.' } };
    }
}

function showLoading(elementId = 'loading-indicator') {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
    hideError();
}

function hideLoading(elementId = 'loading-indicator') {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

function showError(message, elementId = 'error-message') {
    const errorDiv = document.getElementById(elementId);
    const errorText = document.getElementById('error-text');

    if (errorDiv && errorText) {
        errorText.textContent = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
        errorDiv.classList.remove('hidden');
    } else {
        console.error('Error:', message);
        alert('Error: ' + (typeof message === 'string' ? message : JSON.stringify(message)));
    }
    hideLoading();
}

function hideError(elementId = 'error-message') {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}
// Complete list of Surfe industries with exact case from official API
const SURFE_INDUSTRIES = [
    "Call Center", "Collection Agency", "Courier Service", "Debt Collections", "Delivery", "Document Preparation", "Extermination Service", "Facilities Support Services", "Housekeeping Service", "Office Administration", "Packaging Services", "Physical Security", "Staffing Agency", "Trade Shows", "Virtual Workforce", "Ad Network", "Advertising", "Advertising Platforms", "Affiliate Marketing", "Mobile Advertising", "Outdoor Advertising", "SEM", "Social Media Advertising", "Video Advertising", "Agriculture", "AgTech", "Animal Feed", "Aquaculture", "Farming", "Forestry", "Horticulture", "Livestock", "Apps", "Enterprise Applications", "Mobile Apps", "Web Apps", "Artificial Intelligence", "Intelligent Systems", "Machine Learning", "Natural Language Processing", "Predictive Analytics", "Bioinformatics", "Biometrics", "Biopharma", "Biotechnology", "Genetics", "Life Science", "Neuroscience", "Fashion", "Laundry and Dry-cleaning", "Lingerie", "Shoes", "Auctions", "B2B", "B2C", "Commercial", "Consumer Reviews", "Consumer", "Coupons", "E-Commerce Platforms", "E-Commerce", "Gift Card", "Gift", "Handmade", "Local Business", "Local", "Marketplace", "Point of Sale", "Price Comparison", "Rental", "Retail Technology", "Retail", "Sharing Economy", "Shopping Mall", "Shopping", "Sporting Goods", "Subscription Service", "Wholesale", "Adult", "Association", "Baby", "Cannabis", "Charity", "Children", "Communities", "Dating", "Elderly", "Family", "Homeless Shelter", "Humanitarian", "Leisure", "Lifestyle", "Men's", "Non Profit", "Parenting", "Pet", "Professional Networking", "Religion", "Retirement", "Social Entrepreneurship", "Social Impact", "Social", "Underserved Children", "Wedding", "Women's", "Young Adults", "Computer", "Consumer Electronics", "Drones", "Electronics", "Mobile Devices", "Smart Home", "Wearables", "Beauty", "Comics", "Consumer Goods", "Cosmetics", "Drones", "Eyewear", "Fast-Moving Consumer Goods", "Flowers", "Furniture", "Jewelry", "Lingerie", "Shoes", "Tobacco", "Toys", "Blogging Platforms", "Content Delivery Network", "Creative Agency", "EBooks", "Journalism", "News", "Photo Editing", "Photo Sharing", "Photography", "Printing", "Publishing", "Video Editing", "Video Streaming", "Analytics", "Application Performance Management", "Artificial Intelligence", "Big Data", "Bioinformatics", "Biometrics", "Blockchain", "Business Intelligence", "Consumer Research", "Data Integration", "Data Mining", "Data Visualization", "Database", "Ethereum", "Geospatial", "Image Recognition", "Intelligent Systems", "Location Based Services", "Machine Learning", "Market Research", "Natural Language Processing", "Predictive Analytics", "Product Research", "Real Time", "Speech Recognition", "Test and Measurement", "Text Analytics", "Usability Testing", "CAD", "Consumer Research", "Data Visualization", "Fashion", "Graphic Design", "Human Computer Interaction", "Industrial Design", "Interior Design", "Market Research", "Mechanical Design", "Product Design", "Product Research", "Usability Testing", "UX Design", "Web Design", "Charter Schools", "Continuing Education", "Corporate Training", "E-Learning", "EdTech", "Education", "Edutainment", "Higher Education", "Language Learning", "Music Education", "Personal Development", "Primary Education", "Secondary Education", "Skill Assessment", "STEM Education", "Training", "Tutoring", "Universities", "Vocational Education", "Battery", "Biofuel", "Biomass Energy", "Clean Energy", "Electrical Distribution", "Energy", "Energy Efficiency", "Energy Management", "Energy Storage", "Fuel", "Oil and Gas", "Power Grid", "Renewable Energy", "Solar", "Wind Energy", "Concerts", "Event Management", "Event Promotion", "Events", "Reservations", "Ticketing", "Wedding", "Accounting", "Angel Investment", "Asset Management", "Auto Insurance", "Banking", "Bitcoin", "Commercial Insurance", "Commercial Lending", "Consumer Lending", "Credit", "Credit Bureau", "Credit Cards", "Crowdfunding", "Cryptocurrency", "Debit Cards", "Debt Collections", "Finance", "Financial Exchanges", "Financial Services", "FinTech", "Fraud Detection", "Funding Platform", "Gift Card", "Health Insurance", "Hedge Funds", "Impact Investing", "Incubators", "Insurance", "InsurTech", "Leasing", "Lending", "Life Insurance", "Mobile Payments", "Payments", "Personal Finance", "Property Insurance", "Real Estate Investment", "Stock Exchanges", "Trading Platform", "Transaction Processing", "Venture Capital", "Virtual Currency", "Wealth Management", "Bakery", "Brewing", "Cannabis", "Catering", "Coffee", "Confectionery", "Cooking", "Craft Beer", "Dietary Supplements", "Distillery", "Farmers Market", "Food and Beverage", "Food Delivery", "Food Processing", "Food Trucks", "Fruit", "Grocery", "Nutrition", "Organic Food", "Recipes", "Restaurants", "Seafood", "Snack Food", "Tea", "Tobacco", "Wine And Spirits", "Winery", "Casual Games", "Console Games", "Fantasy Sports", "Gambling", "Gamification", "Gaming", "Online Games", "PC Games", "Serious Games", "Video Games", "eSports", "Government", "GovTech", "Law Enforcement", "Military", "National Security", "Politics", "Public Safety", "Social Assistance", "3D Technology", "Augmented Reality", "Cloud Infrastructure", "Communication Hardware", "Communications Infrastructure", "Computer", "Computer Vision", "Consumer Electronics", "Data Center", "Data Center Automation", "Data Storage", "Drone Management", "Drones", "Electronic Design Automation (EDA)", "Electronics", "Embedded Systems", "GPS", "Hardware", "Industrial Design", "Laser", "Lighting", "Mechanical Design", "Mobile Devices", "Network Hardware", "Optical Communication", "Private Cloud", "Retail Technology", "Robotics", "Satellite Communication", "Semiconductor", "Sensor", "Telecommunications", "Video Conferencing", "Virtual Reality", "Virtualization", "Wearables", "Wireless", "Alternative Medicine", "Assisted Living", "Biopharma", "Cannabis", "Child Care", "Clinical Trials", "Cosmetic Surgery", "Dental", "Diabetes", "Dietary Supplements", "Elder Care", "Electronic Health Record (EHR)", "Emergency Medicine", "Employee Benefits", "Fertility", "First Aid", "Funerals", "Genetics", "Health Care", "Health Diagnostics", "Home Health Care", "Hospital", "Medical", "Medical Device", "mHealth", "Nursing and Residential Care", "Nutrition", "Outpatient Care", "Personal Health", "Pharmaceutical", "Psychology", "Rehabilitation", "Therapeutics", "Veterinary", "Wellness", "Business Information Systems", "Cloud Data Services", "Cloud Management", "Cloud Security", "CMS", "Contact Management", "CRM", "Cyber Security", "Data Center", "Data Center Automation", "Data Integration", "Data Mining", "Data Visualization", "Document Management", "Email", "GovTech", "Identity Management", "Information and Communications Technology (ICT)", "Information Services", "Information Technology", "IT Infrastructure", "IT Management", "Management Information Systems", "Messaging", "Military", "Network Security", "Penetration Testing", "Private Cloud", "Reputation", "Sales Automation", "Scheduling", "Unified Communications", "Video Chat", "Video Conferencing", "Virtualization", "VoIP", "Cloud Computing", "Cloud Data Services", "Cloud Infrastructure", "Cloud Management", "Cloud Storage", "Domain Registrar", "E-Commerce Platforms", "Email", "Internet", "Internet of Things", "ISP", "Location Based Services", "Messaging", "Music Streaming", "Online Portals", "Private Cloud", "Search Engine", "SEM", "Semantic Search", "SEO", "SMS", "Social Media", "Social Media Management", "Social Network", "Unified Communications", "Video Chat", "Video Conferencing", "VoIP", "Web Hosting", "Angel Investment", "Banking", "Commercial Lending", "Consumer Lending", "Credit", "Credit Cards", "Financial Exchanges", "Funding Platform", "Hedge Funds", "Impact Investing", "Incubators", "Stock Exchanges", "Trading Platform", "Venture Capital", "3D Printing", "Advanced Materials", "Foundries", "Industrial Automation", "Industrial Engineering", "Industrial Manufacturing", "Industrial", "Infrastructure", "Machinery Manufacturing", "Manufacturing", "Paper Manufacturing", "Plastics and Rubber Manufacturing", "Textiles", "Wood Processing", "Animation", "Art", "Audio", "Audiobooks", "Blogging Platforms", "Broadcasting", "Concerts", "Content", "Content Creators", "Creative Agency", "Digital Entertainment", "Digital Media", "EBooks", "Edutainment", "Event Management", "Event Promotion", "Events", "Film", "Film Distribution", "Film Production", "Guides", "Independent Music", "Internet Radio", "Journalism", "Media and Entertainment", "Motion Capture", "Music", "Music Education", "Music Label", "Music Streaming", "Music Venues", "Musical Instruments", "News", "Performing Arts", "Photo Editing", "Photo Sharing", "Photography", "Podcast", "Printing", "Publishing", "Reservations", "Social Media", "Social News", "Theatre", "Ticketing", "TV", "TV Production", "Video", "Video Editing", "Video on Demand", "Video Streaming", "Email", "Meeting Software", "Messaging", "SMS", "Unified Communications", "Video Chat", "Video Conferencing", "VoIP", "Wired Telecommunications", "Android", "iOS", "mHealth", "Mobile", "Mobile Apps", "Mobile Devices", "Mobile Payments", "Wireless", "Audio", "Audiobooks", "Independent Music", "Internet Radio", "Music", "Music Education", "Music Label", "Music Streaming", "Musical Instruments", "Podcast", "Biofuel", "Biomass Energy", "Mineral", "Mining", "Mining Technology", "Natural Resources", "Oil and Gas", "Precious Metals", "Solar", "Timber", "Water", "Wind Energy", "Geospatial", "GPS", "Location Based Services", "Mapping Services", "Navigation", "Billing", "Bitcoin", "Credit Cards", "Cryptocurrency", "Debit Cards", "Fraud Detection", "Mobile Payments", "Payments", "Transaction Processing", "Virtual Currency", "Android", "iOS", "Windows", "Cloud Security", "Cyber Security", "Fraud Detection", "Homeland Security", "Identity Management", "Law Enforcement", "Network Security", "Penetration Testing", "Physical Security", "Privacy", "Security", "Accounting", "Advice", "Business Development", "Career Planning", "Collaboration", "Compliance", "Consulting", "Customer Service", "Employment", "Enterprise", "Environmental Consulting", "Field Support", "Freelance", "Human Resources", "Innovation Management", "Intellectual Property", "Knowledge Management", "Legal Tech", "Legal", "Management Consulting", "Outsourcing", "Personalization", "Product Management", "Professional Networking", "Professional Services", "Project Management", "Quality Assurance", "Recruiting", "Risk Management", "Service Industry", "Small and Medium Businesses", "Social Recruiting", "Technical Support", "Translation Service", "Architecture", "Building Maintenance", "Building Material", "Commercial Real Estate", "Construction", "Coworking", "Facility Management", "Fast-Moving Consumer Goods", "Green Building", "Home and Garden", "Home Decor", "Home Improvement", "Home Renovation", "Home Services", "Interior Design", "Janitorial Service", "Landscaping", "Property Development", "Property Management", "Real Estate Investment", "Real Estate", "Rental Property", "Residential", "Self-Storage", "Smart Building", "Smart Cities", "Smart Home", "Vacation Rental", "Advertising", "Affiliate Marketing", "App Marketing", "Brand Marketing", "Content Marketing", "CRM", "Digital Marketing", "Digital Signage", "Direct Marketing", "Direct Sales", "Email Marketing", "Lead Generation", "Lead Management", "Loyalty Programs", "Marketing", "Marketing Automation", "Mobile Advertising", "Outdoor Advertising", "Personal Branding", "Public Relations", "Sales", "Sales Automation", "SEM", "SEO", "Social Media Advertising", "Social Media Management", "Social Media Marketing", "Video Advertising", "Advanced Materials", "Aerospace", "Artificial Intelligence", "Bioinformatics", "Biometrics", "Biopharma", "Biotechnology", "Chemical", "Chemical Engineering", "Civil Engineering", "Embedded Systems", "Environmental Engineering", "Human Computer Interaction", "Industrial Automation", "Industrial Engineering", "Intelligent Systems", "Laser", "Life Science", "Marine Technology", "Mechanical Engineering", "Nanotechnology", "Neuroscience", "Nuclear", "Quantum Computing", "Robotics", "Semiconductor", "Software Engineering", "STEM Education", "3D Technology", "Android", "Application Performance Management", "Apps", "Artificial Intelligence", "Augmented Reality", "Billing", "Bitcoin", "CAD", "Cloud Computing", "Cloud Management", "CMS", "Computer Vision", "Consumer Software", "Contact Management", "CRM", "Cryptocurrency", "Data Center Automation", "Data Integration", "Data Storage", "Data Visualization", "Database", "Developer APIs", "Developer Platform", "Developer Tools", "Document Management", "Drone Management", "E-Learning", "EdTech", "Electronic Design Automation (EDA)", "Embedded Systems", "Enterprise Applications", "Enterprise Resource Planning (ERP)", "Enterprise Software", "File Sharing", "IaaS", "Image Recognition", "iOS", "Machine Learning", "Marketing Automation", "Meeting Software", "Mobile Apps", "Mobile Payments", "Natural Language Processing", "Open Source", "PaaS", "Predictive Analytics", "Private Cloud", "Productivity Tools", "Retail Technology", "Robotics", "SaaS", "Sales Automation", "Scheduling", "Simulation", "Software", "Software Engineering", "Speech Recognition", "Task Management", "Text Analytics", "Transaction Processing", "Video Conferencing", "Virtual Assistant", "Virtual Currency", "Virtual Reality", "Virtualization", "Web Apps", "Web Development", "American Football", "Baseball", "Basketball", "Boating", "Cycling", "Diving", "eSports", "Fantasy Sports", "Fitness", "Golf", "Hockey", "Hunting", "Outdoors", "Racing", "Recreation", "Sailing", "Skiing", "Soccer", "Sporting Goods", "Sports", "Surfing", "Swimming", "Tennis", "Biofuel", "Biomass Energy", "Clean Energy", "CleanTech", "Energy Efficiency", "Environmental Engineering", "Green Building", "GreenTech", "Natural Resources", "Organic", "Pollution Control", "Recycling", "Renewable Energy", "Solar", "Sustainability", "Waste Management", "Water Purification", "Wind Energy", "Air Transportation", "Automotive", "Autonomous Vehicles", "Car Sharing", "Courier Service", "Delivery Service", "Electric Vehicle", "Fleet Management", "Food Delivery", "Freight Service", "Last Mile Transportation", "Limousine Service", "Logistics", "Marine Transportation", "Parking", "Ports and Harbors", "Procurement", "Public Transportation", "Railroad", "Recreational Vehicles", "Ride Sharing", "Same Day Delivery", "Shipping", "Space Travel", "Supply Chain Management", "Taxi Service", "Transportation", "Warehousing", "Water Transportation", "Adventure Travel", "Amusement Park and Arcade", "Business Travel", "Casino", "Hospitality", "Hotel", "Museums and Historical Sites", "Parks", "Resorts", "Tour Operator", "Tourism", "Travel", "Travel Accommodations", "Travel Agency", "Vacation Rental", "Animation", "Broadcasting", "Film", "Film Distribution", "Film Production", "Motion Capture", "TV", "TV Production", "Video", "Video Editing", "Video on Demand", "Video Streaming"
];

// Country list with ISO codes, names, and flags
const COUNTRIES = [
    { "Name": "Afghanistan", "Code": "AF" }, { "Name": "Albania", "Code": "AL" }, { "Name": "Algeria", "Code": "DZ" }, { "Name": "American Samoa", "Code": "AS" }, { "Name": "Andorra", "Code": "AD" }, { "Name": "Angola", "Code": "AO" }, { "Name": "Anguilla", "Code": "AI" }, { "Name": "Antarctica", "Code": "AQ" }, { "Name": "Antigua and Barbuda", "Code": "AG" }, { "Name": "Argentina", "Code": "AR" }, { "Name": "Armenia", "Code": "AM" }, { "Name": "Aruba", "Code": "AW" }, { "Name": "Australia", "Code": "AU" }, { "Name": "Austria", "Code": "AT" }, { "Name": "Azerbaijan", "Code": "AZ" }, { "Name": "Bahamas", "Code": "BS" }, { "Name": "Bahrain", "Code": "BH" }, { "Name": "Bangladesh", "Code": "BD" }, { "Name": "Barbados", "Code": "BB" }, { "Name": "Belarus", "Code": "BY" }, { "Name": "Belgium", "Code": "BE" }, { "Name": "Belize", "Code": "BZ" }, { "Name": "Benin", "Code": "BJ" }, { "Name": "Bermuda", "Code": "BM" }, { "Name": "Bhutan", "Code": "BT" }, { "Name": "Bolivia, Plurinational State of", "Code": "BO" }, { "Name": "Bonaire, Sint Eustatius and Saba", "Code": "BQ" }, { "Name": "Bosnia and Herzegovina", "Code": "BA" }, { "Name": "Botswana", "Code": "BW" }, { "Name": "Bouvet Island", "Code": "BV" }, { "Name": "Brazil", "Code": "BR" }, { "Name": "British Indian Ocean Territory", "Code": "IO" }, { "Name": "Brunei Darussalam", "Code": "BN" }, { "Name": "Bulgaria", "Code": "BG" }, { "Name": "Burkina Faso", "Code": "BF" }, { "Name": "Burundi", "Code": "BI" }, { "Name": "Cambodia", "Code": "KH" }, { "Name": "Cameroon", "Code": "CM" }, { "Name": "Canada", "Code": "CA" }, { "Name": "Cape Verde", "Code": "CV" }, { "Name": "Cayman Islands", "Code": "KY" }, { "Name": "Central African Republic", "Code": "CF" }, { "Name": "Chad", "Code": "TD" }, { "Name": "Chile", "Code": "CL" }, { "Name": "China", "Code": "CN" }, { "Name": "Christmas Island", "Code": "CX" }, { "Name": "Cocos (Keeling) Islands", "Code": "CC" }, { "Name": "Colombia", "Code": "CO" }, { "Name": "Comoros", "Code": "KM" }, { "Name": "Congo", "Code": "CG" }, { "Name": "Congo, the Democratic Republic of the", "Code": "CD" }, { "Name": "Cook Islands", "Code": "CK" }, { "Name": "Costa Rica", "Code": "CR" }, { "Name": "Croatia", "Code": "HR" }, { "Name": "Cuba", "Code": "CU" }, { "Name": "Curaçao", "Code": "CW" }, { "Name": "Cyprus", "Code": "CY" }, { "Name": "Czech Republic", "Code": "CZ" }, { "Name": "Côte d'Ivoire", "Code": "CI" }, { "Name": "Denmark", "Code": "DK" }, { "Name": "Djibouti", "Code": "DJ" }, { "Name": "Dominica", "Code": "DM" }, { "Name": "Dominican Republic", "Code": "DO" }, { "Name": "Ecuador", "Code": "EC" }, { "Name": "Egypt", "Code": "EG" }, { "Name": "El Salvador", "Code": "SV" }, { "Name": "Equatorial Guinea", "Code": "GQ" }, { "Name": "Eritrea", "Code": "ER" }, { "Name": "Estonia", "Code": "EE" }, { "Name": "Eswatini", "Code": "SZ" }, { "Name": "Ethiopia", "Code": "ET" }, { "Name": "Falkland Islands (Malvinas)", "Code": "FK" }, { "Name": "Faroe Islands", "Code": "FO" }, { "Name": "Fiji", "Code": "FJ" }, { "Name": "Finland", "Code": "FI" }, { "Name": "France", "Code": "FR" }, { "Name": "French Guiana", "Code": "GF" }, { "Name": "French Polynesia", "Code": "PF" }, { "Name": "French Southern Territories", "Code": "TF" }, { "Name": "Gabon", "Code": "GA" }, { "Name": "Gambia", "Code": "GM" }, { "Name": "Georgia", "Code": "GE" }, { "Name": "Germany", "Code": "DE" }, { "Name": "Ghana", "Code": "GH" }, { "Name": "Gibraltar", "Code": "GI" }, { "Name": "Greece", "Code": "GR" }, { "Name": "Greenland", "Code": "GL" }, { "Name": "Grenada", "Code": "GD" }, { "Name": "Guadeloupe", "Code": "GP" }, { "Name": "Guam", "Code": "GU" }, { "Name": "Guatemala", "Code": "GT" }, { "Name": "Guernsey", "Code": "GG" }, { "Name": "Guinea", "Code": "GN" }, { "Name": "Guinea-Bissau", "Code": "GW" }, { "Name": "Guyana", "Code": "GY" }, { "Name": "Haiti", "Code": "HT" }, { "Name": "Heard Island and McDonald Islands", "Code": "HM" }, { "Name": "Holy See (Vatican City State)", "Code": "VA" }, { "Name": "Honduras", "Code": "HN" }, { "Name": "Hong Kong", "Code": "HK" }, { "Name": "Hungary", "Code": "HU" }, { "Name": "Iceland", "Code": "IS" }, { "Name": "India", "Code": "IN" }, { "Name": "Indonesia", "Code": "ID" }, { "Name": "Iran, Islamic Republic of", "Code": "IR" }, { "Name": "Iraq", "Code": "IQ" }, { "Name": "Ireland", "Code": "IE" }, { "Name": "Isle of Man", "Code": "IM" }, { "Name": "Israel", "Code": "IL" }, { "Name": "Italy", "Code": "IT" }, { "Name": "Jamaica", "Code": "JM" }, { "Name": "Japan", "Code": "JP" }, { "Name": "Jersey", "Code": "JE" }, { "Name": "Jordan", "Code": "JO" }, { "Name": "Kazakhstan", "Code": "KZ" }, { "Name": "Kenya", "Code": "KE" }, { "Name": "Kiribati", "Code": "KI" }, { "Name": "Korea, Democratic People's Republic of", "Code": "KP" }, { "Name": "Korea, Republic of", "Code": "KR" }, { "Name": "Kuwait", "Code": "KW" }, { "Name": "Kyrgyzstan", "Code": "KG" }, { "Name": "Lao People's Democratic Republic", "Code": "LA" }, { "Name": "Latvia", "Code": "LV" }, { "Name": "Lebanon", "Code": "LB" }, { "Name": "Lesotho", "Code": "LS" }, { "Name": "Liberia", "Code": "LR" }, { "Name": "Libya", "Code": "LY" }, { "Name": "Liechtenstein", "Code": "LI" }, { "Name": "Lithuania", "Code": "LT" }, { "Name": "Luxembourg", "Code": "LU" }, { "Name": "Macao", "Code": "MO" }, { "Name": "Macedonia, the Former Yugoslav Republic of", "Code": "MK" }, { "Name": "Madagascar", "Code": "MG" }, { "Name": "Malawi", "Code": "MW" }, { "Name": "Malaysia", "Code": "MY" }, { "Name": "Maldives", "Code": "MV" }, { "Name": "Mali", "Code": "ML" }, { "Name": "Malta", "Code": "MT" }, { "Name": "Marshall Islands", "Code": "MH" }, { "Name": "Martinique", "Code": "MQ" }, { "Name": "Mauritania", "Code": "MR" }, { "Name": "Mauritius", "Code": "MU" }, { "Name": "Mayotte", "Code": "YT" }, { "Name": "Mexico", "Code": "MX" }, { "Name": "Micronesia, Federated States of", "Code": "FM" }, { "Name": "Moldova, Republic of", "Code": "MD" }, { "Name": "Monaco", "Code": "MC" }, { "Name": "Mongolia", "Code": "MN" }, { "Name": "Montenegro", "Code": "ME" }, { "Name": "Montserrat", "Code": "MS" }, { "Name": "Morocco", "Code": "MA" }, { "Name": "Mozambique", "Code": "MZ" }, { "Name": "Myanmar", "Code": "MM" }, { "Name": "Namibia", "Code": "NA" }, { "Name": "Nauru", "Code": "NR" }, { "Name": "Nepal", "Code": "NP" }, { "Name": "Netherlands", "Code": "NL" }, { "Name": "New Caledonia", "Code": "NC" }, { "Name": "New Zealand", "Code": "NZ" }, { "Name": "Nicaragua", "Code": "NI" }, { "Name": "Niger", "Code": "NE" }, { "Name": "Nigeria", "Code": "NG" }, { "Name": "Niue", "Code": "NU" }, { "Name": "Norfolk Island", "Code": "NF" }, { "Name": "Northern Mariana Islands", "Code": "MP" }, { "Name": "Norway", "Code": "NO" }, { "Name": "Oman", "Code": "OM" }, { "Name": "Pakistan", "Code": "PK" }, { "Name": "Palau", "Code": "PW" }, { "Name": "Palestine, State of", "Code": "PS" }, { "Name": "Panama", "Code": "PA" }, { "Name": "Papua New Guinea", "Code": "PG" }, { "Name": "Paraguay", "Code": "PY" }, { "Name": "Peru", "Code": "PE" }, { "Name": "Philippines", "Code": "PH" }, { "Name": "Pitcairn", "Code": "PN" }, { "Name": "Poland", "Code": "PL" }, { "Name": "Portugal", "Code": "PT" }, { "Name": "Puerto Rico", "Code": "PR" }, { "Name": "Qatar", "Code": "QA" }, { "Name": "Romania", "Code": "RO" }, { "Name": "Russian Federation", "Code": "RU" }, { "Name": "Rwanda", "Code": "RW" }, { "Name": "Réunion", "Code": "RE" }, { "Name": "Saint Barthélemy", "Code": "BL" }, { "Name": "Saint Helena, Ascension and Tristan da Cunha", "Code": "SH" }, { "Name": "Saint Kitts and Nevis", "Code": "KN" }, { "Name": "Saint Lucia", "Code": "LC" }, { "Name": "Saint Martin (French part)", "Code": "MF" }, { "Name": "Saint Pierre and Miquelon", "Code": "PM" }, { "Name": "Saint Vincent and the Grenadines", "Code": "VC" }, { "Name": "Samoa", "Code": "WS" }, { "Name": "San Marino", "Code": "SM" }, { "Name": "Sao Tome and Principe", "Code": "ST" }, { "Name": "Saudi Arabia", "Code": "SA" }, { "Name": "Senegal", "Code": "SN" }, { "Name": "Serbia", "Code": "RS" }, { "Name": "Seychelles", "Code": "SC" }, { "Name": "Sierra Leone", "Code": "SL" }, { "Name": "Singapore", "Code": "SG" }, { "Name": "Sint Maarten (Dutch part)", "Code": "SX" }, { "Name": "Slovakia", "Code": "SK" }, { "Name": "Slovenia", "Code": "SI" }, { "Name": "Solomon Islands", "Code": "SB" }, { "Name": "Somalia", "Code": "SO" }, { "Name": "South Africa", "Code": "ZA" }, { "Name": "South Georgia and the South Sandwich Islands", "Code": "GS" }, { "Name": "South Sudan", "Code": "SS" }, { "Name": "Spain", "Code": "ES" }, { "Name": "Sri Lanka", "Code": "LK" }, { "Name": "Sudan", "Code": "SD" }, { "Name": "Suriname", "Code": "SR" }, { "Name": "Svalbard and Jan Mayen", "Code": "SJ" }, { "Name": "Sweden", "Code": "SE" }, { "Name": "Switzerland", "Code": "CH" }, { "Name": "Syrian Arab Republic", "Code": "SY" }, { "Name": "Taiwan, Province of China", "Code": "TW" }, { "Name": "Tajikistan", "Code": "TJ" }, { "Name": "Tanzania, United Republic of", "Code": "TZ" }, { "Name": "Thailand", "Code": "TH" }, { "Name": "Timor-Leste", "Code": "TL" }, { "Name": "Togo", "Code": "TG" }, { "Name": "Tokelau", "Code": "TK" }, { "Name": "Tonga", "Code": "TO" }, { "Name": "Trinidad and Tobago", "Code": "TT" }, { "Name": "Tunisia", "Code": "TN" }, { "Name": "Turkey", "Code": "TR" }, { "Name": "Turkmenistan", "Code": "TM" }, { "Name": "Turks and Caicos Islands", "Code": "TC" }, { "Name": "Tuvalu", "Code": "TV" }, { "Name": "Uganda", "Code": "UG" }, { "Name": "Ukraine", "Code": "UA" }, { "Name": "United Arab Emirates", "Code": "AE" }, { "Name": "United Kingdom", "Code": "GB" }, { "Name": "United States", "Code": "US" }, { "Name": "United States Minor Outlying Islands", "Code": "UM" }, { "Name": "Uruguay", "Code": "UY" }, { "Name": "Uzbekistan", "Code": "UZ" }, { "Name": "Vanuatu", "Code": "VU" }, { "Name": "Venezuela, Bolivarian Republic of", "Code": "VE" }, { "Name": "Viet Nam", "Code": "VN" }, { "Name": "Virgin Islands, British", "Code": "VG" }, { "Name": "Virgin Islands, U.S.", "Code": "VI" }, { "Name": "Wallis and Futuna", "Code": "WF" }, { "Name": "Western Sahara", "Code": "EH" }, { "Name": "Yemen", "Code": "YE" }, { "Name": "Zambia", "Code": "ZM" }, { "Name": "Zimbabwe", "Code": "ZW" }, { "Name": "Åland Islands", "Code": "AX" }
];

// Popular industries for quick access (subset of SURFE_INDUSTRIES)
const POPULAR_INDUSTRIES = [
    "Software", "SaaS", "FinTech", "E-Commerce", "Health Care", "Education", "Marketing",
    "Consulting", "Banking", "Manufacturing", "Retail", "Gaming", "Artificial Intelligence",
    "Machine Learning", "Cloud Computing", "Cyber Security", "Mobile Apps", "Enterprise Software",
    "Payments", "Cryptocurrency", "Insurance", "CRM", "Accounting", "Fashion", "Food and Beverage",
    "Beauty", "Electronics", "Furniture", "Marketplace", "Digital Marketing", "Biotechnology",
    "Real Estate", "Transportation", "Media and Entertainment", "Logistics", "Agriculture",
    "Music", "Internet", "Mobile", "Analytics", "Big Data", "Blockchain", "Video Streaming"
];

const SURFE_DEPARTMENTS = [
    "Accounting and Finance", "Board", "Business Support", "Customer Relations", "Design", "Editorial Personnel", "Engineering", "Founder/Owner", "Healthcare", "HR", "Legal", "Management", "Manufacturing", "Marketing and Advertising", "Operations", "Other", "PR and Communications", "Procurement", "Product", "Quality Control", "R&D", "Sales", "Security", "Supply Chain"
];

const SURFE_SENIORITIES = [
    "Board Member","C-Level","Director","Founder","Head","Manager","Other","Owner","Partner","VP"
];

// Helper functions for searching
function searchIndustries(query, limit = 10) {
    if (!query.trim()) return [];

    return SURFE_INDUSTRIES.filter(industry =>
        industry.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);
}

function searchCountries(query, limit = 10) {
    if (!query.trim()) return [];

    return COUNTRIES.filter(country =>
        country.Name.toLowerCase().includes(query.toLowerCase()) ||
        country.Code.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);
}

function searchDepartments(query, limit = 10) {
    if (!query.trim()) return [];

    return SURFE_DEPARTMENTS.filter(industry =>
        industry.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);
}

function searchSeniorities(query, limit = 10) {
    if (!query.trim()) return [];

    return SURFE_SENIORITIES.filter(industry =>
        industry.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);
}

// Universal autocomplete setup function
function setupAutocomplete(inputElement, dataArray, searchFunction, isCountryAutocomplete = false) {
    let currentFocus = -1;
    let autocompleteList = null;
    
    // Ensure parent container has relative positioning
    if (!inputElement.parentNode.classList.contains('autocomplete-container')) {
        inputElement.parentNode.classList.add('autocomplete-container');
    }
    
    inputElement.addEventListener('input', function() {
        const val = this.value.split(',').pop().trim();
        closeAllLists();
        
        if (!val) return false;
        
        const matches = searchFunction(val, 10);
        if (matches.length === 0) return false;
        
        // Create dropdown
        autocompleteList = document.createElement('div');
        autocompleteList.setAttribute('id', this.id + '-autocomplete-list');
        autocompleteList.className = 'autocomplete-dropdown';
        
        this.parentNode.appendChild(autocompleteList);
        
        matches.forEach((match, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'autocomplete-item';
            
            if (isCountryAutocomplete) {
                itemDiv.innerHTML = `${match.Name} (${match.Code})`;
            } else {
                itemDiv.innerHTML = match;
            }
            
            itemDiv.addEventListener('click', function() {
                const currentValue = inputElement.value;
                const parts = currentValue.split(',');
                if (isCountryAutocomplete) {
                    parts[parts.length - 1] = ' ' + match.Code;
                } else {
                    parts[parts.length - 1] = ' ' + match;
                }
                inputElement.value = parts.join(',');
                closeAllLists();
                inputElement.focus();
            });
            
            autocompleteList.appendChild(itemDiv);
        });
    });
    
    inputElement.addEventListener('keydown', function(e) {
        if (!autocompleteList) return;
        const items = autocompleteList.getElementsByClassName('autocomplete-item');
        
        if (e.keyCode === 40) { // Down arrow
            e.preventDefault();
            currentFocus++;
            setActive(items);
        } else if (e.keyCode === 38) { // Up arrow
            e.preventDefault();
            currentFocus--;
            setActive(items);
        } else if (e.keyCode === 13) { // Enter
            e.preventDefault();
            if (currentFocus > -1 && items[currentFocus]) {
                items[currentFocus].click();
            }
        } else if (e.keyCode === 27) { // Escape
            closeAllLists();
        }
    });
    
    function setActive(items) {
        if (!items) return false;
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        if (items[currentFocus]) {
            items[currentFocus].classList.add('autocomplete-active');
        }
    }
    
    function removeActive(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('autocomplete-active');
        }
    }
    
    function closeAllLists() {
        const lists = document.getElementsByClassName('autocomplete-dropdown');
        for (let i = lists.length - 1; i >= 0; i--) {
            if (lists[i].parentNode) {
                lists[i].parentNode.removeChild(lists[i]);
            }
        }
        autocompleteList = null;
        currentFocus = -1;
    }
    
    // Close on click outside
    document.addEventListener('click', function(e) {
        if (!inputElement.contains(e.target) && (!autocompleteList || !autocompleteList.contains(e.target))) {
            closeAllLists();
        }
    });
}

// Universal autocomplete initializer that works for any page
function initializeAutocompleteForPage(pageType = 'auto') {
    console.log(`🔧 Initializing autocomplete for page type: ${pageType}`);
    
    // Define all possible autocomplete configurations
    const autocompleteConfigs = [
        // Company fields
        {
            inputId: 'industries',
            dataArray: SURFE_INDUSTRIES,
            searchFunction: searchIndustries,
            isCountry: false,
            name: 'Company Industries'
        },
        {
            inputId: 'company-countries',
            dataArray: COUNTRIES,
            searchFunction: searchCountries,
            isCountry: true,
            name: 'Company Countries'
        },
        {
            inputId: 'countries',
            dataArray: COUNTRIES,
            searchFunction: searchCountries,
            isCountry: true,
            name: 'Countries'
        },
        
        // People fields
        {
            inputId: 'people-countries',
            dataArray: COUNTRIES,
            searchFunction: searchCountries,
            isCountry: true,
            name: 'People Countries'
        },
        {
            inputId: 'people-departments',
            dataArray: SURFE_DEPARTMENTS,
            searchFunction: searchDepartments,
            isCountry: false,
            name: 'People Departments'
        },
        {
            inputId: 'people-seniorities',
            dataArray: SURFE_SENIORITIES,
            searchFunction: searchSeniorities,
            isCountry: false,
            name: 'People Seniorities'
        }
    ];
    
    let initializedCount = 0;
    
    autocompleteConfigs.forEach(config => {
        const input = document.getElementById(config.inputId);
        if (input && config.dataArray && config.searchFunction) {
            setupAutocomplete(input, config.dataArray, config.searchFunction, config.isCountry);
            console.log(`✅ ${config.name} autocomplete initialized`);
            initializedCount++;
        }
    });
    
    console.log(`🎉 Initialized ${initializedCount} autocomplete fields for ${pageType} page`);
}

// Revenue range presets
const REVENUE_PRESETS = [
    { label: "$1M - $10M", min: 1000000, max: 10000000 },
    { label: "$10M - $100M", min: 10000000, max: 100000000 },
    { label: "$100M - $1B", min: 100000000, max: 1000000000 },
    { label: "$1B+", min: 1000000000, max: 999999999999999 }
];

// Employee count presets
const EMPLOYEE_PRESETS = [
    { label: "Startup (1-50)", min: 1, max: 50 },
    { label: "Small (51-200)", min: 51, max: 200 },
    { label: "Medium (201-1K)", min: 201, max: 1000 },
    { label: "Large (1K-10K)", min: 1001, max: 10000 },
    { label: "Enterprise (10K+)", min: 10001, max: 999999999999999 }
];

// // Export for use in other files (if using modules)
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = {
//         SURFE_INDUSTRIES,
//         COUNTRIES,
//         POPULAR_INDUSTRIES,
//         REVENUE_PRESETS,
//         EMPLOYEE_PRESETS,
//         searchIndustries,
//         searchCountries
//     };
// };
// shared.js - Common components and utilities

// Create sidebar component
function createSidebar() {
    const currentPath = window.location.pathname;

    return `
        <aside class="w-64 bg-white text-gray-800 flex flex-col flex-shrink-0 border-r border-gray-200">
            <div class="p-5 border-b border-gray-200">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-xl font-bold tracking-tight text-gray-900">Surfe API</span>
                </a>
            </div>
            
            <nav class="mt-4 flex-1 px-2 space-y-1">
                <a href="/" class="nav-link ${currentPath === '/' ? 'active' : ''}">
                    <span>📊 Dashboard</span>
                </a>
                
                <div class="pt-4">
                    <h2 class="nav-section-title">Company</h2>
                    <a href="/pages/company_search" class="nav-link ${currentPath.includes('company_search') ? 'active' : ''}">
                        <span>🔍 Company Search</span>
                    </a>
                    <a href="/pages/company_lookalikes" class="nav-link ${currentPath.includes('company_lookalikes') ? 'active' : ''}">
                        <span>🎯 Company Lookalikes</span>
                    </a>
                    <a href="/pages/company_enrichment" class="nav-link ${currentPath.includes('company_enrichment') ? 'active' : ''}">
                        <span>📈 Company Enrichment</span>
                    </a>
                </div>
                
                <div class="pt-4">
                    <h2 class="nav-section-title">People</h2>
                    <a href="/pages/people_search" class="nav-link ${currentPath.includes('people_search') ? 'active' : ''}">
                        <span>👥 People Search</span>
                    </a>
                    <a href="/pages/people_enrichment" class="nav-link ${currentPath.includes('people_enrichment') ? 'active' : ''}">
                        <span>👤 People Enrichment</span>
                    </a>
                </div>
                
                <div class="pt-4">
                    <h2 class="nav-section-title">Other</h2>
                    <a href="/pages/diagnostics" class="nav-link ${currentPath.includes('diagnostics') ? 'active' : ''}">
                        <span>🔧 API Diagnostics</span>
                    </a>
                </div>
            </nav>
        </aside>
    `;
}

// Domain validation utility
function isValidDomain(domain) {
    if (!domain || domain.length < 4 || domain.length > 253) return false;
    if (!domain.includes('.')) return false;

    const parts = domain.split('.');
    if (parts.length < 2) return false;
    if (parts.some(part => part.length === 0)) return false;

    const tld = parts[parts.length - 1];
    if (tld.length < 2) return false;

    if (!/^[a-z0-9.-]+$/i.test(domain)) return false;
    if (domain.startsWith('-') || domain.endsWith('-') ||
        domain.startsWith('.') || domain.endsWith('.')) return false;

    return true;
}

function cleanDomain(domainValue) {
    return domainValue.trim()
        .replace(/^["'`]+|["'`]+$/g, '')
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .toLowerCase();
}
console.log('Shared.js loaded successfully');
