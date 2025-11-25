// Netlify Serverless Function to retrieve adventures from Airtable

exports.handler = async (event, context) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Get Airtable credentials from environment variables
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = 'Adventures';
    
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Airtable credentials not configured' })
        };
    }

    try {
        // Fetch from Airtable (sorted by date, most recent first)
        const response = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?sort%5B0%5D%5Bfield%5D=Date&sort%5B0%5D%5Bdirection%5D=desc&maxRecords=50`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch from Airtable');
        }

        const data = await response.json();
        
        // Transform the data for easier frontend use
        const adventures = data.records.map(record => ({
            id: record.id,
            dogName: record.fields['Dog Name'],
            breed: record.fields['Breed'],
            gender: record.fields['Gender'],
            location: record.fields['Location'] || 'Unknown location',
            photoUrl: record.fields['Photo URL'],
            chapters: JSON.parse(record.fields['Chapters'] || '[]'),
            date: record.fields['Date'],
            chapterCount: record.fields['Chapter Count']
        }));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                adventures: adventures
            })
        };

    } catch (error) {
        console.error('Error fetching adventures:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: error.message || 'Failed to fetch adventures'
            })
        };
    }
};

