document.addEventListener("DOMContentLoaded", () => {
    // Page Elements
    const navFeed = document.getElementById("nav-feed");
    const navPost = document.getElementById("nav-post");
    const feedPage = document.getElementById("feed-page");
    const postPage = document.getElementById("post-page");
    
    // Form Elements
    const memeForm = document.getElementById("meme-form");
    const imageUpload = document.getElementById("image-upload");
    const imagePreview = document.getElementById("image-preview");
    const memeContainer = document.getElementById("meme-container");

    let uploadedImagesBase64 = [];

    // --- NAVIGATION LOGIC ---
    navFeed.addEventListener("click", () => {
        switchPage("feed");
        renderPosts();
    });
    
    navPost.addEventListener("click", () => {
        switchPage("post");
    });

    function switchPage(page) {
        if (page === "feed") {
            feedPage.classList.remove("hidden");
            postPage.classList.add("hidden");
            navFeed.classList.add("active");
            navPost.classList.remove("active");
        } else {
            postPage.classList.remove("hidden");
            feedPage.classList.add("hidden");
            navPost.classList.add("active");
            navFeed.classList.remove("active");
        }
    }

    // --- IMAGE PREVIEW & PROCESSING ---
    imageUpload.addEventListener("change", (e) => {
        imagePreview.innerHTML = "";
        uploadedImagesBase64 = [];
        const files = Array.from(e.target.files);

        // Filter and limit to max 5 PNG files
        const pngFiles = files.filter(file => file.type === "image/png").slice(0, 5);

        if (files.length > 5 || files.length !== pngFiles.length) {
            alert("Only PNG images are allowed, and you can upload a maximum of 5 images.");
        }

        pngFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImagesBase64.push(event.target.result);
                
                // Show thumbnail preview
                const img = document.createElement("img");
                img.src = event.target.result;
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    // --- SUBMIT MANIFESTING (Save to LocalStorage) ---
    memeForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = document.getElementById("post-title").value;
        const authorInput = document.getElementById("author-name").value;
        const revealIdentity = document.getElementById("reveal-identity").checked;
        const isExclusive = document.getElementById("is-exclusive").checked;

        const authorName = revealIdentity ? authorInput : "Anonymous";

        if (uploadedImagesBase64.length === 0) {
            alert("Please upload at least one valid PNG image.");
            return;
        }

        const newPost = {
            id: Date.now(),
            title: title,
            author: authorName,
            images: uploadedImagesBase64,
            exclusive: isExclusive
        };

        // Fetch current posts ecosystem from local storage
        let currentPosts = JSON.parse(localStorage.getItem("meme_posts")) || [];
        currentPosts.unshift(newPost); // Add new post to top of array
        localStorage.setItem("meme_posts", JSON.stringify(currentPosts));

        // Reset form & view feed
        memeForm.reset();
        imagePreview.innerHTML = "";
        uploadedImagesBase64 = [];
        switchPage("feed");
        renderPosts();
    });

    // --- RENDER POSTS TO THE FEED ---
    function renderPosts() {
        memeContainer.innerHTML = "";
        const posts = JSON.parse(localStorage.getItem("meme_posts")) || [];

        if (posts.length === 0) {
            memeContainer.innerHTML = `<p style="text-align:center; color:#666; margin-top:20px;">No posts available yet. Be the first to publish one!</p>`;
            return;
        }

        posts.forEach(post => {
            const card = document.createElement("div");
            card.className = "meme-card";

            if (post.exclusive) {
                // If Post is Exclusive, hide content behind wrapper
                card.innerHTML = `
                    <div class="card-header">
                        <span class="card-title">${post.title} <span class="blog-tag">Exclusive Blog</span></span>
                        <span class="card-author">By: ${post.author}</span>
                    </div>
                    <div class="exclusive-overlay" id="overlay-${post.id}">
                        <p>🔒 This content is locked inside an exclusive blog post.</p>
                        <button class="btn reveal-btn" onclick="revealContent(${post.id})">Reveal Exclusive Content</button>
                    </div>
                    <div class="card-gallery hidden" id="gallery-${post.id}">
                        ${post.images.map(img => `<img src="${img}" alt="Meme Image">`).join('')}
                    </div>
                `;
            } else {
                // Standard post display
                card.innerHTML = `
                    <div class="card-header">
                        <span class="card-title">${post.title}</span>
                        <span class="card-author">By: ${post.author}</span>
                    </div>
                    <div class="card-gallery">
                        ${post.images.map(img => `<img src="${img}" alt="Meme Image">`).join('')}
                    </div>
                `;
            }

            memeContainer.appendChild(card);
        });
    }

    // Initialize display with present posts
    renderPosts();
});

// --- REVEAL ACTION FUNCTION ---
function revealContent(postId) {
    const overlay = document.getElementById(`overlay-${postId}`);
    const gallery = document.getElementById(`gallery-${postId}`);
    
    if (overlay && gallery) {
        overlay.classList.add("hidden");
        gallery.classList.remove("hidden");
    }
}
