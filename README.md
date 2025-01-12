# Pulse AI - Web Scraper and SEO Inspector

## Overview

**Pulse AI** is a powerful web scraper and SEO inspector built using **FastAPI**, **BeautifulSoup**, **Requests**, and **Transformers**. This application allows users to submit a URL and perform an in-depth analysis of the provided webpage, including SEO analysis, content summarization, broken link detection, and much more.

### Features:
- **SEO Analysis**: Extracts and analyzes the title, meta description, headings, and keywords of a webpage.
- **Content Summarization**: Uses Hugging Face's transformer model to generate a summary of the page content.
- **Broken Link Detection**: Identifies broken links on the page.
- **Image Alt-Text Validation**: Flags images missing alt text for accessibility.
- **Language Detection**: Identifies the language of the webpage.
- **Favicon Extraction**: Retrieves the favicon URL of the page.
- **CORS Support**: The backend supports CORS for frontend requests.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/copycode69/pluse-AI.git
   cd pulse-ai

## Description of Response 
status_code: The HTTP status code of the request (e.g., 200 for success).
title: The page title extracted from the HTML <title> tag.
meta_description: The meta description of the page, if available.
language: The language of the webpage (e.g., en for English).
favicon: The URL of the website's favicon.
headings: A dictionary containing all the headings (h1 to h6) found on the page.
links: A list of all the links (href attributes) found on the page.
images: A list of all the images (src attributes) found on the page.
word_count: The total word count of the page content.
meta_keywords: The meta keywords of the page, if available.
summary: A summarized version of the page content using the Hugging Face model.
broken_links: A list of broken links on the page (if any).
seo_score: A calculated score based on various SEO metrics (e.g., title length, meta description length, headings count).
image_issues: A list of issues related to images (e.g., missing alt text).
Technologies Used
FastAPI: A high-performance web framework for building APIs with Python 3.8+.
BeautifulSoup: A Python library for parsing HTML and XML documents.
Requests: A simple HTTP library for making requests to webpages.
Hugging Face Transformers: A Python package for state-of-the-art NLP models like GPT-2 and BERT.
Pydantic: A data validation library used to parse and validate API request bodies.
SEO Score Calculation
The SEO score is a calculated value based on several factors:

Length of the meta description
Length of the title
Word count on the page
Number of headings (h1 - h6)
Issues with images (missing alt-text)
The score is returned as part of the inspection results.

Development
To contribute or modify this project:

Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make your changes.
Push to your forked repository (git push origin feature-branch).
Open a pull request.
License
This project is licensed under the MIT License - see the LICENSE file for details.

 ## Acknowledgments 
Hugging Face: For providing powerful NLP models.
BeautifulSoup and Requests: For excellent HTML parsing and HTTP handling.
FastAPI: For creating high-performance APIs with ease.