const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const plants_demo_data = require('../plants-demo-data.json');

/* GET the page with all plants. */
router.get('/api/v1/plants/search', (req, res, next) => {

  let term = req.query.q;
  if (typeof term === 'string') {
    term = term.trim();
    if (term.length === 0) {
      term = undefined;
    }
  }
  let pageNum = parseInt(req.query.page);
  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }

  const data = plants_demo_data.data.filter(plant =>
    !term ||
    plant.common_name.includes(term) ||
    plant.scientific_name.includes(term) ||
    plant.synonyms.reduce((found, synonym) => found || synonym.includes(term), false)
  );

  const pageSize = 20;
  const begin = (pageNum - 1) * pageSize; // pageNum * pageSize - pageSize
  const end = begin + pageSize - 1;
  const pageData = data.slice(begin, end);

  res.json({ data: pageData, meta: { total: data.length } });
});


/* GET single plant page. */
router.get('/api/v1/plants/:slug', (req, res, next) => {

  let apiSlug = decodeURIComponent(req.params.slug);

  if (!apiSlug || apiSlug.trim().length === 0) {
    res.status(400).json({ error: "Slug is missing!" });
    return;
  }

  const plantData = plants_demo_data.data.find(plant => plant.slug === apiSlug);

  if(!plantData) {
    res.status(404).json({ error: "Unknown slug!" });
    return;
  }

  res.json({ data: plantData })

});

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

module.exports = router;
