import * as itg from './itg';
import * as mix from './mix';
import * as nav from './nav';
import * as util from './util';
import resume_default from 'url:../includes/resume/default.pug';
import resume_dev from 'url:../includes/resume/dev.pug';
import resume_it from 'url:../includes/resume/it.pug';
import resume_graphics from 'url:../includes/resume/graphics.pug';
import data_ceristreams from 'url:../data/packs/streams.json';
import data_mix from '../data/mix.yaml';
import Macy from "macy"

// Get page details
const url = window.location.href
let page;
try {
    page = url.split("/")[3];
    page = page.split(".")[0];
} catch(e) {
    page = '';
}

// Navigation
nav.sticky();
nav.handleTransition();

// Content injection
if (page.includes('resume') || page.includes('$')) {
    ['hashchange', 'load'].forEach(el => {
        window.addEventListener(el, () => {
            const hash = window.location.hash.slice(1);
            const target = document.getElementById('resume');
            const links = document.getElementById('resume-links');
            if (hash === 'dev') {
                util.req(resume_dev).then(html => target.innerHTML = html);
                links.innerHTML = `
                <a class="action" href="./docs/SpencerGunning-Resume_20241218-dev.pdf">download as pdf</a>
                <a class="action" href="./webdev">view portfolio</a>
                <a class="action" href="./resume">view general resume</a>
                `
            } else if (hash === 'graphics') {
                util.req(resume_graphics).then(html => target.innerHTML = html);
                links.innerHTML = `
                <a class="action" href="./docs/SpencerGunning-Resume_20241218-graphics.pdf">download as pdf</a>
                <a class="action" href="./graphics">view portfolio</a>
                <a class="action" href="./resume">view general resume</a>
                `
            } else if (hash === 'it') {
                util.req(resume_it).then(html => target.innerHTML = html);
                links.innerHTML = `
                <a class="action" href="./docs/SpencerGunning-Resume_20241218-it.pdf">download as pdf</a>
                <a class="action" href="./resume">view general resume</a>
                `
            } else {
                util.req(resume_default).then(html => target.innerHTML = html);
                links.innerHTML = `
                <a class="action" href="./docs/SpencerGunning-Resume_20241218.pdf">download as pdf</a>
                `
            }
        });
    })
} else if (page.includes("graphics")) {
    const macyInstance = Macy({
        container: "#gallery",
        columns: 3,
        margin: 8,
        breakAt: {
            500: 2
        }
    });
} else if (page.includes("mixes")) {
    mix.mixList(data_mix);
} else if (page.includes("ceristreams")) {
  util.reqJson(data_ceristreams, itg.listControl);
}