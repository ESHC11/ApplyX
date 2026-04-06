const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/themuse?search=developer&category=Engineering
router.get('/', async (req, res) => {
  const { search, category, page } = req.query;

  try {
    const response = await axios.get('https://www.themuse.com/api/public/jobs', {
      params: {
        category: category || '',
        page: page || 1,
      },
    });

    let jobs = response.data.results;

    // Filtrar por búsqueda si se proporcionó
    if (search) {
      const keyword = search.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.name.toLowerCase().includes(keyword) ||
          job.company.name.toLowerCase().includes(keyword)
      );
    }

    const formatted = jobs.map((job) => ({
      id: job.id,
      title: job.name,
      company: job.company.name,
      location: job.locations.map((l) => l.name).join(', '),
      url: job.refs.landing_page,
      category: job.categories.map((c) => c.name).join(', '),
      publishedAt: job.publication_date,
      source: 'The Muse',
    }));

    res.json({ total: formatted.length, jobs: formatted });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos de The Muse', details: error.message });
  }
});

module.exports = router;
