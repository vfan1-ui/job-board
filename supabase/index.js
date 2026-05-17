const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const cors = require('cors');
const { parse } = require('node-html-parser');
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

function isValidState(state) {
    return US_STATES.includes(state.toUpperCase());
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

//grab all users
app.get('/api/users', async (req, res) => {
    console.log('Attempting to get all users');

    const { data, error } = await supabase.from('users').select();

    if (error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }

    console.log('Received data:', data);
    res.json(data);
});

// add a new user/subscriber
app.post('/api/user', async (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const state = req.body.state;

    if (!firstName || !lastName || !email || !state) {
        return res.status(400).json({ error: 'firstName, lastName, email and state are required' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!isValidState(state)) {
        return res.status(400).json({ error: 'Invalid state. Please use a valid US state abbreviation e.g. NY, CA, TX' });
    }

    const { data, error } = await supabase
        .from('users')
        .insert({
            'first-name': firstName,
            'last-name': lastName,
            user_email: email,
            state: state,
        })
        .select();

    if (error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }

    console.log('User added:', data);
    res.status(201).json(data);
});

// fetch job listings 
app.get('/api/jobs', async (req, res) => {
    console.log('Fetching jobs');

    try {
        const response = await fetch('https://jobicy.com/feed/job_feed?job_categories=supporting&job_types=full-time&search_region=usa');
        const xml = await response.text();
        const root = parse(xml);

        const items = root.querySelectorAll('item');

        const jobs = items.map(item => ({
            title: item.querySelector('title')?.textContent || '',
            company: item.querySelector('job_listing_company_name')?.textContent || '',
            location: item.querySelector('job_listing_region')?.textContent || '',
            description: item.querySelector('description')?.textContent || '',
            link: item.querySelector('guid')?.textContent || '',
        }));

        res.json(jobs);
    } catch (err) {
        console.error('Jobs fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

//fetch next  US public holiday for the current year
app.get('/api/holidays', async (req, res) => {
    try {
        const year = new Date().getFullYear();
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/US`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Holiday fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch holidays' });
    }
});

//fetch a random inspirational quote
app.get('/api/quote', async (req, res) => {
    try {
        const response = await fetch('https://zenquotes.io/api/random');
        const data = await response.json();
        res.json(data[0]);
    } catch (err) {
        console.error('Quote fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch quote' });
    }
});

app.listen(port, () => {
    console.log('App is available through port:', port);
});