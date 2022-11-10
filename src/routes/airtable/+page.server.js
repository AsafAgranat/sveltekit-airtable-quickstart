import Airtable from 'airtable';
import { env } from '$env/dynamic/private';

const myBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;

const myBaseConfig = {
    tableName: 'Table 1',
    selectConfig: {
        pageSize: 100,
        fields: [
            "Name",
            "Notes",
        ],
    },
};

/**
 * 
 * @param {string} baseId 
 * @returns AirtableBase
 */
function setupBase(baseId) {
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: env.AIRTABLE_KEY
    });
    var base = Airtable.base(baseId);

    return base;
}

/**
 * 
 * @param {AirtableBase} base 
 * @param {AirtableConfig} config 
 * @returns {Array<object>} result
 */
async function fetchRecords(base, config) {
    let result = [];
    let debug = false;
    let first = true;
    try {
        await base(config.tableName).select(config.selectConfig).all().then(records => {
            records.forEach(r => {
                let record = r.fields;
                record.id = r.id;
                result.push(record);
                if (debug && first) {
                    console.log(r);
                    first = false;
                }
            });
        }).catch(err => {
            console.error(err);
        });
    } catch (e) {
        console.error(e);
    }
    return result;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    let base = await setupBase(myBaseId);
    const records = await fetchRecords(base, myBaseConfig);
    if (records) {
        try {
            return {
                records
            };
        } catch (e) {
            console.log(e.path);
        }
    }
}

// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in prod
export const prerender = true;