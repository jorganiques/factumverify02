const apiKeys = {
    newsdataApiKey: 'pub_48526852547f7a14aff65b94321d84248d0d6', // Setup value of apiKey with your actual NewsData.io API key
    meaningCloudApiKey: '3cad836143b352a37661657d43213759' // Replace with your actual MeaningCloud API key
};

// Function to show or hide the progress bar
function toggleProgressBar(display, elementId = 'mainProgressBar') {
    const progressBar = document.getElementById(elementId);
    if (progressBar) { // Check if progressBar element exists
        progressBar.style.display = display ? 'block' : 'none';
    } else {
        console.warn(`Progress bar element with ID ${elementId} not found.`);
    }
}

// Function to clear previous results from the results section
function clearPreviousResults() {
    document.getElementById('results').innerHTML = '';
}

// Function to display an error message in the results section
function displayError(message) {
    document.getElementById('results').innerHTML = `<p class="error">${message}</p>`;
}

// Function to create and return a result element based on the article data
function createResultElement(article, index) {
    const resultElement = document.createElement('div');
    resultElement.classList.add('result');
    
    const title = article.title || 'No Title';
    const source = article.source || 'Unknown Source';
    const author = article.author || 'Unknown Author';
    const publishedAt = article.publishedAt || 'Unknown Date';
    const description = article.description || 'No Description';
    const url = article.link;
    const imageUrl = article.image_url || './images/image_not_available.png';

    resultElement.innerHTML = `
        <h2>${title}</h2>
        <p><strong>Source:</strong> ${source}</p>
        <p><strong>Author:</strong> ${author}</p>
        <p><strong>Published At:</strong> ${publishedAt}</p>
        <img src="${imageUrl}" alt="Article Image" class="centerToImage">
        <p>${description}</p>
        <div class="readMore">
            <a href="${url}" target="_blank">Read more</a>
        </div>
        <div class="summarize-container">
            <button class="summarize" onclick="summarizeArticle(${index})">Summarize</button>
        </div>
        <div class="progress-bar" id="progressBar-${index}" style="display: none;">
            <div class="progress"></div>
        </div>
        <div class="summary" id="summary-${index}"></div>
    `;
    
    return resultElement;
}

// Function to perform the fact check by fetching data from the NewsData API
function factCheck(query, language) {
    const apiUrl = `https://newsdata.io/api/1/latest?apikey=${apiKeys.newsdataApiKey}&q=${encodeURIComponent(query)}&language=${language}`;

    toggleProgressBar(true);
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            toggleProgressBar(false);
            clearPreviousResults();
            
            if (data.results && data.results.length > 0) {
                data.results.forEach((article, index) => {
                    const resultElement = createResultElement(article, index);
                    document.getElementById('results').appendChild(resultElement);
                });
            } else {
                displayError('No articles found matching the query.');
            }
        })
        .catch(error => {
            toggleProgressBar(false);
            displayError('Error fetching data from the API.');
            console.error('Error fetching data from the API:', error);
        });
}

// Function to summarize an article using the MeaningCloud API
function summarizeArticle(index) {
    const articleUrl = document.querySelector(`.result:nth-child(${index + 1}) .readMore a`).href;
    const summaryElement = document.getElementById(`summary-${index}`);
    const progressBarElement = document.getElementById(`progressBar-${index}`);
    
    toggleProgressBar(true, `progressBar-${index}`);
    const apiUrl = 'https://api.meaningcloud.com/summarization-1.0';
    const params = new URLSearchParams({
        key: apiKeys.meaningCloudApiKey,
        url: articleUrl,
        sentences: 5
    });

    fetch(`${apiUrl}?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            toggleProgressBar(false, `progressBar-${index}`);
            if (data.status.code === '0') {
                summaryElement.innerText = data.summary;
            } else {
                summaryElement.innerText = 'Error summarizing the article.';
            }
        })
        .catch(error => {
            toggleProgressBar(false, `progressBar-${index}`);
            summaryElement.innerText = 'Error summarizing the article.';
            console.error('Error summarizing the article:', error);
        });
}

// Event listener for form submission
document.getElementById('factCheckForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const query = document.getElementById('query').value;
    const language = document.getElementById('language').value;
    factCheck(query, language);
});
