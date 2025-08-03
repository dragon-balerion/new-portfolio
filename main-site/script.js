import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

// --- Firebase Configuration ---
// PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- General UI Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });
    }

    // Active Nav Link on Scroll
    const sections = document.querySelectorAll('main > section');
    const navLi = document.querySelectorAll('nav ul li a');
    if (sections.length > 0) {
        window.addEventListener('scroll', () => {
            let current = 'hero';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.pageYOffset >= (sectionTop - 80)) {
                    current = section.getAttribute('id');
                }
            });

            navLi.forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href').includes(current)) {
                    a.classList.add('active');
                }
            });
        });
    }

    // Fade-in sections on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section.container').forEach(section => {
        observer.observe(section);
    });

    // Project Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            projectCards.forEach(card => {
                card.style.display = 'block'; // Reset display property
                if (filter !== 'all' && card.getAttribute('data-category') !== filter) {
                    card.classList.add('hidden');
                } else {
                    card.classList.remove('hidden');
                }
            });
        });
    });

    // CV Download Link
    const cvDownloadLink = document.getElementById('cv-download-link');
    if (cvDownloadLink) {
        const cvRef = ref(storage, 'Chandika-Nawodya-Senarathna-CV.pdf');
        getDownloadURL(cvRef)
            .then((url) => {
                cvDownloadLink.setAttribute('href', url);
            })
            .catch((error) => {
                console.error("Could not get CV download URL", error);
                cvDownloadLink.innerHTML = "CV Not Available";
                cvDownloadLink.style.pointerEvents = "none";
                cvDownloadLink.style.borderColor = "grey";
                cvDownloadLink.style.color = "grey";
            });
    }
});

// --- Interactive Terminal Logic (for index.html) ---
if (document.getElementById('terminal-body')) {
    const terminalBody = document.getElementById('terminal-body');
    let commandHistory = [];
    let historyIndex = -1;

    const welcomeMessage = [
        "Initializing connection...",
        "Connection established.",
        "Welcome. I am Chandika Nawodya Senarathna.",
        "> Cybersecurity Student",
        "> Brand Designer",
        "\nType 'help' for a list of available commands."
    ];

    function typeWriter(element, text, speed, callback) {
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                terminalBody.scrollTop = terminalBody.scrollHeight;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        type();
    }

    function initTerminal() {
        let i = 0;
        function showWelcomeMessage() {
            if (i < welcomeMessage.length) {
                const output = document.createElement('div');
                output.classList.add('terminal-output');
                terminalBody.appendChild(output);
                typeWriter(output, welcomeMessage[i], 30, showWelcomeMessage);
                i++;
            } else {
                createInputLine();
            }
        }
        showWelcomeMessage();
    }

    function createInputLine() {
        const line = document.createElement('div');
        line.classList.add('terminal-line');
        line.innerHTML = `<span class="prompt">[user@CNS ~]$</span><input type="text" class="terminal-input" autofocus>`;
        terminalBody.appendChild(line);
        const input = line.querySelector('.terminal-input');
        input.focus();
        input.addEventListener('keydown', handleCommand);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function handleCommand(e) {
        if (e.key === 'Enter') {
            const input = e.target;
            const command = input.value.trim().toLowerCase();
            if (command) {
                commandHistory.unshift(command);
                historyIndex = -1;
            }
            const prevLine = input.parentElement;
            prevLine.innerHTML = `<span class="prompt">[user@CNS ~]$</span> ${command}`;
            if (command) {
                processCommand(command);
            } else {
                createInputLine();
            }
        } else if (e.key === 'ArrowUp') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                e.target.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIndex > 0) {
                historyIndex--;
                e.target.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                e.target.value = "";
            }
        }
    }

    function processCommand(command) {
        const output = document.createElement('div');
        output.classList.add('terminal-output');
        terminalBody.appendChild(output);
        let response = '';
        let action = null;
        switch (command) {
            case 'help':
                response = `Available commands:\n` +
                           `  help      - Shows this list of commands\n` +
                           `  projects  - Scrolls to the projects section\n` +
                           `  contact   - Scrolls to the contact section\n` +
                           `  skills    - Scrolls to the skills section\n` +
                           `  about     - Scrolls to the about section\n` +
                           `  blog      - Navigates to the blog page\n` +
                           `  clear     - Clears the terminal screen`;
                break;
            case 'blog':
                response = 'Navigating to blog...';
                action = () => window.location.href = 'blog.html';
                break;
            case 'projects':
            case 'skills':
            case 'about':
            case 'contact':
                response = `Executing... scrolling to ${command} section.`;
                action = () => {
                    const targetSection = document.getElementById(command);
                    if (targetSection) {
                        const headerOffset = 80;
                        const elementPosition = targetSection.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                    }
                };
                break;
            case 'clear':
                terminalBody.innerHTML = '';
                initTerminal();
                return;
            default:
                response = `bash: command not found: ${command}`;
                break;
        }
        typeWriter(output, response, 10, () => {
            if (action) action();
            createInputLine();
        });
    }

    terminalBody.addEventListener('click', () => {
        const input = terminalBody.querySelector('.terminal-input');
        if (input) input.focus();
    });

    initTerminal();
}

// --- Blog Page Logic (for blog.html) ---
if (document.getElementById('posts-container')) {
    const postsContainer = document.getElementById('posts-container');
    async function getPosts() {
        postsContainer.innerHTML = '<p class="loading-message">Loading posts...</p>';
        try {
            const querySnapshot = await getDocs(collection(db, "blogPosts"));
            if (querySnapshot.empty) {
                postsContainer.innerHTML = '<p class="loading-message">No posts found. Check back later!</p>';
                return;
            }
            postsContainer.innerHTML = ''; // Clear loading message
            querySnapshot.forEach((doc) => {
                const post = doc.data();
                const postCard = document.createElement('div');
                postCard.className = 'blog-post-card';
                postCard.innerHTML = `
                    <h3>${post.title}</h3>
                    <div class="post-meta">Posted on ${new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</div>
                    <p>${post.summary}</p>
                    <a href="post.html?id=${doc.id}" class="read-more-btn">Read More ></a>
                `;
                postsContainer.appendChild(postCard);
            });
        } catch (error) {
            console.error("Error fetching posts:", error);
            postsContainer.innerHTML = '<p class="loading-message" style="color: var(--accent-red);">Error loading posts. Check console for details.</p>';
        }
    }
    getPosts();
}

// --- Single Post Page Logic (for post.html) ---
if (document.getElementById('post-container')) {
    const postContainer = document.getElementById('post-container');
    async function getPost() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        if (!postId) {
            postContainer.innerHTML = '<p class="loading-message" style="color: var(--accent-red);">No post ID provided.</p>';
            return;
        }

        try {
            const docRef = doc(db, "blogPosts", postId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const post = docSnap.data();
                document.title = post.title; // Update page title
                postContainer.innerHTML = `
                    <h1>${post.title}</h1>
                    <div class="post-meta">Posted on ${new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</div>
                    <div class="post-full-content">${marked.parse(post.content)}</div>
                `;
            } else {
                postContainer.innerHTML = '<p class="loading-message" style="color: var(--accent-red);">Post not found.</p>';
            }
        } catch (error) {
            console.error("Error fetching post:", error);
            postContainer.innerHTML = '<p class="loading-message" style="color: var(--accent-red);">Error loading post. Check console for details.</p>';
        }
    }
    getPost();
}
