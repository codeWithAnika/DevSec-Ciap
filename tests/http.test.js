/**
 * HTTP Integration Test for Static Assets
 * Verifies that the web server serves required assets with correct MIME types and status 200
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const server = require('../scripts/serve.js');

describe('HTTP Server & Static Asset Verification', () => {
  const PORT = 8080;
  const BASE_URL = `http://127.0.0.1:${PORT}`;

  function fetchUrl(urlPath) {
    return new Promise((resolve, reject) => {
      http.get(`${BASE_URL}${urlPath}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      }).on('error', reject);
    });
  }

  after(() => {
    server.close();
  });

  it('Serves index.html with status 200 and text/html', async () => {
    const res = await fetchUrl('/');
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['content-type'], /text\/html/);
    assert.match(res.body, /DevSecOps Online Examination Portal/);
    assert.match(res.body, /Talavadekar Anika Vinit/);
  });

  it('Serves css/style.css with status 200 and text/css', async () => {
    const res = await fetchUrl('/css/style.css');
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['content-type'], /text\/css/);
    assert.match(res.body, /--primary-color/);
  });

  it('Serves js/validator.js with status 200 and application/javascript', async () => {
    const res = await fetchUrl('/js/validator.js');
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['content-type'], /javascript/);
    assert.match(res.body, /Validator/);
  });

  it('Serves js/questions.js with status 200 and application/javascript', async () => {
    const res = await fetchUrl('/js/questions.js');
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['content-type'], /javascript/);
    assert.match(res.body, /QuestionBank/);
  });

  it('Serves js/app.js with status 200 and application/javascript', async () => {
    const res = await fetchUrl('/js/app.js');
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['content-type'], /javascript/);
    assert.match(res.body, /registration-form/);
  });

  it('Returns 404 for non-existent files', async () => {
    const res = await fetchUrl('/non-existent-asset.xyz');
    assert.equal(res.statusCode, 404);
  });
});
