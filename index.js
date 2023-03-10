const PORT = process.env.PORT || 3000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const newspapers = require('./newspapers');

console.log(newspapers);

const app = express();

const articles = [];

newspapers.forEach((newspaper) => {
  axios.get(newspaper.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("climate")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr('href');
      articles.push({
        title,
        url: newspaper.base + url,
        source: newspaper.name,
      });
    });
  });
});

app.get('/', (req, res) => {
  res.json('Welcome to the Climate Change News API');
});

app.get('/news', (req, res) => {
  res.json(articles);
});

app.get('/news/:newspaperId', async (req, res) => {
  const newsPaperId = req.params.newspaperId;
  const newsPaperAddress = newspapers.filter(
    (newspaper) => newspaper.name == newsPaperId
  )[0].address;
  const newspaperBase = newspapers.filter(
    (newspaper) => newspaper.name == newsPaperId
  )[0].base;
  console.log(newsPaperAddress);
  axios
    .get(newsPaperAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];
      $('a:contains("climate")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr('href');
        specificArticles.push({
          title,
          url: newspaperBase + url,
          source: newsPaperId,
        });
      });
      res.json(specificArticles);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
