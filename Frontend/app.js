const form = document.getElementById("urlForm");
const statusCodeDiv = document.getElementById("statusCode");
const titleDiv = document.getElementById("title");
const metaDescriptionDiv = document.getElementById("metaDescription");
const languageDiv = document.getElementById("language");
const metaKeywordsDiv = document.getElementById("metaKeywords");
const imageResultsDiv = document.getElementById("imageResults");
const brokenLinksDiv = document.getElementById("brokenLinks");
const seoScoreDiv = document.getElementById("seoScore");
const summaryDiv = document.getElementById("summary");
const imageIssuesDiv = document.getElementById("imageIssues");
const outputContainer = document.getElementById("outputContainer");
const loadingAudio = document.getElementById("loading-audio"); // The audio element

// Utility function for fetch with timeout
const fetchWithTimeout = (url, options, timeout = 10000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
        ),
    ]);
};

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = document.getElementById("urlInput").value.trim();

    // Input validation
    if (!url || !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(url)) {
        alert("Please enter a valid URL.");
        return;
    }

    // Show loading indicator and play background audio
    document.getElementById("loading").style.display = "block";
    outputContainer.style.display = "none";
    loadingAudio.play().catch((error) => {
        console.error("Error playing audio:", error);
    });

    try {
        const response = await fetchWithTimeout(
            "https://ybbmqmjwfg.execute-api.ap-south-1.amazonaws.com/inspect",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache",
                },
                body: JSON.stringify({ url }),
            },
            15000 // 15 seconds timeout
        );

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
            if (data.seo_score) {
                seoScoreDiv.textContent = `SEO Score: 
                    Title Length - ${data.seo_score.title_length || "N/A"}, 
                    Meta Description Length - ${data.seo_score.meta_description_length || "N/A"}, 
                    Word Count - ${data.seo_score.word_count || "N/A"}, 
                    Headings Count - ${data.seo_score.headings_count || "N/A"}, 
                    Image Issues - ${data.seo_score.image_issues || "N/A"}`;
            } else {
                seoScoreDiv.textContent = "No SEO score data available.";
            }

            // Display broken links
            if (data.broken_links && data.broken_links.length > 0) {
                brokenLinksDiv.innerHTML =
                    "<ul>" +
                    data.broken_links
                        .map((link) => `<li>${link}</li>`)
                        .join("") +
                    "</ul>";
            } else {
                brokenLinksDiv.innerHTML = "<p>No broken links found.</p>";
            }

            // Display images
            imageResultsDiv.innerHTML = "";
            if (data.images && data.images.length > 0) {
                data.images.forEach((imgUrl) => {
                    const img = document.createElement("img");
                    img.src = imgUrl;
                    img.alt = "Extracted Image";
                    img.width = 200;
                    img.height = 200;
                    imageResultsDiv.appendChild(img);
                });
            } else {
                imageResultsDiv.innerHTML = "<p>No images found.</p>";
            }

            // Display image optimization issues
            if (data.image_issues && data.image_issues.length > 0) {
                imageIssuesDiv.innerHTML =
                    "<ul>" +
                    data.image_issues
                        .map((issue) => `<li>${issue}</li>`)
                        .join("") +
                    "</ul>";
            } else {
                imageIssuesDiv.innerHTML = "<p>No image issues found.</p>";
            }

            // Show output and hide loading
            outputContainer.style.display = "block";
            document.getElementById("loading").style.display = "none";
            loadingAudio.pause();
        } else {
            throw new Error("Failed to fetch data. Server error.");
        }
    } catch (error) {
        console.error("Error:", error);
        statusCodeDiv.textContent = "Error: " + error.message;
        outputContainer.style.display = "block";
        document.getElementById("loading").style.display = "none";
        loadingAudio.pause();
    }
});
