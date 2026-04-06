const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/jobicy?search=developer&count=10
router.get('/', async (req, res) => {
  const { search, count } = req.query;

  try {
    const response = await axios.get('https://jobicy.com/api/v2/remote-jobs', {
      params: {
        count: count || 10,
      },
    });

    let jobs = response.data.jobs;

    // Filtrar por keyword si se proporcionó
    if (search) {
      const keyword = search.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.jobTitle.toLowerCase().includes(keyword) ||
          job.companyName.toLowerCase().includes(keyword) ||
          (job.jobIndustry && job.jobIndustry.join(' ').toLowerCase().includes(keyword))
      );
    }

    const formatted = jobs.map((job) => ({
      id: job.id,
      title: job.jobTitle,
      company: job.companyName,
      location: job.jobGeo,
      url: job.url,
      category: job.jobIndustry ? job.jobIndustry.join(', ') : '',
      type: job.jobType ? job.jobType.join(', ') : '',
      publishedAt: job.pubDate,
      source: 'Jobicy',
    }));

    res.json({ total: formatted.length, jobs: formatted });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos de Jobicy', details: error.message });
  }
});

module.exports = router;
