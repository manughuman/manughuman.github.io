// Constants
const GIT_UTILITIES_URL = 'https://raw.githubusercontent.com/manughuman/tips/main/git-utilities.md';
const LINUX_UTILITIES_URL = 'https://raw.githubusercontent.com/manughuman/tips/main/linux-utilities.md';
const SCROLL_OFFSET_FOR_TOP_BTN = 200;
const CLICK_DEBOUNCE_TIMEOUT = 500;

document.addEventListener('DOMContentLoaded', function () {
    const sections = Array.from(document.querySelectorAll('.main-content-area section'));
    const navLinks = Array.from(document.querySelectorAll('.sidebar ul li a'));
    let recentlyClicked = false;
    let clickTimeout;

    function updateActiveStates(activeIndex) {
        // Update navigation links
        // 1. Deactivate all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // 2. Activate the current link (if valid index)
        if (activeIndex !== -1 && navLinks[activeIndex]) {
            navLinks[activeIndex].classList.add('active');

            // 3. If a sub-link (Git or Linux Utilities) is active, also activate its parent "Utilities" link
            const activeLinkHref = navLinks[activeIndex].getAttribute('href');
            if (activeLinkHref === '#git-utilities' || activeLinkHref === '#linux-utilities') {
                const utilitiesLink = document.querySelector('.sidebar ul > li > a[href="#utilities-main"]'); // Adjust href if you changed it
                if (utilitiesLink) {
                    utilitiesLink.classList.add('active');
                }
            }
        }

        // 4. Update content section highlights
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
        link.addEventListener('click', function (e) {
            const href = link.getAttribute('href');

            if (href === '#utilities-main') {
                e.preventDefault(); // Prevent default scroll for the main Utilities toggle
                const utilitiesLink = this;
                const subNav = utilitiesLink.nextElementSibling; // The ul.sub-nav

                // Toggle the active state of the Utilities link itself
                utilitiesLink.classList.toggle('active');

                // If Utilities link is now inactive (closed), ensure its children links are also inactive
                // Note: section highlights for children will clear on next scroll/click via updateActiveStates
                if (!utilitiesLink.classList.contains('active') && subNav) {
                    subNav.querySelectorAll('a').forEach(subLink => {
                        subLink.classList.remove('active');
                    });
                }
            } else {
                // Behavior for all other links (including sub-links of Utilities)
                updateActiveStates(index);
                recentlyClicked = true;
                clearTimeout(clickTimeout);
                clickTimeout = setTimeout(() => {
                    recentlyClicked = false;
                }, CLICK_DEBOUNCE_TIMEOUT);
            }
        });
    });

    // Set initial active states on page load
    handleActiveStateOnScroll();
    // Update active states on scroll
    window.addEventListener('scroll', handleActiveStateOnScroll);
    // Scroll to top button functionality
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    // When the user scrolls down 200px from the top of the document, show the button
    window.addEventListener('scroll', scrollFunction); // Changed from onscroll

    function scrollFunction() {
        if (document.body.scrollTop > SCROLL_OFFSET_FOR_TOP_BTN || document.documentElement.scrollTop > SCROLL_OFFSET_FOR_TOP_BTN) {
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

    // Generic function to fetch markdown and display as collapsible items
    async function fetchAndDisplayMarkdownAsCollapsible(markdownUrl, targetDivId, sectionName) {
        const contentDiv = document.getElementById(targetDivId);
        if (!contentDiv) return;

        try {
            const response = await fetch(markdownUrl);
            if (!response.ok) {
                contentDiv.innerHTML = `<p>Error loading ${sectionName}: Could not fetch content (status: ${response.status})</p>`;
                throw new Error(`HTTP error! status: ${response.status} for ${markdownUrl}`);
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
                    currentContent += line + '\n';
                } else if (currentCollapsible) {
                    currentContent += line + '\n';
                }
            });

            // Append the last item
            if (currentCollapsible) {
                appendCollapsible(currentCollapsible.title, currentContent, contentDiv);
            }

        } catch (error) {
            // Error message is set inside the try block if response.ok is false
            console.error(`Failed to fetch or process ${sectionName}:`, error);
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

    // Call the modularized function for Git Utilities
    fetchAndDisplayMarkdownAsCollapsible(
        GIT_UTILITIES_URL,
        'git-utilities-content',
        'Git Utilities'
    );

    // Call the modularized function for Linux Utilities
    fetchAndDisplayMarkdownAsCollapsible(
        LINUX_UTILITIES_URL,
        'linux-utilities-content',
        'Linux Utilities'
    );
});