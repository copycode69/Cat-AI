const form = document.getElementById("urlForm");
const statusCodeDiv = document.getElementById("statusCode");
const titleDiv = document.getElementById("title");
const metaDescriptionDiv = document.getElementById("metaDescription");
const languageDiv = document.getElementById("language");
const metaKeywordsDiv = document.getElementById("metaKeywords");
const imageResultsDiv = document.getElementById("imageResults"); // For displaying images
const brokenLinksDiv = document.getElementById("brokenLinks"); // For displaying broken links
const seoScoreDiv = document.getElementById("seoScore"); // For displaying SEO score
const summaryDiv = document.getElementById("summary"); // For displaying AI summary
const imageIssuesDiv = document.getElementById("imageIssues"); // For displaying image issues
const outputContainer = document.getElementById("outputContainer"); // Output container

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = document.getElementById("urlInput").value;

    // Show loading message
    document.getElementById("loading").style.display = 'block';
    outputContainer.style.display = 'none'; // Hide output container until data is ready

    try {
        const response = await fetch("http://65.1.185.198:8000/inspect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
        });

        if (response.ok) {
            const data = await response.json();

            // Update each result section
            statusCodeDiv.textContent = data.status_code || "Not available";
            titleDiv.textContent = data.title || "Not available";
            metaDescriptionDiv.textContent = data.meta_description || "Not available";
            languageDiv.textContent = data.language || "Not available";
            metaKeywordsDiv.textContent = data.meta_keywords || "Not available";
            summaryDiv.textContent = data.summary || "No summary available";
            
            // Display SEO score
            seoScoreDiv.textContent = `SEO Score: Title Length - ${data.seo_score.title_length}, Meta Description Length - ${data.seo_score.meta_description_length}, Word Count - ${data.seo_score.word_count}, Headings Count - ${data.seo_score.headings_count}, Image Issues - ${data.seo_score.image_issues}`;

            // Display broken links
            if (data.broken_links && data.broken_links.length > 0) {
                brokenLinksDiv.innerHTML = '<ul>' + data.broken_links.map(link => `<li>${link}</li>`).join('') + '</ul>';
            } else {
                brokenLinksDiv.innerHTML = '<p>No broken links found.</p>';
            }

            // Clear previous images before displaying new ones
            imageResultsDiv.innerHTML = '';
            if (data.images && data.images.length > 0) {
                data.images.forEach((imgUrl) => {
                    const img = document.createElement("img");
                    img.src = imgUrl;
                    img.alt = "Extracted Image";
                    img.width = 200;  // Set image width
                    img.height = 200; // Set image height
                    imageResultsDiv.appendChild(img);
                });
            } else {
                imageResultsDiv.innerHTML = '<p>No images found.</p>';
            }

            // Display image optimization issues
            if (data.image_issues && data.image_issues.length > 0) {
                imageIssuesDiv.innerHTML = '<ul>' + data.image_issues.map(issue => `<li>${issue}</li>`).join('') + '</ul>';
            } else {
                imageIssuesDiv.innerHTML = '<p>No image issues found.</p>';
            }

            // Show the output container and hide loading message
            outputContainer.style.display = 'block';
            document.getElementById("loading").style.display = 'none';
        } else {
            statusCodeDiv.textContent = "Error: Unable to inspect URL.";
            outputContainer.style.display = 'block';
            document.getElementById("loading").style.display = 'none';
        }
    } catch (error) {
        statusCodeDiv.textContent = "Error: Network or server issue.";
        outputContainer.style.display = 'block';
        document.getElementById("loading").style.display = 'none';
    }
});
