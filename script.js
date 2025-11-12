const API_KEY = "4fbcf702f75f4510b1ff32d9d4ca34d9";
const url = "https://newsapi.org/v2/top-headlines?country=in&q=";
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

window.addEventListener("load", () => fetchNews("India"));

function reload() {
    window.location.reload();
}

async function fetchNews(query) {
    try {
        let fetchUrl = query ? `${url}${query}&apiKey=${API_KEY}` : `https://newsapi.org/v2/top-headlines?country=in&apiKey=${API_KEY}`;
        
        // Try direct request first
        let res = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        // If CORS error, try with proxy
        if (!res.ok && res.status === 426) {
            console.log("Direct request failed, trying with CORS proxy...");
            fetchUrl = CORS_PROXY + fetchUrl;
            res = await fetch(fetchUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            });
        }
        
        if (!res.ok) {
            console.error(`HTTP Error: ${res.status} ${res.statusText}`);
            alert(`Error fetching news: ${res.status} ${res.statusText}`);
            return;
        }
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
            bindData(data.articles);
        } else {
            console.error("No articles found in response:", data);
            alert("No news articles found. Please check your API key or try a different search.");
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        alert(`Failed to fetch news: ${error.message}`);
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});
