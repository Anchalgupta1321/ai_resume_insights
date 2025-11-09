# 🤖 Resume Analyzer

The **Resume Analyzer** is a Python-based AI-powered tool that automates the process of analyzing resumes using **Google’s Gemini AI (1.5-flash)** and the **Google Drive API**.  
It extracts, evaluates, and organizes information such as candidate skills, education, and AI/ML experience — generating comprehensive Excel reports to assist recruiters in identifying top talent efficiently.

---

## 🚀 Features

- 🧠 **AI-Powered Resume Parsing:** Uses Gemini 1.5-flash for intelligent extraction of structured data.  
- ☁️ **Google Drive Integration:** Automatically downloads resumes from shared Google Drive folders.  
- ⚡ **Batch Processing:** Analyzes multiple resumes concurrently for faster results.  
- 📈 **Scoring System:** Rates AI/ML and Generative AI experience on a 1–3 scale.  
- 📊 **Excel Reporting:** Generates multi-sheet Excel files summarizing candidate insights.  
- 🔄 **Error Handling:** Logs failures and retries API calls automatically.

---

## 🧩 Tech Stack

- **Language:** Python 3.7+  
- **Frameworks / Libraries:**  
  `pandas`, `PyPDF2`, `tqdm`, `openpyxl`, `google-generativeai`,  
  `google-api-python-client`, `google-auth`, `concurrent.futures`  
- **APIs Used:**  
  - Google Drive API  
  - Gemini AI (1.5-flash)  

---

## ⚙️ Installation & Setup

### Clone the Repository
```bash
git clone https://github.com/yourusername/resume_analyzer.git
cd resume_analyzer

## Install Dependencies
Make sure you have Python 3.7+ installed, then run:
pip install -r requirements.txt

---
🔑 Configuration
🧰 Google Drive Setup
Create a Service Account in the Google Cloud Console.
Download the service account credentials (JSON file).
Share the target Drive folder (containing resumes) with your service account email.

🤖 Gemini AI Setup
Obtain a Gemini API key from Google AI Studio
Configure it in your script or notebook:

import google.generativeai as genai
genai.configure(api_key="YOUR_GEMINI_API_KEY")

---

## 👩‍💻 Author

**Anchal Gupta**  
📍 Bengaluru, Karnataka – 560064  
📧 [Email](2022anchal.g@vidyashilp.edu.in)  
📞 7807647835  
🔗 [LinkedIn Profile](https://www.linkedin.com/in/anchal-gupta-71436b254/)  
---

## 🪪 License

This project is licensed under the **MIT License**.  
You’re free to use, modify, and distribute it for both personal and commercial purposes.  
See the [LICENSE](LICENSE) file for more details.




