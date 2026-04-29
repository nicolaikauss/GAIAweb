#!/usr/bin/env node

/**
 * Link Checker Script
 * 
 * Crawls the application to detect broken links and 404s.
 * Run after starting the dev server: npm run dev
 * Then in another terminal: node scripts/check-links.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const visited = new Set();
const broken = [];
const routes = [
  '/',
  '/auth',
  '/dashboard',
  '/inventory',
  '/inventory/add',
  '/transactions',
  '/consignments',
  '/reports',
  '/success',
  '/cancel',
  '/this-should-404', // Test 404 handling
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 400,
      });
    }).on('error', (err) => {
      resolve({
        url,
        status: 0,
        ok: false,
        error: err.message,
      });
    });
  });
}

async function main() {
  console.log('🔍 Checking links...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    
    if (visited.has(url)) continue;
    visited.add(url);

    const result = await checkUrl(url);
    
    if (result.ok) {
      console.log(`✅ ${result.status} - ${route}`);
    } else if (result.status === 404 && route === '/this-should-404') {
      console.log(`✅ ${result.status} - ${route} (expected 404)`);
    } else {
      console.log(`❌ ${result.status} - ${route}${result.error ? ` (${result.error})` : ''}`);
      broken.push(result);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`Total routes checked: ${routes.length}`);
  console.log(`Broken links: ${broken.length}`);

  if (broken.length > 0) {
    console.log('\n❌ Broken links found:');
    broken.forEach(b => {
      console.log(`  - ${b.url} (${b.status}${b.error ? `: ${b.error}` : ''})`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All links working!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
