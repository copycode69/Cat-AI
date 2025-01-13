from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from transformers import pipeline
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins; restrict in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize Hugging Face summarizer
summarizer = pipeline("summarization")

class URLRequest(BaseModel):
    url: str

@app.post("/inspect")
async def inspect_url(data: URLRequest):
    try:
        logger.info(f"Received request with URL: {data.url}")

        # Add headers to mimic a browser
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(data.url, headers=headers, timeout=10)
        if response.status_code == 403:
            raise HTTPException(status_code=403, detail="Access denied by the target website")

        soup = BeautifulSoup(response.content, "html.parser")

        # Title and Meta Description
        title = soup.title.string.strip() if soup.title and soup.title.string else "No title found"
        meta_desc = soup.find("meta", attrs={"name": "description"})
        meta_desc = meta_desc["content"].strip() if meta_desc and meta_desc.get("content") else "No meta description found"

        # Headings Extraction (Limit to the first 5 headings of each type)
        headings = {}
        for i in range(1, 7):
            heading_tags = soup.find_all(f"h{i}")
            headings[f"h{i}"] = [tag.text.strip() for tag in heading_tags[:5]] if heading_tags else []

        # Links Extraction (Limit to the first 20 links for performance)
        links = [tag.get('href') for tag in soup.find_all('a') if tag.get('href')][:20]
        broken_links = []
        for link in links:
            try:
                full_link = urljoin(data.url, link)
                link_response = requests.head(full_link, headers=headers, timeout=5)
                if link_response.status_code >= 400:
                    broken_links.append(full_link)
            except requests.exceptions.RequestException:
                broken_links.append(full_link)

        # Images and Alt-Text Issues (Limit to the first 20 images)
        images = [urljoin(data.url, img.get('src')) for img in soup.find_all('img') if img.get('src')][:20]
        image_issues = []
        for img_url in images:
            img_tag = soup.find("img", {"src": img_url})
            alt_text = img_tag.get("alt", "") if img_tag else ""
            if not alt_text:
                image_issues.append(f"Image at {img_url} is missing alt text.")

        # Summarize Content (Limit content to 2,000 characters)
        content = soup.get_text().strip()[:2000]  # Limit content to 2,000 characters
        summary = "Content too short to summarize"
        if len(content.split()) > 50:  # Ensure content has enough words
            summary = summarizer(content, max_length=200, min_length=50, do_sample=False)[0]['summary_text']

        # Extract Language
        language = soup.html.get('lang', "No language specified") if soup.html else "No language specified"

        # Favicon Extraction
        favicon = soup.find("link", rel="icon")
        favicon_url = urljoin(data.url, favicon['href']) if favicon and favicon.get('href') else "No favicon found"

        # Word Count and Meta Keywords
        words = len(content.split())
        meta_keywords = soup.find("meta", attrs={"name": "keywords"})
        keywords = meta_keywords["content"].strip() if meta_keywords and meta_keywords.get("content") else "No keywords found"

        # Calculate SEO Score
        seo_score = {
            "meta_description_length": len(meta_desc),
            "title_length": len(title),
            "word_count": words,
            "headings_count": sum(len(headings[f"h{i}"]) for i in range(1, 7)),
            "images_issues": len(image_issues),
        }

        logger.info(f"SEO score: {seo_score}")

        # Return Inspection Results
        return {
            "status_code": response.status_code,
            "title": title,
            "meta_description": meta_desc,
            "language": language,
            "favicon": favicon_url,
            "headings": headings,
            "links": links,
            "images": images,
            "word_count": words,
            "meta_keywords": keywords,
            "summary": summary,
            "broken_links": broken_links,
            "seo_score": seo_score,
            "image_issues": image_issues,
        }

    except requests.exceptions.Timeout as e:
        logger.error(f"Timeout error: {str(e)}")
        raise HTTPException(status_code=408, detail="Request timed out")
    except requests.exceptions.RequestException as e:
        logger.error(f"Request exception: {str(e)}")
        raise HTTPException(status_code=500, detail="Error during the request")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
