// Netlify Serverless Function to save adventures to Airtable

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Get Airtable credentials from environment variables
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = 'Adventures'; // You can change this
    
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Airtable credentials not configured' })
        };
    }

    try {
        // Parse request body
        const { dogName, dogBreed, dogGender, dogLocation, dogPhoto, chapters } = JSON.parse(event.body);

        // Prepare data for Airtable
        // Photos are now compressed on client-side before sending
        const fields = {
            'Dog Name': dogName,
            'Breed': dogBreed,
            'Gender': dogGender,
            'Location': dogLocation || 'Unknown',
            'Chapters': JSON.stringify(chapters),
            'Date': new Date().toISOString(),
            'Chapter Count': chapters.length
        };
        
        // Include photo if provided (should be compressed and under size limit)
        if (dogPhoto && dogPhoto.length > 0) {
            // Compressed photos should be under 50k characters, but allow up to 80k to be safe
            if (dogPhoto.length < 80000) {
                fields['Photo URL'] = dogPhoto;
            } else {
                // If somehow still too large, skip it
                console.warn('Photo still too large after compression, skipping');
            }
        }
        
        const airtableData = {
            records: [{ fields }]
        };

        // Save to Airtable
        const response = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(airtableData)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to save to Airtable');
        }

        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                recordId: data.records[0].id
            })
        };

    } catch (error) {
        console.error('Error saving adventure:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: error.message || 'Failed to save adventure'
            })
        };
    }
};

