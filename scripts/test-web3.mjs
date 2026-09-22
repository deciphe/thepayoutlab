import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {build} from 'vite';
import {executionMetrics as metrics} from '../src/components/web3/executionMetrics.js';
assert.deepEqual(metrics(.0025,50),{retained:.75,timeFactor:5,velocity:3.75});
assert.equal(metrics(.005,10).retained,.9);
assert.equal(metrics(0,2.5).velocity,.25);
assert.equal(metrics(null,10).velocity,null);
assert.equal(metrics(.01,null).velocity,null);
assert.equal(metrics(.1,100).retained,-19); // Never hide costs exceeding the target.
assert.equal(metrics(.0025,50,0).velocity,null);
// Rendering the actual app catches undefined JSX components that Vite compilation misses.
const result=await build({configFile:false,esbuild:{jsx:"automatic"},ssr:{noExternal:['lucide-react']},logLevel:'error',build:{ssr:'src/App.jsx',write:false,minify:false,rollupOptions:{output:{format:'cjs'}}}});
const require=createRequire(import.meta.url);
const output=Array.isArray(result)?result[0]:result;
const chunk=output.output.find(x=>x.type==='chunk'&&x.isEntry);
const mod={exports:{}};
new Function('require','module','exports',chunk.code)(require,mod,mod.exports);
const React=require('react');
const {renderToString}=require('react-dom/server');
const html=renderToString(React.createElement(mod.exports.default || mod.exports));
for(const text of ['Firm deck','True R velocity','Vest','Hypernova','Breakout','Vanta','Propr']) assert.ok(html.includes(text),text);
assert.ok(!html.includes('Open Doji'));
assert.ok(!html.includes('Open HyperPNL'));
console.log('Web3 render and fee/leverage checks passed.');
