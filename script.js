document.addEventListener('DOMContentLoaded', function () {
    const sections = Array.from(document.querySelectorAll('.main-content-area section'));
    const navLinks = Array.from(document.querySelectorAll('.sidebar ul li a'));
    
    let recentlyClicked = false;
    let clickTimeout;

    function updateActiveStates(activeIndex) {
        // Update navigation links
        navLinks.forEach((link, i) => {
            if (i === activeIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update content sections
        sections.forEach((section, i) => {
            if (i === activeIndex) {
                section.classList.add('section-highlight');
            } else {
                section.classList.remove('section-highlight');
            }
        });
    }

    function handleActiveStateOnScroll() {
        if (recentlyClicked) {
            return; // Don't update based on scroll if a click just happened
        }

        let currentActiveIndex = -1; // Default to no active section
        const scrollPosition = window.scrollY + window.innerHeight / 2; // Consider middle of viewport

        for (let i = 0; i < sections.length; i++) {
            if (sections[i].offsetTop <= scrollPosition && (sections[i].offsetTop + sections[i].offsetHeight) > scrollPosition) {
                currentActiveIndex = i;
                break;
            }
        }
        updateActiveStates(currentActiveIndex);
    }

    navLinks.forEach((link, index) => {
        link.addEventListener('click', function () {
            updateActiveStates(index);
            recentlyClicked = true;
            clearTimeout(clickTimeout);
            // Ignore scroll-based updates for a short period to let the click state dominate
            clickTimeout = setTimeout(() => {
                recentlyClicked = false;
            }, 500); // Adjust timeout as needed (e.g., 300-700ms)
        });
    });

    // Set initial active states on page load
    handleActiveStateOnScroll();
    // Update active states on scroll
    window.addEventListener('scroll', handleActiveStateOnScroll);

    // Scroll to top button functionality
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    // When the user scrolls down 200px from the top of the document, show the button
    window.onscroll = function() {scrollFunction()};

    function scrollFunction() {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    }

    // When the user clicks on the button, scroll to the top of the document
    scrollToTopBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default anchor behavior
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Fetch and display Git Utilities
    async function fetchGitUtilities() {
        const url = 'https://raw.githubusercontent.com/manughuman/tips/main/git-utilities.md';
        const contentDiv = document.getElementById('git-utilities-content');
        if (!contentDiv) return;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();
            const lines = markdown.split('\n');

            let currentCollapsible = null;
            let currentContent = '';
            let inCodeBlock = false;

            lines.forEach(line => {
                if (line.startsWith('## ')) { // H2 for collapsible title
                    if (currentCollapsible) {
                        appendCollapsible(currentCollapsible.title, currentContent, contentDiv);
                    }
                    currentCollapsible = { title: line.substring(3).trim(), content: '' };
                    currentContent = '';
                    inCodeBlock = false;
                } else if (line.startsWith('```')) {
                    inCodeBlock = !inCodeBlock;
                    currentContent += line + '\n'; // Keep the backticks for pre/code
                } else if (currentCollapsible) {
                    currentContent += line + '\n';
                }
            });

            // Append the last item
            if (currentCollapsible) {
                appendCollapsible(currentCollapsible.title, currentContent, contentDiv);
            }

        } catch (error) {
            contentDiv.innerHTML = `<p>Error loading Git Utilities: ${error.message}</p>`;
            console.error('Failed to fetch Git Utilities:', error);
        }
    }

    function appendCollapsible(title, content, parentDiv) {
        const titleButton = document.createElement('button');
        titleButton.className = 'collapsible-title';
        titleButton.textContent = title;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'collapsible-content';
        // Basic markdown to HTML for code blocks
        contentDiv.innerHTML = `<pre><code>${content.replace(/```[\s\S]*?\n/g, '').replace(/```/g, '').trim()}</code></pre>`;

        titleButton.addEventListener('click', function() {
            this.classList.toggle('active');
            if (contentDiv.style.maxHeight) {
                contentDiv.style.maxHeight = null;
            } else {
                contentDiv.style.maxHeight = contentDiv.scrollHeight + "px";
            }
        });

        parentDiv.appendChild(titleButton);
        parentDiv.appendChild(contentDiv);
    }

    fetchGitUtilities();

    // Main section collapsible functionality
    document.querySelectorAll('.section-collapsible-title').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active'); // Optional: for styling the active button
            const contentId = this.dataset.target;
            if (contentId) {
                const content = document.getElementById(contentId);
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            }
        });
    });
});