const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config()

const app = express();
const port = 3000;

app.use(bodyParser.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

function isValidCountryCode(code) {
    try {
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        return !!regionNames.of(code.toUpperCase());
    } catch (e) {
        return false;
    }
}

app.get('/users', async (req, res) => {
    console.log('Attempting to get all users');

    const { data, error } = await supabase.from('users').select();

    if (error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }

    console.log('Received data:', data);
    res.json(data);
});

app.post('/user', async (req, res) => {
    console.log('Adding user');

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const country = req.body.country

    if (!firstName || !lastName || !country) {
        return res.status(400).json({ error: 'firstName, lastName, and country are required' });
    }

    if (!isValidCountryCode(country)) {
        return res.status(400).json({ error: 'Invalid country code. Please use a valid ISO country code e.g. US, GB, DE' });
    }

    const { data, error } = await supabase
        .from('users')
        .insert({
            user_first_name: firstName,
            user_last_name: lastName,
            user_country: country,
        })
        .select();

    if (error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }

    console.log('User added:', data);
    res.status(201).json(data);
});

app.listen(port, () => {
    console.log('App is available through port:', port);
});