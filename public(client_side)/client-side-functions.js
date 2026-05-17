// Sign Up for Newsletter
async function submitUser() {
    const firstName = document.getElementById('firstName')?.value;
    const lastName = document.getElementById('lastName')?.value;
    const email = document.getElementById('email')?.value;
    const state = document.getElementById('state')?.value;

    const response = await fetch('http://localhost:3000/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, state })
    });

    const data = await response.json();

    if (response.ok) {
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('userForm').style.display = 'none';
    } else {
        const errEl = document.getElementById('errorMessage');
        errEl.innerText = data.error;
        errEl.style.display = 'block';
    }
}

// Display US Holiday 
async function fetchNextHoliday() {
    const banner = document.getElementById('holidayBanner');
    if (!banner) return;

    try {
        const response = await fetch('http://localhost:3000/holidays');
        const holidays = await response.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const next = holidays.find(h => new Date(h.date) >= today);

        if (next) {
            const date = new Date(next.date + 'T00:00:00');
            const formatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            banner.textContent = `🎉 Next US Holiday: ${next.localName} — ${formatted}`;
        } else {
            banner.textContent = '🎉 No upcoming holidays found for this year.';
        }
    } catch (err) {
        console.error('Holiday fetch error:', err);
        banner.textContent = '';
    }
}

// Motivational Quote
async function fetchQuote() {
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    if (!quoteText) return;

    try {
        const response = await fetch('http://localhost:3000/quote');
        const data = await response.json();

        if (data && data.q) {
            quoteText.textContent = data.q;
            quoteAuthor.textContent = `— ${data.a}`;
        }
    } catch (err) {
        console.error('Quote fetch error:', err);
        quoteText.textContent = 'Keep going. Your next opportunity is closer than you think.';
    }
}

// Home Page Image Deck
function initSlider() {
    const el = document.getElementById('workSlider');
    if (!el || typeof Splide === 'undefined') return;
 
    new Splide('#workSlider', {
        type:        'loop',
        perPage:     4,
        gap:         '1rem',
        autoplay:    true,
        interval:    2500,
        pauseOnHover: true,
        breakpoints: {
            768: { perPage: 2 }
        }
    }).mount();
}

// Job Board
let allJobs = [];
 
async function fetchJobs() {
    const spinner = document.getElementById('spinner');
    const jobList = document.getElementById('jobList');
    if (!jobList) return;
 
    spinner.style.display = 'block';
 
    try {
        const response = await fetch('http://localhost:3000/jobs');
        allJobs = await response.json();
        renderJobs(allJobs.slice(0, 10));
    } catch (err) {
        console.error('Jobs fetch error:', err);
        jobList.innerHTML = '<p>Failed to load jobs. Please try again later.</p>';
    } finally {
        spinner.style.display = 'none';
    }
}
 
//Load Jobs
function renderJobs(jobs) {
    const jobList = document.getElementById('jobList');
    if (!jobList) return;
 
    if (!jobs.length) {
        jobList.innerHTML = '<p>No jobs found.</p>';
        return;
    }
 
    let html = '';
    jobs.forEach(job => {
        const title       = job.title || 'Untitled Role';
        const company     = job.company || 'Company not listed';
        const location    = job.location || 'Remote, USA';
        const link        = job.link || '#';
        const description = (job.description || '')
            .replace(/<!\[CDATA\[/g, '')
            .replace(/\]\]>/g, '')
            .trim();
 
        html += `
            <div class="job-card">
                <h2>${title}</h2>
                <p class="meta">${company} &mdash; ${location}</p>
                <p>${description}</p>
                <a href="${link}" target="_blank">Apply →</a>
            </div>
        `;
    });
 
    jobList.innerHTML = html;
}
 
//Job Board Slider
function initJobSlider() {
    const sliderEl = document.getElementById('jobSlider');
    const valueEl  = document.getElementById('sliderValue');
    if (!sliderEl || typeof noUiSlider === 'undefined') return;
 
    noUiSlider.create(sliderEl, {
        start: [10],
        step: 1,
        range: { min: 1, max: 25 },
        tooltips: false,
        format: {
            to:   v => Math.round(v),
            from: v => Math.round(v)
        }
    });
 
    sliderEl.noUiSlider.on('update', (values) => {
        const count = parseInt(values[0]);
        valueEl.textContent = count;
        if (allJobs.length) renderJobs(allJobs.slice(0, count));
    });
}
 
//About Page Boxes
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 600, once: true, offset: 60 });
    }
}
 
//Load functions
document.addEventListener('DOMContentLoaded', () => {
    fetchNextHoliday();
    fetchQuote();
    initSlider();
    initAOS();
    fetchJobs();
    initJobSlider();
});