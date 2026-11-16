const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let page;
const calls = [];
const api = { approveWorkbench: async (...args) => calls.push(args) };
vm.runInNewContext(fs.readFileSync('miniprogram/pages/staff-workbench/index.js', 'utf8'), {
  Page: definition => { page = definition; },
  require: name => name.endsWith('/api') ? api : {}
});
page.launch = 'a'.repeat(48);
page.data.url = 'https://example.com/service/?staff_entry=' + page.launch + '&inline=1';
const challenge = 'b'.repeat(48);
const url = page.data.url + '&challenge=' + challenge;
for (const src of [page.data.url, url.replace('example.com', 'other.example'), url, url]) {
  page.onWebLoad({ detail: { src } });
}
assert.deepEqual(calls, [[page.launch, challenge]]);
console.log('PASS inline browser confirmation checks the exact entry and runs once');
