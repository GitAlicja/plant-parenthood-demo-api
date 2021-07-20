const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const plants_demo_data = require('../plants-demo-data.json');

/* GET the page with all plants. */
router.get('/api/v1/plants/search', (req, res, next) => {

  const apiToken = req.query.token;

  if (apiToken !== process.env.DEMO_API_ACCESS_TOKEN) {
    res.status(401).json({ error: "Invalid API token!" });
    return;
  }

  let term = req.query.q;
  if (typeof term === 'string') {
    term = term.trim().toLowerCase();
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
    plant.common_name.toLowerCase().includes(term) ||
    plant.scientific_name.toLowerCase().includes(term) ||
    plant.synonyms.reduce((found, synonym) => found || synonym.toLowerCase().includes(term), false)
  );

  const pageSize = 20;
  const begin = (pageNum - 1) * pageSize; // pageNum * pageSize - pageSize
  const end = begin + pageSize - 1;
  const pageData = data.slice(begin, end)
    .map(plant => ({ ...plant, image_url: process.env.HOST_URI + plant.image_url }));

  res.json({ data: pageData, meta: { total: data.length } });
});


/* GET single plant page. */
router.get('/api/v1/plants/:slug', (req, res, next) => {

  const apiToken = req.query.token;

  if (apiToken !== process.env.DEMO_API_ACCESS_TOKEN) {
    res.status(401).json({ error: "Invalid API token!" });
    return;
  }


  let apiSlug = decodeURIComponent(req.params.slug);

  if (!apiSlug || apiSlug.trim().length === 0) {
    res.status(400).json({ error: "Slug is missing!" });
    return;
  }

  const plantData = plants_demo_data.data.find(plant => plant.slug === apiSlug);

  if (!plantData) {
    res.status(404).json({ error: "Unknown slug!" });
    return;
  }

  const flowerImages = plantData.main_species.images.flower
    .map(imgObj => ({ // using () around {} gives back an object
      ...imgObj,
      image_url: process.env.HOST_URI + imgObj.image_url,
    }));

  // override recursive modified values
  res.json({
    data: {
      ...plantData,
      image_url: process.env.HOST_URI + plantData.image_url,
      main_species: {
        ...plantData.main_species,
        images: {
          ...plantData.main_species.images,
          flower: flowerImages
        }
      }
    }
  })

});

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

module.exports = router;
