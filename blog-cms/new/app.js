// ----- Mock CMS data (could be fetched from an external JSON file) -----
const cmsData = {
  title: "Simple CMS Demo",
  nav: [
    { label: "Home", anchor: "#home" },
    { label: "About", anchor: "#about" },
    { label: "Blog", anchor: "#blog" }
  ],
  pages: {
    home: {
      heading: "Welcome to the Demo",
      body: "This is a lightweight, client‑side CMS built with vanilla JavaScript. All content lives in a single JSON‑like object."
    },
    about: {
      heading: "About This Project",
      body: "The goal is to illustrate how a static site can behave like a CMS without a server. Feel free to extend it!"
    },
    blog: [
      {
        title: "First Post",
        excerpt: "A quick intro to our tiny CMS.",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio."
      },
      {
        title: "Second Post",
        excerpt: "How to add new pages.",
        content: "Praesent libero. Sed cursus ante dapibus diam. Sed nisi."
      }
    ]
  }
};

// ----- Helper to create DOM elements -----
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  });
  children.forEach(c => {
    if (typeof c === "string") node.appendChild(document.createTextNode(c));
    else if (c) node.appendChild(c);
  });
  return node;
}

// ----- Render the site -----
function render() {
  // Title & Nav
  document.title = cmsData.title;
  document.getElementById("site-title").textContent = cmsData.title;

  const nav = document.getElementById("site-nav");
  cmsData.nav.forEach(item => {
    nav.appendChild(
      el("a", { href: item.anchor }, item.label)
    );
  });

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Load default section (hash or home)
  loadSection(location.hash || "#home");

  // Listen for hash changes (simple routing)
  window.addEventListener("hashchange", () => loadSection(location.hash));
}

// ----- Section loader -----
function loadSection(hash) {
  const id = hash.replace("#", "");
  const container = document.getElementById("content");
  container.innerHTML = ""; // clear previous

  if (id === "home" || id === "about") {
    const page = cmsData.pages[id];
    container.appendChild(
      el("section", { class: "article" },
        el("h2", {}, page.heading),
        el("p", {}, page.body)
      )
    );
  } else if (id === "blog") {
    cmsData.pages.blog.forEach(post => {
      container.appendChild(
        el("article", { class: "article" },
          el("h2", {}, post.title),
          el("p", {}, post.excerpt),
          el("details", {},
            el("summary", {}, "Read more"),
            el("p", {}, post.content)
          )
        )
      );
    });
  } else {
    container.appendChild(
      el("section", { class: "article" },
        el("h2", {}, "Page not found"),
        el("p", {}, "Sorry, the requested section does not exist.")
      )
    );
  }
}

// Kick things off
render();
