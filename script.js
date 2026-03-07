// Data for Lightbox galleries
const galleryMap = {
    illegal: ["illegal1.png", "illegal2.png", "illegal3.png"],
    meslek: ["meslek1.png", "meslek2.png", "meslek3.png"]
};

let currentGallery = "illegal";
let currentImageIndex = 0;
let musicStarted = false;

// SPA Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });
    // Show target page
    const target = document.getElementById(pageId);
    if (target) target.classList.add("active");

    // Update Nav Buttons
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    // Find nav button associated with the page and activate it
    const activeBtnList = document.querySelectorAll(`button[onclick="showPage('${pageId}')"]`);
    activeBtnList.forEach(activeBtn => {
        activeBtn.classList.add("active");
    });

    // Close mobile menu if open
    const navMenu = document.querySelector('.nav-menu');
    const hamburgerIcon = document.querySelector('.hamburger i');
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburgerIcon.classList.remove('fa-times');
        hamburgerIcon.classList.add('fa-bars');
    }

    // Smooth scroll to container with offset for top navbar
    const container = document.querySelector('.container');
    if (container) {
        window.scrollTo({
            top: container.offsetTop - 100, // accommodate fixed navbar thickness
            behavior: "smooth"
        });
    }
}

// Loading Screen removal
function hideLoading() {
    const loading = document.getElementById("loadingScreen");
    if (loading) {
        loading.classList.add("hidden");
        setTimeout(() => {
            loading.style.display = "none";
        }, 600);
    }
}

// FiveM Server Status API integration
async function players() {
    try {
        const start = performance.now();
        // Public FiveM api for server details
        const r = await fetch("https://servers-frontend.fivem.net/api/servers/single/dal65y");
        const d = await r.json();
        const end = performance.now();
        const ping = Math.round(end - start);

        document.getElementById("online").innerText = d.Data.clients + " / " + d.Data.sv_maxclients;

        const statusEl = document.getElementById("status");
        statusEl.innerText = "Aktif";
        statusEl.classList.add("active-badge");

        document.getElementById("serverid").innerText = "dal65y";
        document.getElementById("resources").innerText = d.Data.resources ? d.Data.resources.length : "Bilinmiyor";
        document.getElementById("ping").innerText = ping + " ms";

        // Display Players
        const playersBox = document.getElementById("playersList");
        playersBox.innerHTML = "";

        const playerList = d.Data.players || [];

        if (playerList.length === 0) {
            playersBox.innerHTML = `
                <div class="empty-players" style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 20px;">
                    Şu anda sunucuda oyuncu bulunmuyor.
                </div>`;
        } else {
            playerList.forEach(player => {
                const playerName = player.name || "İsimsiz Oyuncu";
                const playerId = player.id ?? "-";

                playersBox.innerHTML += `
                    <div class="player-item">
                        <div class="player-name"><i class="fas fa-user"></i> ${playerName}</div>
                        <div class="player-id">ID: ${playerId}</div>
                    </div>
                `;
            });
        }

    } catch (error) {
        document.getElementById("online").innerText = "- / -";
        document.getElementById("status").innerText = "Çevrimdışı";
        document.getElementById("status").classList.remove("active-badge");
        document.getElementById("resources").innerText = "-";
        document.getElementById("ping").innerText = "-";
        document.getElementById("playersList").innerHTML = `
            <div class="empty-players" style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 20px;">
                <i class="fas fa-exclamation-triangle"></i> Oyuncu listesi alınamadı. Sunucu kapalı olabilir.
            </div>`;
    }
}

// Lightbox Functions
function openLightbox(src, galleryName) {
    currentGallery = galleryName;
    const currentList = galleryMap[currentGallery];
    const fileName = src.split("/").pop(); // Get filename from url

    // Fallback to placeholder names if it's via.placeholder.com
    let idx = currentList.findIndex(x => src.includes(x));
    currentImageIndex = idx !== -1 ? idx : 0;

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    lightboxImg.src = src; // direct src
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling behind lightbox
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    lightbox.classList.remove("active");
    document.body.style.overflow = "auto";
}

function nextImage() {
    const currentList = galleryMap[currentGallery];
    currentImageIndex++;
    if (currentImageIndex >= currentList.length) {
        currentImageIndex = 0;
    }
    // Just replace for now if no specific src handling.
    // In real env, we map currentList to the actual img elements.
    // Since images might be placeholder URLs, we just use the name for now.
    document.getElementById("lightboxImg").src = currentList[currentImageIndex];
}

function prevImage() {
    const currentList = galleryMap[currentGallery];
    currentImageIndex--;
    if (currentImageIndex < 0) {
        currentImageIndex = currentList.length - 1;
    }
    document.getElementById("lightboxImg").src = currentList[currentImageIndex];
}

// Music Logic
function playThemeMusic() {
    const music = document.getElementById("themeMusic");
    const button = document.getElementById("musicToggleBtn");
    if (!music) return;

    music.play().then(() => {
        button.innerHTML = '<i class="fas fa-volume-up"></i> Müziği Kapat';
        musicStarted = true;
    }).catch(() => {
        button.innerHTML = '<i class="fas fa-volume-mute"></i> Müziği Aç';
    });
}

function toggleMusic() {
    const music = document.getElementById("themeMusic");
    const button = document.getElementById("musicToggleBtn");
    if (!music) return;

    if (music.paused) {
        music.play().then(() => {
            button.innerHTML = '<i class="fas fa-volume-up"></i> Müziği Kapat';
            musicStarted = true;
        }).catch(() => {
            button.innerHTML = '<i class="fas fa-volume-mute"></i> Müziği Aç';
        });
    } else {
        music.pause();
        button.innerHTML = '<i class="fas fa-volume-mute"></i> Müziği Aç';
    }
}

// Mobile Menu & Scroll Logic
const topNavbar = document.querySelector('.top-navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        topNavbar.classList.add('scrolled');
    } else {
        topNavbar.classList.remove('scrolled');
    }
});

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            topNavbar.style.background = 'transparent';
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            if (window.scrollY > 50) topNavbar.style.background = 'rgba(10, 15, 25, 0.85)';
        }
    });
}

// Event Listeners
document.addEventListener("keydown", function (e) {
    const lightbox = document.getElementById("lightbox");

    if (lightbox.classList.contains("active")) {
        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowRight") nextImage();
        else if (e.key === "ArrowLeft") prevImage();
        return;
    }

    // Go back shortcut
    const meslekPage = document.getElementById("meslekPage");
    const illegalPage = document.getElementById("illegalPage");
    if ((meslekPage && meslekPage.classList.contains("active")) ||
        (illegalPage && illegalPage.classList.contains("active"))) {
        if (e.key === "Escape") showPage("about");
    }
});

document.addEventListener("click", function firstStartMusic() {
    if (musicStarted) return;
    playThemeMusic();
    document.removeEventListener("click", firstStartMusic);
});

document.addEventListener("DOMContentLoaded", () => {
    // Hide loading screen after 1.5 seconds from DOM load
    setTimeout(hideLoading, 1500);

    // Fetch API right away, then interval every 15s
    players();
    setInterval(players, 15000);
});

// Failsafe: hide loading screen after 3 seconds no matter what
setTimeout(hideLoading, 3000);
