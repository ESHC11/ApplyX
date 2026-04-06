const express = require('express');
const router  = express.Router();

// URLs de las cuatro APIs
const jobs_apis = {
    jobicy    : 'https://jobicy.com/api/v2/remote-jobs',
    themuse   : 'https://www.themuse.com/api/public/jobs',
    arbeitnow : 'https://www.arbeitnow.com/api/job-board-api',
    remotive  : 'https://remotive.com/api/remote-jobs',
};

// Función para las rutas individuales
async function fetchJobApi(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
            `HTTP ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`
        );
    }
    return response.json();
}

// Generar rutas individuales dinámicamente
for (const [route, url] of Object.entries(jobs_apis)) {
    router.get(`/${route}`, async (req, res) => {
        try {
            const data = await fetchJobApi(url);
            res.json({ source: route, fetchedAt: new Date().toISOString(), data });
        } catch (error) {
            console.error(`[jobs.js] ${route} error:`, error.message);
            res.status(502).json({
                error : `No se pudo obtener datos de ${route}`,
                detail: error.message,
            });
        }
    });
}

// Función auxiliar para normalizar fechas
function toDate(dateStr) {
    if (!dateStr) return new Date(0);
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
}

async function safeFetch(url, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) {
            console.warn(`[jobs/all] HTTP ${res.status} → ${url}`);
            return null;
        }
        return await res.json();
    } catch (err) {
        clearTimeout(timer);
        console.warn(`[jobs/all] Falló ${url}:`, err.message);
        return null;
    }
}

// NORMALIZADORES DE APIS

async function fetchAndNormalizeJobicy(search, limit) {
    const params = new URLSearchParams({
        count: Math.min(limit * 2, 50),
        ...(search ? { tag: search } : {}),
    });

    const data = await safeFetch(`${jobs_apis.jobicy}?${params}`);
    if (!data || !Array.isArray(data.jobs)) return [];

    return data.jobs.slice(0, limit).map((job) => ({
        id          : `jobicy_${job.id}`,
        title       : job.jobTitle    || 'Sin título',
        company     : job.companyName || 'Empresa desconocida',
        location    : job.jobGeo      || 'Remote',
        description : job.jobExcerpt  || '',
        url         : job.url         || '',
        salary      : job.annualSalaryMin
                        ? `$${job.annualSalaryMin}–$${job.annualSalaryMax}`
                        : '',
        tags        : Array.isArray(job.jobIndustry) ? job.jobIndustry : [],
        publishedAt : toDate(job.pubDate),
        source      : 'Jobicy',
    }));
}

async function fetchAndNormalizeTheMuse(search, page, limit) {
    const params = new URLSearchParams({
        page      : page - 1,
        descending: true,
        ...(search ? { category: search } : {}),
    });

    const data = await safeFetch(`${jobs_apis.themuse}?${params}`);
    if (!data || !Array.isArray(data.results)) return [];

    return data.results.slice(0, limit).map((job) => ({
        id          : `themuse_${job.id}`,
        title       : job.name           || 'Sin título',
        company     : job.company?.name  || 'Empresa desconocida',
        location    : job.locations?.[0]?.name || 'Flexible',
        description : job.contents
                        ? job.contents.replace(/<[^>]+>/g, '').slice(0, 300) + '…'
                        : '',
        url         : job.refs?.landing_page || '',
        salary      : '',
        tags        : job.levels?.[0]?.name ? [job.levels[0].name] : [],
        publishedAt : toDate(job.publication_date),
        source      : 'The Muse',
    }));
}

async function fetchAndNormalizeArbeitnow(search, limit) {
    const data = await safeFetch(jobs_apis.arbeitnow);
    if (!data || !Array.isArray(data.data)) return [];

    let jobs = data.data;

    if (search) {
        const q = search.toLowerCase();
        jobs = jobs.filter(
            (job) =>
                job.title?.toLowerCase().includes(q) ||
                job.tags?.some((t) => t.toLowerCase().includes(q)) ||
                job.description?.toLowerCase().includes(q)
        );
    }

    return jobs.slice(0, limit).map((job) => ({
        id          : `arbeitnow_${job.slug}`,
        title       : job.title        || 'Sin título',
        company     : job.company_name || 'Empresa desconocida',
        location    : job.location     || (job.remote ? 'Remote' : 'No especificada'),
        description : job.description
                        ? job.description.replace(/<[^>]+>/g, '').slice(0, 300) + '…'
                        : '',
        url         : job.url || '',
        salary      : '',
        tags        : Array.isArray(job.tags) ? job.tags : [],
        publishedAt : toDate(
                        job.created_at
                            ? new Date(job.created_at * 1000).toISOString()
                            : null
                    ),
        source      : 'Arbeitnow',
    }));
}

async function fetchAndNormalizeRemotive(search, limit) {
    const params = new URLSearchParams({
        limit: Math.min(limit * 2, 50),
        ...(search ? { search: search } : {}),
    });

    const data = await safeFetch(`${jobs_apis.remotive}?${params}`);
    if (!data || !Array.isArray(data.jobs)) return [];

    return data.jobs.slice(0, limit).map((job) => ({
        id          : `remotive_${job.id}`,
        title       : job.title        || 'Sin título',
        company     : job.company_name || 'Empresa desconocida',
        location    : job.candidate_required_location || 'Remote',
        description : job.description
                        ? job.description.replace(/<[^>]+>/g, '').slice(0, 300) + '…'
                        : '',
        url         : job.url          || '',
        salary      : job.salary       || '',
        tags        : Array.isArray(job.tags) ? job.tags : (job.category ? [job.category] : []),
        publishedAt : toDate(job.publication_date),
        source      : 'Remotive',
    }));
}

// RUTA UNIFICADA CENTRALIZADA
router.get('/all', async (req, res) => {
    const search = (req.query.search || '').trim();
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    // Llamadas en paralelo a las 4 APIs
    const [jobicyJobs, theMuseJobs, arbeitnowJobs, remotiveJobs] = await Promise.all([
        fetchAndNormalizeJobicy(search, limit),
        fetchAndNormalizeTheMuse(search, page, limit),
        fetchAndNormalizeArbeitnow(search, limit),
        fetchAndNormalizeRemotive(search, limit)
    ]);

    // Combinar todos los resultados
    const allJobs = [...jobicyJobs, ...theMuseJobs, ...arbeitnowJobs, ...remotiveJobs];

    // Ordenar por fecha
    allJobs.sort((a, b) => b.publishedAt - a.publishedAt);

    // Serializar fechas a ISO string para el JSON final
    const jobs = allJobs.map((job) => ({
        ...job,
        publishedAt: job.publishedAt.toISOString(),
    }));

    return res.json({
        success : true,
        total   : jobs.length,
        page,
        search  : search || null,
        sources : {
            jobicy    : jobicyJobs.length,
            themuse   : theMuseJobs.length,
            arbeitnow : arbeitnowJobs.length,
            remotive  : remotiveJobs.length
        },
        jobs,
    });
});

module.exports = router;