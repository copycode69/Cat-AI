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
const loadingAudio = document.getElementById("loading-audio");  // The audio element

document.getElementById("urlForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent page refresh
    
    const url = document.getElementById("urlInput").value.trim();
    
    if (!url) {
        alert("Please enter a valid URL.");
        return;
    }

    console.log("URL to inspect:", url);

    // Show loading message and play background music
    document.getElementById("loading").style.display = 'block';
    outputContainer.style.display = 'none';
    loadingAudio.play();  // Play the song

    try {
        const response = await fetch("https://ybbmqmjwfg.execute-api.ap-south-1.amazonaws.com/inspect", {
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
                    img.width = 200;
                    img.height = 200;
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
            loadingAudio.pause();  // Stop the music after loading is done
        } else {
            statusCodeDiv.textContent = "Error: Unable to inspect URL.";
            outputContainer.style.display = 'block';
            document.getElementById("loading").style.display = 'none';
            loadingAudio.pause();  // Stop music if there's an error
        }
    } catch (error) {
        statusCodeDiv.textContent = "Error: Network or server issue.";
        outputContainer.style.display = 'block';
        document.getElementById("loading").style.display = 'none';
        loadingAudio.pause();  // Stop music if there's an error
    }
});
